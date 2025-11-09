// 取消导入
function cancelImport() {
    console.log('cancelImport called');

    // 隐藏项目信息区域
    const projectInfo = document.getElementById('projectInfo');
    projectInfo.style.display = 'none';

    showScreen('screen4');
    document.getElementById('screenTitle').textContent = '项目进展一览';
}

// 获取本周一的日期
function getThisMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // 调整为周一
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0]; // 返回YYYY-MM-DD格式
}

// 重置导入表单
function resetImportForm() {
    // 清空手动添加的文档
    manualDocuments = [];
    updateManualDocumentsDisplay();
    console.log('重置导入表单');

    // 清空项目名称
    const projectNameInput = document.getElementById('projectName');
    if (projectNameInput) {
        projectNameInput.value = '';
    }

    // 重置周开始日期为本周一
    const weekStartDateInput = document.getElementById('weekStartDate');
    if (weekStartDateInput) {
        weekStartDateInput.value = getThisMonday();
    }

    // 清空文件选择
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }

    // 隐藏文件夹结构
    hideFolderStructure();

    // 文件夹信息已通过文件夹结构显示，无需重置

    // 移除手动文档显示区域（如果存在）
    const manualDocsDisplay = document.getElementById('manualDocumentsDisplay');
    if (manualDocsDisplay) {
        const manualDocsCard = manualDocsDisplay.closest('.card');
        if (manualDocsCard) {
            manualDocsCard.remove();
        }
    }

    console.log('导入表单已重置');
}

// 更新处理状态显示
function updateProcessingStatus(data) {
    console.log('更新处理状态:', data);

    const processedPages = document.getElementById('processedPages');
    const usedTokens = document.getElementById('usedTokens');
    const estimatedTime = document.getElementById('estimatedTime');
    const processingStatus = document.getElementById('processingStatus');

    console.log('DOM元素:', {
        processedPages: !!processedPages,
        usedTokens: !!usedTokens,
        estimatedTime: !!estimatedTime,
        processingStatus: !!processingStatus
    });

    if (processedPages) {
        processedPages.textContent = data.pages || 0;
        console.log('更新文件数:', data.pages || 0);
    }
    if (usedTokens) {
        usedTokens.textContent = (data.tokens || 0).toLocaleString();
        console.log('更新token数:', data.tokens || 0);
    }
    if (estimatedTime) {
        estimatedTime.textContent = data.estimatedTime || '0秒';
        console.log('更新预计时间:', data.estimatedTime || '0秒');
    }
    if (processingStatus) {
        processingStatus.textContent = data.status || '处理中...';
        console.log('更新状态:', data.status || '处理中...');
    }
}

// 文件选择监听
document.getElementById('fileInput').addEventListener('change', function(e) {
    const files = e.target.files;
    if (files.length > 0) {
        const folderPath = files[0].webkitRelativePath.split('/')[0];
        // 不再显示文件夹名称，直接显示文件夹结构
        // 显示文件夹结构（会自动包含手动添加的文档）
        displayFolderStructure(files);
    } else {
        // 文件夹信息已通过文件夹结构显示，无需设置未选择状态
        // 如果还有手动文档，仍然显示
        if (manualDocuments && manualDocuments.length > 0) {
            updateManualDocumentsDisplay();
        } else {
            hideFolderStructure();
        }
    }
});

// 构建文件夹树结构
function buildFolderTree(files) {
    const tree = {};

    Array.from(files).forEach(file => {
        // 过滤掉系统文件和隐藏文件
        if (file.name.startsWith('.') ||
            file.name === '.DS_Store' ||
            file.name === 'Thumbs.db' ||
            file.name === 'desktop.ini') {
            return;
        }

        const path = file.webkitRelativePath;
        const parts = path.split('/');
        let current = tree;

        parts.forEach((part, index) => {
            // 过滤掉隐藏文件夹
            if (part.startsWith('.')) {
                return;
            }

            if (!current[part]) {
                current[part] = {
                    type: index === parts.length - 1 ? 'file' : 'folder',
                    children: {},
                    file: index === parts.length - 1 ? file : null
                };
            }
            current = current[part].children;
        });
    });

    return tree;
}

