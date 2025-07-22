const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 确保数据目录存在
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 数据库文件路径
const DB_PATH = path.join(dataDir, 'requirements.db');

// 初始化数据库
const db = new Database(DB_PATH);

// 创建表结构
function initializeTables() {
  // 需求表
  db.exec(`
    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      username TEXT NOT NULL,
      allowSuggestions INTEGER NOT NULL,
      willingToPay INTEGER NOT NULL,
      paymentAmount REAL,
      likes INTEGER DEFAULT 0,
      tags TEXT,
      images TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT NOT NULL
    )
  `);

  // 评论表
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      requirementId TEXT NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (requirementId) REFERENCES requirements (id)
    )
  `);

  // 建议表
  db.exec(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id TEXT PRIMARY KEY,
      requirementId TEXT NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (requirementId) REFERENCES requirements (id)
    )
  `);

  // 点赞表
  db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      requirementId TEXT NOT NULL,
      username TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(requirementId, username),
      FOREIGN KEY (requirementId) REFERENCES requirements (id)
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_requirements_created_at ON requirements(createdAt);
    CREATE INDEX IF NOT EXISTS idx_comments_requirement_id ON comments(requirementId);
    CREATE INDEX IF NOT EXISTS idx_suggestions_requirement_id ON suggestions(requirementId);
    CREATE INDEX IF NOT EXISTS idx_likes_requirement_id ON likes(requirementId);
    CREATE INDEX IF NOT EXISTS idx_likes_username ON likes(username);
  `);

  // 检查并添加tags列（如果不存在）
  try {
    const columns = db.prepare('PRAGMA table_info(requirements)').all();
    const hasTagsColumn = columns.some(col => col.name === 'tags');

    if (!hasTagsColumn) {
      db.exec('ALTER TABLE requirements ADD COLUMN tags TEXT');
      console.log('Added tags column to requirements table');
    }
  } catch (error) {
    console.error('Error checking/adding tags column:', error);
  }

  console.log('SQLite database initialized at:', DB_PATH);
}

// 数据库操作函数

// 保存需求
function saveRequirement(requirement, username) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const status = requirement.status || 'pending'; // 默认状态为待确认

  const stmt = db.prepare(`
    INSERT INTO requirements (id, title, description, username, allowSuggestions, willingToPay, paymentAmount, likes, tags, images, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    requirement.title,
    requirement.description,
    username,
    requirement.allowSuggestions ? 1 : 0,
    requirement.willingToPay ? 1 : 0,
    requirement.paymentAmount || null,
    requirement.tags && requirement.tags.length > 0 ? JSON.stringify(requirement.tags) : JSON.stringify([]),
    requirement.images && requirement.images.length > 0 ? JSON.stringify(requirement.images) : JSON.stringify([]),
    status,
    now
  );

  return getRequirementById(id);
}

// 获取单个需求
function getRequirementById(id) {
  const stmt = db.prepare('SELECT * FROM requirements WHERE id = ?');
  const requirement = stmt.get(id);
  
  if (!requirement) return null;

  // 获取评论
  const commentsStmt = db.prepare('SELECT * FROM comments WHERE requirementId = ? ORDER BY createdAt ASC');
  const comments = commentsStmt.all(id);

  // 获取建议
  const suggestionsStmt = db.prepare('SELECT * FROM suggestions WHERE requirementId = ? ORDER BY createdAt ASC');
  const suggestions = suggestionsStmt.all(id);

  return {
    ...requirement,
    allowSuggestions: Boolean(requirement.allowSuggestions),
    willingToPay: Boolean(requirement.willingToPay),
    tags: requirement.tags ? (typeof requirement.tags === 'string' ? JSON.parse(requirement.tags) : requirement.tags) : [],
    images: requirement.images ? (typeof requirement.images === 'string' ? JSON.parse(requirement.images) : requirement.images) : [],
    comments: comments.map(c => ({
      id: c.id,
      username: c.username,
      content: c.content,
      createdAt: c.createdAt
    })),
    suggestions: suggestions.map(s => ({
      id: s.id,
      username: s.username,
      content: s.content,
      createdAt: s.createdAt
    }))
  };
}

