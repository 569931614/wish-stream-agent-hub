import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Heart, MessageCircle, DollarSign, Clock, User, Send, CheckCircle, AlertCircle, PlayCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Requirement, RequirementStatus, toggleLike, addComment, getUsername, hasUserLiked } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

// 状态配置
const statusConfig = {
  pending: { label: '待确认', color: 'bg-yellow-500', icon: AlertCircle },
  submitted: { label: '已提交', color: 'bg-blue-500', icon: Clock },
  developing: { label: '开发中', color: 'bg-orange-500', icon: PlayCircle },
  completed: { label: '开发完成', color: 'bg-green-500', icon: CheckCircle }
};

interface RequirementCardProps {
  requirement: Requirement;
  onUpdate: () => void;
}

export function RequirementCard({ requirement, onUpdate }: RequirementCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();

  // 获取完整的图片URL
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // 动态获取API基础URL
    const apiBase = import.meta.env.DEV ? 'http://localhost:3001' : '';
    return `${apiBase}${imageUrl}`;
  };

  // 打开图片查看器
  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const username = getUsername();
  const timeAgo = getTimeAgo(requirement.createdAt);

  // 检查用户是否已点赞
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const liked = await hasUserLiked(requirement.id, username);
        setIsLiked(liked);
      } catch (error) {
        console.error('Failed to check like status:', error);
      }
    };

    checkLikeStatus();
  }, [requirement.id, username]);

  // 生成头像背景色和首字母
  const getAvatarInfo = (username: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500'];
    const colorIndex = username.length % colors.length;
    return {
      color: colors[colorIndex],
      initial: username.charAt(0).toUpperCase()
    };
  };

  const avatarInfo = getAvatarInfo(requirement.username);

  const handleLike = async () => {
    try {
      const newIsLiked = await toggleLike(requirement.id, username);
      setIsLiked(newIsLiked);
      onUpdate();

      if (newIsLiked) {
        toast({
          title: "👍 点赞成功",
          description: "感谢你的支持！",
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast({
        title: "操作失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    }
  };



  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      await addComment(requirement.id, username, newComment.trim());
      setNewComment('');
      onUpdate();
      toast({
        title: "💬 评论成功",
        description: "你的想法已经发布！",
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({
        title: "评论失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 获取状态配置
  const statusInfo = statusConfig[requirement.status];
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="requirement-card group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl overflow-hidden backdrop-blur-sm relative">
      {/* 右上角状态标签 */}
      <div className="absolute top-3 right-3 z-10">
        <Badge
          className={`${statusInfo.color} text-white flex items-center gap-1 px-3 py-1.5 text-xs font-semibold shadow-lg`}
        >
          <StatusIcon className="h-3 w-3" />
          {statusInfo.label}
        </Badge>
      </div>

      <CardContent className="p-5">
        {/* 头部：用户信息 */}
        <div className="flex items-center gap-3 mb-5 pr-20">
          <Avatar className="h-12 w-12 shrink-0 ring-2 ring-primary/20 shadow-lg">
            <AvatarFallback className={`${avatarInfo.color} text-white font-semibold text-base`}>
              {avatarInfo.initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-lg text-foreground">{requirement.username}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
        </div>

        {/* 需求标题 */}
        <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">
          {requirement.title}
        </h3>

        {/* 需求描述 */}
        <p className="text-lg text-muted-foreground mb-5 leading-relaxed line-clamp-4">
          {requirement.description}
        </p>

        {/* 图片展示 */}
        {requirement.images && requirement.images.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${
              requirement.images.length === 1 ? 'grid-cols-1 max-w-xs' :
              requirement.images.length === 2 ? 'grid-cols-2' :
              'grid-cols-3 sm:grid-cols-4'
            }`}>
              {requirement.images.slice(0, 6).map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div
                    className={`${
                      requirement.images.length === 1
                        ? 'aspect-[4/3] max-h-32'
                        : 'aspect-square image-grid-compact'
                    } rounded-md overflow-hidden border border-border bg-muted cursor-pointer clickable-image`}
                    onClick={() => openImageViewer(index)}
                  >
                    <img
                      src={getImageUrl(imageUrl)}
                      alt={`需求图片 ${index + 1}`}
                      className="w-full h-full object-cover requirement-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  {requirement.images.length > 6 && index === 5 && (
                    <div
                      className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center cursor-pointer"
                      onClick={() => openImageViewer(index)}
                    >
                      <span className="text-white text-xs font-semibold">+{requirement.images.length - 6}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 底部状态信息 */}
        <div className="flex items-center justify-between mb-5 p-3 bg-muted/20 rounded-lg border border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-base">🔥</span>
            <span className="text-sm text-muted-foreground font-medium"> {requirement.username.split('的')[1] || requirement.username}</span>
          </div>
          <div className="flex items-center gap-3">
            {requirement.allowSuggestions && (
              <Badge variant="outline" className="bg-green-500/15 text-green-400 border-green-500/30 text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
                接受建议
              </Badge>
            )}
            {requirement.willingToPay && requirement.paymentAmount && (
              <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
                愿意付费 ¥{requirement.paymentAmount}
              </Badge>
            )}
          </div>
        </div>

        {/* 标签展示 */}
        {(() => {
          const tags = requirement.tags;
          if (!tags || !Array.isArray(tags) || tags.length === 0) return null;

          return (
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm hover:bg-blue-500/20 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          );
        })()}

        {/* 互动按钮 */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm h-10 px-4 rounded-full transition-all font-medium ${
                isLiked
                  ? 'text-red-500 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30'
                  : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {requirement.likes}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-sm h-10 px-4 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-medium border border-transparent hover:border-primary/20"
            >
              <MessageCircle className="h-4 w-4" />
              {requirement.comments.length} 条建议和评论
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-sm h-9 px-4 text-muted-foreground hover:text-primary rounded-full font-medium border border-transparent hover:border-primary/20 hover:bg-primary/5"
          >
            {showComments ? '收起' : '查看详情'}
          </Button>
        </div>
        {/* 评论区域 */}
        {showComments && (
          <>
            <Separator className="my-5 bg-border" />
            <div className="w-full space-y-5">
              {requirement.comments.length > 0 && (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {requirement.comments.map((comment) => (
                    <div key={comment.id} className="bg-muted/30 p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {comment.username.charAt(0)}
                        </div>
                        <span className="text-base font-medium text-foreground truncate">
                          {comment.username}
                        </span>
                        <span className="text-sm text-muted-foreground shrink-0">
                          {getTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed pl-11">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="分享你的想法..."
                  className="flex-1 h-12 border-border focus:border-primary focus:ring-primary rounded-lg bg-background"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="shrink-0 px-5 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                >
                  {isSubmittingComment ? (
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* 图片查看器 */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            {/* 关闭按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImageViewerOpen(false)}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* 左箭头 */}
            {requirement.images && requirement.images.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedImageIndex((prev) => (prev - 1 + requirement.images.length) % requirement.images.length);
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12 p-0"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {/* 右箭头 */}
            {requirement.images && requirement.images.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedImageIndex((prev) => (prev + 1) % requirement.images.length);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12 p-0"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}

            {/* 图片计数 */}
            {requirement.images && requirement.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {selectedImageIndex + 1} / {requirement.images.length}
              </div>
            )}

            {/* 主图片 */}
            {requirement.images && requirement.images[selectedImageIndex] && (
              <img
                src={getImageUrl(requirement.images[selectedImageIndex])}
                alt={`图片 ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  
  return date.toLocaleDateString('zh-CN');
}