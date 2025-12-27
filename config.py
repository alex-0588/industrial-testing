# config.py
import os
from pathlib import Path

class Config:
    """配置类"""
    
    # 基础配置
    BASE_DIR = Path(__file__).parent.absolute()
    SECRET_KEY = 'dev-key-for-student-project'
    
    # 文件上传配置
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'gif'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    # 模型配置
    MODEL_PATH = BASE_DIR / 'models' / 'best_model.pth'
    IMAGE_SIZE = 224
    USE_REAL_MODEL = False  # 设置为False使用模拟模型
    
    # 分类标签
    CLASS_NAMES = [
        'Crazing (裂纹)',
        'Inclusion (夹杂)',
        'Patches (斑块)',
        'Pitted (点蚀)',
        'Rolled-in Scale (轧制氧化皮)',
        'Scratches (划痕)'
    ]
    
    # Web配置
    DEBUG = True
    HOST = '0.0.0.0'
    PORT = 5000

config = Config()

# 创建必要目录
os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(config.BASE_DIR / 'models', exist_ok=True)
os.makedirs(config.BASE_DIR / 'static' / 'css', exist_ok=True)
os.makedirs(config.BASE_DIR / 'static' / 'js', exist_ok=True)
os.makedirs(config.BASE_DIR / 'test_images', exist_ok=True)