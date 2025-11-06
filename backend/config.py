"""
应用配置文件
集中管理AI模型等配置
"""
import os
import json
import logging

logger = logging.getLogger(__name__)

# 模型配置表
MODEL_CONFIG = {
    "gpt-4o-mini": {
        "tokens_per_second": 1000,
        "encoding_model": "gpt-4",
        "display_name": "GPT-4o Mini"
    },
    "gpt-5-nano": {
        "tokens_per_second": 600,
        "encoding_model": "gpt-4",
        "display_name": "GPT-5 Nano"
    }
}

# 配置文件路径（保存在 data 目录中，便于 Docker 部署）
# 默认使用 data 目录，如果不存在则使用当前目录
data_dir = os.getenv("DATA_DIR", "data")
if not os.path.exists(data_dir):
    os.makedirs(data_dir, exist_ok=True)
CONFIG_FILE = os.path.join(data_dir, "model_config.json")

def get_default_model():
    """获取默认模型（从环境变量或使用默认值）"""
    return os.getenv("AI_MODEL", "gpt-5-nano")

def get_current_model():
    """获取当前使用的模型"""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
                model = config.get("current_model", get_default_model())
                # 验证模型是否在配置表中
                if model in MODEL_CONFIG:
                    return model
                else:
                    logger.warning(f"配置的模型 {model} 不在配置表中，使用默认模型")
                    return get_default_model()
        else:
            # 如果配置文件不存在，使用默认值
            default_model = get_default_model()
            set_current_model(default_model)
            return default_model
    except Exception as e:
        logger.error(f"读取模型配置失败: {str(e)}")
        return get_default_model()

def set_current_model(model_name: str):
    """设置当前使用的模型"""
    if model_name not in MODEL_CONFIG:
        raise ValueError(f"模型 {model_name} 不在配置表中")
    
    try:
        config = {
            "current_model": model_name
        }
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        logger.info(f"模型配置已更新为: {model_name}")
        return True
    except Exception as e:
        logger.error(f"保存模型配置失败: {str(e)}")
        raise

def get_available_models():
    """获取所有可用的模型列表"""
    return [
        {
            "id": model_id,
            "name": config["display_name"]
        }
        for model_id, config in MODEL_CONFIG.items()
    ]

# 当前使用的模型（从配置文件读取）
AI_MODEL = get_current_model()