// 显示文件夹结构
function displayFolderStructure(files) {
    const structureCard = document.getElementById('folderStructureCard');
    const structureContainer = document.getElementById('folderStructure');

    // 构建文件夹树结构
    const tree = buildFolderTree(files);

    // 如果有手动添加的文档，添加到树结构中
    if (manualDocuments && manualDocuments.length > 0) {
        if (!tree['其他文档']) {
            tree['其他文档'] = {
                type: 'folder',
                children: {},
                file: null
            };
        }

        manualDocuments.forEach((doc, index) => {
            const fileName = doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') + '.html';
            tree['其他文档'].children[fileName] = {
                type: 'file',
                children: {},
                file: {
                    name: fileName,
                    content: doc.content,
                    isManual: true
                }
            };
        });
    }

    // 生成HTML
    const html = generateTreeHTML(tree);
    structureContainer.innerHTML = html;

    // 显示文件夹结构卡片
    structureCard.style.display = 'block';
}

// 隐藏文件夹结构
function hideFolderStructure() {
    const structureCard = document.getElementById('folderStructureCard');
    structureCard.style.display = 'none';
}

// 生成树状结构的HTML
function generateTreeHTML(tree, prefix = '') {
    let html = '';

    Object.keys(tree).sort().forEach(name => {
        const item = tree[name];
        const fileName = name.toLowerCase();
        const isTextFile = item.type === 'file' && (
            fileName.endsWith('.html') ||
            fileName.endsWith('.htm') ||
            fileName.endsWith('.txt') ||
            fileName.endsWith('.md')
        );
        const isFolder = item.type === 'folder';

        if (isFolder) {
            // 文件夹
            html += `
                <div class="folder-item folder" onclick="toggleFolder(this)">
                    <span class="folder-toggle collapsed"></span>
                    📁 ${name}
                </div>
                <div class="folder-children" style="display: none;">
                    ${generateTreeHTML(item.children, prefix + '  ')}
                </div>
            `;
        } else if (isTextFile) {
            // HTML文件或其他文本文件
            const displayName = cleanNotionFilename(name);
            // 检查是否是手动添加的文档
            const fileData = item.file;
            const isManual = fileData && fileData.isManual;
            const fileItemAttr = isManual ? `data-file-item='${JSON.stringify(fileData).replace(/'/g, "&apos;")}'` : '';

            // 为手动文档添加编辑和删除按钮
            const actionButtons = isManual ? `
                <div class="file-actions">
                    <button class="file-action-btn edit-btn" onclick="editManualDocument('${name}', event)" title="编辑文档">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="file-action-btn delete-btn" onclick="deleteManualDocument('${name}', event)" title="删除文档">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            ` : '';

            html += `<div class="folder-item file html" onclick="showFileContent('${name}', this)" data-file="${name}" ${fileItemAttr} title="${name}">
                <div class="file-info">
                    <span class="file-icon">📄</span>
                    <span class="file-name">${displayName}</span>
                </div>
                ${actionButtons}
            </div>`;
        } else {
            // 其他文件（不支持编辑删除）
            html += `<div class="folder-item file">
                <div class="file-info">
                    <span class="file-icon">📄</span>
                    <span class="file-name">${name}</span>
                </div>
            </div>`;
        }
    });

    return html;
}

