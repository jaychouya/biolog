import asyncio
import json
import queue
import threading
from typing import AsyncGenerator, Optional

from fastapi import HTTPException

from llm_client import chat_completion, iter_chat_completion


def _normalize_result(
    data: dict,
    symptom: str,
    image: Optional[str],
    provider_name: str,
    model: str,
) -> dict:
    data["user_symptom"] = data.get("user_symptom") or symptom
    data["is_custom"] = True
    data["is_ai"] = True
    data["provider"] = provider_name
    data["model"] = model
    if image:
        data["image"] = image
    if data.get("photo_insights") is None and image:
        data["photo_insights"] = []
    if not image:
        data["confidence_without_image"] = None
        data["counterfactual_note"] = None
        data["photo_annotations"] = None
    elif not data.get("photo_annotations"):
        data["photo_annotations"] = []

    required = ["primary_cause", "confidence_score", "primary_action", "evidence_chain", "reasoning_steps"]
    for field in required:
        if field not in data:
            raise HTTPException(status_code=502, detail=f"AI 响应缺少字段: {field}")
    return data


def analyze_symptom(
    symptom: str,
    image: Optional[str],
    api_key: str,
    provider_id: str = "openai",
    model: Optional[str] = None,
    base_url: Optional[str] = None,
) -> dict:
    try:
        data, provider_name, resolved_model, _ = chat_completion(
            provider_id, api_key, symptom, image, model, base_url
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI 调用失败: {str(e)}") from e

    try:
        return _normalize_result(data, symptom, image, provider_name, resolved_model)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail="AI 返回格式异常") from e


async def stream_analyze(
    symptom: str,
    image: Optional[str],
    api_key: str,
    provider_id: str = "openai",
    model: Optional[str] = None,
    base_url: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    def emit(event: dict) -> str:
        return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

    from providers import get_provider

    provider_name = get_provider(provider_id)["name"]
    yield emit({"type": "step", "text": f"连接 {provider_name}..."})

    event_queue: queue.Queue = queue.Queue()

    def producer():
        try:
            for event in iter_chat_completion(
                provider_id, api_key, symptom, image, model, base_url
            ):
                event_queue.put(event)
        except Exception as e:
            event_queue.put(("error", str(e)))
        finally:
            event_queue.put(None)

    threading.Thread(target=producer, daemon=True).start()
    loop = asyncio.get_event_loop()
    result = None

    while True:
        event = await loop.run_in_executor(None, event_queue.get)
        if event is None:
            break
        if event[0] == "error":
            yield emit({"type": "error", "message": event[1]})
            return
        if event[0] == "token":
            yield emit({"type": "token", "text": event[1]})
        if event[0] == "complete":
            raw, pname, resolved_model, _ = event[1], event[2], event[3], event[4]
            try:
                result = _normalize_result(raw, symptom, image, pname, resolved_model)
            except HTTPException as e:
                yield emit({"type": "error", "message": e.detail})
                return

    if not result:
        yield emit({"type": "error", "message": "未收到完整分析结果"})
        return

    yield emit({"type": "step", "text": "解析推理步骤..."})
    for step in result.get("reasoning_steps", []):
        yield emit({"type": "step", "text": step})

    yield emit({"type": "done", "data": result})
