
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageEnhance, ImageFilter
import io
import torch
import cv2
import numpy as np
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from typing import Dict, Any
import warnings
import easyocr
import traceback
import logging
import os

# Try to import pytesseract
try:
    import pytesseract
    if os.name == 'nt':  # Windows
        # Try common installation paths
        possible_paths = [
            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
            r'C:\Users\{}\AppData\Local\Tesseract-OCR\tesseract.exe'.format(os.getenv('USERNAME', ''))
        ]
        for path in possible_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                break
    TESSERACT_AVAILABLE = True
except (ImportError, Exception):
    TESSERACT_AVAILABLE = False
    pytesseract = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
warnings.filterwarnings("ignore")

app = FastAPI(title="Enhanced OCR Document Scanner", version="3.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
processor = None
model = None
easyocr_reader = None

def smart_image_preprocessing(image, ocr_engine="easyocr"):
    """Smart preprocessing optimized for different OCR engines"""
    try:
        # Convert to numpy array
        img_array = np.array(image)
        
        # Convert to grayscale
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array.copy()
        
        # Get image dimensions
        height, width = gray.shape
        
        # Resize for better OCR (minimum 300 DPI equivalent)
        min_size = 800
        if height < min_size or width < min_size:
            scale = max(min_size / height, min_size / width, 2.0)
            new_height, new_width = int(height * scale), int(width * scale)
            gray = cv2.resize(gray, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)
        
        # Denoise the image
        denoised = cv2.fastNlMeansDenoising(gray)
        
        # Enhance contrast adaptively
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)
        
        if ocr_engine == "tesseract":
            # Tesseract works better with binary images
            # Use Otsu's thresholding
            _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Morphological operations to clean up
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
            processed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            processed = cv2.morphologyEx(processed, cv2.MORPH_OPEN, kernel)
            
            return processed
        
        elif ocr_engine == "easyocr":
            # EasyOCR works well with enhanced grayscale
            # Apply slight gaussian blur to smooth text
            smoothed = cv2.GaussianBlur(enhanced, (1, 1), 0)
            return smoothed
        
        else:  # Default processing
            return enhanced
            
    except Exception as e:
        logger.error(f"Error in preprocessing: {str(e)}")
        # Return simple grayscale as fallback
        if len(img_array.shape) == 3:
            return cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        return img_array

def enhance_for_trocr(image):
    """Specific enhancement for TrOCR (needs RGB)"""
    try:
        # Ensure RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Enhance sharpness moderately
        enhancer = ImageEnhance.Sharpness(image)
        sharpened = enhancer.enhance(1.5)
        
        # Enhance contrast moderately
        enhancer = ImageEnhance.Contrast(sharpened)
        enhanced = enhancer.enhance(1.3)
        
        # Enhance brightness slightly
        enhancer = ImageEnhance.Brightness(enhanced)
        brightened = enhancer.enhance(1.1)
        
        return brightened
        
    except Exception as e:
        logger.error(f"Error in TrOCR enhancement: {str(e)}")
        return image

def load_models():
    """Load all OCR models with error handling"""
    global processor, model, easyocr_reader
    
    logger.info("Loading enhanced OCR models...")
    
    try:
        # Load EasyOCR with CPU optimization
        logger.info("Loading EasyOCR...")
        easyocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        logger.info("EasyOCR loaded successfully!")
        
    except Exception as e:
        logger.error(f"Failed to load EasyOCR: {str(e)}")
        easyocr_reader = None
    
    try:
        # Load TrOCR models
        logger.info("Loading TrOCR...")
        processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed", use_fast=False)
        model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")
        
        device = torch.device('cpu')
        model = model.to(device)
        model.eval()
        
        logger.info("TrOCR loaded successfully!")
        
    except Exception as e:
        logger.error(f"Failed to load TrOCR: {str(e)}")
        processor = None
        model = None

@app.on_event("startup")
async def startup_event():
    load_models()
    logger.info("Enhanced OCR API ready!")

