# main.py
import os
import asyncio
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Code Complexity Predictor API",
    description="An API that predicts code complexity using OpenRouter AI models",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CodeInput(BaseModel):
    code: str = Field(..., description="The source code to analyze", min_length=1)
    language: Optional[str] = Field("auto", description="Programming language (auto-detect if not specified)")
    model: Optional[str] = Field("anthropic/claude-3.5-sonnet", description="AI model to use for analysis")

class ComplexityPrediction(BaseModel):
    time_complexity: str
    space_complexity: str
    explanation: str
    confidence_score: float
    suggestions: list[str]

class ComplexityResponse(BaseModel):
    success: bool
    prediction: Optional[ComplexityPrediction] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is required")

# System prompt for code complexity analysis
COMPLEXITY_ANALYSIS_PROMPT = """
You are an expert software engineer specializing in algorithmic complexity analysis. 
Analyze the provided code and return a JSON response with the following structure:

{
    "time_complexity": "O(n)" or similar Big O notation,
    "space_complexity": "O(1)" or similar Big O notation, 
    "explanation": "Detailed explanation of the complexity analysis",
    "confidence_score": 0.95 (float between 0 and 1),
    "suggestions": ["optimization suggestion 1", "optimization suggestion 2"]
}

Focus on:
1. Identifying loops, recursive calls, and nested operations
2. Analyzing data structure operations (arrays, hash maps, trees, etc.)
3. Considering best, average, and worst-case scenarios
4. Providing actionable optimization suggestions
5. Being precise about the dominant complexity factors

Return only valid JSON without any markdown formatting or additional text.
"""

async def call_openrouter_api(
    messages: list[Dict[str, str]], 
    model: str = "anthropic/claude-3.5-sonnet"
) -> Dict[str, Any]:
    """Make API call to OpenRouter"""
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:8000",  # Update for production
        "X-Title": "Code Complexity Predictor",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.1,  # Low temperature for consistent analysis
        "max_tokens": 1000,
        "top_p": 0.9
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPStatusError as e:
            logger.error(f"OpenRouter API error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"OpenRouter API error: {e.response.text}"
            )
        except httpx.TimeoutException:
            logger.error("OpenRouter API timeout")
            raise HTTPException(status_code=408, detail="Request timeout")
        except Exception as e:
            logger.error(f"Unexpected error calling OpenRouter API: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

def parse_complexity_response(content: str) -> ComplexityPrediction:
    """Parse the AI response into a structured ComplexityPrediction"""
    import json
    
    try:
        # Clean the response in case there's extra formatting
        content = content.strip()
        if content.startswith("```"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        
        data = json.loads(content)
        
        return ComplexityPrediction(
            time_complexity=data.get("time_complexity", "O(?)"),
            space_complexity=data.get("space_complexity", "O(?)"),
            explanation=data.get("explanation", "Analysis unavailable"),
            confidence_score=min(max(data.get("confidence_score", 0.5), 0.0), 1.0),
            suggestions=data.get("suggestions", [])
        )
    
    except (json.JSONDecodeError, KeyError) as e:
        logger.error(f"Failed to parse AI response: {str(e)}")
        # Return fallback response
        return ComplexityPrediction(
            time_complexity="O(?)",
            space_complexity="O(?)",
            explanation="Unable to parse complexity analysis",
            confidence_score=0.0,
            suggestions=["Please try again with different code"]
        )

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Code Complexity Predictor API is running"}

@app.get("/models")
async def get_available_models():
    """Get list of available models from OpenRouter"""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{OPENROUTER_BASE_URL}/models",
                headers=headers
            )
            response.raise_for_status()
            models_data = response.json()
            
            # Filter for models suitable for code analysis
            suitable_models = []
            for model in models_data.get("data", []):
                model_id = model.get("id", "")
                if any(provider in model_id for provider in ["anthropic", "openai", "google", "meta"]):
                    suitable_models.append({
                        "id": model_id,
                        "name": model.get("name", model_id),
                        "context_length": model.get("context_length", 0)
                    })
            
            return {"models": suitable_models}
            
        except Exception as e:
            logger.error(f"Error fetching models: {str(e)}")
            return {"models": [], "error": str(e)}

@app.post("/predict-complexity", response_model=ComplexityResponse)
async def predict_complexity(input_data: CodeInput):
    """
    Analyze code complexity using AI models via OpenRouter API
    
    This endpoint accepts source code and returns:
    - Time complexity (Big O notation)
    - Space complexity (Big O notation) 
    - Detailed explanation
    - Confidence score
    - Optimization suggestions
    """
    import time
    start_time = time.time()
    
    try:
        # Prepare the messages for the AI model
        messages = [
            {"role": "system", "content": COMPLEXITY_ANALYSIS_PROMPT},
            {"role": "user", "content": f"Language: {input_data.language}\n\nCode to analyze:\n``````"}
        ]
        
        # Call OpenRouter API
        response = await call_openrouter_api(messages, input_data.model)
        
        # Extract the AI's response
        ai_content = response["choices"][0]["message"]["content"]
        
        # Parse into structured prediction
        prediction = parse_complexity_response(ai_content)
        
        processing_time = time.time() - start_time
        
        return ComplexityResponse(
            success=True,
            prediction=prediction,
            processing_time=round(processing_time, 3)
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error in predict_complexity: {str(e)}")
        processing_time = time.time() - start_time
        
        return ComplexityResponse(
            success=False,
            error=str(e),
            processing_time=round(processing_time, 3)
        )

@app.post("/batch-predict")
async def batch_predict_complexity(codes: list[CodeInput]):
    """
    Analyze multiple code snippets in parallel
    Limited to 5 concurrent requests to avoid rate limiting
    """
    if len(codes) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 code snippets per batch")
    
    # Process in batches of 5 to avoid overwhelming the API
    semaphore = asyncio.Semaphore(5)
    
    async def analyze_single(code_input: CodeInput):
        async with semaphore:
            return await predict_complexity(code_input)
    
    results = await asyncio.gather(
        *[analyze_single(code) for code in codes],
        return_exceptions=True
    )
    
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
