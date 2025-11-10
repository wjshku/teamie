// 渲染项目列表
function renderProjectList() {
    const tbody = document.getElementById('project-list');
    if (!tbody) return;

    if (projects.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 60px 20px; color: #999;">
                    <div class="empty-state">
                        <h3>暂无项目</h3>
                        <p>请先上传 Notion HTML 文件来导入项目</p>
                        <button class="btn primary" onclick="showScreen('screen1')">导入项目</button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = projects.map(project => `
        <tr class="project-row" onclick="selectProject('${project.id}', '${project.name}')">
            <td><strong>${project.name}</strong></td>
            <td>第 ${project.current_week} 周</td>
            <td class="status-cell" data-project="${project.id}" onclick="editStatus(this, event)">${project.status}</td>
            <td class="project-actions">
                <button class="delete-btn" onclick="deleteProject('${project.id}', '${project.name}', event)" title="删除项目">×</button>
            </td>
        </tr>
    `).join('');
}

// 更新项目统计信息
function updateProjectStats() {
    const statsElement = document.getElementById('project-stats');
    if (projects.length > 0) {
        statsElement.textContent = `共 ${projects.length} 个项目`;
    } else {
        statsElement.textContent = '';
    }
}

// 选择项目
async function selectProject(projectId, projectName) {
    console.log('Selecting project:', projectId, projectName);

    // 找到项目（通过ID匹配）
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        showToast('项目不存在', 'error');
        return;
    }

    currentProject = projectId;  // 使用项目ID而不是名称
    currentWeek = project.current_week || 1;

    document.getElementById('currentProject').textContent = projectName;
    document.getElementById('screenTitle').textContent = '进展汇报 - ' + projectName;

    try {
        const reportData = await loadWeekReport(projectId, currentWeek);
        if (reportData) {
            // 设置周数和左下角的日期显示
            document.querySelector('.week-current').textContent = '第 ' + currentWeek + ' 周';
            const currentPeriodElement = document.getElementById('currentPeriod');
            if (currentPeriodElement) {
                currentPeriodElement.textContent = reportData.week_period || '2025-11-03 至 2025-11-09';
            }

            renderReport(reportData);

            // 显示项目信息区域
            const projectInfo = document.getElementById('projectInfo');
            projectInfo.style.display = 'block';

            // 更新侧边栏文件夹结构
            updateSidebarFolderStructure(projectId, currentWeek);

            showScreen('screen3');
        } else {
            showToast('未找到报告数据', 'warning');
        }
    } catch (error) {
        showToast('加载报告失败: ' + error.message, 'error');
    }
}

// 设置默认项目信息
function setDefaultProjectInfo() {
    const weekStartDateInput = document.getElementById('weekStartDate');
    if (weekStartDateInput) {
        weekStartDateInput.value = getThisMonday();
    }

    const projectNameInput = document.getElementById('projectName');
    if (projectNameInput) {
        projectNameInput.value = '';
        projectNameInput.focus();
    }
}

// 编辑项目状态
function editStatus(cellElement, event) {
    if (event) {
        event.stopPropagation();
    }

    const currentText = cellElement.textContent;
    const projectId = cellElement.getAttribute('data-project');

    cellElement.classList.add('editing');
    cellElement.contentEditable = 'true';
    cellElement.focus();

    // 选中所有文本
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(cellElement);
    selection.removeAllRanges();
    selection.addRange(range);

    async function saveEdit() {
        const newText = cellElement.textContent.trim();
        if (newText && newText !== currentText) {
            try {
                // 调用API保存状态更新
                const response = await apiCall(`/projects/${projectId}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: newText })
                });
                if (response && response.success) {
                    cellElement.textContent = newText;
                    console.log(`Status updated for ${projectId}: ${newText}`);
                    showToast('状态更新成功', 'success');
                } else {
                    cellElement.textContent = currentText;
                    showToast('状态更新失败', 'error');
                }
            } catch (error) {
                console.error('Failed to update status:', error);
                cellElement.textContent = currentText;
                showToast('状态更新失败', 'error');
            }
        } else {
            cellElement.textContent = currentText;
        }
        cellElement.classList.remove('editing');
        cellElement.contentEditable = 'false';
    }

    function cancelEdit() {
        cellElement.textContent = currentText;
        cellElement.classList.remove('editing');
        cellElement.contentEditable = 'false';
    }

    cellElement.addEventListener('blur', saveEdit, { once: true });
    cellElement.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    }, { once: true });

    cellElement.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// 更新侧边栏文件夹结构
function updateSidebarFolderStructure(projectId, week = 1) {
    if (projectId && projectId !== '未选择项目') {
        displaySidebarFolderStructure(projectId, week);
    } else {
        document.getElementById('sidebarFolderStructure').innerHTML = '';
    }
}

// 显示侧边栏文件夹结构
async function displaySidebarFolderStructure(projectId, week) {
    const sidebarContainer = document.getElementById('sidebarFolderStructure');

    try {
        // 从后端获取文件列表
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/week/${week}/files`);
        const data = await response.json();

        if (response.ok) {
            const files = data.files || [];

            // 使用统一的文件夹树构建逻辑（与upload.js保持一致）
            let tree = {};

            // 根据文件路径构建树结构
            if (files.length > 0) {
                files.forEach(file => {
                    // file 可能是 "folder/file.html" 或 "其他文档/file.html" 或 "file.html"
                    const pathParts = file.split('/');
                    let current = tree;

                    // 处理路径的每一部分
                    for (let i = 0; i < pathParts.length; i++) {
                        const part = pathParts[i];
                        const isLast = i === pathParts.length - 1;

                        if (isLast) {
                            // 最后一部分是文件名
                            current[part] = {
                                type: 'file',
                                children: {},
                                file: null
                            };
                        } else {
                            // 中间部分是文件夹
                            if (!current[part]) {
                                current[part] = {
                                    type: 'folder',
                                    children: {},
                                    file: null
                                };
                            }
                            current = current[part].children;
                        }
                    }
                });
            }

            // 如果没有文件，显示空状态
            if (Object.keys(tree).length === 0) {
                sidebarContainer.innerHTML = '<div class="folder-item" style="color: #999; font-style: italic;">暂无文件</div>';
                return;
            }

            // 生成HTML（使用侧边栏专用的生成函数）
            const html = generateSidebarTreeHTML(tree);
            sidebarContainer.innerHTML = html;
        } else {
            console.error('获取文件列表失败:', data);
            sidebarContainer.innerHTML = '<div class="folder-item" style="color: #999; font-style: italic;">加载失败</div>';
        }
    } catch (error) {
        console.error('获取文件列表出错:', error);
        sidebarContainer.innerHTML = '<div class="folder-item" style="color: #999; font-style: italic;">加载失败</div>';
    }
}
