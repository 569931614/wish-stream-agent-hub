import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RequirementCard } from '@/components/RequirementCard';
import { RequirementForm } from '@/components/RequirementForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Requirement, getRequirements } from '@/lib/data';
import { Search, Filter, Plus, TrendingUp, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RequirementPool() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<Requirement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterBy, setFilterBy] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadRequirements();
  }, []);

  useEffect(() => {
    filterAndSortRequirements();
  }, [requirements, searchTerm, sortBy, filterBy]);

  const loadRequirements = () => {
    const data = getRequirements();
    setRequirements(data);
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
    loadRequirements();
  };

  const handleRequirementUpdate = () => {
    loadRequirements();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  返回首页
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gradient">AI需求池</h1>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {requirements.length} 个需求
              </Badge>
            </div>
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  提新需求
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
                <RequirementForm onSubmit={handleFormSubmit} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 搜索和筛选区域 */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索需求标题或描述..."
                className="input-field pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      最新
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      最热
                    </div>
                  </SelectItem>
                  <SelectItem value="comments">最多评论</SelectItem>
                  <SelectItem value="payment">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3" />
                      付费优先
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32 input-field">
                  <Filter className="h-3 w-3 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="paid">付费项目</SelectItem>
                  <SelectItem value="free">免费项目</SelectItem>
                  <SelectItem value="suggestions">接受建议</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 快捷筛选标签 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterBy === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterBy('all')}
              className="text-xs"
            >
              全部 ({requirements.length})
            </Button>
            <Button
              variant={filterBy === 'paid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterBy('paid')}
              className="text-xs"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              付费项目 ({requirements.filter(r => r.willingToPay).length})
            </Button>
            <Button
              variant={filterBy === 'suggestions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterBy('suggestions')}
              className="text-xs"
            >
              接受建议 ({requirements.filter(r => r.allowSuggestions).length})
            </Button>
          </div>
        </div>

        {/* 需求列表 */}
        <div className="space-y-6">
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
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                      <DialogTrigger asChild>
                        <Button className="btn-primary mt-4">
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
            <div className="grid gap-6">
              {filteredRequirements.map((requirement) => (
                <RequirementCard
                  key={requirement.id}
                  requirement={requirement}
                  onUpdate={handleRequirementUpdate}
                />
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