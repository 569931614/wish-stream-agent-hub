import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Barrage } from '@/components/Barrage';
import { RequirementForm } from '@/components/RequirementForm';
import { Plus, Sparkles, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFormSubmit = () => {
    setIsFormOpen(false);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(rgba(34, 34, 47, 0.85), rgba(34, 34, 47, 0.85)), url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* 弹幕背景 */}
      <Barrage />
      
      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* 标题区域 */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold text-gradient leading-tight">
              AI需求池
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              🚀 汇聚实用AI需求，让AI为你的业务提效增值
            </p>
            <p className="text-lg text-muted-foreground/80">
              分享真实可落地的AI应用需求，找到最适合的解决方案
            </p>
          </div>

          {/* 特色功能展示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <div className="card-gradient p-6 text-center space-y-3 float-animation">
              <Sparkles className="h-8 w-8 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">业务提效</h3>
              <p className="text-sm text-muted-foreground">
                分享真实可落地的AI应用需求
              </p>
            </div>
            <div className="card-gradient p-6 text-center space-y-3 float-animation" style={{ animationDelay: '0.5s' }}>
              <Users className="h-8 w-8 text-accent mx-auto" />
              <h3 className="text-lg font-semibold">社区互动</h3>
              <p className="text-sm text-muted-foreground">
                交流经验，找到最佳解决方案
              </p>
            </div>
            <div className="card-gradient p-6 text-center space-y-3 float-animation" style={{ animationDelay: '1s' }}>
              <Zap className="h-8 w-8 text-primary-glow mx-auto" />
              <h3 className="text-lg font-semibold">需求实现</h3>
              <p className="text-sm text-muted-foreground">
                实用需求获得开发者关注和实现
              </p>
            </div>
          </div>

          {/* 主要操作按钮 */}
          <div className="space-y-6">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary text-2xl py-8 px-12 rounded-2xl pulse-glow text-white">
                  <Plus className="h-8 w-8 mr-3" />
                  提个需求
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
                <RequirementForm onSubmit={handleFormSubmit} />
              </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pool">
                <Button className="btn-secondary text-lg py-4 px-8">
                  <Users className="h-5 w-5 mr-2" />
                  浏览需求池
                </Button>
              </Link>
            </div>
          </div>

          {/* 底部说明 */}
          <div className="mt-16 text-center space-y-2">
            <p className="text-sm text-muted-foreground/60">
              💡 分享实用需求，找到靠谱解决方案
            </p>
            <p className="text-xs text-muted-foreground/40">
              专注业务价值，让AI真正为你所用
            </p>
          </div>
        </div>
      </div>

      {/* 装饰性元素 */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary-glow/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}