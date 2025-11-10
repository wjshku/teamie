// 显示反馈提示
function showFeedbackToast() {
    const existingToast = document.querySelector('.feedback-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'feedback-toast';
    toast.textContent = 'Thank you for your feedback';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// 通用 Toast 通知函数
function showToast(message, type = 'info', duration = 3000) {
    // 获取所有现有的 toast
    const existingToasts = document.querySelectorAll('.toast');
    const toastCount = existingToasts.length;

    // 创建新的 toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // 计算位置（多个 toast 堆叠显示）
    const topOffset = 20 + (toastCount * 70); // 每个 toast 间隔 70px
    toast.style.top = `${topOffset}px`;

    document.body.appendChild(toast);

    // 自动移除
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => {
            toast.remove();
            // 重新调整剩余 toast 的位置
            const remainingToasts = document.querySelectorAll('.toast');
            remainingToasts.forEach((remainingToast, index) => {
                remainingToast.style.top = `${20 + index * 70}px`;
            });
        }, 300);
    }, duration);

    return toast;
}

// 格式化预计时间
function formatEstimatedTime(seconds) {
    if (!seconds || seconds === 0) {
        return '0秒';
    }
    if (seconds < 60) {
        return `${Math.ceil(seconds)}秒`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.ceil(seconds % 60);
        return `${minutes}分${secs > 0 ? secs + '秒' : ''}`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`;
    }
}

// 清理Notion文件名，去掉ID部分
function cleanNotionFilename(filename) {
    // 去掉.html后缀
    let name = filename.replace('.html', '');

    // 检查是否包含ID模式（通常是32位十六进制字符串）
    // Notion ID通常是32个字符的十六进制字符串
    const idPattern = /\s+[a-f0-9]{32}$/;
    if (idPattern.test(name)) {
        name = name.replace(idPattern, '');
    }

    // 清理文件名中的特殊字符，保留中文、英文、数字、空格和下划线
    name = name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s_-]/g, '');

    // 压缩连续的空格和下划线
    name = name.replace(/[\s_]+/g, ' ');

    // 去除首尾空格
    name = name.trim();

    return name;
}


// 显示模型设置对话框
function showModelSettingsDialog() {
    // 移除已有的对话框
    const existingDialog = document.querySelector('.dialog-overlay');
    if (existingDialog) {
        existingDialog.remove();
    }

    // 确保模型列表已加载
    if (availableModels.length === 0) {
        showToast('正在加载模型列表...', 'info');
        loadModelConfig().then(() => {
            // 重新打开对话框
            setTimeout(() => showModelSettingsDialog(), 100);
        }).catch(err => {
            console.error('加载模型配置失败:', err);
            showToast('加载模型配置失败', 'error');
        });
        return;
    }

    console.log('显示模型对话框，可用模型:', availableModels);
    console.log('当前模型:', currentModel);

    // 生成模型选项HTML
    let modelOptionsHTML = '';
    if (availableModels.length > 0) {
        modelOptionsHTML = availableModels.map(model => {
            const isSelected = currentModel === model.id;
            return `
                <div data-model-id="${model.id}" style="padding: 10px 12px; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s ease; background: ${isSelected ? '#f5f5f5' : 'transparent'}; font-weight: ${isSelected ? '600' : '400'}; font-size: 13px; color: #333;" onclick="selectModel('${model.id}')">
                    ${model.name}
                </div>
            `;
        }).join('');
    } else {
        modelOptionsHTML = '<div style="padding: 20px; text-align: center; color: #999; font-size: 13px;">暂无可用模型</div>';
    }

    const dialogHTML = `
        <div class="dialog-overlay" onclick="closeModelSettingsDialog()">
            <div class="dialog" onclick="event.stopPropagation()" style="max-width: 400px;">
                <div class="dialog-header">
                    <h3 class="dialog-title">AI 模型设置</h3>
                    <button class="dialog-close" onclick="closeModelSettingsDialog()">×</button>
                </div>
                <div class="dialog-content" style="padding: 16px 20px;">
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #333; margin-bottom: 8px;">选择模型</label>
                        <div id="modelOptions" style="display: flex; flex-direction: column; gap: 4px;">
                            ${modelOptionsHTML}
                        </div>
                    </div>
                    <div class="dialog-actions" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
                        <button class="btn" onclick="closeModelSettingsDialog()" style="padding: 6px 16px; font-size: 13px;">取消</button>
                        <button class="btn primary" onclick="saveModelSettings()" style="padding: 6px 16px; font-size: 13px;">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', dialogHTML);

    // 初始化选中模型
    selectedModelId = currentModel;
}

// 关闭模型设置对话框
function closeModelSettingsDialog() {
    const dialog = document.querySelector('.dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
}

// 选择模型（临时选择，不保存）
let selectedModelId = currentModel;
function selectModel(modelId) {
    selectedModelId = modelId;
    // 更新视觉反馈
    const options = document.querySelectorAll('#modelOptions > div[data-model-id]');
    options.forEach(option => {
        const optionModelId = option.getAttribute('data-model-id');
        if (optionModelId === modelId) {
            option.style.background = '#f5f5f5';
            option.style.fontWeight = '600';
        } else {
            option.style.background = 'transparent';
            option.style.fontWeight = '400';
        }
    });
}

// 生成侧边栏树状结构的HTML（简化版，支持文件夹和文件）
function generateSidebarTreeHTML(tree, prefix = '', basePath = '') {
    let html = '';

    Object.keys(tree).sort().forEach(name => {
        const item = tree[name];
        const isFolder = item.type === 'folder';
        const currentPath = basePath ? `${basePath}/${name}` : name;

        if (isFolder) {
            // 文件夹
            html += `
                <div class="folder-item folder" onclick="toggleSidebarFolder(this)">
                    <span class="folder-toggle collapsed"></span>
                    📁 ${name}
                </div>
                <div class="folder-children" style="display: none;">
                    ${generateSidebarTreeHTML(item.children, prefix + '  ', currentPath)}
                </div>
            `;
        } else {
            // 文件
            const fileName = name.toLowerCase();
            const isTextFile = fileName.endsWith('.html') || fileName.endsWith('.htm') || fileName.endsWith('.txt') || fileName.endsWith('.md');
            if (isTextFile) {
                const displayName = name.replace(/\.(html|htm|txt|md)$/i, '');
                // 获取项目ID和周数（从全局变量或通过其他方式）
                const projectId = currentProject;
                const week = currentWeek;
                html += `
                    <div class="folder-item file html" onclick="showSidebarFileContent('${currentPath}', ${week}, '${projectId}')" title="${currentPath}">
                        <div class="file-info">
                            <span class="file-icon">📄</span>
                            <span class="file-name">${displayName}</span>
                        </div>
                        <div class="file-actions">
                            <button class="file-action-btn edit-btn" onclick="editSidebarDocument('${currentPath}', ${week}, '${projectId}', event)" title="编辑文档">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                html += `<div class="folder-item file">📄 ${name}</div>`;
            }
        }
    });

    return html;
}

// 切换侧边栏文件夹展开/折叠
function toggleSidebarFolder(element) {
    const toggle = element.querySelector('.folder-toggle');
    const children = element.nextElementSibling;

    if (children.style.display === 'none') {
        children.style.display = 'block';
        toggle.classList.remove('collapsed');
        toggle.classList.add('expanded');
    } else {
        children.style.display = 'none';
        toggle.classList.remove('expanded');
        toggle.classList.add('collapsed');
    }
}

// 显示侧边栏文件内容
async function showSidebarFileContent(filename, week, projectId) {
    // API返回的文件名已经是清理过的，直接去掉.html后缀作为显示名称
    const displayName = filename.replace('.html', '');

    try {
        // 从后端获取文件内容
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/week/${week}/files/${filename}`);
        if (response.ok) {
            const content = await response.text();
            // 使用parseContent函数处理内容，支持Notion样式渲染
            if (typeof parseContent === 'function') {
                const parsedContent = await parseContent(content);
                showDialog(displayName, parsedContent);
            } else {
                // 如果parseContent不存在，直接显示内容
                showDialog(displayName, content);
            }
        } else {
            // 如果API不存在，使用mock内容作为后备
            console.warn('文件内容API不存在，使用mock内容');
            const mockContent = generateSidebarFileContent(filename, week);
            showDialog(displayName, mockContent);
        }
    } catch (error) {
        console.error('获取文件内容出错:', error);
        // 使用mock内容作为后备
        const mockContent = generateSidebarFileContent(filename, week);
        showDialog(displayName, mockContent);
    }
}

// 编辑侧边栏文档
async function editSidebarDocument(filename, week, projectId, event) {
    event.stopPropagation();
    
    const displayName = filename.replace('.html', '');
    
    try {
        // 从后端获取文件内容
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/week/${week}/files/${filename}`);
        if (response.ok) {
            const content = await response.text();
            // 显示编辑对话框，传入保存回调
            showEditDialog(displayName, content, filename, week, projectId);
        } else {
            showToast('无法加载文档', 'error');
        }
    } catch (error) {
        console.error('编辑文档失败:', error);
        showToast('编辑失败', 'error');
    }
}

// 显示编辑对话框
function showEditDialog(title, content, filename, week, projectId) {
    // 移除已存在的对话框
    const existingDialog = document.querySelector('.dialog-overlay');
    if (existingDialog) {
        existingDialog.remove();
    }

    // 转义HTML特殊字符，防止XSS（用于HTML属性）
    const escapedTitle = title.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedFilename = filename.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedProjectId = projectId.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    
    const dialogHTML = `
        <div class="dialog-overlay" onclick="closeDialog()">
            <div class="dialog dialog-add-document" onclick="event.stopPropagation()">
                <div class="dialog-header">
                    <h3 class="dialog-title">编辑: ${escapedTitle}</h3>
                    <button class="dialog-close" onclick="closeDialog()">×</button>
                </div>
                <div class="dialog-content">
                    <div class="dialog-form">
                        <div class="dialog-form-content">
                            <textarea id="editDocumentInput" placeholder="输入文档内容..."></textarea>
                        </div>
                        <div class="dialog-actions">
                            <button class="btn primary" onclick="saveEditDocument('${escapedFilename}', ${week}, '${escapedProjectId}')">保存修改</button>
                            <button class="btn" onclick="closeDialog()">取消</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    // 设置textarea的内容（直接设置value，不需要转义）
    const textarea = document.getElementById('editDocumentInput');
    if (textarea) {
        textarea.value = content;
        textarea.focus();
    }
}

// 保存编辑的文档
async function saveEditDocument(filename, week, projectId) {
    const textarea = document.getElementById('editDocumentInput');
    if (!textarea) {
        showToast('无法获取编辑内容', 'error');
        return;
    }

    const editedContent = textarea.value;
    
    try {
        // 调用后端API更新文件内容
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/week/${week}/files/${filename}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            },
            body: editedContent
        });

        if (response.ok) {
            const result = await response.json();
            showToast('文档已保存', 'success');
            closeDialog();
        } else {
            const errorText = await response.text();
            console.error('保存失败:', errorText);
            showToast('保存失败: ' + (errorText || '未知错误'), 'error');
        }
    } catch (error) {
        console.error('保存文档失败:', error);
        showToast('保存失败: ' + error.message, 'error');
    }
}

// 生成侧边栏文件内容
function generateSidebarFileContent(filename, week) {
    const baseName = filename.replace('.html', '');

    // 根据文件名和周数生成不同的内容
    if (week === 1) {
        switch (baseName) {
            case '原型图':
                return `<h2>第${week}周 - ${baseName}</h2><p>项目原型设计，包含主要功能流程和用户交互说明。</p>`;
            case '设计图':
                return `<h2>第${week}周 - ${baseName}</h2><p>UI设计系统，色彩搭配和组件规范。</p>`;
            case '产品文档':
                return `<h2>第${week}周 - ${baseName}</h2><p>产品需求文档和功能规格说明。</p>`;
        }
    } else if (week === 2) {
        switch (baseName) {
            case '更新文档':
                return `<h2>第${week}周 - ${baseName}</h2><p>项目更新日志和功能改进记录。</p>`;
            case '会议记录':
                return `<h2>第${week}周 - ${baseName}</h2><p>团队会议纪要和讨论要点。</p>`;
            case '进度报告':
                return `<h2>第${week}周 - ${baseName}</h2><p>项目进度汇报和里程碑达成情况。</p>`;
        }
    }

    return `<h2>第${week}周 - ${baseName}</h2><p>这是第${week}周的${baseName}文件内容。</p>`;
}

// 显示对话框
function showDialog(title, content) {
    // 移除已存在的对话框
    const existingDialog = document.querySelector('.dialog-overlay');
    if (existingDialog) {
        existingDialog.remove();
    }

    // 创建对话框HTML
    const dialogHTML = `
        <div class="dialog-overlay" onclick="closeDialog()">
            <div class="dialog" onclick="event.stopPropagation()">
                <div class="dialog-header">
                    <h3 class="dialog-title">${title}</h3>
                    <button class="dialog-close" onclick="closeDialog()">×</button>
                </div>
                <div class="dialog-content">
                    <div>
                        ${content}
                    </div>
                </div>
            </div>
        </div>
    `;

    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
}

// 关闭对话框
function closeDialog() {
    const dialog = document.querySelector('.dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
}

// 显示添加文档对话框
function showAddDocumentDialog() {
    // 移除已存在的对话框
    const existingDialog = document.querySelector('.dialog-overlay');
    if (existingDialog) {
        existingDialog.remove();
    }

    // 创建对话框HTML
    const dialogHTML = `
        <div class="dialog-overlay" onclick="closeAddDocumentDialog()">
            <div class="dialog dialog-add-document" onclick="event.stopPropagation()" style="max-width: 800px; max-height: 80vh;">
                <div class="dialog-header">
                    <h3 class="dialog-title">添加文档</h3>
                    <button class="dialog-close" onclick="closeAddDocumentDialog()">×</button>
                </div>
                <div class="dialog-content">
                    <div class="dialog-form">
                        <div class="dialog-form-content">
                            <label for="docTitle">文档标题</label>
                            <input type="text" id="docTitle" placeholder="输入文档标题" value="">

                            <label for="docContent">文档内容</label>
                            <textarea id="docContent" placeholder="在此粘贴或输入文档内容..."></textarea>
                        </div>
                        <div class="dialog-actions">
                            <button class="btn" onclick="closeAddDocumentDialog()">取消</button>
                            <button class="btn primary" onclick="saveManualDocument()">保存</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', dialogHTML);

    // 聚焦到标题输入框
    setTimeout(() => {
        const titleInput = document.getElementById('docTitle');
        if (titleInput) {
            titleInput.focus();
        }
    }, 100);
}

// 关闭添加文档对话框
function closeAddDocumentDialog() {
    const dialog = document.querySelector('.dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
}

// 保存手动添加的文档
function saveManualDocument() {
    const titleInput = document.getElementById('docTitle');
    const contentInput = document.getElementById('docContent');

    if (!titleInput || !contentInput) {
        return;
    }

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title) {
        showToast('请输入文档标题', 'warning');
        titleInput.focus();
        return;
    }

    if (!content) {
        showToast('请输入文档内容', 'warning');
        contentInput.focus();
        return;
    }

    // 添加到手动文档列表
    manualDocuments.push({
        title: title,
        content: content
    });

    showToast(`文档"${title}"已添加`, 'success');
    closeAddDocumentDialog();

    // 更新已添加文档列表显示
    updateManualDocumentsDisplay();
}

// 翻转导入模式卡片
function flipImportMode() {
    const flipCardInner = document.getElementById('flipCardInner');
    const importModeInput = document.getElementById('importMode');
    if (flipCardInner && importModeInput) {
        flipCardInner.classList.toggle('flipped');
        // 切换值
        if (flipCardInner.classList.contains('flipped')) {
            importModeInput.value = 'current_week';
        } else {
            importModeInput.value = 'new_week';
        }
    }
}

// 初始化反馈按钮
function initializeFeedbackButtons() {
    const sections = ['motivation', 'completed', 'incomplete', 'internal', 'external', 'next-steps'];
    sections.forEach(section => {
        const feedbackContainer = document.getElementById(`feedback-${section}`);
        if (feedbackContainer) {
            const thumbsUpSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 10v12m8-8.5V2c0-.83-.67-1.5-1.5-1.5h-.5a2 2 0 0 0-2 2v7H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"></path>
            </svg>`;

            const thumbsDownSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 14V2m-8 8.5v11.5c0 .83.67 1.5 1.5 1.5h.5a2 2 0 0 1 2-2v-7h7a2 2 0 0 1 2-2v-8a2 2 0 0 1-2-2h-12a2 2 0 0 1-2 2v8a2 2 0 0 1 2 2z"></path>
            </svg>`;

            feedbackContainer.innerHTML = `
                <button class="feedback-btn" onclick="giveFeedback('${section}', 'like')" title="有帮助">
                    ${thumbsUpSvg}
                </button>
                <button class="feedback-btn" onclick="giveFeedback('${section}', 'dislike')" title="没帮助">
                    ${thumbsDownSvg}
                </button>
            `;
        }
    });
}

// 反馈功能
function giveFeedback(sectionName, feedbackType) {
    const section = document.querySelector(`.report-section[data-section="${sectionName}"]`);
    if (!section) return;

    const likeBtn = section.querySelector('.feedback-btn[onclick*="like"]');
    const dislikeBtn = section.querySelector('.feedback-btn[onclick*="dislike"]');

    likeBtn.classList.remove('liked');
    dislikeBtn.classList.remove('disliked');

    if (feedbackType === 'like') {
        likeBtn.classList.add('liked');
        console.log(`用户对 ${sectionName} 维度点赞`);
    } else if (feedbackType === 'dislike') {
        dislikeBtn.classList.add('disliked');
        console.log(`用户对 ${sectionName} 维度点踩`);
    }

    showFeedbackToast();
    if (event) event.stopPropagation();
}