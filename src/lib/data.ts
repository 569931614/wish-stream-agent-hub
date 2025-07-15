// 数据管理和随机用户名生成

// 业务相关的随机名称生成
const businessAdjectives = [
  '自由的', '忙碌的', '创意的', '头疼的', '勤奋的', '懒散的', '焦虑的', '乐观的',
  '疲惫的', '兴奋的', '纠结的', '专业的', '新手的', '资深的', '迷茫的', '坚定的',
  '佛系的', '拼命的', '温柔的', '严格的', '幽默的', '认真的', '随性的', '完美主义的'
];

const businessRoles = [
  '设计师', '程序员', '产品经理', '老板', '实习生', '运营', '销售', '客服',
  '会计', 'HR', '市场', '策划', '编辑', '摄影师', '视频剪辑师', 'UI设计师',
  '前端工程师', '后端工程师', '测试工程师', '数据分析师', '项目经理', '创业者',
  '自媒体人', '网红', '主播', '写手', '翻译', '咨询师', '培训师', '投资人'
];

const businessItems = [
  '麻辣烫', '奶茶', '咖啡', '外卖', '快递', '打车', '地铁', '公交',
  '电脑', '手机', '键盘', '鼠标', '耳机', '充电器', '数据线', '移动硬盘',
  '笔记本', '便利贴', '马克笔', '白板', '投影仪', '打印机', '复印机', '扫描仪',
  '会议室', '工位', '茶水间', '电梯', '停车位', '班车', '食堂', '健身房'
];

