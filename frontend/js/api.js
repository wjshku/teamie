// API调用函数
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// 加载项目列表
async function loadProjects() {
    try {
        projects = await apiCall('/projects');
        renderProjectList();
        updateProjectStats();
        return projects;
    } catch (error) {
        console.error('Failed to load projects:', error);
        projects = [];
        renderProjectList();
        updateProjectStats();
        return [];
    }
}

// 加载项目周报
async function loadWeekReport(projectId, week) {
    try {
        const report = await apiCall(`/projects/${projectId}/week/${week}`);
        return report;
    } catch (error) {
        console.log(`Week ${week} data not available for project ${projectId}:`, error.message);
        return null;
    }
}

// 获取项目信息
async function getProjectInfo(projectId) {
    try {
        const projectInfo = await apiCall(`/projects/${projectId}`);
        return projectInfo;
    } catch (error) {
        console.error('Failed to get project info:', error);
        return null;
    }
}

// 上传文件（支持多文件）
async function uploadFiles(files, projectName, weekStartDate) {
    const formData = new FormData();

    // 添加所有文件到 FormData，并保存路径信息
    const filePaths = [];
    if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`处理文件 ${i + 1}:`, {
            name: file.name,
            webkitRelativePath: file.webkitRelativePath,
            type: file.type,
            size: file.size
        });

            // 只添加支持的文件类型（html/txt/md）
            const supportedExtensions = ['.html', '.htm', '.txt', '.md'];
            const fileName = file.name.toLowerCase();
            const lastDot = fileName.lastIndexOf('.');
            const fileExt = lastDot > 0 ? '.' + fileName.substring(lastDot + 1) : '';
            if (supportedExtensions.includes(fileExt)) {
                console.log(`添加文件: ${file.name}`);
            // 直接添加原始文件，后端会处理文件名清理
            formData.append('files', file);

            // 保存文件的相对路径（如果有）
            const relativePath = file.webkitRelativePath || '';
            filePaths.push(relativePath);
        } else {
                console.log(`跳过不支持的文件: ${file.name}`);
                filePaths.push(''); // 保持索引对应
            }
        }

        // 添加路径信息
        filePaths.forEach((path, index) => {
            formData.append('file_paths', path);
        });
    }

    // 添加手动添加的文档（保存到"其他文档"文件夹）
    if (manualDocuments && manualDocuments.length > 0) {
        console.log(`添加 ${manualDocuments.length} 个手动文档`);
        manualDocuments.forEach((doc, index) => {
            // 将内容转换为 File 对象
            // 根据内容判断文件类型，优先使用 .html
            const blob = new Blob([doc.content], { type: 'text/html' });
            const fileName = doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') + '.html';
            const file = new File([blob], fileName, { type: 'text/html' });
            formData.append('files', file);

            // 手动添加的文档保存到"其他文档"文件夹
            formData.append('file_paths', `其他文档/${fileName}`);
            console.log(`添加手动文档: ${fileName} (路径: 其他文档/${fileName})`);
        });
    }

    formData.append('project_name', projectName);
    formData.append('week_start_date', weekStartDate);

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

// 更新完整周报
async function updateWeekReport(projectId, week, weekData) {
    try {
        const result = await apiCall(`/projects/${projectId}/week/${week}`, {
            method: 'PUT',
            body: JSON.stringify(weekData)
        });
        return result;
    } catch (error) {
        console.error('Failed to update week report:', error);
        throw error;
    }
}