@app.post("/extract-text-tesseract")
async def extract_text_tesseract(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Extract text using Tesseract OCR with optimal preprocessing"""
    try:
        if not TESSERACT_AVAILABLE:
            raise HTTPException(
                status_code=503, 
                detail="Tesseract OCR not installed"
            )
        
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        logger.info(f"Processing with Tesseract: {file.filename}")
        
        # Read image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Apply Tesseract-optimized preprocessing
        processed_array = smart_image_preprocessing(image, "tesseract")
        
        # Convert back to PIL for tesseract
        processed_image = Image.fromarray(processed_array)
        
        # Use simple, reliable config
        custom_config = r'--oem 3 --psm 6'
        
        # Extract text
        extracted_text = pytesseract.image_to_string(processed_image, config=custom_config)
        
        # Clean and normalize text
        lines = extracted_text.strip().split('\n')
        cleaned_lines = [line.strip() for line in lines if line.strip()]
        cleaned_text = ' '.join(cleaned_lines)
        
        logger.info(f"Tesseract extracted {len(cleaned_text)} characters")
        
        return {
            "success": True,
            "extracted_text": cleaned_text,
            "filename": file.filename,
            "model_used": "Tesseract OCR",
            "preprocessing": "Advanced",
            "character_count": len(cleaned_text)
        }
        
    except Exception as e:
        logger.error(f"Tesseract processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tesseract failed: {str(e)}")

@app.post("/extract-text-easyocr-enhanced")
async def extract_text_easyocr_enhanced(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Enhanced EasyOCR with optimal settings"""
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        if easyocr_reader is None:
            raise HTTPException(status_code=503, detail="EasyOCR not available")
        
        logger.info(f"Processing with Enhanced EasyOCR: {file.filename}")
        
        # Read and preprocess image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Apply EasyOCR-optimized preprocessing
        processed_array = smart_image_preprocessing(image, "easyocr")
        
        # Use EasyOCR with optimized parameters
        results = easyocr_reader.readtext(
            processed_array,
            detail=1,
            paragraph=False,  # Better for mixed layouts
            width_ths=0.7,
            height_ths=0.7,
            decoder='beamsearch',  # More accurate decoding
            beamWidth=5
        )
        
        # Process results with intelligent text assembly
        text_blocks = []
        for result in results:
            if len(result) >= 2:
                bbox = result[0]
                text = result[1]
                confidence = result[2] if len(result) > 2 else 1.0
                
                # Filter by confidence and text length
                if confidence > 0.2 and len(text.strip()) > 0:
                    # Calculate center point for sorting
                    center_y = (bbox[0][1] + bbox[2][1]) / 2
                    center_x = (bbox[0][0] + bbox[2][0]) / 2
                    text_blocks.append((center_y, center_x, text.strip(), confidence))
        
        # Sort by reading order (top to bottom, left to right)
        text_blocks.sort(key=lambda x: (x[0], x[1]))
        
        # Group into lines based on vertical proximity
        lines = []
        current_line = []
        current_y = -1
        
        for y, x, text, conf in text_blocks:
            if current_y == -1 or abs(y - current_y) < 20:  # Same line threshold
                current_line.append(text)
                current_y = y
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [text]
                current_y = y
        
        # Add the last line
        if current_line:
            lines.append(' '.join(current_line))
        
        # Join lines with proper spacing
        extracted_text = ' '.join(lines)
        
        logger.info(f"EasyOCR extracted {len(extracted_text)} characters from {len(text_blocks)} text blocks")
        
        return {
            "success": True,
            "extracted_text": extracted_text,
            "filename": file.filename,
            "model_used": "Enhanced EasyOCR",
            "blocks_found": len(text_blocks),
            "preprocessing": "Advanced",
            "character_count": len(extracted_text)
        }
        
    except Exception as e:
        logger.error(f"Enhanced EasyOCR failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Enhanced EasyOCR failed: {str(e)}")

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Extract text using optimized TrOCR"""
    try:
        if processor is None or model is None:
            raise HTTPException(status_code=503, detail="TrOCR not available")
        
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        logger.info(f"Processing with TrOCR: {file.filename}")
        
        # Read and enhance image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Apply TrOCR-specific enhancement
        enhanced_image = enhance_for_trocr(image)
        
        # Optimal size for TrOCR
        target_size = (384, 384)  # TrOCR optimal input size
        enhanced_image.thumbnail(target_size, Image.Resampling.LANCZOS)
        
        # Process with TrOCR
        with torch.no_grad():
            pixel_values = processor(enhanced_image, return_tensors="pt").pixel_values
            
            # Generate with optimal parameters
            generated_ids = model.generate(
                pixel_values,
                max_length=256,
                num_beams=5,
                early_stopping=True,
                do_sample=False,
                repetition_penalty=1.1,
                length_penalty=1.0
            )
            
            generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        logger.info(f"TrOCR extracted: '{generated_text}'")
        
        return {
            "success": True,
            "extracted_text": generated_text,
            "filename": file.filename,
            "model_used": "TrOCR-Base-Printed",
            "character_count": len(generated_text)
        }
        
    except Exception as e:
        logger.error(f"TrOCR failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TrOCR failed: {str(e)}")

@app.post("/extract-text-multi-engine")
async def extract_text_multi_engine(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Intelligent multi-engine OCR with quality scoring"""
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        logger.info(f"Processing with Multi-Engine OCR: {file.filename}")
        
        results = {}
        scores = {}
        
        # Try all available engines
        engines_to_try = []
        
        if TESSERACT_AVAILABLE:
            engines_to_try.append(("tesseract", extract_text_tesseract))
        
        if easyocr_reader is not None:
            engines_to_try.append(("easyocr", extract_text_easyocr_enhanced))
        
        if processor is not None and model is not None:
            engines_to_try.append(("trocr", extract_text))
        
        # Process with each engine
        for engine_name, engine_func in engines_to_try:
            try:
                await file.seek(0)
                result = await engine_func(file)
                text = result["extracted_text"]
                results[engine_name] = text
                
                # Score the result quality
                word_count = len(text.split())
                char_count = len(text)
                # Prefer longer, more detailed extractions
                quality_score = word_count * 2 + char_count * 0.1
                scores[engine_name] = quality_score
                
                logger.info(f"{engine_name}: {char_count} chars, {word_count} words, score: {quality_score:.1f}")
                
            except Exception as e:
                logger.error(f"{engine_name} failed: {str(e)}")
                results[engine_name] = ""
                scores[engine_name] = 0
        
        # Select best result
        if scores and max(scores.values()) > 0:
            best_engine = max(scores.keys(), key=lambda k: scores[k])
            best_text = results[best_engine]
            best_score = scores[best_engine]
        else:
            best_engine = "None"
            best_text = "No text detected by any engine"
            best_score = 0
        
        logger.info(f"Best result from {best_engine} with score {best_score:.1f}")
        
        return {
            "success": True,
            "extracted_text": best_text,
            "filename": file.filename,
            "model_used": f"Multi-Engine (Best: {best_engine})",
            "all_results": results,
            "quality_scores": scores,
            "best_engine": best_engine,
            "available_engines": {
                "tesseract": TESSERACT_AVAILABLE,
                "easyocr": easyocr_reader is not None,
                "trocr": model is not None
            }
        }
        
    except Exception as e:
        logger.error(f"Multi-engine processing failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Multi-engine failed: {str(e)}")

@app.post("/extract-text-easyocr")
async def extract_text_easyocr(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Standard EasyOCR endpoint with better processing"""
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        if easyocr_reader is None:
            raise HTTPException(status_code=503, detail="EasyOCR not available")
        
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        img_array = np.array(image)
        
        # Use EasyOCR with standard settings
        result = easyocr_reader.readtext(img_array, detail=1)
        
        # Extract text properly
        text_parts = []
        for item in result:
            if len(item) >= 2:
                text = item[1]
                confidence = item[2] if len(item) > 2 else 1.0
                if confidence > 0.3 and len(text.strip()) > 0:
                    text_parts.append(text.strip())
        
        extracted_text = ' '.join(text_parts)
        
        return {
            "success": True,
            "extracted_text": extracted_text,
            "filename": file.filename,
            "model_used": "Standard EasyOCR"
        }
        
    except Exception as e:
        logger.error(f"Standard EasyOCR failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Standard EasyOCR failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": {
            "easyocr": easyocr_reader is not None,
            "trocr": model is not None,
            "tesseract": TESSERACT_AVAILABLE
        },
        "tesseract_path": getattr(pytesseract.pytesseract, 'tesseract_cmd', 'Not available') if TESSERACT_AVAILABLE else "Not installed"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1, log_level="info")
