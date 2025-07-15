import { useEffect, useState, useCallback, useRef } from 'react';
import { getBarrageData } from '@/lib/data';

interface BarrageItem {
  text: string;
  id: number;
  top: number;
  fontSize: number;
  speed: number;
  startTime: number;
}

export function Barrage() {
  const [items, setItems] = useState<string[]>([]);
  const [visibleItems, setVisibleItems] = useState<BarrageItem[]>([]);
  const animationFrameRef = useRef<number>();
  const lastGenerateTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadBarrageData = async () => {
      try {
        const barrageData = await getBarrageData();
        setItems(barrageData);
      } catch (error) {
        console.error('Failed to load barrage data:', error);
      }
    };

    loadBarrageData();
  }, []);

  const generateBarrageItem = useCallback(() => {
    if (items.length === 0) return;

    const randomText = items[Math.floor(Math.random() * items.length)];
    const id = Date.now() + Math.random();
    const top = Math.random() * 60 + 15; // 15% - 75% 的位置，避免太靠边
    const fontSize = Math.random() * 3 + 14; // 14px - 17px，范围稍小
    const speed = Math.random() * 15 + 25; // 25-40 秒完成动画，更快一些
    const startTime = Date.now();

    const newItem: BarrageItem = {
      text: randomText,
      id,
      top,
      fontSize,
      speed,
      startTime
    };

    setVisibleItems(prev => [...prev, newItem]);
  }, [items]);

  const updateBarrageItems = useCallback(() => {
    const currentTime = Date.now();

    // 生成新弹幕 (每4-7秒生成一个，避免过于频繁)
    if (currentTime - lastGenerateTimeRef.current > (4000 + Math.random() * 3000)) {
      generateBarrageItem();
      lastGenerateTimeRef.current = currentTime;
    }

    // 清理已完成的弹幕项目 (给一点缓冲时间确保动画完成)
    setVisibleItems(prev =>
      prev.filter(item => {
        const elapsed = (currentTime - item.startTime) / 1000;
        return elapsed < (item.speed + 1); // 多给1秒缓冲
      })
    );

    // 限制最大弹幕数量，避免性能问题
    setVisibleItems(prev => prev.slice(-8)); // 最多保留8个弹幕

    animationFrameRef.current = requestAnimationFrame(updateBarrageItems);
  }, [generateBarrageItem]);

  useEffect(() => {
    if (items.length === 0) return;

    // 初始生成几个弹幕
    setTimeout(() => generateBarrageItem(), 1000);
    setTimeout(() => generateBarrageItem(), 3000);
    setTimeout(() => generateBarrageItem(), 5000);

    // 开始动画循环
    lastGenerateTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(updateBarrageItems);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [items, generateBarrageItem, updateBarrageItems]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {visibleItems.map((item) => (
        <div
          key={item.id}
          className="barrage-item-smooth absolute whitespace-nowrap"
          style={{
            top: `${item.top}%`,
            fontSize: `${item.fontSize}px`,
            '--animation-duration': `${item.speed}s`,
            '--start-time': `${item.startTime}`,
          } as React.CSSProperties}
        >
          🤖 {item.text}
        </div>
      ))}
    </div>
  );
}