// 上传文件（导入新进展）
async function uploadFilesForNextWeek(projectId, files, updateCurrentWeek = false, weekStartDate = null) {
    const formData = new FormData();

    // 添加所有文件到 FormData，并保存路径信息
    const filePaths = [];
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`处理文件 ${i + 1}:`, {
                name: file.name,
                webkitRelativePath: file.webkitRelativePath,
                type: file.type,
                size: file.size
            });

            // 只添加支持的文件类型（html/txt/md）
            const supportedExtensions = ['.html', '.htm', '.txt', '.md'];
            const fileName = file.name.toLowerCase();
            const lastDot = fileName.lastIndexOf('.');
            const fileExt = lastDot > 0 ? '.' + fileName.substring(lastDot + 1) : '';
            if (supportedExtensions.includes(fileExt)) {
                console.log(`添加文件: ${file.name}`);
                formData.append('files', file);

                // 保存文件的相对路径（如果有）
                const relativePath = file.webkitRelativePath || '';
                filePaths.push(relativePath);
            } else {
                console.log(`跳过不支持的文件: ${file.name}`);
                filePaths.push(''); // 保持索引对应
            }
        }

        // 添加路径信息
        filePaths.forEach((path, index) => {
            formData.append('file_paths', path);
        });
    }

    // 添加手动添加的文档（保存到"其他文档"文件夹）
    if (manualDocuments && manualDocuments.length > 0) {
        console.log(`添加 ${manualDocuments.length} 个手动文档`);
        manualDocuments.forEach((doc, index) => {
            const blob = new Blob([doc.content], { type: 'text/html' });
            const fileName = doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') + '.html';
            const file = new File([blob], fileName, { type: 'text/html' });
            formData.append('files', file);

            // 手动添加的文档保存到"其他文档"文件夹
            formData.append('file_paths', `其他文档/${fileName}`);
            console.log(`添加手动文档: ${fileName} (路径: 其他文档/${fileName})`);
        });
    }

    try {
        // 添加更新模式参数
        formData.append('update_current_week', updateCurrentWeek ? 'true' : 'false');

        // 添加周开始日期参数（如果提供）
        if (weekStartDate) {
            console.log('📅 发送周开始日期参数:', weekStartDate);
            formData.append('week_start_date', weekStartDate);
        } else {
            console.warn('⚠️ 未发送周开始日期参数');
        }

        console.log('🚀 发送请求到:', `${API_BASE_URL}/projects/${projectId}/analyze-next-week`);
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/analyze-next-week`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Upload for next week error:', error);
        throw error;
    }
}

// 删除项目
async function deleteProject(projectId, projectName, event) {
    event.stopPropagation(); // 阻止事件冒泡，避免触发行点击

    if (!confirm(`确定要删除项目"${projectName}"吗？\n\n这将永久删除该项目的所有数据，此操作不可恢复。`)) {
        return;
    }

    try {
        // 调用删除API
        await apiCall(`/projects/${projectId}`, {
            method: 'DELETE'
        });

        showToast('项目删除成功', 'success');

        // 检查是否删除了当前项目
        if (currentProject === projectId) {
            console.log('删除了当前项目，重置状态');
            currentProject = null;
            currentWeek = 1;
            // 隐藏项目信息区域
            const projectInfo = document.getElementById('projectInfo');
            if (projectInfo) {
                projectInfo.style.display = 'none';
            }
            // 切换到项目列表页面
            showScreen('screen4');
            document.getElementById('screenTitle').textContent = '项目进展一览';
        }

        // 重新加载项目列表
        await loadProjects();
    } catch (error) {
        console.error('删除项目失败:', error);
        showToast('删除项目失败: ' + error.message, 'error');
    }
}

// 加载模型配置
async function loadModelConfig() {
    try {
        const response = await fetch(`${API_BASE_URL}/models`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data && data.success) {
            availableModels = data.available_models || [];
            currentModel = data.current_model || null;
            console.log('模型配置加载成功:', {
                currentModel: currentModel,
                availableModels: availableModels
            });
        } else {
            console.error('加载模型配置失败: 响应数据格式错误', data);
            showToast('加载模型配置失败', 'error');
        }
    } catch (error) {
        console.error('加载模型配置失败:', error);
        showToast('加载模型配置失败: ' + error.message, 'error');
    }
}

// 保存模型设置
async function saveModelSettings() {
    if (!selectedModelId || selectedModelId === currentModel) {
        closeModelSettingsDialog();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/models/${selectedModelId}`, {
            method: 'POST'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`设置失败: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        if (result && result.success) {
            currentModel = selectedModelId;
            showToast(`模型已切换为 ${result.current_model}`, 'success');
            closeModelSettingsDialog();
        } else {
            throw new Error(result?.message || '设置失败');
        }
    } catch (error) {
        console.error('保存模型设置失败:', error);
        showToast('保存失败: ' + error.message, 'error');
    }
}
