// static/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // 全局变量
    let uploadedFiles = [];
    let currentDetection = null;
    let isProcessing = false;
    
    // DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const detectBtn = document.getElementById('detectBtn');
    const clearBtn = document.getElementById('clearBtn');
    const testBtn = document.getElementById('testBtn');
    const previewImage = document.getElementById('previewImage');
    const imagePreview = document.getElementById('imagePreview');
    const detectionResult = document.getElementById('detectionResult');
    const batchResult = document.getElementById('batchResult');
    const emptyState = document.getElementById('emptyState');
    const resultStatus = document.getElementById('resultStatus');
    const systemStatus = document.getElementById('systemStatus');
    const testImages = document.getElementById('testImages');
    const testImagesGrid = document.getElementById('testImagesGrid');
    
    // 缺陷类型图标映射
    const defectIcons = {
        'Crazing': 'fas fa-bolt',
        'Inclusion': 'fas fa-circle',
        'Patches': 'fas fa-square',
        'Pitted': 'fas fa-dot-circle',
        'Rolled-in Scale': 'fas fa-layer-group',
        'Scratches': 'fas fa-cut'
    };
    
    // 缺陷类型颜色映射
    const defectColors = {
        'Crazing': '#e74c3c',
        'Inclusion': '#3498db',
        'Patches': '#9b59b6',
        'Pitted': '#1abc9c',
        'Rolled-in Scale': '#f39c12',
        'Scratches': '#34495e'
    };
    
    // 初始化
    init();
    
    // 初始化函数
    async function init() {
        // 检查系统状态
        await checkSystemHealth();
        
        // 设置事件监听器
        setupEventListeners();
        
        // 加载测试图片
        loadTestImages();
    }
    
    // 检查系统状态
    async function checkSystemHealth() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
            if (data.status === 'healthy') {
                systemStatus.innerHTML = '<i class="fas fa-circle"></i> 系统状态: 正常';
                systemStatus.style.color = '#27ae60';
                console.log('系统状态正常:', data);
            } else {
                systemStatus.innerHTML = '<i class="fas fa-circle"></i> 系统状态: 异常';
                systemStatus.style.color = '#e74c3c';
            }
        } catch (error) {
            systemStatus.innerHTML = '<i class="fas fa-circle"></i> 系统状态: 连接失败';
            systemStatus.style.color = '#e74c3c';
            console.error('系统健康检查失败:', error);
        }
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 点击上传区域
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // 文件选择事件
        fileInput.addEventListener('change', handleFileSelect);
        
        // 拖拽事件
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        
        // 控制按钮事件
        detectBtn.addEventListener('click', startDetection);
        clearBtn.addEventListener('click', clearFileList);
        testBtn.addEventListener('click', toggleTestImages);
    }
    
    // 处理文件选择
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        addFilesToUploadList(files);
    }
    
    // 处理拖拽事件
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            addFilesToUploadList(imageFiles);
        } else {
            alert('请上传图片文件！');
        }
    }
    
    // 添加文件到上传列表
    function addFilesToUploadList(files) {
        files.forEach(file => {
            // 检查文件是否已存在
            const existingIndex = uploadedFiles.findIndex(f => 
                f.name === file.name && f.size === file.size
            );
            
            if (existingIndex === -1) {
                uploadedFiles.push(file);
            }
        });
        
        updateFileList();
        updateDetectButton();
    }
    
    // 更新文件列表显示
    function updateFileList() {
        fileList.innerHTML = '';
        
        uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileSize = formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <i class="fas fa-image file-icon"></i>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
                <i class="fas fa-times file-remove" data-index="${index}"></i>
            `;
            
            fileList.appendChild(fileItem);
            
            // 添加删除事件
            const removeBtn = fileItem.querySelector('.file-remove');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFile(index);
            });
        });
    }
    
    // 更新检测按钮状态
    function updateDetectButton() {
        detectBtn.disabled = uploadedFiles.length === 0 || isProcessing;
        
        if (uploadedFiles.length > 1) {
            detectBtn.innerHTML = '<i class="fas fa-tasks"></i> 批量检测';
        } else {
            detectBtn.innerHTML = '<i class="fas fa-search"></i> 开始检测';
        }
    }
    
    // 移除文件
    function removeFile(index) {
        uploadedFiles.splice(index, 1);
        updateFileList();
        updateDetectButton();
    }
    
    // 清空文件列表
    function clearFileList() {
        uploadedFiles = [];
        updateFileList();
        updateDetectButton();
        hideTestImages();
        resetResults();
    }
    
    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 开始检测
    async function startDetection() {
        if (uploadedFiles.length === 0 || isProcessing) return;
        
        isProcessing = true;
        updateDetectButton();
        
        // 更新状态
        updateResultStatus('processing', '检测中...');
        
        // 隐藏空状态
        emptyState.style.display = 'none';
        
        if (uploadedFiles.length === 1) {
            // 单张检测
            await detectSingleImage(uploadedFiles[0]);
        } else {
            // 批量检测
            await detectMultipleImages();
        }
        
        isProcessing = false;
        updateDetectButton();
    }
    
    // 单张图像检测
    async function detectSingleImage(file) {
        try {
            // 显示预览
            displayImagePreview(file);
            
            // 创建FormData
            const formData = new FormData();
            formData.append('file', file);
            
            // 发送请求
            const response = await fetch('/api/detect', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // 显示结果
                displayDetectionResult(result.data);
                updateResultStatus('completed', '检测完成');
            } else {
                throw new Error(result.error || '检测失败');
            }
            
        } catch (error) {
            console.error('检测失败:', error);
            updateResultStatus('error', `检测失败: ${error.message}`);
            alert(`检测失败: ${error.message}`);
        }
    }
    
    // 批量检测
    async function detectMultipleImages() {
        try {
            const formData = new FormData();
            
            // 添加所有文件
            uploadedFiles.forEach(file => {
                formData.append('files', file);
            });
            
            // 显示批量结果表格
            displayBatchTable();
            
            // 发送请求
            const response = await fetch('/api/batch/detect', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // 更新批量结果表格
                updateBatchTable(result.results);
                updateResultStatus('completed', `批量检测完成 (${result.results.length}/${result.total})`);
            } else {
                throw new Error(result.error || '批量检测失败');
            }
            
        } catch (error) {
            console.error('批量检测失败:', error);
            updateResultStatus('error', `批量检测失败: ${error.message}`);
            alert(`批量检测失败: ${error.message}`);
        }
    }
    
    // 显示图像预览
    function displayImagePreview(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            imagePreview.style.display = 'block';
            detectionResult.style.display = 'none';
            batchResult.style.display = 'none';
        };
        
        reader.readAsDataURL(file);
    }
    
    // 显示检测结果
    function displayDetectionResult(data) {
        // 更新缺陷信息
        document.getElementById('defectType').textContent = data.defect_type;
        document.getElementById('confidenceValue').textContent = 
            (data.confidence * 100).toFixed(2);
        document.getElementById('processingTime').textContent = 
            Math.round(data.processing_time * 1000);
        document.getElementById('detectionTime').textContent = 
            new Date(data.timestamp).toLocaleTimeString();
        
        // 更新缺陷图标
        const defectIcon = document.getElementById('defectIcon');
        const defectTypeKey = data.defect_type.split(' ')[0]; // 获取英文部分
        
        defectIcon.innerHTML = `<i class="${defectIcons[defectTypeKey] || 'fas fa-exclamation-triangle'}"></i>`;
        defectIcon.style.background = `linear-gradient(135deg, ${defectColors[defectTypeKey] || '#4a6fa5'}, ${lightenColor(defectColors[defectTypeKey] || '#4a6fa5', 20)})`;
        
        // 更新置信度条
        updateConfidenceBars(data.all_probabilities);
        
        // 显示结果区域
        detectionResult.style.display = 'block';
        batchResult.style.display = 'none';
    }
    
    // 更新置信度条
    function updateConfidenceBars(probabilities) {
        const container = document.getElementById('confidenceBars');
        container.innerHTML = '';
        
        // 按置信度排序
        const sortedEntries = Object.entries(probabilities)
            .sort((a, b) => b[1] - a[1]);
        
        sortedEntries.forEach(([className, confidence]) => {
            const percent = (confidence * 100).toFixed(1);
            const defectTypeKey = className.split(' ')[0];
            const barColor = defectColors[defectTypeKey] || '#4a6fa5';
            
            const barHTML = `
                <div class="confidence-bar">
                    <div class="bar-label">
                        <span>${className}</span>
                        <span>${percent}%</span>
                    </div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percent}%; background: ${barColor};"></div>
                    </div>
                </div>
            `;
            
            container.innerHTML += barHTML;
        });
    }
    
    // 显示批量结果表格
    function displayBatchTable() {
        const tbody = document.querySelector('#batchTable tbody');
        tbody.innerHTML = '';
        
        uploadedFiles.forEach((file, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${file.name}</td>
                <td><span class="spinner" style="width: 16px; height: 16px;"></span></td>
                <td>-</td>
                <td><span class="status-processing">处理中</span></td>
            `;
            tbody.appendChild(row);
        });
        
        batchResult.style.display = 'block';
        detectionResult.style.display = 'none';
        imagePreview.style.display = 'none';
    }
    
    // 更新批量结果表格
    function updateBatchTable(results) {
        const tbody = document.querySelector('#batchTable tbody');
        
        results.forEach((result, index) => {
            const row = tbody.children[index];
            
            if (result.error) {
                row.children[1].innerHTML = '未知';
                row.children[2].innerHTML = '-';
                row.children[3].innerHTML = '<span class="status-error">失败</span>';
            } else {
                row.children[1].innerHTML = result.defect_type;
                row.children[2].innerHTML = (result.confidence * 100).toFixed(1) + '%';
                row.children[3].innerHTML = '<span class="status-completed">完成</span>';
            }
        });
    }
    
    // 更新结果状态
    function updateResultStatus(status, message) {
        resultStatus.innerHTML = `<span class="status-${status}">${message}</span>`;
    }
    
    // 加载测试图片
    async function loadTestImages() {
        try {
            const response = await fetch('/api/test/images');
            const data = await response.json();
            
            if (data.success && data.images.length > 0) {
                testImagesGrid.innerHTML = '';
                
                data.images.forEach(img => {
                    const imgItem = document.createElement('div');
                    imgItem.className = 'test-image-item';
                    imgItem.innerHTML = `
                        <img src="${img.url}" alt="${img.name}">
                        <div class="test-image-name">${img.name}</div>
                    `;
                    
                    imgItem.addEventListener('click', () => {
                        useTestImage(img.url, img.name);
                    });
                    
                    testImagesGrid.appendChild(imgItem);
                });
            }
        } catch (error) {
            console.error('加载测试图片失败:', error);
        }
    }
    
    // 使用测试图片
    async function useTestImage(url, filename) {
        try {
            // 获取测试图片
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], filename, { type: blob.type });
            
            // 添加到上传列表
            uploadedFiles = [file];
            updateFileList();
            updateDetectButton();
            
            // 隐藏测试图片选择
            hideTestImages();
            
            // 自动开始检测
            startDetection();
            
        } catch (error) {
            console.error('使用测试图片失败:', error);
            alert('加载测试图片失败');
        }
    }
    
    // 切换测试图片显示
    function toggleTestImages() {
        if (testImages.style.display === 'none') {
            testImages.style.display = 'block';
            testBtn.innerHTML = '<i class="fas fa-times"></i> 关闭测试图片';
        } else {
            hideTestImages();
        }
    }
    
    // 隐藏测试图片
    function hideTestImages() {
        testImages.style.display = 'none';
        testBtn.innerHTML = '<i class="fas fa-vial"></i> 使用测试图片';
    }
    
    // 重置结果
    function resetResults() {
        imagePreview.style.display = 'none';
        detectionResult.style.display = 'none';
        batchResult.style.display = 'none';
        emptyState.style.display = 'block';
        updateResultStatus('pending', '等待检测');
    }
    
    // 工具函数：颜色变亮
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    // 生成测试图片（如果没有）
    async function generateTestImages() {
        try {
            const response = await fetch('/api/generate/test_images', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('测试图片生成成功！');
                loadTestImages();
            }
        } catch (error) {
            console.error('生成测试图片失败:', error);
        }
    }
    
    // 如果没有测试图片，自动生成
    setTimeout(() => {
        if (testImagesGrid.children.length === 0) {
            generateTestImages();
        }
    }, 1000);
});