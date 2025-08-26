from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import io
import torch
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image
import base64
from transformers import pipeline

app = FastAPI(title="Image Cartoonifier API", version="2.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
cartoon_pipeline = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def load_huggingface_model():
    """Load Hugging Face cartoon style transfer model"""
    global cartoon_pipeline
    
    try:
        # Option 1: Using AnimeGAN-style model (lightweight)
        cartoon_pipeline = pipeline(
            "image-to-image", 
            model="akhaliq/AnimeGANv2",
            device=0 if torch.cuda.is_available() else -1
        )
        print("✅ AnimeGANv2 model loaded successfully")
        
    except Exception as e:
        try:
            # Option 2: Fallback to Stable Diffusion with cartoon style
            cartoon_pipeline = StableDiffusionImg2ImgPipeline.from_pretrained(
                "runwayml/stable-diffusion-v1-5",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                safety_checker=None,
                requires_safety_checker=False
            ).to(device)
            print("✅ Stable Diffusion model loaded successfully")
            
        except Exception as e2:
            print(f"❌ Failed to load both models: {e}, {e2}")
            cartoon_pipeline = None

# Load model on startup
@app.on_event("startup")
async def startup_event():
    load_huggingface_model()

def cartoonify_image_opencv(img_array):
    """Fallback OpenCV cartoon effect (backup method)"""
    # Resize for faster processing
    h, w = img_array.shape[:2]
    if w > 1000:
        img_array = cv2.resize(img_array, (1000, int(h * 1000 / w)))
    
    # Enhanced cartoon effect
    # Step 1: Apply bilateral filter to reduce noise while preserving edges
    smooth = cv2.bilateralFilter(img_array, d=15, sigmaColor=80, sigmaSpace=80)
    
    # Step 2: Create edge mask
    gray = cv2.cvtColor(smooth, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.medianBlur(gray, 7)
    edges = cv2.adaptiveThreshold(gray_blur, 255, 
                                  cv2.ADAPTIVE_THRESH_MEAN_C, 
                                  cv2.THRESH_BINARY, 9, 10)
    
    # Step 3: Color quantization using K-means
    data = smooth.reshape((-1, 3))
    data = np.float32(data)
    
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, labels, centers = cv2.kmeans(data, k=8, bestLabels=None, 
                                   criteria=criteria, attempts=10, 
                                   flags=cv2.KMEANS_RANDOM_CENTERS)
    
    centers = np.uint8(centers)
    segmented_data = centers[labels.flatten()]
    segmented_image = segmented_data.reshape(smooth.shape)
    
    # Step 4: Combine edges with quantized image
    edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    cartoon = cv2.bitwise_and(segmented_image, edges_colored)
    
    return cartoon

def cartoonify_with_huggingface(image: Image.Image):
    """Use Hugging Face model for cartoon generation"""
    global cartoon_pipeline
    
    if cartoon_pipeline is None:
        raise HTTPException(status_code=503, detail="Cartoon model not available")
    
    try:
        # Resize image to manageable size
        max_size = 512
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Check if it's AnimeGAN or Stable Diffusion pipeline
        if hasattr(cartoon_pipeline, 'model') and hasattr(cartoon_pipeline.model, 'config'):
            # AnimeGAN-style pipeline
            result = cartoon_pipeline(image)
            if isinstance(result, list):
                cartoon_image = result[0]
            else:
                cartoon_image = result
                
        else:
            # Stable Diffusion pipeline
            cartoon_prompt = "cartoon style, animated, colorful, simplified features, clean lines, vibrant colors"
            result = cartoon_pipeline(
                prompt=cartoon_prompt,
                image=image,
                strength=0.75,  # How much to transform the original
                guidance_scale=7.5,
                num_inference_steps=20
            )
            cartoon_image = result.images[0]
        
        return cartoon_image
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cartoon generation failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Image Cartoonifier API with Hugging Face models",
        "version": "2.0.0",
        "model_status": "loaded" if cartoon_pipeline else "not available",
        "device": device
    }

@app.post("/cartoonify-advanced")
async def cartoonify_advanced(
    file: UploadFile = File(...),
    style: str = "anime",  # anime, cartoon, disney
    strength: float = 0.75  # 0.1 to 1.0
):
    """Advanced cartoonification with style options"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if cartoon_pipeline is None:
        raise HTTPException(status_code=503, detail="Advanced model not available")
    
    try:
        image_bytes = await file.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Style-specific prompts
        style_prompts = {
            "anime": "anime style, manga art, cel shading, vibrant colors, large eyes",
            "cartoon": "cartoon style, animated, Disney-like, colorful, simplified features",
            "disney": "Disney Pixar style, 3D animation, cute characters, bright colors",
        }
        
        prompt = style_prompts.get(style, style_prompts["cartoon"])
        
        # Generate with custom settings
        if hasattr(cartoon_pipeline, 'model') and hasattr(cartoon_pipeline.model, 'config'):
            # Simple pipeline
            result = cartoon_pipeline(pil_image)
            cartoon_image = result[0] if isinstance(result, list) else result
        else:
            # Advanced Stable Diffusion pipeline
            result = cartoon_pipeline(
                prompt=prompt,
                image=pil_image,
                strength=min(max(strength, 0.1), 1.0),
                guidance_scale=7.5,
                num_inference_steps=25
            )
            cartoon_image = result.images[0]
        
        # Return processed image
        img_buffer = io.BytesIO()
        cartoon_image.save(img_buffer, format='PNG')
        img_bytes = img_buffer.getvalue()
        
        return StreamingResponse(
            io.BytesIO(img_bytes), 
            media_type="image/png"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced processing failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check for monitoring"""
    return {
        "status": "healthy", 
        "service": "cartoonifier",
        "model_loaded": cartoon_pipeline is not None,
        "device": device,
        "gpu_available": torch.cuda.is_available()
    }

@app.get("/models")
async def available_models():
    """List available cartoon models and styles"""
    return {
        "primary_model": "AnimeGANv2" if cartoon_pipeline else "OpenCV",
        "fallback_model": "OpenCV Enhanced",
        "available_styles": ["anime", "cartoon", "disney"],
        "supported_formats": ["PNG", "JPG", "JPEG", "GIF"],
        "max_image_size": "1024x1024"
    }
