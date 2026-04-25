// ==================== AI Image Analysis ====================

class ImageAnalyzer {
    constructor() {
        // State
        this.currentImage = null;
        this.imageData = null;
        this.isAnalyzing = false;
        
        // API 服务商配置
        this.apiProviders = {
            'openai': {
                name: 'OpenAI',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                models: [
                    { id: 'gpt-4o', name: 'GPT-4o (推荐)' },
                    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo Vision' },
                    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
                ]
            },

            'zhipu': {
                name: '智谱 AI (GLM)',
                endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                models: [
                    { id: 'glm-4v', name: 'GLM-4V (推荐)' },
                    { id: 'glm-4v-plus', name: 'GLM-4V Plus' }
                ]
            },
            'baidu': {
                name: '百度文心一言',
                endpoint: 'https://qianfan.baidubce.com/v2/app/conversation',
                models: [
                    { id: 'ernie-4v', name: 'ERNIE-4V (推荐)' },
                    { id: 'ernie-3.5-8k', name: 'ERNIE-3.5' }
                ]
            },
            'aliyun': {
                name: '阿里通义千问',
                endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
                models: [
                    { id: 'qwen-vl-plus', name: 'Qwen-VL-Plus (推荐)' },
                    { id: 'qwen-vl-max', name: 'Qwen-VL-Max' }
                ]
            },
            'volcengine': {
                name: '火山引擎 (豆包)',
                endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
                models: [
                    { id: 'doubao-pro-32k', name: '豆包 Pro (推荐)' }
                ]
            },
            'azure': {
                name: 'Azure OpenAI',
                endpoint: '',
                models: [
                    { id: 'gpt-4o', name: 'GPT-4o' },
                    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo Vision' }
                ]
            }
        };
        
        // 当前选中的服务商
        this.currentProvider = localStorage.getItem('img_provider') || 'openai';
        
        // Settings
        this.settings = {
            apiEndpoint: localStorage.getItem('img_api_endpoint') || this.apiProviders[this.currentProvider].endpoint,
            apiKey: localStorage.getItem('img_api_key') || '',
            model: localStorage.getItem('img_model') || this.apiProviders[this.currentProvider].models[0]?.id
        };
        
        // DOM Elements
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImage = document.getElementById('previewImage');
        this.reuploadBtn = document.getElementById('reuploadBtn');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resultsPlaceholder = document.getElementById('resultsPlaceholder');
        this.resultsContent = document.getElementById('resultsContent');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        this.saveSettings = document.getElementById('saveSettings');
        
        // Analysis options
        this.options = {
            description: document.getElementById('optDescription'),
            tags: document.getElementById('optTags'),
            colors: document.getElementById('optColors'),
            ocr: document.getElementById('optOCR')
        };
        
        // Result elements
        this.resultElements = {
            description: document.getElementById('descriptionText'),
            tags: document.getElementById('tagsList'),
            colors: document.getElementById('colorsList'),
            ocr: document.getElementById('ocrText'),
            infoName: document.getElementById('infoName'),
            infoFormat: document.getElementById('infoFormat'),
            infoSize: document.getElementById('infoSize'),
            infoFileSize: document.getElementById('infoFileSize')
        };
        
        this.init();
    }
    
    init() {
        this.initEventListeners();
        this.initSettings();
    }
    
