import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Tag } from 'lucide-react';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

// 预设的业务相关标签
const PRESET_TAGS = [
  // 电商相关
  '电商', '小红书', '淘宝', '京东', '拼多多', '直播带货', '社交电商', '跨境电商',
  
  // 办公自动化
  '办公自动化', '文档生成', '工作效率', '项目管理', '团队协作', '会议管理',
  
  // 开发工具
  '开发工具', '代码优化', '编程助手', '测试自动化', '质量保证', 'API开发',
  
  // 数据分析
  '数据分析', '商业智能', '报表生成', '数据可视化', '统计分析',
  
  // 人工智能
  '人工智能', '机器学习', '自然语言处理', '图像识别', '语音识别', '对话机器人',
  
  // 金融理财
  '金融理财', '投资分析', '风险管理', '支付系统', '区块链',
  
  // 教育培训
  '在线教育', '知识管理', '学习工具', '培训系统', '考试系统',
  
  // 内容创作
  '内容创作', '视频制作', '图片处理', '文案写作', '翻译工具',
  
  // 生活服务
  '生活服务', '健康管理', '出行导航', '美食推荐', '购物助手',
  
  // 游戏娱乐
  '游戏开发', '娱乐应用', '社交平台', '音乐播放', '视频播放',
  
  // 其他
  '个人助手', '工具应用', '基础功能', '系统优化', '安全防护'
];

export function TagSelector({ selectedTags, onTagsChange, maxTags = 5 }: TagSelectorProps) {
  const [customTag, setCustomTag] = useState('');
  const [showAllPresets, setShowAllPresets] = useState(false);

  // 显示的预设标签（默认显示前20个，可展开查看全部）
  const displayedPresets = showAllPresets ? PRESET_TAGS : PRESET_TAGS.slice(0, 20);

  const handlePresetTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // 移除标签
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < maxTags) {
      // 添加标签
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleCustomTagAdd = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, trimmedTag]);
      setCustomTag('');
    }
  };

  const handleCustomTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomTagAdd();
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Tag className="h-5 w-5 text-primary" />
        标签分类
        <span className="text-sm font-normal text-muted-foreground">
          ({selectedTags.length}/{maxTags})
        </span>
      </Label>

      {/* 已选择的标签 */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">已选择：</div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="bg-primary text-primary-foreground px-3 py-1 text-sm flex items-center gap-1"
              >
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-primary-foreground/20"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 预设标签选择 */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-foreground">选择预设标签：</div>
        <div className="flex flex-wrap gap-2">
          {displayedPresets.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer transition-all hover:scale-105 px-3 py-1 text-sm ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-primary/10 hover:border-primary'
              } ${
                !selectedTags.includes(tag) && selectedTags.length >= maxTags
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              onClick={() => handlePresetTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        {!showAllPresets && PRESET_TAGS.length > 20 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAllPresets(true)}
            className="text-primary hover:text-primary/80"
          >
            查看更多标签 ({PRESET_TAGS.length - 20}个)
          </Button>
        )}
      </div>

      {/* 自定义标签输入 */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-foreground">或添加自定义标签：</div>
        <div className="flex gap-2">
          <Input
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={handleCustomTagKeyPress}
            placeholder="输入自定义标签"
            className="flex-1"
            maxLength={20}
            disabled={selectedTags.length >= maxTags}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCustomTagAdd}
            disabled={!customTag.trim() || selectedTags.includes(customTag.trim()) || selectedTags.length >= maxTags}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          最多可选择 {maxTags} 个标签，每个标签最长 20 个字符
        </div>
      </div>
    </div>
  );
}
