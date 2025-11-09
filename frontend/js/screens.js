// 显示导入屏幕（带重置）
function showImportScreen() {
    if (!currentProject) {
        showToast('请先选择项目', 'warning');
        return;
    }
    resetImportForm();
    showScreen('screen1');
    document.getElementById('screenTitle').textContent = '导入新进展';
    // 隐藏项目信息
    const projectInfo = document.getElementById('projectInfo');
    projectInfo.style.display = 'none';
    // 显示项目名称输入框，设置为只读并填充当前项目名称
    const projectNameInput = document.getElementById('projectName');
    if (projectNameInput) {
        projectNameInput.style.display = 'block';
        projectNameInput.readOnly = true;
        projectNameInput.style.backgroundColor = '#f5f5f5';
        projectNameInput.style.cursor = 'not-allowed';
        // 从 projects 数组中找到当前项目名称
        const currentProjectObj = projects.find(p => p.id === currentProject);
        if (currentProjectObj) {
            projectNameInput.value = currentProjectObj.name;
        }
        const projectNameLabel = projectNameInput.previousElementSibling;
        if (projectNameLabel && projectNameLabel.tagName === 'LABEL') {
            projectNameLabel.style.display = 'block';
        }
    }
    // 显示导入模式 flip card 和标签
    const importModeFlipCard = document.getElementById('importModeFlipCard');
    const importModeLabel = document.getElementById('importModeLabel');
    if (importModeFlipCard) {
        importModeFlipCard.style.display = 'block';
    }
    if (importModeLabel) {
        importModeLabel.style.display = 'block';
    }
    // 重置 flip card 状态
    const flipCardInner = document.getElementById('flipCardInner');
    const importModeInput = document.getElementById('importMode');
    if (flipCardInner && importModeInput) {
        flipCardInner.classList.remove('flipped');
        importModeInput.value = 'new_week';
    }
}

// 显示屏幕
function showScreen(screenId) {
    console.log('Switching to screen:', screenId);
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        targetScreen.classList.add('active');
        console.log('Screen switched successfully:', screenId);

        // 当切换到导入页面时，设置默认项目信息
        if (screenId === 'screen1') {
            setDefaultProjectInfo();
            // 如果是导入新进展，显示项目名称但设置为只读
            const isImportNewProgress = document.getElementById('screenTitle').textContent === '导入新进展';
            const projectNameInput = document.getElementById('projectName');
            if (projectNameInput) {
                if (isImportNewProgress && currentProject) {
                    projectNameInput.style.display = 'block';
                    projectNameInput.readOnly = true;
                    projectNameInput.style.backgroundColor = '#f5f5f5';
                    projectNameInput.style.cursor = 'not-allowed';
                    // 从 projects 数组中找到当前项目名称
                    const currentProjectObj = projects.find(p => p.id === currentProject);
                    if (currentProjectObj) {
                        projectNameInput.value = currentProjectObj.name;
                    }
                    const projectNameLabel = projectNameInput.previousElementSibling;
                    if (projectNameLabel && projectNameLabel.tagName === 'LABEL') {
                        projectNameLabel.style.display = 'block';
                    }
                } else {
                    projectNameInput.style.display = 'block';
                    projectNameInput.readOnly = false;
                    projectNameInput.style.backgroundColor = '';
                    projectNameInput.style.cursor = '';
                    projectNameInput.value = '';
                    const projectNameLabel = projectNameInput.previousElementSibling;
                    if (projectNameLabel && projectNameLabel.tagName === 'LABEL') {
                        projectNameLabel.style.display = 'block';
                    }
                }
            }
            // 隐藏/显示导入模式 flip card 和标签
            const importModeFlipCard = document.getElementById('importModeFlipCard');
            const importModeLabel = document.getElementById('importModeLabel');
            const shouldShow = isImportNewProgress && currentProject;
            if (importModeFlipCard) {
                importModeFlipCard.style.display = shouldShow ? 'block' : 'none';
            }
            if (importModeLabel) {
                importModeLabel.style.display = shouldShow ? 'block' : 'none';
            }
            if (shouldShow) {
                // 重置 flip card 状态
                const flipCardInner = document.getElementById('flipCardInner');
                const importModeInput = document.getElementById('importMode');
                if (flipCardInner && importModeInput) {
                    flipCardInner.classList.remove('flipped');
                    importModeInput.value = 'new_week';
                }
            }
        }

        // 当切换到项目列表时，隐藏项目信息区域
        if (screenId === 'screen4') {
            const projectInfo = document.getElementById('projectInfo');
            projectInfo.style.display = 'none';
        }

        // 控制AI助手按钮显示
        if (screenId === 'screen3') {
            // 在每周进展页面显示AI助手按钮
            if (typeof showAIHelperButton === 'function') {
                showAIHelperButton();
            }
        } else {
            // 在其他页面隐藏AI助手按钮
            if (typeof hideAIHelperButton === 'function') {
                hideAIHelperButton();
            }
        }
    } else {
        console.error('Screen not found:', screenId);
    }
}

// 切换导航
function switchNav(type) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');

    const projectInfo = document.getElementById('projectInfo');
    if (type === 'dashboard') {
        projectInfo.style.display = 'block';
        showScreen('screen4');
        document.getElementById('screenTitle').textContent = '项目进展一览';
    } else {
        projectInfo.style.display = 'none';
        showScreen('screen1');
        document.getElementById('screenTitle').textContent = '导入新项目';
        // 重置导入表单到初始状态
        resetImportForm();
        // 显示项目名称输入框（创建新项目需要）
        const projectNameInput = document.getElementById('projectName');
        if (projectNameInput) {
            projectNameInput.style.display = 'block';
            projectNameInput.readOnly = false;
            projectNameInput.style.backgroundColor = '';
            projectNameInput.style.cursor = '';
            projectNameInput.value = '';
            const projectNameLabel = projectNameInput.previousElementSibling;
            if (projectNameLabel && projectNameLabel.tagName === 'LABEL') {
                projectNameLabel.style.display = 'block';
            }
        }
        // 隐藏导入模式 flip card 和标签
        const importModeFlipCard = document.getElementById('importModeFlipCard');
        const importModeLabel = document.getElementById('importModeLabel');
        if (importModeFlipCard) {
            importModeFlipCard.style.display = 'none';
        }
        if (importModeLabel) {
            importModeLabel.style.display = 'none';
        }
    }
}

// 切换屏幕（兼容旧代码）
function switchScreen(num) {
    showScreen('screen' + num);
}
