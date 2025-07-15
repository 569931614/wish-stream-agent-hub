const { saveRequirement } = require('./database');

// 真实的AI需求数据
const realRequirements = [
  {
    requirement: {
      title: "智能客服聊天机器人",
      description: "需要一个能够处理常见客户咨询的AI聊天机器人，支持多轮对话，能够理解客户意图并提供准确回复。要求支持知识库管理，能够学习新的问答对，并且可以无缝转接人工客服。希望能够集成到现有的客服系统中。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 5000,
      tags: ["客服自动化", "自然语言处理", "企业服务"],
      status: "submitted"
    },
    username: "忙碌的客服主管"
  },
  {
    requirement: {
      title: "电商商品描述自动生成",
      description: "希望有AI能根据商品图片和基本信息自动生成吸引人的商品描述。需要支持不同类目的商品，生成的文案要符合平台规范，突出卖点，提高转化率。最好能够A/B测试不同文案的效果。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 3000,
      tags: ["电商", "文案生成", "营销工具"],
      status: "submitted"
    },
    username: "拼命的电商运营"
  },
  {
    requirement: {
      title: "会议纪要自动整理",
      description: "每天开会太多，手动整理会议纪要很耗时。希望有AI能够根据会议录音自动生成结构化的会议纪要，包括讨论要点、决策事项、待办任务和责任人。支持多人发言识别，能够过滤无关内容。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 2000,
      tags: ["办公自动化", "语音识别", "文档生成"],
      status: "developing"
    },
    username: "疲惫的项目经理"
  },
  {
    requirement: {
      title: "智能简历筛选系统",
      description: "HR每天要看几百份简历，效率太低。需要AI帮助快速筛选简历，根据岗位要求自动评分和排序。要能识别关键技能、工作经验匹配度，并生成筛选理由。支持批量处理和自定义筛选条件。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 4000,
      tags: ["人力资源", "文档分析", "智能筛选"],
      status: "submitted"
    },
    username: "焦虑的HR专员"
  },
  {
    requirement: {
      title: "学生作业批改助手",
      description: "作为老师，每天批改作业占用大量时间。希望有AI能够帮助批改客观题，检查语法错误，评估作文质量，并给出改进建议。需要支持多种题型，能够生成详细的批改报告和学习建议。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 1500,
      tags: ["教育", "自动批改", "学习辅助"],
      status: "submitted"
    },
    username: "辛苦的语文老师"
  },
  {
    requirement: {
      title: "智能投资组合建议",
      description: "希望有AI能够根据个人风险偏好、投资目标和市场情况，自动推荐投资组合配置。需要实时监控市场变化，动态调整建议，并提供风险评估报告。要求有历史回测功能验证策略有效性。",
      allowSuggestions: false,
      willingToPay: true,
      paymentAmount: 8000,
      tags: ["金融理财", "投资建议", "风险管理"],
      status: "submitted"
    },
    username: "谨慎的理财顾问"
  },
  {
    requirement: {
      title: "医疗影像辅助诊断",
      description: "需要AI辅助分析X光片、CT等医疗影像，帮助快速识别异常区域，提高诊断效率和准确性。要求有高精度的病灶检测能力，能够标注可疑区域，并提供置信度评分。必须符合医疗行业标准。",
      allowSuggestions: false,
      willingToPay: true,
      paymentAmount: 15000,
      tags: ["医疗健康", "影像分析", "辅助诊断"],
      status: "developing"
    },
    username: "专业的放射科医生"
  },
  {
    requirement: {
      title: "智能库存管理系统",
      description: "仓库管理太复杂，经常出现缺货或积压。希望AI能够预测销量趋势，自动计算最优库存量，并在需要补货时提前预警。要能考虑季节性因素、促销活动等影响，降低库存成本。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 6000,
      tags: ["供应链", "预测分析", "库存优化"],
      status: "submitted"
    },
    username: "头疼的仓库经理"
  },
  {
    requirement: {
      title: "个性化学习路径推荐",
      description: "在线教育平台需要为每个学生推荐个性化的学习路径。AI要能分析学生的学习进度、知识掌握情况和学习习惯，推荐最适合的课程顺序和学习资源。支持实时调整和学习效果评估。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 4500,
      tags: ["在线教育", "个性化推荐", "学习分析"],
      status: "submitted"
    },
    username: "创新的教育产品经理"
  },
  {
    requirement: {
      title: "智能合同审查工具",
      description: "法务部门每天要审查大量合同，工作量巨大。需要AI帮助识别合同中的风险条款、不合规内容和缺失条款。要能对比标准模板，标注修改建议，并生成风险评估报告。支持多种合同类型。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 7000,
      tags: ["法律科技", "文档分析", "风险识别"],
      status: "submitted"
    },
    username: "严谨的法务专员"
  },
  {
    requirement: {
      title: "智能价格优化系统",
      description: "电商平台需要动态调整商品价格以最大化利润。AI要能分析竞品价格、库存情况、用户行为等因素，实时推荐最优定价策略。要考虑促销活动、季节性因素，并预测价格变化对销量的影响。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 10000,
      tags: ["电商", "价格策略", "收益优化"],
      status: "developing"
    },
    username: "精明的电商总监"
  },
  {
    requirement: {
      title: "智能招聘面试评估",
      description: "希望AI能够辅助面试官评估候选人表现。通过分析面试录音和录像，评估候选人的沟通能力、专业技能、情绪稳定性等维度。生成客观的评估报告，减少主观偏见，提高招聘质量。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 5500,
      tags: ["人力资源", "面试评估", "人才分析"],
      status: "submitted"
    },
    username: "专业的招聘经理"
  },
  {
    requirement: {
      title: "智能内容审核系统",
      description: "社交平台每天产生海量用户内容，人工审核成本太高。需要AI自动识别违规内容，包括暴力、色情、仇恨言论等。要求高准确率和低误判率，支持多媒体内容审核，并能持续学习新的违规模式。",
      allowSuggestions: false,
      willingToPay: true,
      paymentAmount: 12000,
      tags: ["内容安全", "自动审核", "社交媒体"],
      status: "submitted"
    },
    username: "负责的内容运营"
  },
  {
    requirement: {
      title: "智能财务报表分析",
      description: "财务分析工作繁重且容易出错。希望AI能够自动分析财务报表，识别异常数据，计算关键财务指标，并生成可视化报告。要能预警财务风险，提供经营建议，支持多期对比分析。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 6500,
      tags: ["财务管理", "数据分析", "风险预警"],
      status: "submitted"
    },
    username: "细心的财务分析师"
  },
  {
    requirement: {
      title: "智能设备故障预测",
      description: "工厂设备故障会导致生产停滞，损失巨大。需要AI通过分析设备运行数据，预测可能的故障时间和类型。要能提前预警，建议维护计划，减少意外停机时间。支持多种设备类型和传感器数据。",
      allowSuggestions: true,
      willingToPay: true,
      paymentAmount: 20000,
      tags: ["工业4.0", "预测维护", "设备管理"],
      status: "developing"
    },
    username: "经验丰富的设备工程师"
  }
];

// 添加需求到数据库
async function addRealRequirements() {
  console.log('开始添加真实AI需求数据...');
  
  for (let i = 0; i < realRequirements.length; i++) {
    const { requirement, username } = realRequirements[i];
    try {
      const savedRequirement = saveRequirement(requirement, username);
      console.log(`✅ 已添加需求: ${requirement.title} (用户: ${username})`);
    } catch (error) {
      console.error(`❌ 添加需求失败: ${requirement.title}`, error.message);
    }
  }
  
  console.log('✨ 真实AI需求数据添加完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  addRealRequirements();
}

module.exports = { addRealRequirements, realRequirements };
