import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { saveRequirement } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Zap, Users, DollarSign } from 'lucide-react';

interface RequirementFormProps {
  onSubmit?: () => void;
}

export function RequirementForm({ onSubmit }: RequirementFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allowSuggestions, setAllowSuggestions] = useState(true);
  const [willingToPay, setWillingToPay] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "请完善需求信息",
        description: "标题和详情都是必填项哦～",
        variant: "destructive",
      });
      return;
    }

    if (willingToPay && (!paymentAmount || parseFloat(paymentAmount) <= 0)) {
      toast({
        title: "请设置付费金额",
        description: "既然愿意付费，请设置一个合理的金额",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newRequirement = saveRequirement({
        title: title.trim(),
        description: description.trim(),
        allowSuggestions,
        willingToPay,
        paymentAmount: willingToPay ? parseFloat(paymentAmount) : undefined,
      });

      toast({
        title: "🎉 需求提交成功！",
        description: "你的想法已经加入需求池，期待更多人看到并实现它！",
      });

      // 重置表单
      setTitle('');
      setDescription('');
      setAllowSuggestions(true);
      setWillingToPay(false);
      setPaymentAmount('');

      onSubmit?.();
    } catch (error) {
      toast({
        title: "提交失败",
        description: "网络似乎有点问题，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="card-gradient max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-gradient flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8" />
          提个AI需求
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          说出你的想法，让AI为你的生活和工作创造无限可能
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              需求标题
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：自动写周报的AI助手"
              className="input-field text-base"
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">需求详情</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="详细描述你的需求，包括功能特点、使用场景等..."
              className="input-field min-h-32 text-base resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/1000
            </div>
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <Label htmlFor="allow-suggestions" className="text-base font-medium">
                  允许他人添加建议
                </Label>
              </div>
              <Switch
                id="allow-suggestions"
                checked={allowSuggestions}
                onCheckedChange={setAllowSuggestions}
              />
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              开启后，其他用户可以为你的需求提供实现建议和改进意见
            </p>
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-accent" />
                <Label htmlFor="willing-to-pay" className="text-base font-medium">
                  愿意为实现付费
                </Label>
              </div>
              <Switch
                id="willing-to-pay"
                checked={willingToPay}
                onCheckedChange={setWillingToPay}
              />
            </div>
            
            {willingToPay && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="payment-amount" className="text-sm">付费金额（人民币）</Label>
                <div className="flex items-center gap-2">
                  <span className="text-lg">¥</span>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    className="input-field w-32"
                    min="1"
                    max="99999"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  设置合理的付费金额有助于吸引开发者实现你的需求
                </p>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="btn-primary w-full text-lg py-6 pulse-glow"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full mr-2" />
                提交中...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                发布需求到池子里
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}