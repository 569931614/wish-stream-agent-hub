// 管理员认证相关功能

// 简单的管理员认证配置
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // 在实际项目中应该使用更安全的密码和加密
};

// 管理员认证状态管理
export interface AdminAuthState {
  isAuthenticated: boolean;
  username?: string;
}

// 检查是否已登录
export function isAdminAuthenticated(): boolean {
  const authData = localStorage.getItem('admin_auth');
  if (!authData) return false;
  
  try {
    const { isAuthenticated, timestamp } = JSON.parse(authData);
    // 检查登录是否过期（24小时）
    const now = Date.now();
    const expireTime = 24 * 60 * 60 * 1000; // 24小时
    
    if (now - timestamp > expireTime) {
      localStorage.removeItem('admin_auth');
      return false;
    }
    
    return isAuthenticated;
  } catch {
    return false;
  }
}

// 管理员登录
export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const authData = {
      isAuthenticated: true,
      username,
      timestamp: Date.now()
    };
    localStorage.setItem('admin_auth', JSON.stringify(authData));
    return true;
  }
  return false;
}

// 管理员登出
export function adminLogout(): void {
  localStorage.removeItem('admin_auth');
}

// 获取管理员信息
export function getAdminInfo(): AdminAuthState {
  if (isAdminAuthenticated()) {
    const authData = localStorage.getItem('admin_auth');
    if (authData) {
      try {
        const { username } = JSON.parse(authData);
        return { isAuthenticated: true, username };
      } catch {
        return { isAuthenticated: false };
      }
    }
  }
  return { isAuthenticated: false };
}