// 切换文件夹展开/折叠
function toggleFolder(element) {
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

// 检测内容是否为 markdown 格式
function isMarkdown(content) {
    // 检查 markdown 的典型特征
    const markdownPatterns = [
        /^#{1,6}\s+.+$/m,  // 标题 (# ## ###)
        /\*\*.*?\*\*/,      // 粗体 (**text**)
        /\*.*?\*/,          // 斜体 (*text*)
        /^[-*+]\s+.+$/m,    // 无序列表 (- item)
        /^\d+\.\s+.+$/m,    // 有序列表 (1. item)
        /`.*?`/,            // 行内代码 (`code`)
        /^```[\s\S]*?```$/m, // 代码块 (```code```)
        /\[.*?\]\(.*?\)/,    // 链接 ([text](url))
        /!\[.*?\]\(.*?\)/,   // 图片 (![alt](url))
    ];

    return markdownPatterns.some(pattern => pattern.test(content));
}

// Notion 风格的 HTML 后处理
function notionifyHTML(html) {
    return html
        // 任务列表处理 - 创建更好的 HTML 结构
        .replace(/<li>\[ \] (.*?)<\/li>/g, '<li class="task-list-item"><input type="checkbox">$1</li>')
        .replace(/<li>\[x\] (.*?)<\/li>/gi, '<li class="task-list-item"><input type="checkbox" checked>$1</li>')
        .replace(/<li>\[X\] (.*?)<\/li>/g, '<li class="task-list-item"><input type="checkbox" checked>$1</li>')
        // 优化引用块样式
        .replace(/<blockquote>/g, '<blockquote class="notion-quote">')
        // 优化代码块
        .replace(/<pre><code>/g, '<pre class="notion-code-block"><code>')
        .replace(/<\/code><\/pre>/g, '</code></pre>')
        // 确保段落有适当的间距
        .replace(/<p>/g, '<p class="notion-paragraph">')
        // 优化列表
        .replace(/<ul>/g, '<ul class="notion-list">')
        .replace(/<ol>/g, '<ol class="notion-list">')
        // 优化表格
        .replace(/<table>/g, '<table class="notion-table">')
        .replace(/<th>/g, '<th class="notion-table-header">')
        .replace(/<td>/g, '<td class="notion-table-cell">');
}

// 解析内容（支持 markdown）
async function parseContent(content) {
    if (typeof marked !== 'undefined' && isMarkdown(content)) {
        // 配置 marked 选项，模拟 Notion 风格
        marked.setOptions({
            breaks: true,      // 转换换行为 <br>
            gfm: true,         // 启用 GitHub 风格 markdown
            headerIds: false,  // 不生成标题 ID
            mangle: false,     // 不转义 HTML
            smartLists: true,  // 智能列表
            smartypants: true  // 智能标点
        });

        // 处理 marked 库的新版本（返回 Promise）
        try {
            const result = await marked.parse(content);
            // 确保返回的是字符串
            if (typeof result === 'string') {
                // 应用 Notion 风格的后处理
                return notionifyHTML(result);
            } else {
                console.warn('Markdown 解析返回非字符串结果，使用原始内容');
                return content;
            }
        } catch (error) {
            console.warn('Markdown 解析失败，使用原始内容:', error);
            return content;
        }
    }
    return content;
}

// 显示文件内容
function showFileContent(filename, element) {
    // 使用清理后的显示名称
    const displayName = cleanNotionFilename(filename);

    // 检查是否是手动添加的文档（通过查找手动文档列表）
    if (manualDocuments && manualDocuments.length > 0) {
        const fileNameWithoutExt = filename.replace(/\.(html|htm|txt|md)$/i, '');
        const manualDoc = manualDocuments.find(doc => {
            const docFileName = doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
            return docFileName === fileNameWithoutExt;
        });

        if (manualDoc) {
            parseContent(manualDoc.content).then(parsedContent => {
                showDialog(displayName, parsedContent);
            });
            return;
        }
    }

    // 读取文件内容并显示
    const fileInput = document.getElementById('fileInput');
    const files = Array.from(fileInput.files);
    const file = files.find(f => f.name === filename);

    if (file && filename.toLowerCase().endsWith('.html')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            showDialog(displayName, e.target.result);
        };
        reader.readAsText(file);
    } else if (file && (filename.toLowerCase().endsWith('.md') || filename.toLowerCase().endsWith('.txt'))) {
        // 支持 .md 和 .txt 文件的 markdown 解析
        const reader = new FileReader();
        reader.onload = async function(e) {
            const parsedContent = await parseContent(e.target.result);
            showDialog(displayName, parsedContent);
        };
        reader.readAsText(file);
    } else {
        showDialog(displayName, `<p>无法预览此文件类型</p>`);
    }
}

// 清理Notion文件名，去掉ID部分
function cleanNotionFilename(filename) {
    // 去掉.html后缀
    let name = filename.replace('.html', '');

    // Notion文件名通常包含32位十六进制ID，我们需要去掉这些ID
    // 使用正则表达式直接替换掉所有32位十六进制字符串
    const idPattern = /[a-f0-9]{32}/gi; // 匹配32位十六进制ID（去掉边界匹配）

    // 直接替换掉所有ID，保留其他内容
    name = name.replace(idPattern, '').trim();

    // 清理多余的空格（多个连续空格变成单个空格）
    name = name.replace(/\s+/g, ' ').trim();

    // 如果清理后文件名太短或为空，使用默认名称
    if (!name || name.length < 2) {
        name = '未命名文档';
    }

    return name;
}

