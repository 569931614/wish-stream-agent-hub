const express = require('express');
const cors = require('cors');
const path = require('path');
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
  clearAllData,
  initializeSampleData
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务（可选，用于提供前端文件）
app.use(express.static(path.join(__dirname, '..', 'dist')));

// API 路由

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

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log('Database ready - no sample data auto-initialization');
});

module.exports = app;
