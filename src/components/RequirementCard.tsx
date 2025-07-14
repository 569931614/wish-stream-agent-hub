import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, DollarSign, Clock, User, Send } from 'lucide-react';
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
    <Card className="requirement-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-foreground leading-tight">
            {requirement.title}
          </h3>
          {requirement.willingToPay && requirement.paymentAmount && (
            <Badge variant="secondary" className="bg-accent/20 text-accent shrink-0">
              <DollarSign className="h-3 w-3 mr-1" />
              ¥{requirement.paymentAmount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {requirement.username}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </div>
          {requirement.allowSuggestions && (
            <Badge variant="outline" className="text-xs">
              接受建议
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground leading-relaxed">
          {requirement.description}
        </p>
      </CardContent>
      
      <CardFooter className="flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {requirement.likes}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              {requirement.comments.length}
            </Button>
          </div>
        </div>
        
        {showComments && (
          <>
            <Separator />
            <div className="w-full space-y-4">
              {requirement.comments.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {requirement.comments.map((comment) => (
                    <div key={comment.id} className="bg-muted/50 p-3 rounded-lg">
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