    // ==================== Event Listeners ====================
    initEventListeners() {
        this.uploadZone.addEventListener('click', (e) => {
            if (e.target !== this.reuploadBtn && !this.reuploadBtn.contains(e.target)) {
                this.fileInput.click();
            }
        });
        
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });
        
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('dragover');
        });
        
        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.classList.remove('dragover');
        });
        
        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFile(e.dataTransfer.files[0]);
            }
        });
        
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData.items;
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        this.handleFile(file);
                    }
                    break;
                }
            }
        });
        
        this.reuploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });
        
        this.analyzeBtn.addEventListener('click', () => this.analyzeImage());
        
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    const text = targetEl.textContent;
                    navigator.clipboard.writeText(text);
                    this.showToast('已复制到剪贴板');
                }
            });
        });
        
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettingsModal();
        });
        this.saveSettings.addEventListener('click', () => this.saveSettingsData());
        
        // Provider change
        const providerSelect = document.getElementById('providerSelect');
        providerSelect.addEventListener('change', () => {
            this.currentProvider = providerSelect.value;
            this.updateModelOptions();
            this.updateEndpointField();
        });
        
        Object.values(this.options).forEach(opt => {
            opt.addEventListener('change', () => this.updateAnalyzeButton());
        });
    }
    
    updateModelOptions() {
        const provider = this.apiProviders[this.currentProvider];
        const modelSelect = document.getElementById('modelSelect');
        
        modelSelect.innerHTML = provider.models.map(m => 
            `<option value="${m.id}">${m.name}</option>`
        ).join('');
        
        if (provider.models.length > 0) {
            modelSelect.value = provider.models[0].id;
        }
    }
    
    updateEndpointField() {
        const provider = this.apiProviders[this.currentProvider];
        const endpointInput = document.getElementById('apiEndpoint');
        
        if (this.currentProvider === 'azure') {
            endpointInput.placeholder = '输入 Azure 端点 URL';
            endpointInput.value = '';
        } else {
            endpointInput.placeholder = provider.endpoint;
            endpointInput.value = provider.endpoint;
        }
    }
    
    // ==================== File Handling ====================
    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('请上传图片文件');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('图片大小不能超过10MB');
            return;
        }
        
        this.currentImage = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.imageData = e.target.result;
            this.displayPreview();
            this.updateAnalyzeButton();
        };
        reader.onerror = () => {
            this.showToast('读取文件失败');
        };
        reader.readAsDataURL(file);
    }
    
    displayPreview() {
        this.previewImage.src = this.imageData;
        this.uploadPlaceholder.style.display = 'none';
        this.imagePreview.classList.add('active');
    }
    
    // ==================== Analysis ====================
    async analyzeImage() {
        if (!this.currentImage || this.isAnalyzing) return;
        
        if (!this.settings.apiKey) {
            this.showToast('请先在设置中配置API Key');
            this.openSettings();
            return;
        }
        
        this.isAnalyzing = true;
        this.updateAnalyzeButton();
        this.showResults();
        
        this.resultsPlaceholder.classList.add('hidden');
        this.resultsContent.classList.add('active');
        
        try {
            this.updateImageInfo();
            
            if (this.options.description.checked || this.options.tags.checked) {
                await this.analyzeWithAI();
            }
            
            if (this.options.colors.checked) {
                this.analyzeColors();
            }
            
            if (this.options.ocr.checked) {
                this.analyzeOCR();
            }
            
        } catch (error) {
            this.showToast(`分析失败：${error.message}`);
        }
        
        this.isAnalyzing = false;
        this.updateAnalyzeButton();
    }
    
    async analyzeWithAI() {
        const base64Data = this.imageData.split(',')[1];
        
        let prompt = '请分析这张图片，';
        const tasks = [];
        
        if (this.options.description.checked) {
            tasks.push('提供详细的图像描述');
        }
        if (this.options.tags.checked) {
            tasks.push('提取8-12个关键词标签');
        }
        
        prompt += tasks.join('，') + '。';
        prompt += '请用简体中文回复。';
        prompt += '标签用逗号分隔。';
        
        // 构建请求消息（所有服务商都使用 base64 格式）
        const messages = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
                ]
            }
        ];
        
        const response = await fetch(this.settings.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.settings.apiKey}`
            },
            body: JSON.stringify({
                model: this.settings.model,
                messages: messages,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API请求失败 (${response.status})`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        this.parseAIResponse(content);
    }
    
    parseAIResponse(content) {
        try {
            const json = JSON.parse(content);
            if (json.description && this.options.description.checked) {
                this.resultElements.description.textContent = json.description;
            }
            if (json.tags && this.options.tags.checked) {
                this.renderTags(json.tags);
            }
            return;
        } catch (e) {
            // Not JSON, parse as text
        }
        
        const lines = content.split('\n');
        const descriptionLines = [];
        const tagLines = [];
        let inTagsSection = false;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.toLowerCase().includes('标签') || trimmed.toLowerCase().includes('tag')) {
                inTagsSection = true;
                continue;
            }
            if (trimmed.toLowerCase().includes('描述') || trimmed.toLowerCase().includes('description')) {
                inTagsSection = false;
                continue;
            }
            
            if (inTagsSection) {
                tagLines.push(trimmed);
            } else {
                descriptionLines.push(trimmed);
            }
        }
        
        if (tagLines.length === 0 && descriptionLines.length > 0) {
            const allText = descriptionLines.join(' ');
            const tagMatch = allText.match(/[,，]([^,，]{2,10})/g);
            if (tagMatch) {
                tagLines.push(...tagMatch.map(t => t.replace(/^[,，]/, '')));
                descriptionLines.length = 0;
                const parts = allText.split(/[,，]/);
                if (parts.length > 0) {
                    descriptionLines.push(parts.slice(0, Math.max(1, parts.length - tagLines.length)).join(' '));
                }
            }
        }
        
        if (this.options.description.checked && descriptionLines.length > 0) {
            this.resultElements.description.textContent = descriptionLines.join(' ').trim();
        }
        
        if (this.options.tags.checked && tagLines.length > 0) {
            const tags = tagLines
                .join(',')
                .replace(/[,，;；]/g, ',')
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 1 && t.length < 20);
            this.renderTags(tags.slice(0, 12));
        }
    }
    
    renderTags(tags) {
        const container = this.resultElements.tags;
        
        if (typeof tags === 'string') {
            tags = tags.split(/[,，]/).map(t => t.trim()).filter(t => t);
        }
        
        container.innerHTML = tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('');
    }
    
    analyzeColors() {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const maxSize = 100;
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const colors = this.extractColors(imageData.data);
            this.renderColors(colors);
        };
        img.src = this.imageData;
    }
    
    extractColors(pixels) {
        const colorCounts = {};
        const step = 4;
        
        for (let i = 0; i < pixels.length; i += 4 * step) {
            const r = Math.round(pixels[i] / 32) * 32;
            const g = Math.round(pixels[i + 1] / 32) * 32;
            const b = Math.round(pixels[i + 2] / 32) * 32;
            const key = `${r},${g},${b}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;
        }
        
        const sorted = Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([key]) => {
                const [r, g, b] = key.split(',').map(Number);
                return { r, g, b, hex: this.rgbToHex(r, g, b) };
            });
        
        return sorted;
    }
    
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    
    renderColors(colors) {
        const container = this.resultElements.colors;
        container.innerHTML = colors.map(color => `
            <div class="color-item">
                <div class="color-swatch" style="background-color: ${color.hex}"></div>
                <span class="color-hex">${color.hex}</span>
            </div>
        `).join('');
    }
    
    analyzeOCR() {
        this.resultElements.ocr.textContent = '文字识别功能需要配置专门的OCR服务。当前版本请使用支持视觉的AI模型（如GPT-4o、Qwen-VL）来识别图片中的文字。';
    }
    
    updateImageInfo() {
        const file = this.currentImage;
        this.resultElements.infoName.textContent = file.name;
        this.resultElements.infoFormat.textContent = file.type.split('/')[1].toUpperCase();
        this.resultElements.infoFileSize.textContent = this.formatSize(file.size);
        
        const img = new Image();
        img.onload = () => {
            this.resultElements.infoSize.textContent = `${img.width} x ${img.height}`;
        };
        img.src = this.imageData;
    }
    
    showResults() {
        this.resultElements.description.textContent = '-';
        this.resultElements.tags.innerHTML = '-';
        this.resultElements.colors.innerHTML = '-';
        this.resultElements.ocr.textContent = '-';
    }
    
    updateAnalyzeButton() {
        const hasImage = this.currentImage !== null;
        const hasOption = Object.values(this.options).some(opt => opt.checked);
        this.analyzeBtn.disabled = !hasImage || !hasOption || this.isAnalyzing;
        this.analyzeBtn.classList.toggle('loading', this.isAnalyzing);
        this.analyzeBtn.querySelector('span').textContent = this.isAnalyzing ? '分析中...' : '开始分析';
    }
    
    // ==================== Settings ====================
    initSettings() {
        document.getElementById('providerSelect').value = this.currentProvider;
        document.getElementById('apiEndpoint').value = this.settings.apiEndpoint;
        document.getElementById('apiEndpoint').placeholder = this.apiProviders[this.currentProvider].endpoint;
        document.getElementById('apiKey').value = this.settings.apiKey;
        document.getElementById('modelSelect').value = this.settings.model;
        
        this.updateModelOptions();
    }
    
    openSettings() {
        // 每次打开时从 localStorage 读取最新保存的值
        this.currentProvider = localStorage.getItem('img_provider') || 'openai';
        this.settings.apiEndpoint = localStorage.getItem('img_api_endpoint') || this.apiProviders[this.currentProvider].endpoint;
        this.settings.apiKey = localStorage.getItem('img_api_key') || '';
        this.settings.model = localStorage.getItem('img_model') || this.apiProviders[this.currentProvider].models[0]?.id;
        
        // 更新表单值
        document.getElementById('providerSelect').value = this.currentProvider;
        document.getElementById('apiEndpoint').value = this.settings.apiEndpoint;
        document.getElementById('apiEndpoint').placeholder = this.apiProviders[this.currentProvider].endpoint;
        document.getElementById('apiKey').value = this.settings.apiKey;
        this.updateModelOptions();
        document.getElementById('modelSelect').value = this.settings.model;
        
        this.settingsModal.classList.add('active');
    }
    
    closeSettingsModal() {
        this.settingsModal.classList.remove('active');
    }
    
    saveSettingsData() {
        this.currentProvider = document.getElementById('providerSelect').value;
        this.settings.apiEndpoint = document.getElementById('apiEndpoint').value || this.apiProviders[this.currentProvider].endpoint;
        this.settings.apiKey = document.getElementById('apiKey').value;
        this.settings.model = document.getElementById('modelSelect').value;
        
        localStorage.setItem('img_provider', this.currentProvider);
        localStorage.setItem('img_api_endpoint', this.settings.apiEndpoint);
        localStorage.setItem('img_api_key', this.settings.apiKey);
        localStorage.setItem('img_model', this.settings.model);
        
        this.closeSettingsModal();
        this.showToast(`设置已保存，已切换到 ${this.apiProviders[this.currentProvider].name}`);
        this.updateAnalyzeButton();
    }
    
    // ==================== Utilities ====================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.imageAnalyzer = new ImageAnalyzer();
});