// 获取所有需求
function getRequirements() {
  const stmt = db.prepare('SELECT * FROM requirements ORDER BY createdAt DESC');
  const requirements = stmt.all();

  return requirements.map(req => {
    // 获取评论
    const commentsStmt = db.prepare('SELECT * FROM comments WHERE requirementId = ? ORDER BY createdAt ASC');
    const comments = commentsStmt.all(req.id);

    // 获取建议
    const suggestionsStmt = db.prepare('SELECT * FROM suggestions WHERE requirementId = ? ORDER BY createdAt ASC');
    const suggestions = suggestionsStmt.all(req.id);

    return {
      ...req,
      allowSuggestions: Boolean(req.allowSuggestions),
      willingToPay: Boolean(req.willingToPay),
      tags: req.tags ? (typeof req.tags === 'string' ? JSON.parse(req.tags) : req.tags) : [],
      images: req.images ? (typeof req.images === 'string' ? JSON.parse(req.images) : req.images) : [],
      comments: comments.map(c => ({
        id: c.id,
        username: c.username,
        content: c.content,
        createdAt: c.createdAt
      })),
      suggestions: suggestions.map(s => ({
        id: s.id,
        username: s.username,
        content: s.content,
        createdAt: s.createdAt
      }))
    };
  });
}

// 添加评论
function addComment(requirementId, username, content) {
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO comments (id, requirementId, username, content, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, requirementId, username, content, now);

  return {
    id,
    username,
    content,
    createdAt: now
  };
}

// 添加建议
function addSuggestion(requirementId, username, content) {
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO suggestions (id, requirementId, username, content, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, requirementId, username, content, now);

  return {
    id,
    username,
    content,
    createdAt: now
  };
}

// 切换点赞状态
function toggleLike(requirementId, username) {
  // 检查是否已经点赞
  const checkStmt = db.prepare('SELECT id FROM likes WHERE requirementId = ? AND username = ?');
  const existingLike = checkStmt.get(requirementId, username);

  if (existingLike) {
    // 取消点赞
    const deleteStmt = db.prepare('DELETE FROM likes WHERE requirementId = ? AND username = ?');
    deleteStmt.run(requirementId, username);
    
    // 更新需求的点赞数
    const updateStmt = db.prepare('UPDATE requirements SET likes = likes - 1 WHERE id = ?');
    updateStmt.run(requirementId);
    
    return false;
  } else {
    // 添加点赞
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const insertStmt = db.prepare(`
      INSERT INTO likes (id, requirementId, username, createdAt)
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(id, requirementId, username, now);
    
    // 更新需求的点赞数
    const updateStmt = db.prepare('UPDATE requirements SET likes = likes + 1 WHERE id = ?');
    updateStmt.run(requirementId);
    
    return true;
  }
}

// 检查用户是否已点赞
function hasUserLiked(requirementId, username) {
  const stmt = db.prepare('SELECT id FROM likes WHERE requirementId = ? AND username = ?');
  const result = stmt.get(requirementId, username);

  return Boolean(result);
}

// 更新需求状态
function updateRequirementStatus(requirementId, status) {
  const validStatuses = ['pending', 'submitted', 'developing', 'completed'];

  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`);
  }

  const stmt = db.prepare('UPDATE requirements SET status = ? WHERE id = ?');
  const result = stmt.run(status, requirementId);

  if (result.changes === 0) {
    throw new Error('Requirement not found');
  }

  return getRequirementById(requirementId);
}

