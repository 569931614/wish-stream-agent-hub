// 前端 API 客户端 - 连接到后端 SQLite 数据库
// 动态获取API基础URL，支持开发和生产环境
const getApiBaseUrl = () => {
  // 如果是开发环境，使用localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  // 生产环境使用相对路径，与前端同域
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// 需求状态类型
export type RequirementStatus = 'pending' | 'submitted' | 'developing' | 'completed';

// 数据类型定义
export interface Requirement {
  id: string;
  title: string;
  description: string;
  username: string;
  allowSuggestions: boolean;
  willingToPay: boolean;
  paymentAmount?: number;
  likes: number;
  tags: string[];
  status: RequirementStatus;
  createdAt: string;
  comments: Comment[];
  suggestions: Suggestion[];
}

export interface Comment {
  id: string;
  username: string;
  content: string;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  username: string;
  content: string;
  createdAt: string;
}

export interface RequirementInput {
  title: string;
  description: string;
  allowSuggestions: boolean;
  willingToPay: boolean;
  paymentAmount?: number;
  tags?: string[];
}

// API 辅助函数
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`Making API request to: ${url}`, options);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`API response status: ${response.status}`, response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API response data:`, data);
    return data;
  } catch (error) {
    console.error(`API request error for ${url}:`, error);
    throw error;
  }
}

// 初始化数据库（确保后端服务可用）
export async function initializeDatabase(): Promise<void> {
  try {
    await apiRequest('/health');
    console.log('Connected to SQLite database backend');
  } catch (error) {
    console.error('Failed to connect to database backend:', error);
    throw error;
  }
}

// 保存需求
export async function saveRequirement(requirement: RequirementInput, username: string): Promise<Requirement> {
  return apiRequest('/requirements', {
    method: 'POST',
    body: JSON.stringify({ requirement, username }),
  });
}

// 获取单个需求
export async function getRequirementById(id: string): Promise<Requirement | null> {
  try {
    return await apiRequest(`/requirements/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

// 获取所有需求
export async function getRequirements(): Promise<Requirement[]> {
  return apiRequest('/requirements');
}

// 添加评论
export async function addComment(requirementId: string, username: string, content: string): Promise<Comment> {
  return apiRequest(`/requirements/${requirementId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ username, content }),
  });
}

// 添加建议
export async function addSuggestion(requirementId: string, username: string, content: string): Promise<Suggestion> {
  return apiRequest(`/requirements/${requirementId}/suggestions`, {
    method: 'POST',
    body: JSON.stringify({ username, content }),
  });
}

// 切换点赞状态
export async function toggleLike(requirementId: string, username: string): Promise<boolean> {
  const result = await apiRequest(`/requirements/${requirementId}/like`, {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
  return result.isLiked;
}

// 检查用户是否已点赞
export async function hasUserLiked(requirementId: string, username: string): Promise<boolean> {
  const result = await apiRequest(`/requirements/${requirementId}/like/${username}`);
  return result.isLiked;
}

// 更新需求状态
export async function updateRequirementStatus(requirementId: string, status: RequirementStatus): Promise<Requirement> {
  return apiRequest(`/requirements/${requirementId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// 删除需求
export async function deleteRequirement(requirementId: string): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/requirements/${requirementId}`, {
    method: 'DELETE',
  });
}

// 清除所有数据
export async function clearAllData(): Promise<void> {
  await apiRequest('/reset', {
    method: 'POST',
  });
}
