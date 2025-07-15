import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  getRequirements,
  updateRequirementStatus,
  deleteRequirement,
  type Requirement,
  type RequirementStatus
} from '@/lib/data';
import { adminLogout, getAdminInfo } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  User,
  Calendar,
  MessageCircle,
  Heart,
  DollarSign,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// 状态配置
const statusConfig = {
  pending: { label: '待确认', color: 'bg-yellow-500', icon: AlertCircle },
  submitted: { label: '已提交', color: 'bg-blue-500', icon: Clock },
  developing: { label: '开发中', color: 'bg-orange-500', icon: PlayCircle },
  completed: { label: '开发完成', color: 'bg-green-500', icon: CheckCircle }
};

export default function AdminDashboard() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingRequirement, setDeletingRequirement] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const adminInfo = getAdminInfo();

  // 加载需求列表
  const loadRequirements = async () => {
    try {
      setLoading(true);
      const data = await getRequirements();
      setRequirements(data);
    } catch (error) {
      console.error('Failed to load requirements:', error);
      setError('加载需求列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  // 更新需求状态
  const handleStatusUpdate = async (requirementId: string, newStatus: RequirementStatus) => {
    try {
      setUpdatingStatus(requirementId);
      await updateRequirementStatus(requirementId, newStatus);

      // 更新本地状态
      setRequirements(prev =>
        prev.map(req =>
          req.id === requirementId
            ? { ...req, status: newStatus }
            : req
        )
      );

      toast({
        title: "状态更新成功",
        description: `需求状态已更新为：${statusConfig[newStatus].label}`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "更新失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // 删除需求
  const handleDeleteRequirement = async (requirementId: string) => {
    try {
      setDeletingRequirement(requirementId);
      await deleteRequirement(requirementId);

      // 从本地状态中移除
      setRequirements(prev => prev.filter(req => req.id !== requirementId));

      toast({
        title: "删除成功",
        description: "需求已被永久删除",
      });

      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete requirement:', error);
      toast({
        title: "删除失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setDeletingRequirement(null);
    }
  };

  // 登出
  const handleLogout = () => {
    adminLogout();
    toast({
      title: "已登出",
      description: "管理员已安全登出",
    });
    navigate('/');
  };

  // 生成头像信息
  const getAvatarInfo = (username: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500'];
    const colorIndex = username.length % colors.length;
    return {
      color: colors[colorIndex],
      initial: username.charAt(0).toUpperCase()
    };
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  // 统计信息
  const stats = {
    total: requirements.length,
    pending: requirements.filter(r => r.status === 'pending').length,
    submitted: requirements.filter(r => r.status === 'submitted').length,
    developing: requirements.filter(r => r.status === 'developing').length,
    completed: requirements.filter(r => r.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <img
                  src="/laolinai-logo.jpg"
                  alt="老林AI Logo"
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                />
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">老林AI管理员面板</h1>
                  <p className="text-sm text-muted-foreground">
                    欢迎，{adminInfo.username}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">总需求</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">待确认</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
              <div className="text-sm text-muted-foreground">已提交</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.developing}</div>
              <div className="text-sm text-muted-foreground">开发中</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">已完成</div>
            </CardContent>
          </Card>
        </div>

        {/* 需求列表 */}
        <Card>
          <CardHeader>
            <CardTitle>需求管理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requirements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无需求数据
                </div>
              ) : (
                requirements.map((requirement) => {
                  const avatarInfo = getAvatarInfo(requirement.username);
                  const StatusIcon = statusConfig[requirement.status].icon;
                  
                  return (
                    <div key={requirement.id} className="border border-border rounded-lg p-4 space-y-4">
                      {/* 需求头部信息 */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`${avatarInfo.color} text-white font-semibold`}>
                              {avatarInfo.initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{requirement.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {requirement.username}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatTime(requirement.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 状态选择器和操作按钮 */}
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${statusConfig[requirement.status].color} text-white flex items-center gap-1`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[requirement.status].label}
                          </Badge>
                          <Select
                            value={requirement.status}
                            onValueChange={(value: RequirementStatus) =>
                              handleStatusUpdate(requirement.id, value)
                            }
                            disabled={updatingStatus === requirement.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">待确认</SelectItem>
                              <SelectItem value="submitted">已提交</SelectItem>
                              <SelectItem value="developing">开发中</SelectItem>
                              <SelectItem value="completed">开发完成</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteConfirmId(requirement.id)}
                            disabled={deletingRequirement === requirement.id}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 需求描述 */}
                      <div className="text-sm text-muted-foreground">
                        {requirement.description}
                      </div>

                      {/* 标签 */}
                      {requirement.tags && requirement.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {requirement.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* 底部信息 */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {requirement.likes} 点赞
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {requirement.comments?.length || 0} 评论
                          </span>
                          {requirement.willingToPay && (
                            <span className="flex items-center gap-1 text-green-600">
                              <DollarSign className="h-3 w-3" />
                              ¥{requirement.paymentAmount || 0}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          ID: {requirement.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除需求</DialogTitle>
            <DialogDescription>
              此操作将永久删除该需求及其所有相关数据（评论、建议、点赞等）。
              <br />
              <strong>此操作不可撤销，请谨慎操作。</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              disabled={!!deletingRequirement}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteRequirement(deleteConfirmId)}
              disabled={!!deletingRequirement}
            >
              {deletingRequirement === deleteConfirmId ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  删除中...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  确认删除
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