export function generateRandomUsername(): string {
  const types = ['role', 'item'];
  const type = types[Math.floor(Math.random() * types.length)];

  const adjective = businessAdjectives[Math.floor(Math.random() * businessAdjectives.length)];

  if (type === 'role') {
    const role = businessRoles[Math.floor(Math.random() * businessRoles.length)];
    return `${adjective}${role}`;
  } else {
    const item = businessItems[Math.floor(Math.random() * businessItems.length)];
    return `${adjective}${item}`;
  }
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

// 基于IP的固定用户名称管理
export function getUsername(): string {
  let username = localStorage.getItem('username');
  if (!username) {
    username = generateRandomUsername();
    localStorage.setItem('username', username);
  }
  return username;
}

// 更新用户名称（用户主动更改时调用）
export function updateUsername(newUsername: string): void {
  localStorage.setItem('username', newUsername);
}

// 检查是否有已保存的用户名称
export function hasStoredUsername(): boolean {
  return localStorage.getItem('username') !== null;
}

// 重新导出数据库操作和类型
export {
  type Requirement,
  type RequirementStatus,
  type Comment,
  type Suggestion,
  type RequirementInput,
  saveRequirement,
  getRequirements,
  getRequirementById,
  addComment,
  addSuggestion,
  toggleLike,
  hasUserLiked,
  updateRequirementStatus,
  deleteRequirement
} from './database';

// 导入需要在本文件中使用的函数
import {
  getRequirements,
  saveRequirement,
  addComment,
  clearAllData
} from './database';

// 初始化示例数据的函数
export async function initializeSampleData(): Promise<void> {
  try {
    // 检查是否已有数据
    const existingRequirements = await getRequirements();
    if (existingRequirements.length > 0) {
      return; // 已有数据，不需要初始化
    }
  } catch (error) {
    console.error('Failed to check existing requirements:', error);
    return;
  }

  // 创建示例数据
  const sampleRequirements = [
    {
      title: '自动写周报的AI助手',
      description: '希望有个AI能帮我自动生成工作周报，只需要输入本周完成的任务，就能生成专业的周报格式。包括工作总结、完成情况、下周计划等模块。最好能支持多种格式导出，比如Word、PDF等。',
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 29,
      tags: ['办公自动化', '文档生成', '工作效率']
    },
    {
      title: '智能代码重构助手',
      description: '能够分析现有代码，自动进行重构优化，提高代码质量和性能。支持多种编程语言，包括JavaScript、Python、Java等。能识别代码异味，提供重构建议，并自动执行安全的重构操作。',
      allowSuggestions: true,
      willingToPay: false,
      tags: ['开发工具', '代码优化', '编程助手']
    },
    {
      title: '个人财务分析AI',
      description: '帮助分析个人收支情况，给出理财建议和投资方案。能连接银行账户自动获取数据，分析消费习惯，制定预算计划，推荐合适的投资产品。支持多种图表展示财务状况。',
      allowSuggestions: false,
      willingToPay: true,
      paymentAmount: 99,
      tags: ['金融理财', '数据分析', '个人助手']
    },
    {
      title: '简单的计算器',
      description: '一个基础的计算器应用。',
      allowSuggestions: true,
      willingToPay: false,
      tags: ['工具应用', '基础功能']
    },
    {
      title: '智能会议记录系统',
      description: '能够实时转录会议内容，自动识别发言人，生成会议纪要和待办事项。支持多语言识别，能够过滤掉无关的噪音和口语化表达，生成结构化的会议记录。还能根据会议内容自动提取关键决策点和行动项，并设置提醒。希望能集成到常用的会议软件中，如腾讯会议、钉钉等。',
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 199,
      tags: ['办公自动化', '会议管理', '语音识别']
    },
    {
      title: '自动化测试工具',
      description: '为Web应用生成自动化测试脚本，支持UI测试和API测试。',
      allowSuggestions: false,
      willingToPay: true,
      paymentAmount: 150,
      tags: ['开发工具', '测试自动化', '质量保证']
    },
    {
      title: 'AI驱动的客服机器人',
      description: '能够理解客户问题并提供准确回答的智能客服系统。需要支持多轮对话，能够处理复杂的业务场景，包括订单查询、退换货、技术支持等。要求能够学习历史对话记录，不断优化回答质量。支持文字和语音交互，能够无缝转接人工客服。',
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 299,
      tags: ['电商', '客服系统', '人工智能', '对话机器人']
    },
    {
      title: '文档自动翻译',
      description: '批量翻译技术文档，保持格式不变。',
      allowSuggestions: true,
      willingToPay: false,
      tags: ['文档处理', '翻译工具', '办公自动化']
    },
    {
      title: '智能简历优化助手',
      description: '根据目标职位自动优化简历内容，突出相关技能和经验。能够分析招聘需求，调整简历关键词，提高匹配度。支持多种简历模板，能够生成针对不同公司的定制化简历版本。还能提供面试准备建议和常见问题的回答思路。',
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 59,
      tags: ['求职招聘', '简历优化', '职业发展']
    }
  ];

  try {
    // 保存示例数据
    const usernames = [
      '忙碌的产品经理', '头疼的程序员', '焦虑的老板', '自由的设计师',
      '勤奋的运营', '创意的策划', '专业的测试工程师', '乐观的实习生', '严格的项目经理'
    ];

    for (let i = 0; i < sampleRequirements.length; i++) {
      const req = sampleRequirements[i];
      const username = usernames[i % usernames.length];
      await saveRequirement(req, username);
    }

    // 添加一些示例评论
    const requirements = await getRequirements();
    if (requirements.length > 0) {
      await addComment(requirements[0].id, '自由的设计师', '这个想法太棒了！我也需要这样的工具');
      await addComment(requirements[2].id, '忙碌的产品经理', '安全性怎么保证？');
    }
  } catch (error) {
    console.error('Failed to initialize sample data:', error);
  }
}

// 获取弹幕数据（取最新的几条需求标题）
export async function getBarrageData(): Promise<string[]> {
  try {
    const requirements = await getRequirements();
    return requirements.slice(0, 10).map(r => r.title);
  } catch (error) {
    console.error('Failed to get barrage data:', error);
    return [];
  }
}

// 重新初始化数据（清除现有数据并重新创建示例数据）
export async function reinitializeData(): Promise<void> {
  try {
    await clearAllData();
    await initializeSampleData();
  } catch (error) {
    console.error('Failed to reinitialize data:', error);
  }
}