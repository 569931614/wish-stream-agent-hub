const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const {
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
  initializeSampleData
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// 创建上传目录
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
    files: 5 // 最多5个文件
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 提供上传的图片文件
app.use('/uploads', express.static(uploadsDir));

// 静态文件服务（可选，用于提供前端文件）
app.use(express.static(path.join(__dirname, '..', 'dist')));

// API 路由

// 图片上传
app.post('/api/upload-images', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // 返回上传的文件信息
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// 获取所有需求
app.get('/api/requirements', (req, res) => {
  try {
    const requirements = getRequirements();
    res.json(requirements);
  } catch (error) {
    console.error('Error getting requirements:', error);
    res.status(500).json({ error: 'Failed to get requirements' });
  }
});

// 获取单个需求
app.get('/api/requirements/:id', (req, res) => {
  try {
    const requirement = getRequirementById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ error: 'Requirement not found' });
    }
    res.json(requirement);
  } catch (error) {
    console.error('Error getting requirement:', error);
    res.status(500).json({ error: 'Failed to get requirement' });
  }
});

// 创建新需求
app.post('/api/requirements', (req, res) => {
  try {
    const { requirement, username } = req.body;



    if (!requirement || !username) {
      return res.status(400).json({ error: 'Requirement and username are required' });
    }

    const newRequirement = saveRequirement(requirement, username);
    res.status(201).json(newRequirement);
  } catch (error) {
    console.error('Error creating requirement:', error);
    res.status(500).json({ error: 'Failed to create requirement' });
  }
});

// 添加评论
app.post('/api/requirements/:id/comments', (req, res) => {
  try {
    const { username, content } = req.body;
    
    if (!username || !content) {
      return res.status(400).json({ error: 'Username and content are required' });
    }

    const comment = addComment(req.params.id, username, content);
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// 添加建议
app.post('/api/requirements/:id/suggestions', (req, res) => {
  try {
    const { username, content } = req.body;
    
    if (!username || !content) {
      return res.status(400).json({ error: 'Username and content are required' });
    }

    const suggestion = addSuggestion(req.params.id, username, content);
    res.status(201).json(suggestion);
  } catch (error) {
    console.error('Error adding suggestion:', error);
    res.status(500).json({ error: 'Failed to add suggestion' });
  }
});

// 切换点赞
app.post('/api/requirements/:id/like', (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const isLiked = toggleLike(req.params.id, username);
    res.json({ isLiked });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// 检查用户是否已点赞
app.get('/api/requirements/:id/like/:username', (req, res) => {
  try {
    const isLiked = hasUserLiked(req.params.id, req.params.username);
    res.json({ isLiked });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: 'Failed to check like status' });
  }
});

// 更新需求状态
app.put('/api/requirements/:id/status', (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updatedRequirement = updateRequirementStatus(req.params.id, status);
    res.json(updatedRequirement);
  } catch (error) {
    console.error('Error updating requirement status:', error);
    if (error.message.includes('Invalid status') || error.message.includes('not found')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update requirement status' });
    }
  }
});

// 删除需求
app.delete('/api/requirements/:id', (req, res) => {
  try {
    const result = deleteRequirement(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting requirement:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete requirement' });
    }
  }
});

// 删除评论
app.delete('/api/comments/:id', (req, res) => {
  try {
    const result = deleteComment(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
});

// 删除建议
app.delete('/api/suggestions/:id', (req, res) => {
  try {
    const result = deleteSuggestion(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete suggestion' });
    }
  }
});

// 清除所有数据并重新初始化
app.post('/api/reset', (req, res) => {
  try {
    clearAllData();
    initializeSampleData();
    res.json({ message: 'Database reset and sample data initialized' });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// 初始化示例数据
app.post('/api/init', (req, res) => {
  try {
    initializeSampleData();
    res.json({ message: 'Sample data initialized' });
  } catch (error) {
    console.error('Error initializing sample data:', error);
    res.status(500).json({ error: 'Failed to initialize sample data' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 前端路由fallback - 必须在错误处理之前
app.get('*', (req, res) => {
  // 如果请求的是API路径，返回404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // 否则返回前端index.html（支持前端路由）
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 老林AI需求池服务器启动成功！`);
  console.log(`📱 前端网站: http://localhost:${PORT}`);
  console.log(`🔌 API接口: http://localhost:${PORT}/api`);
  console.log(`💾 数据库已就绪`);
  console.log(`⚡ 单服务模式 - 前端和后端统一在端口 ${PORT}`);
});

module.exports = app;
