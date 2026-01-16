import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useDragControls } from 'framer-motion';
import { PetSprite } from './PetSprite';
import { Utensils, Zap, MessageCircle, Heart, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// 语录库
const QUOTES = [
  "Have you hydrated today?",
  "It works on my machine.",
  "Git push --force?",
  "I need coffee ☕",
  "Checking for bugs...",
  "Pixel perfect!",
  "Don't forget to commit.",
  "Refactoring life...",
  "Zzz... compiling...",
  "Dark mode is better."
];

function App() {
  // 状态：x/y 坐标, 行为模式
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [action, setAction] = useState('idle'); // idle, walk, sleep, happy, eat
  const [direction, setDirection] = useState(1); // 1: right, -1: left
  
  // 属性
  const [hunger, setHunger] = useState(50); // 0-100 (0 is very hungry)
  const [mood, setMood] = useState(80); // 0-100 (100 is very happy)
  const [message, setMessage] = useState('');
  
  const containerRef = useRef(null);
  const controls = useAnimation();
  const dragControls = useDragControls();

  // --- AI 行为核心循环 ---
  useEffect(() => {
    // 每 3-8 秒决定一次新行动
    const loop = setInterval(() => {
      if (action === 'sleep') return; // 睡觉时不动
      if (action === 'eat') return;   // 吃饭时不动

      const rand = Math.random();
      
      // 30% 概率说话
      if (Math.random() > 0.7) speak();

      // 决策树
      if (hunger < 20) {
        speak("I'm hungry!");
        setAction('idle');
      } else if (rand < 0.4) {
        // 40% 概率发呆
        setAction('idle');
      } else if (rand < 0.8) {
        // 40% 概率散步
        walkRandomly();
      } else {
        // 20% 概率睡觉
        setAction('sleep');
        setTimeout(() => setAction('idle'), 5000); // 睡5秒醒来
      }

      // 随时间降低属性
      setHunger(h => Math.max(0, h - 2));
      setMood(m => Math.max(0, m - 1));

    }, 3000 + Math.random() * 5000);

    return () => clearInterval(loop);
  }, [action, hunger]);

  // --- 动作：随机散步 ---
  const walkRandomly = async () => {
    if (!containerRef.current) return;
    setAction('walk');
    
    const bounds = containerRef.current.getBoundingClientRect();
    const moveX = (Math.random() - 0.5) * 200; // 随机移动 -100 到 100
    const moveY = (Math.random() - 0.5) * 100;
    
    // 简单的边界限制
    let newX = position.x + moveX;
    let newY = position.y + moveY;
    
    // 转向判断
    if (moveX < 0) setDirection(-1);
    else setDirection(1);

    // 限制在屏幕内 (大概范围)
    newX = Math.max(50, Math.min(bounds.width - 100, newX));
    newY = Math.max(50, Math.min(bounds.height - 100, newY));

    // 执行动画
    await controls.start({
      x: newX,
      y: newY,
      transition: { duration: 2, ease: "easeInOut" }
    });
    
    setPosition({ x: newX, y: newY });
    setAction('idle');
  };

  // --- 动作：说话 ---
  const speak = (text) => {
    const msg = text || QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  // --- 交互：喂食 ---
  const feed = () => {
    if (hunger >= 90) {
      speak("I'm full!");
      return;
    }
    setAction('eat');
    speak("Yummy!");
    setHunger(Math.min(100, hunger + 30));
    setTimeout(() => setAction('happy'), 2000);
    setTimeout(() => setAction('idle'), 4000);
  };

  // --- 交互：玩耍 ---
  const play = () => {
    setAction('happy');
    setMood(Math.min(100, mood + 20));
    speak("Yay!");
    controls.start({
      y: position.y - 50,
      transition: { duration: 0.3, yoyo: Infinity }
    });
    setTimeout(() => {
      controls.start({ y: position.y }); // 落地
      setAction('idle');
    }, 1500);
  };

  // --- 交互：被拖拽 ---
  const handleDragEnd = (event, info) => {
    const newPos = { 
      x: position.x + info.offset.x, 
      y: position.y + info.offset.y 
    };
    setPosition(newPos);
    setAction('idle');
    speak("Whoa!");
  };

  return (
    <div ref={containerRef} className="h-screen w-full relative overflow-hidden cursor-crosshair">
      
      {/* 顶部 HUD */}
      <div className="absolute top-4 left-4 flex gap-4 bg-white/80 backdrop-blur border-2 border-zinc-800 p-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
        <div className="flex flex-col w-24">
          <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
            <Utensils size={10} /> Hunger
          </span>
          <div className="h-2 bg-zinc-200 mt-1 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full bg-orange-400" style={{ width: `${hunger}%` }} />
          </div>
        </div>
        <div className="flex flex-col w-24">
          <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
            <Heart size={10} /> Mood
          </span>
          <div className="h-2 bg-zinc-200 mt-1 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full bg-pink-400" style={{ width: `${mood}%` }} />
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        <button onClick={feed} className="btn-pixel bg-orange-100 hover:bg-orange-200 text-orange-800">
          <Utensils size={20} /> Feed
        </button>
        <button onClick={play} className="btn-pixel bg-blue-100 hover:bg-blue-200 text-blue-800">
          <Zap size={20} /> Play
        </button>
        <button onClick={() => setAction('sleep')} className="btn-pixel bg-indigo-100 hover:bg-indigo-200 text-indigo-800">
          <MessageCircle size={20} /> Sleep
        </button>
      </div>

      {/* 宠物本体 */}
      <motion.div
        drag
        dragConstraints={containerRef}
        dragMomentum={false}
        dragControls={dragControls}
        onDragStart={() => setAction('happy')} // 被抓起时开心
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={position}
        className="absolute w-16 h-16 z-10 cursor-grab active:cursor-grabbing touch-none"
      >
        {/* 气泡对话框 */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white border-2 border-zinc-800 px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold"
            >
              {message}
              {/* 气泡小三角 */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b-2 border-r-2 border-zinc-800 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 宠物渲染 */}
        <div style={{ transform: `scaleX(${direction})` }} className="transition-transform duration-300">
          <PetSprite action={action} />
        </div>

        {/* 状态图标 (头顶) */}
        {action === 'sleep' && (
          <motion.div 
            animate={{ y: -10, opacity: [0, 1, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-4 right-0 text-blue-500 font-bold"
          >
            Zzz
          </motion.div>
        )}
      </motion.div>

      <div className="absolute bottom-2 right-2 text-[10px] text-zinc-400">
        Pixel Pal v1.0
      </div>
    </div>
  );
}

export default App;