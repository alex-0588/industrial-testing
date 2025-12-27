from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime

app = Flask(__name__)

# 配置
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

print("=" * 50)
print("工业零件缺陷检测系统启动中...")
print("=" * 50)
print("注意：这是模拟版本，使用随机结果")
print("适用于课程演示和论文展示")
print("=" * 50)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/detect', methods=['POST'])
def detect():
    """模拟检测API"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': '没有上传文件'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': '未选择文件'}), 400
    
    # 检查文件类型
    allowed_extensions = {'png', 'jpg', 'jpeg', 'bmp', 'gif'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'success': False, 'error': '不支持的文件格式'}), 400
    
    try:
        # 模拟处理时间
        import time
        import random
        import numpy as np
        
        start_time = datetime.now()
        
        # 读取一点点文件内容（验证文件有效）
        file_bytes = file.read(1024)  # 只读1KB验证
        file.seek(0)  # 重置文件指针
        
        # 模拟处理延迟
        process_time = random.uniform(0.5, 2.0)
        time.sleep(process_time)
        
        # 模拟预测结果
        class_names = [
            'Crazing (裂纹)',
            'Inclusion (夹杂)',
            'Patches (斑块)',
            'Pitted (点蚀)',
            'Rolled-in Scale (轧制氧化皮)',
            'Scratches (划痕)'
        ]
        
        # 基于文件名或随机生成一个"合理"的结果
        filename = file.filename.lower()
        if any(word in filename for word in ['crack', '裂纹', 'line']):
            predicted_idx = 0  # 裂纹
        elif any(word in filename for word in ['inclusion', '夹杂', 'spot']):
            predicted_idx = 1  # 夹杂
        elif any(word in filename for word in ['patch', '斑块', 'blob']):
            predicted_idx = 2  # 斑块
        elif any(word in filename for word in ['pit', '点蚀', 'hole']):
            predicted_idx = 3  # 点蚀
        elif any(word in filename for word in ['scale', '氧化', 'flake']):
            predicted_idx = 4  # 氧化皮
        elif any(word in filename for word in ['scratch', '划痕', 'line']):
            predicted_idx = 5  # 划痕
        else:
            predicted_idx = random.randint(0, 5)  # 随机
        
        # 生成概率
        np.random.seed(int(datetime.now().timestamp()) % 10000)
        base_probs = np.random.dirichlet(np.ones(6) * 0.5)
        base_probs[predicted_idx] *= 2.0  # 提高预测类别的概率
        base_probs = base_probs / base_probs.sum()
        
        # 构建结果
        result = {
            'success': True,
            'data': {
                'defect_type': class_names[predicted_idx],
                'confidence': float(base_probs[predicted_idx]),
                'all_probabilities': {
                    class_names[i]: float(prob) for i, prob in enumerate(base_probs)
                },
                'processing_time': round((datetime.now() - start_time).total_seconds(), 3),
                'timestamp': datetime.now().isoformat(),
                'image_info': {
                    'filename': file.filename,
                    'size': len(file_bytes)
                }
            }
        }
        
        print(f"检测完成: {class_names[predicted_idx]} ({base_probs[predicted_idx]*100:.1f}%)")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"检测失败: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'检测失败: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0 (模拟版)',
        'message': '系统运行正常，使用模拟检测算法'
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """获取系统统计信息"""
    return jsonify({
        'success': True,
        'data': {
            'total_requests': 0,
            'system_status': 'running',
            'model_type': 'simulation',
            'accuracy': 'N/A (模拟模式)'
        }
    })

if __name__ == '__main__':
    print("\n系统信息:")
    print(f"   访问地址: http://localhost:5000")
    print(f"   API文档: http://localhost:5000/api/health")
    print(f"   上传目录: {os.path.abspath(UPLOAD_FOLDER)}")
    print("=" * 50)
    print(" 按 Ctrl+C 停止服务器")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)