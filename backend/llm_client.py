from typing import Iterator, Optional, Tuple, Union

from openai import OpenAI

from prompts import SYSTEM_PROMPT
from providers import get_provider, resolve_model

StreamEvent = Union[Tuple[str, str], Tuple[str, dict, str, str, bool]]


def create_client(provider_id: str, api_key: str, base_url: Optional[str] = None) -> OpenAI:
    cfg = get_provider(provider_id)
    if provider_id == "custom":
        if not base_url:
            raise ValueError("自定义端点需要填写 Base URL")
        url = base_url.rstrip("/")
    else:
        url = base_url or cfg.get("base_url")

    kwargs = {"api_key": api_key}
    if url:
        kwargs["base_url"] = url
    return OpenAI(**kwargs)


def build_messages(symptom: str, image: Optional[str], include_image: bool):
    if include_image and image:
        user_content = [
            {"type": "text", "text": f"用户症状描述：{symptom}"},
            {"type": "image_url", "image_url": {"url": image}},
        ]
    else:
        extra = ""
        if image and not include_image:
            extra = "（用户上传了餐食照片，但当前模型不支持视觉，请仅基于文字推断，并在 reasoning_steps 中说明）"
        user_content = f"用户症状描述：{symptom}{extra}"
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]


def chat_completion(
    provider_id: str,
    api_key: str,
    symptom: str,
    image: Optional[str],
    model: Optional[str] = None,
    base_url: Optional[str] = None,
) -> Tuple[dict, str, str, bool]:
    cfg = get_provider(provider_id)
    has_image = bool(image)
    use_vision = has_image and cfg["supports_vision"]
    resolved_model = resolve_model(provider_id, model, use_vision)
    client = create_client(provider_id, api_key, base_url)

    response = client.chat.completions.create(
        model=resolved_model,
        messages=build_messages(symptom, image, use_vision),
        response_format={"type": "json_object"},
        max_tokens=1500,
    )
    raw = response.choices[0].message.content
    import json

    data = json.loads(raw)
    data["vision_used"] = use_vision
    if has_image and not use_vision:
        data["vision_skipped"] = True
    return data, cfg["name"], resolved_model, use_vision


def iter_chat_completion(
    provider_id: str,
    api_key: str,
    symptom: str,
    image: Optional[str],
    model: Optional[str] = None,
    base_url: Optional[str] = None,
) -> Iterator[StreamEvent]:
    import json

    cfg = get_provider(provider_id)
    has_image = bool(image)
    use_vision = has_image and cfg["supports_vision"]
    resolved_model = resolve_model(provider_id, model, use_vision)
    client = create_client(provider_id, api_key, base_url)

    stream = client.chat.completions.create(
        model=resolved_model,
        messages=build_messages(symptom, image, use_vision),
        response_format={"type": "json_object"},
        max_tokens=1500,
        stream=True,
    )
    buffer = ""
    for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        if delta:
            buffer += delta
            yield ("token", delta)

    data = json.loads(buffer)
    data["vision_used"] = use_vision
    if has_image and not use_vision:
        data["vision_skipped"] = True
    yield ("complete", data, cfg["name"], resolved_model, use_vision)


def test_connection(
    provider_id: str,
    api_key: str,
    base_url: Optional[str] = None,
) -> dict:
    client = create_client(provider_id, api_key, base_url)
    models = client.models.list()
    count = len(getattr(models, "data", []) or [])
    cfg = get_provider(provider_id)
    return {
        "ok": True,
        "provider": cfg["name"],
        "models_available": count,
    }
