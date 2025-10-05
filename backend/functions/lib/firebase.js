"use strict";
// ==================== Firebase Configuration ====================
// Firebase 初始化和配置
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIRESTORE_INDEXES = exports.COLLECTIONS = exports.auth = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
// 检查是否已经初始化
const apps = (0, app_1.getApps)();
if (apps.length === 0) {
    (0, app_1.initializeApp)();
}
// 导出 Firestore 和 Auth 实例
exports.db = (0, firestore_1.getFirestore)();
exports.auth = (0, auth_1.getAuth)();
// Firestore 集合名称常量
exports.COLLECTIONS = {
    USERS: 'users',
    MEETINGS: 'meetings',
    PRE_MEETING: 'preMeeting',
    IN_MEETING: 'inMeeting',
    POST_MEETING: 'postMeeting',
};
// Firestore 索引配置
exports.FIRESTORE_INDEXES = {
    // 会议集合索引
    meetings: [
        {
            collectionGroup: 'meetings',
            queryScope: 'COLLECTION',
            fields: [
                { fieldPath: 'createdBy', order: 'ASCENDING' },
                { fieldPath: 'createdAt', order: 'DESCENDING' }
            ]
        },
        {
            collectionGroup: 'meetings',
            queryScope: 'COLLECTION',
            fields: [
                { fieldPath: 'status', order: 'ASCENDING' },
                { fieldPath: 'createdAt', order: 'DESCENDING' }
            ]
        }
    ]
};
//# sourceMappingURL=firebase.js.map