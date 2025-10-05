"use strict";
// ==================== Utility Functions ====================
// 通用工具函数
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInviteToken = exports.createPaginationResponse = exports.createPaginationParams = exports.handleAsyncError = exports.checkPermission = exports.parseDate = exports.formatDate = exports.isValidEmail = exports.sanitizeString = exports.validateRequiredFields = exports.generateId = exports.sendSuccessResponse = exports.sendErrorResponse = exports.validateAuthToken = void 0;
/**
 * 验证认证令牌
 * @param req Cloud Function 请求对象
 * @returns 用户ID或null
 */
const validateAuthToken = (req) => {
    const authHeader = req.headers.authorization;
    // Handle both string and string[] types
    const authString = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (!authString || !authString.startsWith('Bearer ')) {
        return null;
    }
    const token = authString.split(' ')[1];
    return token || null;
};
exports.validateAuthToken = validateAuthToken;
/**
 * 发送错误响应
 * @param res Cloud Function 响应对象
 * @param statusCode HTTP状态码
 * @param message 错误消息
 */
const sendErrorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({
        success: false,
        error: message
    });
};
exports.sendErrorResponse = sendErrorResponse;
/**
 * 发送成功响应
 * @param res Cloud Function 响应对象
 * @param data 响应数据
 * @param statusCode HTTP状态码，默认为200
 */
const sendSuccessResponse = (res, data, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        data
    });
};
exports.sendSuccessResponse = sendSuccessResponse;
/**
 * 生成唯一ID
 * @returns 基于时间戳的唯一ID
 */
const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
exports.generateId = generateId;
/**
 * 验证必需字段
 * @param data 要验证的数据对象
 * @param requiredFields 必需字段数组
 * @returns 验证结果和错误消息
 */
const validateRequiredFields = (data, requiredFields) => {
    const missingFields = [];
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            missingFields.push(field);
        }
    }
    return {
        isValid: missingFields.length === 0,
        missingFields
    };
};
exports.validateRequiredFields = validateRequiredFields;
/**
 * 清理和验证字符串输入
 * @param input 输入字符串
 * @param maxLength 最大长度
 * @returns 清理后的字符串
 */
const sanitizeString = (input, maxLength = 1000) => {
    if (typeof input !== 'string') {
        return '';
    }
    return input
        .trim()
        .substring(0, maxLength)
        .replace(/[<>]/g, ''); // 移除潜在的HTML标签
};
exports.sanitizeString = sanitizeString;
/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
/**
 * 格式化日期为ISO字符串
 * @param date 日期对象
 * @returns ISO格式的日期字符串
 */
const formatDate = (date) => {
    return date.toISOString();
};
exports.formatDate = formatDate;
/**
 * 从ISO字符串解析日期
 * @param dateString ISO格式的日期字符串
 * @returns 日期对象
 */
const parseDate = (dateString) => {
    return new Date(dateString);
};
exports.parseDate = parseDate;
/**
 * 检查用户权限
 * @param userId 用户ID
 * @param resourceOwnerId 资源所有者ID
 * @returns 是否有权限
 */
const checkPermission = (userId, resourceOwnerId) => {
    return userId === resourceOwnerId;
};
exports.checkPermission = checkPermission;
/**
 * 处理异步操作错误
 * @param operation 异步操作
 * @param errorMessage 错误消息
 * @returns 操作结果或错误
 */
const handleAsyncError = async (operation, errorMessage) => {
    try {
        const data = await operation();
        return { success: true, data };
    }
    catch (error) {
        console.error(errorMessage, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : errorMessage
        };
    }
};
exports.handleAsyncError = handleAsyncError;
/**
 * 创建分页参数
 * @param page 页码
 * @param limit 每页数量
 * @returns 分页参数对象
 */
const createPaginationParams = (page = 1, limit = 10) => {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const offset = (pageNum - 1) * limitNum;
    return {
        page: pageNum,
        limit: limitNum,
        offset
    };
};
exports.createPaginationParams = createPaginationParams;
/**
 * 创建分页响应
 * @param data 数据数组
 * @param total 总数量
 * @param page 当前页码
 * @param limit 每页数量
 * @returns 分页响应对象
 */
const createPaginationResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
};
exports.createPaginationResponse = createPaginationResponse;
/**
 * 生成邀请链接的唯一token
 * @param length token长度，默认为32
 * @returns 唯一的token字符串
 */
const generateInviteToken = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateInviteToken = generateInviteToken;
//# sourceMappingURL=utils.js.map