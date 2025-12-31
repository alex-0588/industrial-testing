# models/model.py
import numpy as np
import random
from datetime import datetime

class SimpleDefectCNN:
    
    def __init__(self, num_classes=6):
        self.num_classes = num_classes
        self.class_names = [
            'Crazing (裂纹)',
            'Inclusion (夹杂)',
            'Patches (斑块)',
            'Pitted (点蚀)',
            'Rolled-in Scale (轧制氧化皮)',
            'Scratches (划痕)'
        ]
        print("模拟模型初始化完成")
    
    def predict(self, image_tensor):
        """模拟预测过程"""
        # 生成随机的概率（模拟模型输出）
        timestamp = int(datetime.now().timestamp())
        np.random.seed(timestamp % 10000)
        
        # 使用Dirichlet分布生成概率（保证和为1）
        probabilities = np.random.dirichlet(np.ones(self.num_classes) * 0.5, size=1)[0]
        
        # 稍微调整，让某个类别概率更高（模拟正确预测）
        predicted_idx = np.random.randint(0, self.num_classes)
        probabilities[predicted_idx] *= 2.0
        probabilities = probabilities / probabilities.sum()
        
        return probabilities

def load_model(model_path=None, device='cpu'):
    """加载模拟模型"""
    print("=" * 50)
    print("注意：使用模拟模型，检测结果是随机的")
    print("这是为了演示目的，实际使用时应替换为真实模型")
    print("=" * 50)
    return SimpleDefectCNN()

def predict_image(model, image_tensor, device='cpu'):
    """预测单张图片"""
    # 模拟处理时间
    import time
    process_time = random.uniform(0.3, 1.2)
    time.sleep(process_time)
    
    # 获取预测概率
    probabilities = model.predict(image_tensor)
    
    # 确保概率和为1（浮点数精度问题）
    probabilities = probabilities / probabilities.sum()
    
    return probabilities

# 测试模型
if __name__ == "__main__":
    print("测试模拟模型...")
    model = load_model()
    
    # 模拟一个图像张量
    fake_image = np.random.randn(1, 224, 224)
    
    print("\n模拟预测结果:")
    probs = predict_image(model, fake_image)
    
    for i, (name, prob) in enumerate(zip(model.class_names, probs)):
        print(f"{name}: {prob:.4f} ({prob*100:.1f}%)")
    
    predicted_idx = np.argmax(probs)
    print(f"\n预测类别: {model.class_names[predicted_idx]}")
    print(f"置信度: {probs[predicted_idx]*100:.1f}%")
    print("模拟模型测试通过！")
