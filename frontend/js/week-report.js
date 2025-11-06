// 渲染报告
function renderReport(data) {
    // 渲染"做了什么" (达成事项)
    const completedTasksContainer = document.getElementById('completed-tasks');
    const completedCountContainer = document.getElementById('completed-count');

    if (completedTasksContainer && data.completed_tasks) {
        if (data.completed_tasks.length > 0) {
            completedTasksContainer.innerHTML = `
                <table class="task-table">
                    <thead>
                        <tr>
                            <th>任务名称</th>
                            <th>完成情况</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.completed_tasks.map((task, index) => `
                            <tr class="editable-row" data-path="completed_tasks" data-index="${index}">
                                <td>
                                    <div class="task-name editable-text" data-path="completed_tasks" data-index="${index}" data-field="task" data-placeholder="任务名称">${task.task}</div>
                                </td>
                                <td>
                                    <div class="task-desc editable-text" data-path="completed_tasks" data-index="${index}" data-field="description" data-placeholder="任务描述">${task.description}</div>
                                </td>
                                <td class="row-actions">
                                    <button class="row-action-btn delete" title="删除">×</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="add-row-btn" data-path="completed_tasks">+ 添加完成任务</button>
            `;
        } else {
            completedTasksContainer.innerHTML = `
                <p class="text-muted">暂无达成事项</p>
                <button class="add-row-btn" data-path="completed_tasks">+ 添加完成任务</button>
            `;
        }
    }

    if (completedCountContainer && data.completed_tasks) {
        completedCountContainer.textContent = `共 ${data.completed_tasks.length} 个任务完成`;
    }

    // 渲染"为什么这样做" (动机与方向)
    const reasonsContainer = document.getElementById('reasons-list');
    if (reasonsContainer && data.motivation_direction) {
        if (data.motivation_direction.length > 0) {
            reasonsContainer.innerHTML = `
                ${data.motivation_direction.map((item, index) => `
                    <div class="data-item editable-row" data-path="motivation_direction" data-index="${index}">
                        <span class="editable-text" data-path="motivation_direction" data-index="${index}" data-field="item" data-placeholder="输入动机方向">${item}</span>
                        <div class="row-actions">
                            <button class="row-action-btn delete" title="删除">×</button>
                        </div>
                    </div>
                `).join('')}
                <button class="add-row-btn" data-path="motivation_direction">+ 添加动机方向</button>
            `;
        } else {
            reasonsContainer.innerHTML = '<p class="text-muted">暂无动机方向信息</p>';
        }
    }

    // 渲染"没做什么" (未达成事项)
    const notCompletedTasksContainer = document.getElementById('not-completed-tasks');
    const notCompletedCountContainer = document.getElementById('not-completed-count');

    if (notCompletedTasksContainer && data.incomplete_tasks) {
        if (data.incomplete_tasks.length > 0) {
            notCompletedTasksContainer.innerHTML = `
                <table class="task-table">
                    <thead>
                        <tr>
                            <th>任务名称</th>
                            <th>预期目标</th>
                            <th>未完成原因</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.incomplete_tasks.map((task, index) => `
                            <tr class="editable-row" data-path="incomplete_tasks" data-index="${index}">
                                <td>
                                    <div class="task-name editable-text" data-path="incomplete_tasks" data-index="${index}" data-field="task" data-placeholder="任务名称">${task.task}</div>
                                </td>
                                <td>
                                    <div class="task-desc editable-text" data-path="incomplete_tasks" data-index="${index}" data-field="expected" data-placeholder="预期目标">${task.expected}</div>
                                </td>
                                <td>
                                    <div class="task-desc editable-text" data-path="incomplete_tasks" data-index="${index}" data-field="reason" data-placeholder="未完成原因">${task.reason}</div>
                                </td>
                                <td class="row-actions">
                                    <button class="row-action-btn delete" title="删除">×</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="add-row-btn" data-path="incomplete_tasks">+ 添加未完成任务</button>
            `;
            if (notCompletedCountContainer) {
                notCompletedCountContainer.textContent = `${data.incomplete_tasks.length} 个任务未完成`;
            }
        } else {
            notCompletedTasksContainer.innerHTML = `
                <p class="text-muted">暂无未完成任务</p>
                <button class="add-row-btn" data-path="incomplete_tasks">+ 添加未完成任务</button>
            `;
            if (notCompletedCountContainer) {
                notCompletedCountContainer.textContent = '';
            }
        }
    }

    // 渲染"为什么没做" (内部反思)
    const whyNotContainer = document.getElementById('why-not-list');
    if (whyNotContainer && data.internal_reflection) {
        if (data.internal_reflection.length > 0) {
            whyNotContainer.innerHTML = `
                ${data.internal_reflection.map((item, index) => `
                    <div class="data-item editable-row" data-path="internal_reflection" data-index="${index}">
                        <span class="editable-text" data-path="internal_reflection" data-index="${index}" data-field="item" data-placeholder="输入内部反思">${item}</span>
                        <div class="row-actions">
                            <button class="row-action-btn delete" title="删除">×</button>
                        </div>
                    </div>
                `).join('')}
                <button class="add-row-btn" data-path="internal_reflection">+ 添加内部反思</button>
            `;
        } else {
            whyNotContainer.innerHTML = '<p class="text-muted">暂无内部反思</p>';
        }
    }

    // 渲染"成效与反馈" (外部反馈)
    const achievementsContainer = document.getElementById('achievements-list');
    if (achievementsContainer && data.external_feedback) {
        if (data.external_feedback.length > 0) {
            achievementsContainer.innerHTML = `
                ${data.external_feedback.map((feedback, index) => `
                    <div class="data-item editable-row" data-path="external_feedback" data-index="${index}">
                        <div class="task-name editable-text" data-path="external_feedback" data-index="${index}" data-field="source" data-placeholder="反馈来源">${feedback.source}</div>
                        <div class="task-desc editable-text" data-path="external_feedback" data-index="${index}" data-field="content" data-placeholder="反馈内容">${feedback.content}</div>
                        <div class="row-actions">
                            <button class="row-action-btn delete" title="删除">×</button>
                        </div>
                    </div>
                `).join('')}
                <button class="add-row-btn" data-path="external_feedback">+ 添加外部反馈</button>
            `;
        } else {
            achievementsContainer.innerHTML = '<p class="text-muted">暂无外部反馈</p>';
        }
    }

    // 渲染"下一步计划"
    const nextStepsContainer = document.getElementById('next-steps-list');
    if (nextStepsContainer && data.next_week_plan) {
        if (data.next_week_plan.length > 0) {
            nextStepsContainer.innerHTML = `
                <table class="task-table">
                    <thead>
                        <tr>
                            <th>优先级</th>
                            <th>任务名称</th>
                            <th>目标</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.next_week_plan.map((plan, index) => `
                            <tr class="editable-row" data-path="next_week_plan" data-index="${index}">
                                <td>
                                    <span class="priority-badge editable-text" data-path="next_week_plan" data-index="${index}" data-field="priority" data-placeholder="P1">${typeof plan.priority === 'string' && plan.priority.startsWith('P') ? plan.priority : 'P' + (plan.priority || 1)}</span>
                                </td>
                                <td>
                                    <div class="task-name editable-text" data-path="next_week_plan" data-index="${index}" data-field="task" data-placeholder="任务名称">${plan.task || ''}</div>
                                </td>
                                <td>
                                    <div class="task-desc editable-text" data-path="next_week_plan" data-index="${index}" data-field="goal" data-placeholder="目标描述">${plan.goal || ''}</div>
                                </td>
                                <td class="row-actions">
                                    <button class="row-action-btn delete" title="删除">×</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="add-row-btn" data-path="next_week_plan">+ 添加下一步计划</button>
            `;
        } else {
            nextStepsContainer.innerHTML = '<p class="text-muted">暂无下一步计划</p>';
        }
    }

    // 设置编辑模式
    if (isEditMode) {
        document.body.classList.add('edit-mode');
    } else {
        document.body.classList.remove('edit-mode');
    }
}

// 改变周数
async function changeWeek(direction) {
    console.log('Changing week, direction:', direction);
    const current = parseInt(document.querySelector('.week-current').textContent.match(/\d+/)[0]);
    const newWeek = current + direction;

    // 先获取项目信息来检查边界
    const projectInfo = await getProjectInfo(currentProject);
    if (!projectInfo) {
        showToast('无法获取项目信息', 'error');
        return;
    }

    const maxWeek = projectInfo.total_weeks;

    // 检查边界
    if (newWeek < 1) {
        showToast('已经是第一周了', 'warning');
        return;
    }
    if (newWeek > maxWeek) {
        showToast('已经是最后一周了', 'warning');
        return;
    }

    // 更新当前周
    currentWeek = newWeek;

    // 重新加载数据
    const reportData = await loadWeekReport(currentProject, currentWeek);
    if (reportData) {
        // 更新UI
        document.querySelector('.week-current').textContent = '第 ' + currentWeek + ' 周';
        const currentPeriodElement = document.getElementById('currentPeriod');
        if (currentPeriodElement) {
            currentPeriodElement.textContent = reportData.week_period || '未设置';
        }

        renderReport(reportData);

        // 更新侧边栏文件夹结构
        updateSidebarFolderStructure(currentProject, currentWeek);
    } else {
        showToast('该周数据不存在', 'warning');
    }
}

// 进入编辑模式
function toggleEditMode() {
    isEditMode = true;
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const deleteWeekBtn = document.getElementById('deleteWeekBtn');
    const container = document.querySelector('.container');

    // 隐藏"编辑内容"按钮，显示"保存修改"和"删除该周进展"按钮
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    if (deleteWeekBtn) {
        deleteWeekBtn.style.display = 'inline-block';
    }
    container.classList.add('edit-mode');
    enableInlineEditing();
}

// 退出编辑模式
function exitEditMode() {
    isEditMode = false;
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const deleteWeekBtn = document.getElementById('deleteWeekBtn');
    const container = document.querySelector('.container');

    // 显示"编辑内容"按钮，隐藏"保存修改"和"删除该周进展"按钮
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    if (deleteWeekBtn) {
        deleteWeekBtn.style.display = 'none';
    }
    container.classList.remove('edit-mode');
    disableInlineEditing();
}

// 保存所有修改
async function saveAllChanges() {
    if (!currentProject) {
        showToast('请先选择项目', 'warning');
        return;
    }

    try {
        // 收集所有修改的数据
        const weekData = collectCurrentWeekData();

        // 调用API保存
        await updateWeekReport(currentProject, currentWeek, weekData);

        showToast('保存成功', 'success');
    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败: ' + error.message, 'error');
    }
}

// 收集当前页面数据
function collectCurrentWeekData() {
    const data = {
        completed_tasks: [],
        incomplete_tasks: [],
        motivation_direction: [],
        internal_reflection: [],
        external_feedback: [],
        next_week_plan: []
    };

    // 收集达成事项
    const completedTaskRows = document.querySelectorAll('#completed-tasks .editable-row');
    completedTaskRows.forEach(row => {
        const task = (row.querySelector('[data-field="task"]')?.textContent || '').trim();
        const description = (row.querySelector('[data-field="description"]')?.textContent || '').trim();
        // 只要有任务名称就保存（description 可以为空）
        if (task) {
            data.completed_tasks.push({
                task: task,
                description: description || ''  // 确保是字符串，不能是 undefined
            });
        }
    });

    // 收集未达成事项
    const incompleteTaskRows = document.querySelectorAll('#not-completed-tasks .editable-row');
    incompleteTaskRows.forEach(row => {
        const task = (row.querySelector('[data-field="task"]')?.textContent || '').trim();
        const expected = (row.querySelector('[data-field="expected"]')?.textContent || '').trim();
        const reason = (row.querySelector('[data-field="reason"]')?.textContent || '').trim();
        // 只要有任务名称就保存
        if (task) {
            data.incomplete_tasks.push({
                task: task,
                expected: expected || '',  // 确保是字符串
                reason: reason || ''      // 确保是字符串
            });
        }
    });

    // 收集动机与方向
    const motivationItems = document.querySelectorAll('#reasons-list .editable-row [data-field="item"]');
    motivationItems.forEach(item => {
        const content = item.textContent?.trim();
        if (content) {
            data.motivation_direction.push(content);
        }
    });

    // 收集内部反思
    const reflectionItems = document.querySelectorAll('#why-not-list .editable-row [data-field="item"]');
    reflectionItems.forEach(item => {
        const content = item.textContent?.trim();
        if (content) {
            data.internal_reflection.push(content);
        }
    });

    // 收集外部反馈
    const feedbackItems = document.querySelectorAll('#achievements-list .editable-row');
    feedbackItems.forEach(item => {
        const source = (item.querySelector('[data-field="source"]')?.textContent || '').trim();
        const content = (item.querySelector('[data-field="content"]')?.textContent || '').trim();
        // 只要有来源或内容就保存
        if (source || content) {
            data.external_feedback.push({
                source: source || '',   // 确保是字符串
                content: content || ''  // 确保是字符串
            });
        }
    });

    // 收集下一步计划
    const planRows = document.querySelectorAll('#next-steps-list .editable-row');
    planRows.forEach(row => {
        const task = (row.querySelector('[data-field="task"]')?.textContent || '').trim();
        const goal = (row.querySelector('[data-field="goal"]')?.textContent || '').trim();
        let priorityText = (row.querySelector('[data-field="priority"]')?.textContent || 'P1').trim();

        // 确保 priority 是字符串格式（P0, P1, P2）
        if (!priorityText || !priorityText.startsWith('P')) {
            // 如果是数字或空，转换为 P 格式
            const priorityNum = parseInt(priorityText) || 1;
            priorityText = `P${priorityNum}`;
        }
        // 确保是有效的优先级格式（P0, P1, P2）
        if (!/^P[0-2]$/.test(priorityText)) {
            priorityText = 'P1';
        }

        // 只要有任务名称就保存
        if (task) {
            data.next_week_plan.push({
                task: task,
                priority: priorityText,  // 保持为字符串格式（P0, P1, P2）
                goal: goal || ''        // 确保是字符串
            });
        }
    });

    return data;
}

// 维度切换
function toggleDimension(button) {
    const sectionName = button.getAttribute('data-section');
    const section = document.querySelector(`.report-section[data-section="${sectionName}"]`);

    if (section) {
        section.classList.toggle('hidden');
        button.classList.toggle('active');
    }
}

// 维度控制区域切换
function toggleDimensionControls() {
    const controls = document.querySelector('.dimension-controls');
    controls.classList.toggle('hidden');
}

// 处理添加行的事件
function handleAddRow(e) {
    e.stopPropagation();
    const dataPath = e.target.getAttribute('data-path');
    if (!dataPath) return;

    let container;
    let newRow;
    let newIndex;

    switch(dataPath) {
        case 'completed_tasks':
            container = document.getElementById('completed-tasks');
            if (!container) return;

            // 如果表格不存在，创建表格
            let tbody = container.querySelector('tbody');
            if (!tbody) {
                container.innerHTML = `
                    <table class="task-table">
                        <thead>
                            <tr>
                                <th>任务名称</th>
                                <th>完成情况</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                    <button class="add-row-btn" data-path="completed_tasks">+ 添加完成任务</button>
                `;
                tbody = container.querySelector('tbody');
                // 重新绑定添加按钮事件
                const newAddBtn = container.querySelector('.add-row-btn');
                if (newAddBtn) {
                    newAddBtn.addEventListener('click', handleAddRow);
                }
            }

            newIndex = tbody.querySelectorAll('.editable-row').length;

            newRow = document.createElement('tr');
            newRow.className = 'editable-row';
            newRow.setAttribute('data-path', 'completed_tasks');
            newRow.setAttribute('data-index', newIndex);
            newRow.innerHTML = `
                <td>
                    <div class="task-name editable-text" data-path="completed_tasks" data-index="${newIndex}" data-field="task" data-placeholder="任务名称"></div>
                </td>
                <td>
                    <div class="task-desc editable-text" data-path="completed_tasks" data-index="${newIndex}" data-field="description" data-placeholder="任务描述"></div>
                </td>
                <td class="row-actions">
                    <button class="row-action-btn delete" title="删除">×</button>
                </td>
            `;
            tbody.appendChild(newRow);
            break;

        case 'incomplete_tasks':
            container = document.getElementById('not-completed-tasks');
            if (!container) return;

            // 如果表格不存在，创建表格
            let tbody2 = container.querySelector('tbody');
            if (!tbody2) {
                container.innerHTML = `
                    <table class="task-table">
                        <thead>
                            <tr>
                                <th>任务名称</th>
                                <th>预期目标</th>
                                <th>未完成原因</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                    <button class="add-row-btn" data-path="incomplete_tasks">+ 添加未完成任务</button>
                `;
                tbody2 = container.querySelector('tbody');
                // 重新绑定添加按钮事件
                const newAddBtn2 = container.querySelector('.add-row-btn');
                if (newAddBtn2) {
                    newAddBtn2.addEventListener('click', handleAddRow);
                }
            }

            newIndex = tbody2.querySelectorAll('.editable-row').length;

            newRow = document.createElement('tr');
            newRow.className = 'editable-row';
            newRow.setAttribute('data-path', 'incomplete_tasks');
            newRow.setAttribute('data-index', newIndex);
            newRow.innerHTML = `
                <td>
                    <div class="task-name editable-text" data-path="incomplete_tasks" data-index="${newIndex}" data-field="task" data-placeholder="任务名称"></div>
                </td>
                <td>
                    <div class="task-desc editable-text" data-path="incomplete_tasks" data-index="${newIndex}" data-field="expected" data-placeholder="预期目标"></div>
                </td>
                <td>
                    <div class="task-desc editable-text" data-path="incomplete_tasks" data-index="${newIndex}" data-field="reason" data-placeholder="未完成原因"></div>
                </td>
                <td class="row-actions">
                    <button class="row-action-btn delete" title="删除">×</button>
                </td>
            `;
            tbody2.appendChild(newRow);
            break;

        case 'motivation_direction':
            container = document.getElementById('reasons-list');
            if (!container) return;

            // 移除"暂无"提示
            const emptyMsg = container.querySelector('.text-muted');
            if (emptyMsg) emptyMsg.remove();

            // 确保有添加按钮
            let addBtn = container.querySelector('.add-row-btn');
            if (!addBtn) {
                addBtn = document.createElement('button');
                addBtn.className = 'add-row-btn';
                addBtn.setAttribute('data-path', 'motivation_direction');
                addBtn.textContent = '+ 添加动机方向';
                addBtn.addEventListener('click', handleAddRow);
                container.appendChild(addBtn);
            }

            newIndex = container.querySelectorAll('.editable-row').length;

            newRow = document.createElement('div');
            newRow.className = 'data-item editable-row';
            newRow.setAttribute('data-path', 'motivation_direction');
            newRow.setAttribute('data-index', newIndex);
            newRow.innerHTML = `
                <span class="editable-text" data-path="motivation_direction" data-index="${newIndex}" data-field="item" data-placeholder="输入动机方向"></span>
                <div class="row-actions">
                    <button class="row-action-btn delete" title="删除">×</button>
                </div>
            `;
            // 插入到添加按钮之前
            container.insertBefore(newRow, addBtn);
            break;

        case 'internal_reflection':
            container = document.getElementById('why-not-list');
            if (!container) return;

            const emptyMsg2 = container.querySelector('.text-muted');
            if (emptyMsg2) emptyMsg2.remove();

            // 确保有添加按钮
            let addBtn2 = container.querySelector('.add-row-btn');
            if (!addBtn2) {
                addBtn2 = document.createElement('button');
                addBtn2.className = 'add-row-btn';
                addBtn2.setAttribute('data-path', 'internal_reflection');
                addBtn2.textContent = '+ 添加内部反思';
                addBtn2.addEventListener('click', handleAddRow);
                container.appendChild(addBtn2);
            }

            newIndex = container.querySelectorAll('.editable-row').length;

            newRow = document.createElement('div');
            newRow.className = 'data-item editable-row';
            newRow.setAttribute('data-path', 'internal_reflection');
            newRow.setAttribute('data-index', newIndex);
            newRow.innerHTML = `
                <span class="editable-text" data-path="internal_reflection" data-index="${newIndex}" data-field="item" data-placeholder="输入内部反思"></span>
                <div class="row-actions">
                    <button class="row-action-btn delete" title="删除">×</button>
                </div>
            `;
            container.insertBefore(newRow, addBtn2);
            break;

        case 'external_feedback':
            container = document.getElementById('achievements-list');
            if (!container) return;

            const emptyMsg3 = container.querySelector('.text-muted');
            if (emptyMsg3) emptyMsg3.remove();

            // 确保有添加按钮
            let addBtn3 = container.querySelector('.add-row-btn');
            if (!addBtn3) {
                addBtn3 = document.createElement('button');
                addBtn3.className = 'add-row-btn';
                addBtn3.setAttribute('data-path', 'external_feedback');
                addBtn3.textContent = '+ 添加外部反馈';
                addBtn3.addEventListener('click', handleAddRow);
                container.appendChild(addBtn3);
            }

            newIndex = container.querySelectorAll('.editable-row').length;

            newRow = document.createElement('div');
            newRow.className = 'data-item editable-row';
            newRow.setAttribute('data-path', 'external_feedback');
            newRow.setAttribute('data-index', newIndex);
            newRow.innerHTML = `
                <div class="task-name editable-text" data-path="external_feedback" data-index="${newIndex}" data-field="source" data-placeholder="反馈来源"></div>
                <div class="task-desc editable-text" data-path="external_feedback" data-index="${newIndex}" data-field="content" data-placeholder="反馈内容"></div>
                <div class="row-actions">
                    <button class="row-action-btn delete" title="删除">×</button>
                </div>
            `;
            container.insertBefore(newRow, addBtn3);
            break;

        case 'next_week_plan':
            container = document.getElementById('next-steps-list');
            if (!container) return;

            // 如果表格不存在，创建表格
            let tbody3 = container.querySelector('tbody');
            if (!tbody3) {
                container.innerHTML = `
                    <table class="task-table">
                        <thead>
                            <tr>
                                <th>优先级</th>
                                <th>任务名称</th>
                                <th>目标</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                    <button class="add-row-btn" data-path="next_week_plan">+ 添加下一步计划</button>
                `;
                tbody3 = container.querySelector('tbody');
                // 重新绑定添加按钮事件
                const newAddBtn3 = container.querySelector('.add-row-btn');
                if (newAddBtn3) {
                    newAddBtn3.addEventListener('click', handleAddRow);
                }
            }

            newIndex = tbody3.querySelectorAll('.editable-row').length;

            newRow = document.createElement('tr');
            newRow.className = 'editable-row';
            newRow.setAttribute('data-path', 'next_week_plan');
            newRow.setAttribute('data-index', newIndex);
            newRow.innerHTML = `
                <td>
                    <span class="priority-badge editable-text" data-path="next_week_plan" data-index="${newIndex}" data-field="priority" data-placeholder="P1">P1</span>
                </td>
                <td>
                    <div class="task-name editable-text" data-path="next_week_plan" data-index="${newIndex}" data-field="task" data-placeholder="任务名称"></div>
                </td>
                <td>
                    <div class="task-desc editable-text" data-path="next_week_plan" data-index="${newIndex}" data-field="goal" data-placeholder="目标描述"></div>
                </td>
                <td class="row-actions">
                    <button class="row-action-btn delete" title="删除">×</button>
                </td>
            `;
            tbody3.appendChild(newRow);
            break;
    }

    // 重新绑定编辑事件到新添加的行（必须在编辑模式下）
    if (isEditMode && newRow) {
        const editableElements = newRow.querySelectorAll('.editable-text');
        editableElements.forEach(element => {
            element.contentEditable = 'true';
            element.addEventListener('focus', handleEditStart);
            element.addEventListener('blur', handleEditEnd);
            element.addEventListener('keydown', handleKeyDown);
            element.addEventListener('input', handleInput);
        });

        const deleteBtn = newRow.querySelector('.row-action-btn.delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', handleDeleteRow);
        }

        newRow.addEventListener('click', handleRowClick);

        // 自动聚焦到第一个可编辑字段
        const firstEditable = newRow.querySelector('.editable-text');
        if (firstEditable) {
            setTimeout(() => firstEditable.focus(), 100);
        }
    } else {
        // 如果不在编辑模式，提示用户进入编辑模式
        showToast('请先进入编辑模式', 'info');
    }
}

// 启用内联编辑
function enableInlineEditing() {
    const editableElements = document.querySelectorAll('.editable-text');
    editableElements.forEach(element => {
        element.contentEditable = 'true';
        element.addEventListener('focus', handleEditStart);
        element.addEventListener('blur', handleEditEnd);
        element.addEventListener('keydown', handleKeyDown);
        element.addEventListener('input', handleInput);
    });

    const editableRows = document.querySelectorAll('.editable-row');
    editableRows.forEach(row => {
        row.addEventListener('click', handleRowClick);
    });

    const deleteButtons = document.querySelectorAll('.row-action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteRow);
    });

    const addButtons = document.querySelectorAll('.add-row-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', handleAddRow);
    });
}

// 禁用内联编辑
function disableInlineEditing() {
    const editingElements = document.querySelectorAll('.editable-text:focus');
    editingElements.forEach(element => {
        element.blur();
    });

    const editableElements = document.querySelectorAll('.editable-text');
    editableElements.forEach(element => {
        element.contentEditable = 'false';
        element.removeEventListener('focus', handleEditStart);
        element.removeEventListener('blur', handleEditEnd);
        element.removeEventListener('keydown', handleKeyDown);
        element.removeEventListener('input', handleInput);
    });

    const editableRows = document.querySelectorAll('.editable-row');
    editableRows.forEach(row => {
        row.removeEventListener('click', handleRowClick);
        row.classList.remove('selected');
    });
}

// 处理编辑相关事件
function handleEditStart(e) {
    if (!isEditMode) return;
    const row = e.target.closest('.editable-row');
    if (row) {
        const allRows = document.querySelectorAll('.editable-row');
        allRows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
    }
}

function handleEditEnd(e) {
    // 可以在这里添加保存逻辑
}

function handleInput(e) {
    // 可以在这里添加实时验证
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.target.blur();
    }
    if (e.key === 'Escape') {
        e.target.blur();
    }
}

function handleRowClick(e) {
    if (!isEditMode) return;
    if (e.target.classList.contains('row-action-btn')) return;

    const allRows = document.querySelectorAll('.editable-row');
    allRows.forEach(row => row.classList.remove('selected'));
    e.currentTarget.classList.add('selected');
}

function handleDeleteRow(e) {
    e.stopPropagation();
    const row = e.target.closest('.editable-row');
    if (!row) return;

    const dataPath = row.getAttribute('data-path');
    const dataIndex = parseInt(row.getAttribute('data-index'));

    if (dataPath && dataIndex !== undefined) {
        // 这里可以添加删除逻辑，现在只是从DOM中移除
        row.remove();
        console.log(`Deleted ${dataPath}[${dataIndex}]`);
    }
}

// 保存所有编辑
async function saveAllEdits() {
    if (!currentProject) {
        showToast('请先选择项目', 'warning');
        return;
    }

    try {
        const weekData = collectCurrentWeekData();
        await updateWeekReport(currentProject, currentWeek, weekData);
        showToast('保存成功！', 'success');
        // 保存成功后退出编辑模式
        exitEditMode();
    } catch (error) {
        showToast('保存失败: ' + error.message, 'error');
    }
}

// 删除当前周进展
async function deleteCurrentWeek() {
    if (!currentProject) {
        showToast('请先选择项目', 'warning');
        return;
    }

    if (!confirm(`确定要删除第 ${currentWeek} 周的进展吗？\n\n这将永久删除该周的所有数据，此操作不可恢复。`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/projects/${currentProject}/week/${currentWeek}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`删除失败: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        if (result && result.success) {
            showToast(`第 ${currentWeek} 周数据已删除`, 'success');

            // 退出编辑模式
            exitEditMode();

            // 重新加载项目列表
            await loadProjects();

            // 尝试加载上一周的数据
            const project = projects.find(p => p.id === currentProject);
            // current_week 是计算出来的（最大周数），所以删除后会自动更新
            const maxWeek = project ? project.current_week : 0;
            if (project && maxWeek > 0) {
                // 有上一周数据，加载上一周
                currentWeek = maxWeek;
                const reportData = await loadWeekReport(currentProject, currentWeek);
                if (reportData) {
                    document.querySelector('.week-current').textContent = '第 ' + currentWeek + ' 周';
                    const currentPeriodElement = document.getElementById('currentPeriod');
                    if (currentPeriodElement) {
                        currentPeriodElement.textContent = reportData.week_period || '';
                    }
                    updateSidebarFolderStructure(currentProject, currentWeek);
                    renderReport(reportData);
                    showScreen('screen3');
                } else {
                    // 没有上一周数据，返回项目列表
                    showScreen('screen4');
                    document.getElementById('screenTitle').textContent = '项目进展一览';
                }
            } else {
                // 没有其他周数据，返回项目列表
                showScreen('screen4');
                document.getElementById('screenTitle').textContent = '项目进展一览';
                currentProject = null;
            }
        } else {
            throw new Error(result?.message || '删除失败');
        }
    } catch (error) {
        console.error('删除周数据失败:', error);
        showToast('删除失败: ' + error.message, 'error');
    }
}
