import { useEffect, useState } from 'react';
import { getBarrageData } from '@/lib/data';

export function Barrage() {
  const [items, setItems] = useState<string[]>([]);
  const [visibleItems, setVisibleItems] = useState<Array<{ text: string; id: number; delay: number }>>([]);

  useEffect(() => {
    const barrageData = getBarrageData();
    setItems(barrageData);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const generateBarrageItem = () => {
      const randomText = items[Math.floor(Math.random() * items.length)];
      const id = Date.now() + Math.random();
      const delay = Math.random() * 10; // 0-10秒的随机延迟
      
      setVisibleItems(prev => [...prev, { text: randomText, id, delay }]);
      
      // 15秒后移除这个项目
      setTimeout(() => {
        setVisibleItems(prev => prev.filter(item => item.id !== id));
      }, 15000 + delay * 1000);
    };

    // 初始生成一些弹幕
    for (let i = 0; i < 3; i++) {
      setTimeout(generateBarrageItem, i * 2000);
    }

    // 持续生成新的弹幕
    const interval = setInterval(generateBarrageItem, 4000);

    return () => clearInterval(interval);
  }, [items]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {visibleItems.map((item) => (
        <div
          key={item.id}
          className="barrage-item absolute whitespace-nowrap"
          style={{
            top: `${Math.random() * 70 + 10}%`,
            animationDelay: `${item.delay}s`,
            fontSize: `${Math.random() * 4 + 14}px`,
          }}
        >
          🤖 {item.text}
        </div>
      ))}
    </div>
  );
}