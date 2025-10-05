// ==================== Firebase Configuration ====================
// Firebase 初始化和配置

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// 检查是否已经初始化
const apps = getApps();

if (apps.length === 0) {
  initializeApp();
}

// 导出 Firestore 和 Auth 实例
export const db = getFirestore();
export const auth = getAuth();

// Firestore 集合名称常量
export const COLLECTIONS = {
  USERS: 'users',
  MEETINGS: 'meetings',
  PRE_MEETING: 'preMeeting',
  IN_MEETING: 'inMeeting',
  POST_MEETING: 'postMeeting',
} as const;

// Firestore 索引配置
export const FIRESTORE_INDEXES = {
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