// 更新手动文档显示
function updateManualDocumentsDisplay() {
    // 更新文件夹结构显示（如果文件选择不为空）
    const fileInput = document.getElementById('fileInput');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        displayFolderStructure(fileInput.files);
    } else if (manualDocuments.length > 0) {
        // 如果只有手动文档，也显示文件夹结构
        const structureCard = document.getElementById('folderStructureCard');
        const structureContainer = document.getElementById('folderStructure');
        if (structureCard && structureContainer) {
            // 构建只有手动文档的树结构
            const tree = {
                '其他文档': {
                    type: 'folder',
                    children: {},
                    file: null
                }
            };

            manualDocuments.forEach((doc, index) => {
                const fileName = doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') + '.html';
                tree['其他文档'].children[fileName] = {
                    type: 'file',
                    children: {},
                    file: {
                        name: fileName,
                        content: doc.content,
                        isManual: true
                    }
                };
            });

            const html = generateTreeHTML(tree);
            structureContainer.innerHTML = html;
            structureCard.style.display = 'block';
        }
    } else {
        // 如果没有手动文档，隐藏文件夹结构
        const structureCard = document.getElementById('folderStructureCard');
        if (structureCard) {
            structureCard.style.display = 'none';
        }
    }
}

// 处理文件上传
async function handleUpload() {
    console.log('handleUpload called');
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    const projectNameInput = document.getElementById('projectName');
    const weekStartDateInput = document.getElementById('weekStartDate');

    // 检查是否有文件或手动添加的文档
    const hasFiles = files && files.length > 0;
    const hasManualDocs = manualDocuments && manualDocuments.length > 0;

    if (!hasFiles && !hasManualDocs) {
        showToast('请先选择文件夹或添加文档', 'warning');
        return;
    }

    // 判断是导入新进展还是创建新项目
    const isImportNewProgress = currentProject && currentProject !== null;

    if (isImportNewProgress) {
        // 导入新进展：不需要项目名称，使用当前项目
        try {
            // 获取导入模式选择
            const importModeInput = document.getElementById('importMode');
            const isUpdateCurrentWeek = importModeInput && importModeInput.value === 'current_week';

            // 获取周开始日期
            const weekStartDateInput = document.getElementById('weekStartDate');
            const weekStartDate = weekStartDateInput ? weekStartDateInput.value : null;

            console.log('📅 日期输入框元素:', weekStartDateInput);
            console.log('📅 日期输入框值:', weekStartDateInput ? weekStartDateInput.value : '元素不存在');
            console.log('开始导入新进展...', isUpdateCurrentWeek ? '(本周新进展)' : '(开启新周)', '开始日期:', weekStartDate);
            console.log('准备调用 uploadFilesForNextWeek，参数:', {
                projectId: currentProject,
                files: files ? files.length : 0,
                isUpdateCurrentWeek,
                weekStartDate
            });

            if (weekStartDate) {
                console.log('✅ 前端将传递周开始日期:', weekStartDate);
            } else {
                console.warn('❌ 前端周开始日期为空');
            }

            // 显示处理中状态
            updateProcessingStatus({
                pages: 0,
                tokens: 0,
                estimatedTime: '计算中...',
                status: '正在上传文件并分析...'
            });

            // 跳转到加载页面
            console.log('跳转到加载页面 screen2');
            showScreen('screen2');
            console.log('页面跳转完成，等待UI重绘');
            // 给UI一个机会重绘
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('开始调用后端API');
            const result = await uploadFilesForNextWeek(currentProject, files, isUpdateCurrentWeek, weekStartDate);
            console.log('导入结果:', result);

            if (result && result.success) {
                updateProcessingStatus({
                    pages: result.file_count || 0,
                    tokens: result.token_count || 0,
                    estimatedTime: formatEstimatedTime(result.estimated_time_seconds || 0),
                    status: '文件上传成功，正在分析新一周进展...'
                });

                const weekText = isUpdateCurrentWeek ? `第${result.week}周新进展已更新！` : `第${result.week}周分析完成！`;
                console.log('📊 后端返回结果:', {
                    week: result.week,
                    isUpdateCurrentWeek,
                    weekText
                });
                showToast(weekText, 'success');
                await resetImportForm();
                await loadProjects();
                // 重新加载当前周报数据
                if (result.week) {
                    console.log('🔄 设置currentWeek为:', result.week);
                    currentWeek = result.week;
                    console.log('📥 加载周报数据:', currentProject, result.week);
                    const reportData = await loadWeekReport(currentProject, result.week);
                    console.log('📄 周报数据:', reportData ? {
                        week_period: reportData.week_period,
                        hasData: true
                    } : 'null');
                    if (reportData) {
                        document.querySelector('.week-current').textContent = '第 ' + result.week + ' 周';
                        // 更新左下角的日期显示
                        const currentPeriodElement = document.getElementById('currentPeriod');
                        const newPeriod = reportData.week_period || '未设置';
                        console.log('📅 更新日期显示:', newPeriod);
                        if (currentPeriodElement) {
                            currentPeriodElement.textContent = newPeriod;
                        }
                        // 显示项目信息区域（侧边栏）
                        const projectInfo = document.getElementById('projectInfo');
                        if (projectInfo) {
                            projectInfo.style.display = 'block';
                        }

                        updateSidebarFolderStructure(currentProject, result.week);
                        renderReport(reportData);
                    }
                }
                // 返回报告页面
                showScreen('screen3');
            } else {
                showScreen('screen2');
                updateProcessingStatus({
                    pages: 0,
                    tokens: 0,
                    estimatedTime: '0秒',
                    status: '导入失败: ' + (result?.message || '未知错误')
                });
            }
        } catch (error) {
            console.error('导入过程出错:', error);
            showScreen('screen2');
            updateProcessingStatus({
                pages: 0,
                tokens: 0,
                estimatedTime: '0秒',
                status: '导入失败: ' + error.message
            });
        }
        return; // 提前返回，不执行创建新项目的逻辑
    }

    // 创建新项目：需要项目名称
    const projectName = projectNameInput.value.trim();
    if (!projectName) {
        showToast('请输入项目名称', 'warning');
        projectNameInput.focus();
        return;
    }

    const weekStartDate = weekStartDateInput.value;
    if (!weekStartDate) {
        showToast('请选择本周开始日期', 'warning');
        weekStartDateInput.focus();
        return;
    }

    // 文件夹信息已通过文件夹结构显示，无需单独显示

    try {
        // 先显示上传中状态（不跳转页面）
        updateProcessingStatus({
            pages: 0,
            tokens: 0,
            estimatedTime: '计算中...',
            status: '正在上传文件并计算...'
        });

        console.log('开始上传文件...');

        // 等待上传完成并收到响应
        const result = await uploadFiles(files, projectName, weekStartDate);
        console.log('上传结果:', result);

        if (result && result.success) {
            // 收到响应后，跳转到处理中页面
            showScreen('screen2');

            // 使用后端返回的实际数据更新状态
            updateProcessingStatus({
                pages: result.file_count || 0,
                tokens: result.token_count || 0,
                estimatedTime: formatEstimatedTime(result.estimated_time_seconds || 0),
                status: '文件上传成功，正在后台分析...'
            });

            showToast('文件上传成功！系统正在后台处理您的内容。', 'success');

            // 执行后续操作
            await resetImportForm();
            await loadProjects();

            if (result.project_id) {
                const newProject = projects.find(p => p.id === result.project_id);
                if (newProject) {
                    await selectProject(result.project_id, newProject.name);
                } else {
                    showScreen('screen4');
                    document.getElementById('screenTitle').textContent = '项目进展一览';
                }
            } else {
                showScreen('screen4');
                document.getElementById('screenTitle').textContent = '项目进展一览';
            }
        } else {
            // 上传失败，显示错误信息
            showScreen('screen2');
            updateProcessingStatus({
                pages: 0,
                tokens: 0,
                estimatedTime: '0秒',
                status: '上传失败: ' + (result?.message || '未知错误')
            });
        }
    } catch (error) {
        console.error('上传过程出错:', error);
        // 跳转到处理中页面显示错误
        showScreen('screen2');
        updateProcessingStatus({
            pages: 0,
            tokens: 0,
            estimatedTime: '0秒',
            status: '上传失败: ' + error.message
        });
        showToast('上传失败: ' + error.message, 'error');
    }
}

