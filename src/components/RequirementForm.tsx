import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TagSelector } from '@/components/TagSelector';
import { saveRequirement, generateRandomUsername, getUsername, updateUsername } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Zap, Users, DollarSign, User, Shuffle } from 'lucide-react';

interface RequirementFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function RequirementForm({ onSubmit, onCancel }: RequirementFormProps) {
  const [name, setName] = useState(getUsername());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [allowSuggestions, setAllowSuggestions] = useState(true);
  const [willingToPay, setWillingToPay] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('200');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 防止名称输入框自动选中文本
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.setSelectionRange(0, 0);
        nameInputRef.current.blur();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);



  const generateNewName = () => {
    const newName = generateRandomUsername();
    setName(newName);
    updateUsername(newName); // 更新本地存储的用户名称
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // 当用户手动修改名称时，也更新本地存储
    if (newName.trim()) {
      updateUsername(newName.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !title.trim() || !description.trim()) {
      toast({
        title: "请完善需求信息",
        description: "名称、标题和详情都是必填项哦～",
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
      await saveRequirement({
        title: title.trim(),
        description: description.trim(),
        allowSuggestions,
        willingToPay,
        paymentAmount: willingToPay ? parseFloat(paymentAmount) : undefined,
        tags: tags,
      }, name.trim());

      toast({
        title: "🎉 需求提交成功！",
        description: "你的想法已经加入需求池，期待更多人看到并实现它！",
      });

      // 重置表单（保持用户名称不变）
      setTitle('');
      setDescription('');
      setTags([]);
      setAllowSuggestions(true);
      setWillingToPay(true);
      setPaymentAmount('200');

      onSubmit?.();
    } catch (error) {
      console.error('Failed to save requirement:', error);
      toast({
        title: "提交失败",
        description: "网络似乎有点问题，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // 关闭弹窗，不重置表单数据
    onCancel?.();
  };

  return (
    <Card className="w-full bg-card border border-border shadow-xl">
      <CardHeader className="text-center px-6 sm:px-8 pt-8 sm:pt-10">
        <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          提个AI需求
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground px-4">
          说出你的想法，让AI为你的生活和工作创造无限可能
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 名称输入 */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              你的名称
            </Label>
            <div className="flex gap-3">
              <Input
                ref={nameInputRef}
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="输入你的名称"
                className="flex-1 h-14 text-lg border-border focus:border-primary focus:ring-primary rounded-xl bg-background"
                maxLength={50}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateNewName}
                className="shrink-0 h-14 w-14 border-border hover:border-primary hover:bg-primary/10 rounded-xl"
                title="随机生成名称"
              >
                <Shuffle className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {name.length}/50 · 你的名称会被记住，点击🔀按钮可随机生成新名称
            </div>
          </div>

          {/* 需求标题 */}
          <div className="space-y-3">
            <Label htmlFor="title" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              需求标题
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：自动写周报的AI助手"
              className="h-14 text-lg border-border focus:border-primary focus:ring-primary rounded-xl bg-background"
              maxLength={100}
            />
            <div className="text-sm text-muted-foreground text-right">
              {title.length}/100
            </div>
          </div>

          {/* 需求详情 */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-lg font-semibold text-foreground">需求详情</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="详细描述你的需求，包括功能特点、使用场景等..."
              className="min-h-40 text-lg border-border focus:border-primary focus:ring-primary rounded-xl resize-none bg-background"
              maxLength={2000}
            />
            <div className="text-sm text-muted-foreground text-right">
              {description.length}/2000
            </div>
          </div>

          {/* 标签选择 */}
          <div className="space-y-3 p-6 bg-muted/30 rounded-xl border border-border">
            <TagSelector
              selectedTags={tags}
              onTagsChange={setTags}
              maxTags={5}
            />
          </div>

          <div className="space-y-6 p-6 bg-muted/30 rounded-xl border border-border">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Users className="h-5 w-5 text-green-500 shrink-0" />
                <Label htmlFor="allow-suggestions" className="text-lg font-semibold text-foreground">
                  允许他人添加建议
                </Label>
              </div>
              <Switch
                id="allow-suggestions"
                checked={allowSuggestions}
                onCheckedChange={setAllowSuggestions}
                className="shrink-0"
              />
            </div>
            <p className="text-base text-muted-foreground ml-8">
              开启后，其他用户可以为你的需求提供实现建议和改进意见
            </p>
          </div>

          <div className="space-y-6 p-6 bg-muted/30 rounded-xl border border-border">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <DollarSign className="h-5 w-5 text-emerald-500 shrink-0" />
                <Label htmlFor="willing-to-pay" className="text-lg font-semibold text-foreground">
                  愿意为实现付费
                </Label>
              </div>
              <Switch
                id="willing-to-pay"
                checked={willingToPay}
                onCheckedChange={setWillingToPay}
                className="shrink-0"
              />
            </div>

            {willingToPay && (
              <div className="ml-8 space-y-4">
                <Label htmlFor="payment-amount" className="text-base font-medium text-muted-foreground">付费金额（人民币）</Label>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-semibold text-foreground">¥</span>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="200"
                    className="w-40 h-12 text-lg border-border focus:border-primary focus:ring-primary rounded-lg bg-background"
                    min="1"
                    max="99999"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  设置合理的付费金额有助于吸引开发者实现你的需求
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-none w-28 h-14 text-lg border-border hover:border-border/80 rounded-xl"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 text-lg bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full mr-3" />
                  提交中...
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6 mr-3" />
                  发布需求到池子里
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}