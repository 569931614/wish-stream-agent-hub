// 数据管理和随机用户名生成

// 随机用户名生成
const adjectives = [
  '聪明的', '创新的', '勇敢的', '神秘的', '活泼的', '睿智的', '优雅的', '机敏的',
  '梦幻的', '灵动的', '炫酷的', '温暖的', '奇妙的', '闪亮的', '快乐的', '自由的',
  '魔法的', '星空的', '彩虹的', '银河的', '晨光的', '微风的', '花香的', '月影的'
];

const animals = [
  '独角兽', '小熊猫', '火狐', '海豚', '雪豹', '蝴蝶', '萤火虫', '天鹅',
  '孔雀', '企鹅', '考拉', '猫咪', '兔子', '松鼠', '海星', '鲸鱼',
  '凤凰', '龙猫', '小鹿', '狐狸', '熊猫', '羊驼', '刺猬', '章鱼'
];

export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adjective}${animal}${number}`;
}

// 用户IP模拟（实际项目中应该使用真实IP）
export function getUserId(): string {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
}

export function getUsername(): string {
  let username = localStorage.getItem('username');
  if (!username) {
    username = generateRandomUsername();
    localStorage.setItem('username', username);
  }
  return username;
}

// 需求数据接口
export interface Requirement {
  id: string;
  title: string;
  description: string;
  allowSuggestions: boolean;
  willingToPay: boolean;
  paymentAmount?: number;
  userId: string;
  username: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  username: string;
  createdAt: string;
}

// 本地存储管理
const STORAGE_KEY = 'agent_requirements';

export function getRequirements(): Requirement[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // 初始化一些示例数据
  const initialData: Requirement[] = [
    {
      id: '1',
      title: '自动写周报的AI助手',
      description: '希望有个AI能帮我自动生成工作周报，只需要输入本周完成的任务，就能生成专业的周报格式。',
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 29,
      userId: 'demo1',
      username: '聪明的独角兽888',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      likes: 12,
      likedBy: ['demo2', 'demo3'],
      comments: [
        {
          id: 'c1',
          content: '这个想法太棒了！我也需要这样的工具',
          userId: 'demo2',
          username: '机敏的小熊猫666',
          createdAt: new Date(Date.now() - 43200000).toISOString()
        }
      ]
    },
    {
      id: '2',
      title: '智能代码重构助手',
      description: '能够分析现有代码，自动进行重构优化，提高代码质量和性能。支持多种编程语言。',
      allowSuggestions: true,
      willingToPay: false,
      userId: 'demo2',
      username: '机敏的小熊猫666',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      likes: 8,
      likedBy: ['demo1'],
      comments: []
    },
    {
      id: '3',
      title: '个人财务分析AI',
      description: '帮助分析个人收支情况，给出理财建议和投资方案。能连接银行账户自动获取数据。',
      allowSuggestions: false,
      willingToPay: true,
      paymentAmount: 99,
      userId: 'demo3',
      username: '梦幻的火狐777',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      likes: 15,
      likedBy: ['demo1', 'demo2'],
      comments: [
        {
          id: 'c2',
          content: '安全性怎么保证？',
          userId: 'demo1',
          username: '聪明的独角兽888',
          createdAt: new Date(Date.now() - 129600000).toISOString()
        }
      ]
    }
  ];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

export function saveRequirement(requirement: Omit<Requirement, 'id' | 'userId' | 'username' | 'createdAt' | 'likes' | 'likedBy' | 'comments'>): Requirement {
  const requirements = getRequirements();
  const newRequirement: Requirement = {
    ...requirement,
    id: Date.now().toString(),
    userId: getUserId(),
    username: getUsername(),
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    comments: []
  };
  
  requirements.unshift(newRequirement);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requirements));
  return newRequirement;
}

export function toggleLike(requirementId: string): void {
  const requirements = getRequirements();
  const userId = getUserId();
  
  const requirement = requirements.find(r => r.id === requirementId);
  if (requirement) {
    const isLiked = requirement.likedBy.includes(userId);
    if (isLiked) {
      requirement.likedBy = requirement.likedBy.filter(id => id !== userId);
      requirement.likes--;
    } else {
      requirement.likedBy.push(userId);
      requirement.likes++;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requirements));
  }
}

export function addComment(requirementId: string, content: string): void {
  const requirements = getRequirements();
  const requirement = requirements.find(r => r.id === requirementId);
  
  if (requirement) {
    const comment: Comment = {
      id: Date.now().toString(),
      content,
      userId: getUserId(),
      username: getUsername(),
      createdAt: new Date().toISOString()
    };
    
    requirement.comments.push(comment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requirements));
  }
}

// 获取弹幕数据（取最新的几条需求标题）
export function getBarrageData(): string[] {
  const requirements = getRequirements();
  return requirements.slice(0, 10).map(r => r.title);
}