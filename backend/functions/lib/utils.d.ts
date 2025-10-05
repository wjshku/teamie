import { CloudFunctionRequest, CloudFunctionResponse } from './types';
/**
 * 验证认证令牌
 * @param req Cloud Function 请求对象
 * @returns 用户ID或null
 */
export declare const validateAuthToken: (req: CloudFunctionRequest) => string | null;
/**
 * 发送错误响应
 * @param res Cloud Function 响应对象
 * @param statusCode HTTP状态码
 * @param message 错误消息
 */
export declare const sendErrorResponse: (res: CloudFunctionResponse, statusCode: number, message: string) => void;
/**
 * 发送成功响应
 * @param res Cloud Function 响应对象
 * @param data 响应数据
 * @param statusCode HTTP状态码，默认为200
 */
export declare const sendSuccessResponse: (res: CloudFunctionResponse, data: any, statusCode?: number) => void;
/**
 * 生成唯一ID
 * @returns 基于时间戳的唯一ID
 */
export declare const generateId: () => string;
/**
 * 验证必需字段
 * @param data 要验证的数据对象
 * @param requiredFields 必需字段数组
 * @returns 验证结果和错误消息
 */
export declare const validateRequiredFields: (data: any, requiredFields: string[]) => {
    isValid: boolean;
    missingFields: string[];
};
/**
 * 清理和验证字符串输入
 * @param input 输入字符串
 * @param maxLength 最大长度
 * @returns 清理后的字符串
 */
export declare const sanitizeString: (input: string, maxLength?: number) => string;
/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export declare const isValidEmail: (email: string) => boolean;
/**
 * 格式化日期为ISO字符串
 * @param date 日期对象
 * @returns ISO格式的日期字符串
 */
export declare const formatDate: (date: Date) => string;
/**
 * 从ISO字符串解析日期
 * @param dateString ISO格式的日期字符串
 * @returns 日期对象
 */
export declare const parseDate: (dateString: string) => Date;
/**
 * 检查用户权限
 * @param userId 用户ID
 * @param resourceOwnerId 资源所有者ID
 * @returns 是否有权限
 */
export declare const checkPermission: (userId: string, resourceOwnerId: string) => boolean;
/**
 * 处理异步操作错误
 * @param operation 异步操作
 * @param errorMessage 错误消息
 * @returns 操作结果或错误
 */
export declare const handleAsyncError: <T>(operation: () => Promise<T>, errorMessage: string) => Promise<{
    success: boolean;
    data?: T;
    error?: string;
}>;
/**
 * 创建分页参数
 * @param page 页码
 * @param limit 每页数量
 * @returns 分页参数对象
 */
export declare const createPaginationParams: (page?: number, limit?: number) => {
    page: number;
    limit: number;
    offset: number;
};
/**
 * 创建分页响应
 * @param data 数据数组
 * @param total 总数量
 * @param page 当前页码
 * @param limit 每页数量
 * @returns 分页响应对象
 */
export declare const createPaginationResponse: (data: any[], total: number, page: number, limit: number) => {
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
};
/**
 * 生成邀请链接的唯一token
 * @param length token长度，默认为32
 * @returns 唯一的token字符串
 */
export declare const generateInviteToken: (length?: number) => string;
//# sourceMappingURL=utils.d.ts.map