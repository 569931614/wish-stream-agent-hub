import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, DollarSign, Clock, User, Send, Plus, CheckCircle } from 'lucide-react';
import { Requirement, toggleLike, addComment, getUserId } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface RequirementCardProps {
  requirement: Requirement;
  onUpdate: () => void;
}

export function RequirementCard({ requirement, onUpdate }: RequirementCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { toast } = useToast();
  
  const userId = getUserId();
  const isLiked = requirement.likedBy.includes(userId);
  const timeAgo = getTimeAgo(requirement.createdAt);

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

  const handleLike = () => {
    toggleLike(requirement.id);
    onUpdate();
    
    if (!isLiked) {
      toast({
        title: "👍 点赞成功",
        description: "感谢你的支持！",
      });
    }
  };

  const handleSupport = () => {
    toast({
      title: "💰 加薪成功",
      description: "感谢你的支持！",
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      addComment(requirement.id, newComment.trim());
      setNewComment('');
      onUpdate();
      toast({
        title: "💬 评论成功",
        description: "你的想法已经发布！",
      });
    } catch (error) {
      toast({
        title: "评论失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <Card className="requirement-card hover:shadow-lg transition-all duration-300 bg-card border border-border/50">
      <CardHeader className="pb-4">
        {/* 用户信息和状态 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={`${avatarInfo.color} text-white font-semibold`}>
                {avatarInfo.initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{requirement.username}</span>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
              {requirement.allowSuggestions && (
                <span className="text-xs text-primary">接受建议</span>
              )}
            </div>
          </div>
          
          {/* 状态标识 */}
          <div className="flex items-center gap-2">
            {Math.random() > 0.7 && ( // 随机显示已完成状态作为演示
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                已完成
              </Badge>
            )}
            {requirement.willingToPay && requirement.paymentAmount && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                <DollarSign className="h-3 w-3 mr-1" />
                ¥{requirement.paymentAmount}
              </Badge>
            )}
          </div>
        </div>
        
        {/* 需求标题 */}
        <h3 className="text-lg font-semibold text-foreground leading-tight mt-3">
          {requirement.title}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0 pb-4">
        <p className="text-muted-foreground leading-relaxed">
          {requirement.description}
        </p>
        
        {/* Powered by 标识 */}
        <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground/60">
          <span>⚡</span>
          <span>Powered by AI-需求池</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col gap-4 pt-0">
        {/* 操作按钮 */}
        <div className="flex items-center justify-between w-full border-t border-border pt-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSupport}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-1.5 h-auto text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>0</span>
              <span>加薪</span>
            </Button>
            
            <div className="w-px h-4 bg-border mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1.5 h-auto text-sm transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{requirement.likes}</span>
            </Button>
            
            <div className="w-px h-4 bg-border mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-1.5 h-auto text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{requirement.comments.length}</span>
              <span>条评论</span>
            </Button>
          </div>
        </div>
        
        {/* 评论区域 */}
        {showComments && (
          <>
            <Separator />
            <div className="w-full space-y-4">
              {requirement.comments.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {requirement.comments.map((comment) => (
                    <div key={comment.id} className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {comment.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="分享你的想法..."
                  className="input-field flex-1"
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
                  className="btn-secondary shrink-0"
                >
                  {isSubmittingComment ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardFooter>
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