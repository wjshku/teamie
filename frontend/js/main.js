// API配置
const API_BASE_URL = '/api';

// 全局状态
let currentProject = null;
let currentWeek = 1;
// 手动添加的文档列表
let manualDocuments = [];
let isEditMode = false;
let projects = []; // 项目列表
let currentModel = null; // 当前使用的模型
let availableModels = []; // 可用的模型列表

// 页面初始化
document.addEventListener('DOMContentLoaded', async function() {
    await loadModelConfig(); // 先加载模型配置
    isEditMode = false;
    const container = document.querySelector('.container');
    container.classList.remove('edit-mode');

    // 加载项目列表
    await loadProjects();
});
