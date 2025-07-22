import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TagSelector } from '@/components/TagSelector';
import { saveRequirement, generateRandomUsername, getUsername, updateUsername, uploadImages } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Zap, Users, DollarSign, User, Shuffle, Upload, X, Image } from 'lucide-react';

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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 清理图片预览URL
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);



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

  // 处理文件列表
  const processFiles = (files: File[]) => {
    // 验证文件类型
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "文件类型错误",
          description: `${file.name} 不是图片文件`,
          variant: "destructive",
        });
        return false;
      }

      // 验证文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: `${file.name} 超过5MB限制`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // 限制最多上传5张图片
    const currentCount = images.length;
    const maxImages = 5;
    const availableSlots = maxImages - currentCount;

    if (availableSlots <= 0) {
      toast({
        title: "图片数量限制",
        description: `最多只能上传${maxImages}张图片`,
        variant: "destructive",
      });
      return;
    }

    const filesToAdd = validFiles.slice(0, availableSlots);

    if (filesToAdd.length < validFiles.length) {
      toast({
        title: "部分图片未添加",
        description: `只能再添加${availableSlots}张图片`,
        variant: "destructive",
      });
    }

    // 生成预览URL
    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));

    setImages(prev => [...prev, ...filesToAdd]);
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // 成功提示
    toast({
      title: "图片上传成功",
      description: `已添加 ${filesToAdd.length} 张图片`,
    });
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  // 删除图片
  const removeImage = (index: number) => {
    // 释放预览URL内存
    URL.revokeObjectURL(imagePreviews[index]);

    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
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
      let imageUrls: string[] = [];

      // 如果有图片，先上传图片
      if (images.length > 0) {
        try {
          const uploadResult = await uploadImages(images);
          imageUrls = uploadResult.files.map(file => file.url);
        } catch (error) {
          console.error('Failed to upload images:', error);
          toast({
            title: "图片上传失败",
            description: "图片上传遇到问题，但需求仍会保存（不含图片）",
            variant: "destructive",
          });
        }
      }

      await saveRequirement({
        title: title.trim(),
        description: description.trim(),
        allowSuggestions,
        willingToPay,
        paymentAmount: willingToPay ? parseFloat(paymentAmount) : undefined,
        tags: tags,
        images: imageUrls,
      }, name.trim());

      toast({
        title: "🎉 需求提交成功！",
        description: "你的需求已提交，正在等待管理员审核。审核通过后将会出现在需求池中，敬请期待！",
      });

      // 重置表单（保持用户名称不变）
      setTitle('');
      setDescription('');
      setTags([]);
      setAllowSuggestions(true);
      setWillingToPay(true);
      setPaymentAmount('200');

      // 清理图片
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImages([]);
      setImagePreviews([]);

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
    // 清理图片预览URL
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreviews([]);

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
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            💡 提示：提交的需求将由管理员审核，审核通过后会显示在需求池中
          </p>
        </div>
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

          {/* 图片上传 */}
          <div className="space-y-3 p-6 bg-muted/30 rounded-xl border border-border">
            <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              上传图片
              <span className="text-sm font-normal text-muted-foreground">（可选，最多5张）</span>
            </Label>

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* 上传区域 */}
            <div className="space-y-4">
              {/* 上传按钮 */}
              <div
                className={`w-full h-20 border-2 border-dashed rounded-lg transition-all duration-200 image-upload-area ${
                  isDragOver
                    ? 'border-primary bg-primary/5 drag-over'
                    : 'border-border hover:border-primary hover:bg-primary/5'
                } ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={images.length < 5 ? triggerFileSelect : undefined}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {images.length >= 5 ? '已达到最大上传数量' : '点击选择图片或拖拽到此处'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    支持 JPG、PNG、GIF 格式，单张图片不超过 5MB
                  </span>
                </div>
              </div>

              {/* 图片预览 */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group image-preview">
                      <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted max-h-20 sm:max-h-24">
                        <img
                          src={preview}
                          alt={`预览图片 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* 图片数量提示 */}
              {images.length > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  已选择 {images.length}/5 张图片
                </div>
              )}
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

          {/* 审核提示 */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <div className="flex-shrink-0">⏳</div>
              <div className="text-sm">
                <p className="font-medium">需要管理员审核</p>
                <p className="text-xs opacity-90">提交后需要等待管理员审核通过，审核通过的需求将会显示在需求池中供大家查看</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-none w-24 sm:w-28 h-12 sm:h-14 text-base sm:text-lg border-border hover:border-border/80 rounded-xl"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all"
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