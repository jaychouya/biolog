from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from llm_client import test_connection
from openai_service import analyze_symptom, stream_analyze
from providers import list_providers_public

app = FastAPI(title="Biolog API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    symptom: str = Field(min_length=1)
    image: Optional[str] = None
    api_key: str = Field(min_length=1)
    provider: str = "openai"
    model: Optional[str] = None
    base_url: Optional[str] = None


class TestConnectionRequest(BaseModel):
    api_key: str = Field(min_length=1)
    provider: str = "openai"
    base_url: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok", "features": ["analyze", "analyze/stream", "providers", "test-connection"]}


@app.get("/providers")
def providers():
    return list_providers_public()


@app.post("/test-connection")
def test_conn(req: TestConnectionRequest):
    try:
        return test_connection(req.provider, req.api_key, req.base_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"连接失败: {str(e)}") from e


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    return analyze_symptom(
        req.symptom, req.image, req.api_key, req.provider, req.model, req.base_url
    )


@app.post("/analyze/stream")
async def analyze_stream(req: AnalyzeRequest):
    return StreamingResponse(
        stream_analyze(
            req.symptom, req.image, req.api_key, req.provider, req.model, req.base_url
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
