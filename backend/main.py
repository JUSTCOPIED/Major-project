from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from typing import Optional, List, Any

from data_gen import IndianResumeGen
from bias_detector import get_bias_metrics

app = FastAPI(title="EthosGuard Bias Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    n: int = 1000

class BiasDetectRequest(BaseModel):
    n_select: int = 50
    basis: str = "merit" # merit, random, biased, diversity
    candidates: Optional[List[dict]] = None

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend API is running"}

@app.post("/api/generate")
def generate_data(req: GenerateRequest):
    try:
        df = IndianResumeGen().gen(req.n)
        return {"candidates": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/detect_bias")
def detect_bias(req: BiasDetectRequest):
    try:
        if req.candidates and len(req.candidates) > 0:
            df = pd.DataFrame(req.candidates)
        else:
            try:
                df = pd.read_csv("resumes.csv")
            except FileNotFoundError:
                df = IndianResumeGen().gen(1000) # Fallback if csv not generated
                df.to_csv("resumes.csv", index=False)
            
        metrics = get_bias_metrics(df, req.n_select, req.basis)
        if "error" in metrics:
            raise HTTPException(status_code=400, detail=metrics["error"])
            
        return metrics
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    message: str
    report_data: list
    api_key: Optional[str] = None

@app.post("/api/chat")
def chat_with_bot(req: ChatRequest):
    import os
    try:
        from groq import Groq
    except ImportError:
        raise HTTPException(status_code=500, detail="Groq library not installed on the server.")
        
    api_key = req.api_key or os.getenv("GROQ_API_KEY") or ""
    if not api_key:
        raise HTTPException(status_code=400, detail="GROQ_API_KEY is not set.")
        
    try:
        client = Groq(api_key=api_key)
        
        system_prompt = (
            "You are an AI fairness and bias expert. The user has run an AI selection audit on a pool of synthetic resumes. "
            f"Here is the result of the audit (Fairlearn and AIF360 metrics): {req.report_data}\n\n"
            "Explain the results clearly and concisely to the user, answering their questions."
        )
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
