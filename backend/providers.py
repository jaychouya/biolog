PROVIDERS = {
    "openai": {
        "name": "OpenAI",
        "base_url": None,
        "default_model": "gpt-4o",
        "vision_model": "gpt-4o",
        "supports_vision": True,
    },
    "deepseek": {
        "name": "DeepSeek",
        "base_url": "https://api.deepseek.com",
        "default_model": "deepseek-chat",
        "vision_model": "deepseek-chat",
        "supports_vision": False,
    },
    "moonshot": {
        "name": "Moonshot / Kimi",
        "base_url": "https://api.moonshot.cn/v1",
        "default_model": "moonshot-v1-8k",
        "vision_model": "moonshot-v1-8k-vision-preview",
        "supports_vision": True,
    },
    "siliconflow": {
        "name": "硅基流动",
        "base_url": "https://api.siliconflow.cn/v1",
        "default_model": "deepseek-ai/DeepSeek-V3",
        "vision_model": "Qwen/Qwen2-VL-72B-Instruct",
        "supports_vision": True,
    },
    "custom": {
        "name": "自定义端点",
        "base_url": None,
        "default_model": "gpt-4o",
        "vision_model": "gpt-4o",
        "supports_vision": True,
        "requires_base_url": True,
    },
}


def get_provider(provider_id: str) -> dict:
    if provider_id not in PROVIDERS:
        raise ValueError(f"未知提供商: {provider_id}")
    return PROVIDERS[provider_id]


def list_providers_public():
    return [
        {
            "id": pid,
            "name": cfg["name"],
            "default_model": cfg["default_model"],
            "vision_model": cfg["vision_model"],
            "supports_vision": cfg["supports_vision"],
            "requires_base_url": cfg.get("requires_base_url", False),
        }
        for pid, cfg in PROVIDERS.items()
    ]


from typing import Optional


def resolve_model(provider_id: str, model: Optional[str], has_image: bool) -> str:
    cfg = get_provider(provider_id)
    if model:
        return model
    return cfg["vision_model"] if has_image else cfg["default_model"]