// 编辑手动文档
function editManualDocument(filename, event) {
    event.stopPropagation(); // 阻止事件冒泡，避免触发文件预览

    // 找到对应的手动文档
    const fileNameWithoutExt = filename.replace(/\.(html|htm|txt|md)$/i, '');
    const manualDoc = manualDocuments.find(doc => {
        const docFileName = doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
        return docFileName === fileNameWithoutExt;
    });

    if (!manualDoc) {
        showToast('未找到文档', 'error');
        return;
    }

    // 显示编辑对话框
    showEditDocumentDialog(manualDoc, filename);
}

// 删除手动文档
function deleteManualDocument(filename, event) {
    event.stopPropagation(); // 阻止事件冒泡

    // 确认删除
    if (!confirm(`确定要删除文档 "${filename}" 吗？此操作不可撤销。`)) {
        return;
    }

    // 找到并删除文档
    const fileNameWithoutExt = filename.replace(/\.(html|htm|txt|md)$/i, '');
    const docIndex = manualDocuments.findIndex(doc => {
        const docFileName = doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
        return docFileName === fileNameWithoutExt;
    });

    if (docIndex !== -1) {
        manualDocuments.splice(docIndex, 1);
        showToast('文档已删除', 'success');

        // 重新显示文件夹结构
        const fileInput = document.getElementById('fileInput');
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            displayFolderStructure(fileInput.files);
        } else if (manualDocuments.length > 0) {
            // 如果只有手动文档，创建一个空的树结构来显示手动文档
            const tree = {};
            displayFolderStructure([]);
        } else {
            hideFolderStructure();
        }
    } else {
        showToast('删除失败：未找到文档', 'error');
    }
}

