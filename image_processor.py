# utils/image_processor.py
import io
import base64
import numpy as np
from PIL import Image
import os

class ImageProcessor:
    
    def __init__(self, image_size=224):
        self.image_size = image_size
        print(f"图像处理器初始化，目标尺寸: {image_size}x{image_size}")
    
    def preprocess_image(self, image_file):
        """
        预处理上传的图像
        参数：
            image_file: Flask的FileStorage对象或文件路径
        返回：
            模拟的图像张量（numpy数组）
        """
        try:
            # 读取图像（验证文件格式）
            if hasattr(image_file, 'read'):
                image_bytes = image_file.read()
                image = Image.open(io.BytesIO(image_bytes))
            else:
                image = Image.open(image_file)
            
            # 记录图像信息
            width, height = image.size
            print(f"图像尺寸: {width}x{height}")
            
            # 为了演示，我们返回一个模拟的张量
            # 注意：模拟模型不需要真实处理，所以返回一个随机数组
            # 形状为 (1, 1, image_size, image_size) 模拟 batch=1, channel=1, height, width
            fake_tensor = np.random.randn(1, 1, self.image_size, self.image_size).astype(np.float32)
            
            # 显示图像预览（保存到uploads目录供前端显示）
            self.save_preview(image)
            
            return fake_tensor
        
        except Exception as e:
            print(f"图像预处理失败: {str(e)}")
            # 返回一个模拟的张量
            return np.random.randn(1, 1, self.image_size, self.image_size).astype(np.float32)
    
    def save_preview(self, image):
        """保存预览图像"""
        try:
            # 创建预览目录
            preview_dir = "uploads/previews"
            os.makedirs(preview_dir, exist_ok=True)
            
            # 保存为预览文件
            preview_path = os.path.join(preview_dir, "latest.jpg")
            
            # 调整大小以便显示
            image.thumbnail((400, 400))
            
            # 转换为RGB（如果是RGBA或灰度图）
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            image.save(preview_path, "JPEG", quality=85)
            print(f"预览图保存到: {preview_path}")
            
        except Exception as e:
            print(f"保存预览图失败: {e}")
    
    def image_to_base64(self, image):
        """将PIL图像转换为base64字符串"""
        buffered = io.BytesIO()
        
        # 确保图像是RGB模式，否则转换可能出错
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        image.save(buffered, format="JPEG", quality=85)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/jpeg;base64,{img_str}"
    
    def get_image_info(self, image_file):
        """获取图像信息"""
        try:
            if hasattr(image_file, 'read'):
                image_bytes = image_file.read()
                image = Image.open(io.BytesIO(image_bytes))
                # 重置文件指针
                image_file.seek(0)
            else:
                image = Image.open(image_file)
            
            return {
                'width': image.width,
                'height': image.height,
                'format': image.format,
                'mode': image.mode,
                'size_bytes': len(image_file.read()) if hasattr(image_file, 'read') else os.path.getsize(image_file)
            }
        except Exception as e:
            print(f"获取图像信息失败: {e}")
            return None

# 测试代码
if __name__ == "__main__":
    print("测试图像处理器...")
    processor = ImageProcessor()
    
    # 创建一个测试图像
    test_image = Image.new('RGB', (200, 200), color='red')
    
    # 测试base64转换
    base64_str = processor.image_to_base64(test_image)
    print(f"Base64字符串长度: {len(base64_str)}")
    
    print("图像处理器测试通过！")