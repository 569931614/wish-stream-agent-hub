import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Barrage } from '@/components/Barrage';
import { RequirementForm } from '@/components/RequirementForm';
import { Plus, Sparkles, Zap, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFormSubmit = () => {
    setIsFormOpen(false);
  };

  const handleFormCancel = () => {
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* 标题区域 */}
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            {/* Logo */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <img
                src="/laolinai-logo.jpg"
                alt="老林AI Logo"
                className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-32 lg:w-32 rounded-full object-cover shadow-lg ring-4 ring-primary/20 hover:ring-primary/40 transition-all duration-300"
              />
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-gradient leading-tight">
              需求池
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed px-2">
              🚀 汇聚实用AI需求，让AI为你的业务提效增值
            </p>
            <p className="text-base sm:text-lg text-muted-foreground/80 px-2">
              分享真实可落地的AI应用需求，找到最适合的解决方案
            </p>
          </div>

          {/* 主要操作按钮 */}
          <div className="space-y-3 sm:space-y-4 px-4 sm:px-2 flex flex-col items-center">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary text-lg sm:text-xl py-4 px-8 sm:py-4 sm:px-10 lg:py-5 lg:px-12 rounded-xl pulse-glow text-white w-full sm:w-auto sm:min-w-[280px] sm:max-w-[360px] lg:max-w-[400px] shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  提个需求
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border mx-2 sm:mx-auto">
                <RequirementForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
              </DialogContent>
            </Dialog>

            <div className="flex justify-center">
              <Link to="/pool" className="w-full sm:w-auto">
                <Button className="btn-secondary text-base py-3 px-6 sm:py-3 sm:px-8 lg:py-3.5 lg:px-10 w-full sm:w-auto sm:min-w-[200px] sm:max-w-[260px] lg:max-w-[280px] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-border/50">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  看看别人的需求
                </Button>
              </Link>
            </div>
          </div>
          {/* 特色功能展示 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 my-8 sm:my-12 px-4 sm:px-2">
            <div className="card-gradient p-3 sm:p-4 lg:p-6 text-center space-y-2 sm:space-y-3 float-animation">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary mx-auto" />
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold">业务提效</h3>
              <p className="text-xs sm:text-xs lg:text-sm text-muted-foreground">
                分享真实可落地的AI应用需求
              </p>
            </div>

            <div className="card-gradient p-3 sm:p-4 lg:p-6 text-center space-y-2 sm:space-y-3 float-animation" style={{ animationDelay: '0.5s' }}>
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary-glow mx-auto" />
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold">需求实现</h3>
              <p className="text-xs sm:text-xs lg:text-sm text-muted-foreground">
                实用需求获得开发者关注和实现
              </p>
            </div>

            <div className="card-gradient p-3 sm:p-4 lg:p-6 text-center space-y-2 sm:space-y-3 float-animation" style={{ animationDelay: '1s' }}>
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-accent mx-auto" />
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold">定制需求</h3>
              <p className="text-xs sm:text-xs lg:text-sm text-muted-foreground">
                个性化AI解决方案，满足特定业务场景
              </p>
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