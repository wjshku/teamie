// AI指令助手功能
let isAIHelperOpen = false;
let isAIProcessing = false;

// 初始化AI助手功能
function initializeAIHelper() {
    // 只有在screen3（每周进展页面）才显示AI助手按钮
    const aiHelperTrigger = document.getElementById('aiHelperTrigger');
    if (aiHelperTrigger) {
        // 默认隐藏，只有在screen3时才显示
        aiHelperTrigger.style.display = 'none';
    }
}

// 切换AI助手面板
function toggleAIHelper() {
    const panel = document.getElementById('aiHelperPanel');
    const trigger = document.getElementById('aiHelperTrigger');

    if (!panel || !trigger) return;

    isAIHelperOpen = !isAIHelperOpen;

    if (isAIHelperOpen) {
        panel.classList.remove('hidden');
        // 聚焦到输入框
        setTimeout(() => {
            const input = document.getElementById('aiHelperInput');
            if (input) input.focus();
        }, 300);
    } else {
        panel.classList.add('hidden');
    }
}

// 关闭AI助手面板
function closeAIHelper() {
    const panel = document.getElementById('aiHelperPanel');
    if (panel) panel.classList.add('hidden');
    isAIHelperOpen = false;
}

// 处理助手键盘事件
function handleHelperKeyDown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendAIInstruction();
    }
}

// 发送AI指令
async function sendAIInstruction() {
    const input = document.getElementById('aiHelperInput');

    if (!input) return;

    const instruction = input.value.trim();
    if (!instruction || isAIProcessing) return;

    // 设置处理状态
    isAIProcessing = true;
    input.disabled = true;
    input.placeholder = '处理中...';
    input.style.opacity = '0.6';

    // 清空输入框
    input.value = '';

    // 关闭面板
    closeAIHelper();

    // 显示处理提示
    showToast('正在更新您的进展...', 'info');

    try {
        // 调用AI API
        const response = await sendInstructionToAI(instruction);

        // 检查是否包含结构化修改指令
        if (response.includes('[MODIFY:') && response.includes('[/MODIFY]')) {
            // 处理结构化响应
            await processStructuredResponse(response);
        } else {
            // 显示普通响应
            showToast('AI回复: ' + response.substring(0, 100) + (response.length > 100 ? '...' : ''), 'success');
        }

    } catch (error) {
        console.error('AI指令处理错误:', error);
        showToast('处理失败: ' + error.message, 'error');
    } finally {
        // 重置处理状态
        isAIProcessing = false;
        input.disabled = false;
        input.placeholder = '加入新的下一步计划...';
        input.style.opacity = '1';
    }
}