// 删除需求
function deleteRequirement(requirementId) {
  // 检查需求是否存在
  const requirement = getRequirementById(requirementId);
  if (!requirement) {
    throw new Error('Requirement not found');
  }

  // 开始事务
  const transaction = db.transaction(() => {
    // 删除相关的点赞记录
    const deleteLikesStmt = db.prepare('DELETE FROM likes WHERE requirementId = ?');
    deleteLikesStmt.run(requirementId);

    // 删除相关的建议
    const deleteSuggestionsStmt = db.prepare('DELETE FROM suggestions WHERE requirementId = ?');
    deleteSuggestionsStmt.run(requirementId);

    // 删除相关的评论
    const deleteCommentsStmt = db.prepare('DELETE FROM comments WHERE requirementId = ?');
    deleteCommentsStmt.run(requirementId);

    // 删除需求本身
    const deleteRequirementStmt = db.prepare('DELETE FROM requirements WHERE id = ?');
    const result = deleteRequirementStmt.run(requirementId);

    if (result.changes === 0) {
      throw new Error('Failed to delete requirement');
    }
  });

  // 执行事务
  transaction();

  return { success: true, message: 'Requirement deleted successfully' };
}

// 删除评论
function deleteComment(commentId) {
  const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
  const result = stmt.run(commentId);

  if (result.changes === 0) {
    throw new Error('Comment not found');
  }

  return { success: true, message: 'Comment deleted successfully' };
}

// 删除建议
function deleteSuggestion(suggestionId) {
  const stmt = db.prepare('DELETE FROM suggestions WHERE id = ?');
  const result = stmt.run(suggestionId);

  if (result.changes === 0) {
    throw new Error('Suggestion not found');
  }

  return { success: true, message: 'Suggestion deleted successfully' };
}

// 清除所有数据
function clearAllData() {
  db.exec(`
    DELETE FROM likes;
    DELETE FROM suggestions;
    DELETE FROM comments;
    DELETE FROM requirements;
  `);
}

// 初始化示例数据
function initializeSampleData() {
  // 检查是否已有数据
  const existingRequirements = getRequirements();
  if (existingRequirements.length > 0) {
    return; // 已有数据，不需要初始化
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
    }
  ];

  // 保存示例数据
  const usernames = ['忙碌的产品经理', '头疼的程序员', '焦虑的老板'];

  sampleRequirements.forEach((req, index) => {
    const username = usernames[index % usernames.length];
    saveRequirement(req, username);
  });

  // 添加一些示例评论
  const requirements = getRequirements();
  if (requirements.length > 0) {
    addComment(requirements[0].id, '自由的设计师', '这个想法太棒了！我也需要这样的工具');
    if (requirements.length > 2) {
      addComment(requirements[2].id, '忙碌的产品经理', '安全性怎么保证？');
    }
  }

  console.log('Sample data initialized');
}

// 数据库迁移 - 添加status和images字段
function migrateDatabase() {
  try {
    const tableInfo = db.prepare("PRAGMA table_info(requirements)").all();

    // 检查是否已经有status字段
    const hasStatusColumn = tableInfo.some(column => column.name === 'status');
    if (!hasStatusColumn) {
      console.log('Adding status column to requirements table...');
      db.exec('ALTER TABLE requirements ADD COLUMN status TEXT DEFAULT "pending"');
      // 将现有的需求状态设置为'submitted'（已提交）
      db.exec("UPDATE requirements SET status = 'submitted' WHERE status IS NULL OR status = ''");
      console.log('Status column added and existing requirements updated to "submitted" status');
    }

    // 检查是否已经有images字段
    const hasImagesColumn = tableInfo.some(column => column.name === 'images');
    if (!hasImagesColumn) {
      console.log('Adding images column to requirements table...');
      db.exec('ALTER TABLE requirements ADD COLUMN images TEXT');
      // 将现有需求的images字段设置为空数组
      db.exec("UPDATE requirements SET images = '[]' WHERE images IS NULL");
      console.log('Images column added to requirements table');
    }
  } catch (error) {
    console.error('Database migration error:', error);
  }
}

// 初始化数据库
initializeTables();
migrateDatabase();

module.exports = {
  saveRequirement,
  getRequirements,
  getRequirementById,
  addComment,
  addSuggestion,
  toggleLike,
  hasUserLiked,
  updateRequirementStatus,
  deleteRequirement,
  deleteComment,
  deleteSuggestion,
  clearAllData,
  initializeSampleData,
  db
};