// 显示编辑文档对话框
function showEditDocumentDialog(doc, filename) {
    // 移除已存在的对话框
    const existingDialog = document.querySelector('.dialog-overlay');
    if (existingDialog) {
        existingDialog.remove();
    }

    const dialogHTML = `
        <div class="dialog-overlay" onclick="closeEditDocumentDialog()">
            <div class="dialog" onclick="event.stopPropagation()" style="max-width: 800px; max-height: 80vh;">
                <div class="dialog-header">
                    <h3 class="dialog-title">编辑文档</h3>
                    <button class="dialog-close" onclick="closeEditDocumentDialog()">×</button>
                </div>
                <div class="dialog-content" style="padding: 20px;">
                    <div class="dialog-form">
                        <div class="form-group">
                            <label for="editDocTitle" style="display: block; margin-bottom: 8px; font-weight: 600;">文档标题</label>
                            <input type="text" id="editDocTitle" value="${doc.title}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-top: 16px;">
                            <label for="editDocContent" style="display: block; margin-bottom: 8px; font-weight: 600;">文档内容</label>
                            <textarea id="editDocContent" style="width: 100%; height: 300px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; resize: vertical;">${doc.content}</textarea>
                        </div>
                    </div>
                </div>
                <div class="dialog-actions" style="padding: 16px 20px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn" onclick="closeEditDocumentDialog()">取消</button>
                    <button class="btn primary" onclick="saveEditedDocument('${filename}')">保存</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dialogHTML);
}

// 关闭编辑文档对话框
function closeEditDocumentDialog() {
    const dialog = document.querySelector('.dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
}

// 保存编辑后的文档
function saveEditedDocument(originalFilename) {
    const newTitle = document.getElementById('editDocTitle').value.trim();
    const newContent = document.getElementById('editDocContent').value.trim();

    if (!newTitle) {
        showToast('请输入文档标题', 'error');
        return;
    }

    if (!newContent) {
        showToast('请输入文档内容', 'error');
        return;
    }

    // 找到并更新文档
    const fileNameWithoutExt = originalFilename.replace(/\.(html|htm|txt|md)$/i, '');
    const docIndex = manualDocuments.findIndex(doc => {
        const docFileName = doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
        return docFileName === fileNameWithoutExt;
    });

    if (docIndex !== -1) {
        manualDocuments[docIndex] = {
            title: newTitle,
            content: newContent
        };

        showToast('文档已保存', 'success');
        closeEditDocumentDialog();

        // 重新显示文件夹结构
        const fileInput = document.getElementById('fileInput');
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            displayFolderStructure(fileInput.files);
        } else if (manualDocuments.length > 0) {
            displayFolderStructure([]);
        }
    } else {
        showToast('保存失败：未找到文档', 'error');
    }
}
