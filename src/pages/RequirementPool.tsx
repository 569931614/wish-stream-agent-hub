import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RequirementCard } from '@/components/RequirementCard';
import { RequirementForm } from '@/components/RequirementForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Requirement, getRequirements, reinitializeData } from '@/lib/data';
import { Search, Filter, Plus, TrendingUp, Clock, DollarSign, ArrowLeft, User, QrCode, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RequirementPool() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<Requirement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterBy, setFilterBy] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    loadRequirements().catch(console.error);
  }, []);

  useEffect(() => {
    filterAndSortRequirements();
  }, [requirements, searchTerm, sortBy, filterBy]);

  const loadRequirements = async () => {
    try {
      const data = await getRequirements();
      // 过滤掉待确认状态的需求，只显示其他状态的需求
      const filteredData = data.filter(req => req.status !== 'pending');
      setRequirements(filteredData);
    } catch (error) {
      console.error('Failed to load requirements:', error);
    }
  };

  const filterAndSortRequirements = () => {
    let filtered = [...requirements];

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 类型过滤
    switch (filterBy) {
      case 'paid':
        filtered = filtered.filter(req => req.willingToPay);
        break;
      case 'free':
        filtered = filtered.filter(req => !req.willingToPay);
        break;
      case 'suggestions':
        filtered = filtered.filter(req => req.allowSuggestions);
        break;
    }

    // 排序
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'comments':
        filtered.sort((a, b) => b.comments.length - a.comments.length);
        break;
      case 'payment':
        filtered.sort((a, b) => (b.paymentAmount || 0) - (a.paymentAmount || 0));
        break;
    }

    setFilteredRequirements(filtered);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    loadRequirements().catch(console.error);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  const handleRequirementUpdate = () => {
    loadRequirements().catch(console.error);
  };

  return (
    <div className="min-h-screen bg-background" style={{ zoom: '90%' }}>
      {/* 导航栏 */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-8xl mx-auto px-1 sm:px-3 lg:px-4 py-3 sm:py-4">
          {/* 第一行：主要导航 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link to="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-8 sm:h-9">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">返回首页</span>
                  <span className="sm:hidden">返回</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src="/laolinai-logo.jpg"
                  alt="老林AI Logo"
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover ring-2 ring-primary/20"
                />
                <h1 className="text-lg sm:text-2xl font-bold text-gradient truncate">需求池</h1>
              </div>
              <Badge variant="secondary" className="bg-primary/20 text-primary text-xs sm:text-sm hidden sm:inline-flex">
                {requirements.length} 个需求
              </Badge>


            </div>

            {/* AI定制需求指示和作者相关按钮 - 靠右对齐 */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* AI定制需求指示 - 仅大屏显示 */}
              <div className="flex items-center gap-2 hidden lg:flex">
                <span className="text-xl font-bold text-primary animate-pulse">
                  🤖 AI、智能体定制需求找作者
                </span>
                <ArrowRight className="h-6 w-6 text-primary font-bold animate-bounce" />
              </div>

              <div className="flex gap-1 lg:gap-2">
                <Button
                  onClick={() => window.open('/person.html', '_blank')}
                  variant="outline"
                  size="sm"
                  className="text-xs lg:text-sm px-2 lg:px-4 py-2 h-8 lg:h-10 rounded-full font-medium transition-all hover:scale-105"
                >
                  <User className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">作者简介</span>
                  <span className="sm:hidden">简介</span>
                </Button>

                <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs lg:text-sm px-2 lg:px-4 py-2 h-8 lg:h-10 rounded-full font-medium transition-all hover:scale-105 border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <QrCode className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">直接找作者</span>
                      <span className="sm:hidden">联系</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-semibold">联系作者</h3>
                      <div className="space-y-2">
                        <p className="text-muted-foreground font-medium">
                          🤖 AI、智能体定制开发
                        </p>
                        <p className="text-sm text-muted-foreground">
                          扫描二维码添加作者微信
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <img
                          src="https://pic.imgdd.cc/item/685ba1823c3a6234d352513f.jpg"
                          alt="作者微信二维码"
                          className="w-64 h-64 object-contain rounded-lg border"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-primary">
                          💡 专业提供AI解决方案
                        </p>
                        <p className="text-xs text-muted-foreground">
                          智能体定制 • 自动化工具 • 技术咨询
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5 h-8 sm:h-10">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">提新需求</span>
                    <span className="sm:hidden">提需求</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border mx-2 sm:mx-auto">
                  <RequirementForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 第二行：小屏幕下的AI定制需求指示 */}
          <div className="lg:hidden mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-center">
              {/* AI定制需求指示 */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary animate-pulse">
                  🤖 AI、智能体定制需求找作者
                </span>
                <ArrowRight className="h-5 w-5 text-primary font-bold animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-1 sm:px-2 lg:px-3 py-6 sm:py-10">
        {/* 搜索和筛选区域 */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索需求标题或描述..."
                  className="pl-12 h-12 text-base border-border focus:border-primary focus:ring-primary rounded-lg bg-background"
                />
              </div>

              <div className="flex gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 h-12 border-border focus:border-primary focus:ring-primary rounded-lg bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        最新发布
                      </div>
                    </SelectItem>
                    <SelectItem value="popular">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        最受欢迎
                      </div>
                    </SelectItem>
                    <SelectItem value="comments">最多评论</SelectItem>
                    <SelectItem value="payment">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        付费优先
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-36 h-12 border-border focus:border-primary focus:ring-primary rounded-lg bg-background">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="paid">付费项目</SelectItem>
                    <SelectItem value="free">免费项目</SelectItem>
                    <SelectItem value="suggestions">接受建议</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 快捷筛选标签 */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
            <Button
              variant={filterBy === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterBy('all')}
              className="text-sm px-4 py-2 h-10 rounded-full font-medium transition-all hover:scale-105"
            >
              全部 ({requirements.length})
            </Button>
            <Button
              variant={filterBy === 'paid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterBy('paid')}
              className="text-sm px-4 py-2 h-10 rounded-full font-medium transition-all hover:scale-105"
            >
              <DollarSign className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">付费项目</span>
              <span className="sm:hidden">付费</span> ({requirements.filter(r => r.willingToPay).length})
            </Button>
            <Button
              variant={filterBy === 'suggestions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterBy('suggestions')}
              className="text-sm px-4 py-2 h-10 rounded-full font-medium transition-all hover:scale-105"
            >
              <span className="hidden sm:inline">接受建议</span>
              <span className="sm:hidden">建议</span> ({requirements.filter(r => r.allowSuggestions).length})
            </Button>
          </div>
        </div>

        {/* 审核说明 */}
        {filteredRequirements.length > 0 && (
          <div className="mb-6 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 text-center">
              ✅ 以下是已通过管理员审核的需求，欢迎大家查看和参与讨论
            </p>
          </div>
        )}

        {/* 需求列表 */}
        <div className="space-y-4 sm:space-y-6">
          {filteredRequirements.length === 0 ? (
            <div className="text-center py-16">
              <div className="card-gradient p-8 max-w-md mx-auto">
                <div className="space-y-4">
                  <div className="text-6xl">🤖</div>
                  <h3 className="text-xl font-semibold">暂无匹配的需求</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? '试试其他搜索关键词' : '成为第一个提出需求的人吧！'}
                  </p>
                  {!searchTerm && (
                    <p className="text-xs text-muted-foreground/80">
                      💡 提交的需求需要管理员审核后才会显示在这里
                    </p>
                  )}
                  {!searchTerm && (
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                      <DialogTrigger asChild>
                        <Button className="btn-primary mt-4 px-6 py-3 h-12">
                          <Plus className="h-4 w-4 mr-2" />
                          提个需求
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="masonry-container">
              {filteredRequirements.map((requirement) => (
                <div key={requirement.id} className="masonry-item">
                  <RequirementCard
                    requirement={requirement}
                    onUpdate={handleRequirementUpdate}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        {filteredRequirements.length > 0 && (
          <div className="text-center mt-16 py-8 border-t border-border">
            <p className="text-muted-foreground">
              💡 看到感兴趣的需求？点赞支持或留言交流吧！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}