// 发送指令到AI后端
async function sendInstructionToAI(instruction) {
    console.log('AI Chat: 开始发送指令到后端');

    // 获取当前上下文信息
    const context = getCurrentContext();
    console.log('AI Chat: 上下文信息', context);

    const payload = {
        message: instruction,
        context: context,
        project_id: currentProject,
        week: currentWeek
    };

    console.log('AI Chat: 发送payload', payload);
    console.log('AI Chat: API_BASE_URL', API_BASE_URL);
    console.log('AI Chat: 最终请求URL', `${API_BASE_URL}/ai/chat`);

    try {
        const response = await apiCall('/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('AI Chat: 收到响应', response);

        if (!response.success) {
            throw new Error(response.message || 'AI响应失败');
        }

        return response.response;
    } catch (error) {
        console.error('AI Chat: API调用失败', error);
        throw error;
    }
}

// 处理结构化的AI响应
async function processStructuredResponse(response) {
    const modifyRegex = /\[MODIFY:(\w+)\]([\s\S]*?)\[\/MODIFY\]/g;

    const modifications = [];
    let match;

    // 提取所有修改
    while ((match = modifyRegex.exec(response)) !== null) {
        const sectionName = match[1];
        const newContent = match[2].trim();
        modifications.push({
            section: sectionName,
            content: newContent
        });
    }

    // 如果有修改，直接应用
    if (modifications.length > 0) {
        await applyModifications(modifications);
    }
}

// 获取区域显示名称
function getSectionDisplayName(sectionName) {
    const names = {
        'motivation_direction': '动机与方向',
        'completed_tasks': '达成事项',
        'incomplete_tasks': '未达成事项',
        'internal_reflection': '内部反思',
        'external_feedback': '外部反馈',
        'next_week_plan': '下一步计划'
    };
    return names[sectionName] || sectionName;
}

// 应用修改
async function applyModifications(modifications) {
    try {
        showToast('正在应用AI修改...', 'info');

        // 应用每个修改
        for (const mod of modifications) {
            await applySingleModification(mod.section, mod.content);
        }

        showToast('AI修改已应用成功！', 'success');

        // 刷新周报显示
        if (typeof loadWeekReport === 'function') {
            const reportData = await loadWeekReport(currentProject, currentWeek);
            if (reportData) {
                renderReport(reportData);
            }
        }

    } catch (error) {
        console.error('应用修改失败:', error);
        showToast('应用修改失败: ' + error.message, 'error');
    }
}

// 应用单个修改
async function applySingleModification(sectionName, newContent) {
    // 构建更新数据
    const updateData = {};

    // 根据不同section类型处理内容
    if (sectionName === 'completed_tasks') {
        try {
            // 尝试解析为JSON数组
            const parsed = JSON.parse(newContent);
            // 确保是正确的格式：[{task: string, description: string}, ...]
            if (Array.isArray(parsed)) {
                updateData[sectionName] = parsed;
            } else {
                // 如果是字符串，包装成单个任务
                updateData[sectionName] = [{ task: newContent, description: "" }];
            }
        } catch (e) {
            // 如果不是JSON，作为单个任务处理
            updateData[sectionName] = [{ task: newContent, description: "" }];
        }
    } else if (sectionName === 'incomplete_tasks') {
        try {
            const parsed = JSON.parse(newContent);
            if (Array.isArray(parsed)) {
                updateData[sectionName] = parsed;
            } else {
                updateData[sectionName] = [{ task: newContent, expected: "", reason: "" }];
            }
        } catch (e) {
            updateData[sectionName] = [{ task: newContent, expected: "", reason: "" }];
        }
    } else if (sectionName === 'external_feedback') {
        try {
            const parsed = JSON.parse(newContent);
            if (Array.isArray(parsed)) {
                updateData[sectionName] = parsed;
            } else {
                updateData[sectionName] = [{ source: "AI建议", content: newContent }];
            }
        } catch (e) {
            updateData[sectionName] = [{ source: "AI建议", content: newContent }];
        }
    } else if (sectionName === 'next_week_plan') {
        try {
            const parsed = JSON.parse(newContent);
            if (Array.isArray(parsed)) {
                updateData[sectionName] = parsed;
            } else {
                updateData[sectionName] = [{ task: newContent, priority: "P1", goal: "" }];
            }
        } catch (e) {
            updateData[sectionName] = [{ task: newContent, priority: "P1", goal: "" }];
        }
    } else if (sectionName === 'motivation_direction' || sectionName === 'internal_reflection') {
        // 这些是字符串数组
        try {
            const parsed = JSON.parse(newContent);
            if (Array.isArray(parsed)) {
                updateData[sectionName] = parsed;
            } else {
                updateData[sectionName] = [newContent];
            }
        } catch (e) {
            updateData[sectionName] = [newContent];
        }
    } else {
        // 其他section直接使用字符串
        updateData[sectionName] = newContent;
    }

    // 调用API更新
    const response = await apiCall(`/projects/${currentProject}/week/${currentWeek}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });

    if (!response.success) {
        throw new Error(response.message || '更新失败');
    }
}

// 获取当前上下文信息
function getCurrentContext() {
    const context = {
        focused_section: null,
        current_report: null,
        available_documents: []
    };

    // 获取当前聚焦的部分
    const focusedElements = document.querySelectorAll('.report-section:hover, .report-section:focus');
    if (focusedElements.length > 0) {
        const section = focusedElements[0];
        context.focused_section = section.getAttribute('data-section');
    }

    // 获取当前周报数据
    if (typeof collectCurrentWeekData === 'function') {
        try {
            context.current_report = collectCurrentWeekData();
        } catch (e) {
            console.warn('获取当前周报数据失败:', e);
        }
    }

    // 暂时简化文档信息，后续可以通过API获取
    context.available_documents = [];

    return context;
}

// 显示AI助手按钮（仅在screen3）
function showAIHelperButton() {
    const aiHelperTrigger = document.getElementById('aiHelperTrigger');
    if (aiHelperTrigger) {
        aiHelperTrigger.style.display = 'flex';
    }
}

// 隐藏AI助手按钮
function hideAIHelperButton() {
    const aiHelperTrigger = document.getElementById('aiHelperTrigger');
    if (aiHelperTrigger) {
        aiHelperTrigger.style.display = 'none';
    }
    // 同时关闭助手面板
    closeAIHelper();
}

// 初始化事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 点击外部关闭助手面板
    document.addEventListener('click', function(event) {
        const panel = document.getElementById('aiHelperPanel');
        const trigger = document.getElementById('aiHelperTrigger');

        if (isAIHelperOpen &&
            panel &&
            !panel.contains(event.target) &&
            !trigger.contains(event.target)) {
            closeAIHelper();
        }
    });
});
