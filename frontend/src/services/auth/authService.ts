// ==================== Firebase Auth Service ====================
// Firebase 认证服务，提供 Google 登录功能

import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';
import { User } from '../../types/api';

// ==================== Auth Functions ====================

// 创建 Google 认证提供者
const googleProvider = new GoogleAuthProvider();

/**
 * Google 账户登录
 * @returns Promise<{ token: string; user: User }>
 */
export const loginWithGoogle = async (): Promise<{ token: string; user: User }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // 获取 Firebase ID Token
    const token = await firebaseUser.getIdToken();
    
    // 获取或创建用户资料
    const user = await getUserProfile(firebaseUser.uid);
    // console.log('user', user);
    // console.log('token', token);
    return {
      token,
      user
    };
  } catch (error: any) {
    console.error('Google 登录失败:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};


/**
 * 用户登出
 * @returns Promise<{ success: true }>
 */
export const logoutUser = async (): Promise<{ success: true }> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Firebase 登出失败:', error);
    throw new Error('登出失败');
  }
};

/**
 * 获取当前用户
 * @returns Promise<User | null>
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    return null;
  }
  
  try {
    return await getUserProfile(firebaseUser.uid);
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
};

/**
 * 获取 Firebase ID Token
 * @param forceRefresh 是否强制刷新 token
 * @returns Promise<string | null>
 */
export const getCurrentUserToken = async (): Promise<string | null> => {
  // 如果 auth.currentUser 是 null，等待 Firebase Auth 初始化
  if (!auth.currentUser) {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          user.getIdToken().then(resolve);
        } else {
          resolve(null);
        }
      });
    });
  }
  
  return await auth.currentUser.getIdToken();
};

/**
 * 监听认证状态变化
 * @param callback 状态变化回调函数
 * @returns 取消监听的函数
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const user = await getUserProfile(firebaseUser.uid);
        callback(user);
      } catch (error) {
        console.error('获取用户资料失败:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// ==================== Helper Functions ====================

/**
 * 从 Firebase Auth 获取用户资料
 * @param uid Firebase 用户 ID
 * @returns Promise<User>
 */
const getUserProfile = async (uid: string): Promise<User> => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error('用户未登录');
    }
    
    // 直接使用 Firebase Auth 的用户信息
    const user: User = {
      id: uid,
      name: firebaseUser.displayName || 'Google 用户',
      avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`
    };
    
    return user;
  } catch (error) {
    console.error('获取用户资料失败:', error);
    throw new Error('获取用户资料失败');
  }
};

/**
 * 更新用户资料
 * 注意：由于移除了 Firestore，此函数现在只返回当前用户信息
 * 如需更新用户资料，请使用 Firebase Auth 的 updateProfile 方法
 * @param uid Firebase 用户 ID
 * @param userData 用户资料（暂时忽略，因为无法持久化）
 * @returns Promise<User>
 */
export const updateUserProfile = async (uid: string, _userData: Partial<User>): Promise<User> => {
  try {
    // 由于移除了 Firestore，无法持久化用户资料更新
    // 这里只返回当前用户信息
    console.warn('用户资料更新功能已禁用，因为移除了 Firestore 依赖');
    const currentUser = await getUserProfile(uid);
    return currentUser;
  } catch (error) {
    console.error('获取用户资料失败:', error);
    throw new Error('获取用户资料失败');
  }
};

/**
 * 将 Firebase 错误码转换为中文错误信息
 * @param errorCode Firebase 错误码
 * @returns 中文错误信息
 */
const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    'auth/user-disabled': '用户已被禁用',
    'auth/too-many-requests': '请求过于频繁，请稍后再试',
    'auth/network-request-failed': '网络连接失败',
    'auth/popup-closed-by-user': '登录弹窗被用户关闭',
    'auth/popup-blocked': '登录弹窗被浏览器阻止',
    'auth/cancelled-popup-request': '登录请求被取消',
    'auth/account-exists-with-different-credential': '该邮箱已使用其他方式注册',
  };
  
  return errorMessages[errorCode] || '认证失败，请重试';
};
