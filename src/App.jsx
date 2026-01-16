import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { PetSprite } from './PetSprite';
import { Utensils, Zap, MessageCircle, Heart, Palette, Timer, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const QUOTES = [
  "Have you hydrated today?", "It works on my machine.", "Git push --force?",
  "I need coffee ☕", "Checking for bugs...", "Pixel perfect!",
  "Don't forget to commit.", "Refactoring life...", "Dark mode is better."
];

// 🎨 皮肤列表
const SKINS = [
  { name: 'Void', color: '#333' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Ghost', color: '#cbd5e1' },
  { name: 'Pinky', color: '#f472b6' },
  { name: 'Blue', color: '#3b82f6' }
];

function App() {
  const [position, setPosition] = useState({ x: 200, y: 300 });
  const [action, setAction] = useState('idle');
  const [direction, setDirection] = useState(1);
  const [hunger, setHunger] = useState(50);
  const [mood, setMood] = useState(80);
  const [message, setMessage] = useState('');
  
  // ✨ 新增状态：皮肤索引 & 专注模式
  const [skinIndex, setSkinIndex] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟
  
  const containerRef = useRef(null);
  const controls = useAnimation();

  // --- 专注模式倒计时 ---
  useEffect(() => {
    let timer;
    if (isFocusMode && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      setAction('focus'); // 强制设为专注状态
    } else if (timeLeft === 0 && isFocusMode) {
      // 时间到！
      setIsFocusMode(false);
      speak("Great job! Take a break! 🎉");
      setAction('happy');
      play(); // 庆祝一下
    }
    return () => clearInterval(timer);
  }, [isFocusMode, timeLeft]);

  // --- AI 行为循环 (非专注模式下才运行) ---
  useEffect(() => {
    if (isFocusMode) return; // 专注时停止 AI 乱跑

    const loop = setInterval(() => {
      if (action === 'sleep' || action === 'eat') return;

      const rand = Math.random();
      if (Math.random() > 0.7) speak();

      if (hunger < 20) {
        speak("I'm hungry!");
        setAction('idle');
      } else if (rand < 0.4) {
        setAction('idle');
      } else if (rand < 0.8) {
        walkRandomly();
      } else {
        setAction('sleep');
        setTimeout(() => setAction('idle'), 5000);
      }
      setHunger(h => Math.max(0, h - 2));
      setMood(m => Math.max(0, m - 1));
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(loop);
  }, [action, hunger, isFocusMode]); // 依赖项加上 isFocusMode

  // --- 辅助函数 ---
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const walkRandomly = async () => {
    if (!containerRef.current) return;
    setAction('walk');
    const bounds = containerRef.current.getBoundingClientRect();
    const moveX = (Math.random() - 0.5) * 200;
    const moveY = (Math.random() - 0.5) * 100;
    let newX = Math.max(50, Math.min(bounds.width - 100, position.x + moveX));
    let newY = Math.max(50, Math.min(bounds.height - 100, position.y + moveY));
    
    setDirection(moveX < 0 ? -1 : 1);
    await controls.start({ x: newX, y: newY, transition: { duration: 2, ease: "easeInOut" } });
    setPosition({ x: newX, y: newY });
    setAction('idle');
  };

  const speak = (text) => {
    const msg = text || QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const feed = () => {
    if (hunger >= 90) { speak("I'm full!"); return; }
    setAction('eat'); speak("Yummy!");
    setHunger(Math.min(100, hunger + 30));
    setTimeout(() => setAction('happy'), 2000);
    setTimeout(() => setAction('idle'), 4000);
  };

  const play = () => {
    setAction('happy'); setMood(Math.min(100, mood + 20)); speak("Yay!");
    controls.start({ y: position.y - 50, transition: { duration: 0.3, yoyo: Infinity } });
    setTimeout(() => { controls.start({ y: position.y }); setAction('idle'); }, 1500);
  };

  const cycleSkin = () => {
    setSkinIndex((prev) => (prev + 1) % SKINS.length);
    speak(`I'm ${SKINS[(skinIndex + 1) % SKINS.length].name}!`);
    setAction('happy');
    setTimeout(() => setAction('idle'), 1000);
  };

  const toggleFocus = () => {
    if (isFocusMode) {
      // 停止专注
      setIsFocusMode(false);
      setAction('idle');
      speak("Break time?");
    } else {
      // 开始专注
      setIsFocusMode(true);
      setTimeLeft(25 * 60); // 重置为 25 分钟
      setAction('focus');
      speak("Let's focus! 🤓");
    }
  };

  const handleDragEnd = (event, info) => {
    if (isFocusMode) return; // 专注时不许拖拽
    const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y };
    setPosition(newPos); setAction('idle'); speak("Whoa!");
  };

  return (
    <div ref={containerRef} className={cn(
      "h-screen w-full relative overflow-hidden cursor-crosshair transition-colors duration-1000",
      isFocusMode ? "bg-zinc-900" : "" // 专注模式变暗
    )}>
      
      {/* 顶部 HUD (专注模式时简化显示) */}
      <div className={cn(
        "absolute top-4 left-4 flex gap-4 backdrop-blur border-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 transition-all p-2",
        isFocusMode ? "bg-zinc-800/80 border-zinc-600 text-white" : "bg-white/80 border-zinc-800"
      )}>
        {!isFocusMode ? (
          <>
            <div className="flex flex-col w-24">
              <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1"><Utensils size={10} /> Hunger</span>
              <div className="h-2 bg-zinc-200 mt-1 rounded-full overflow-hidden border border-zinc-800">
                <div className="h-full bg-orange-400" style={{ width: `${hunger}%` }} />
              </div>
            </div>
            <div className="flex flex-col w-24">
              <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1"><Heart size={10} /> Mood</span>
              <div className="h-2 bg-zinc-200 mt-1 rounded-full overflow-hidden border border-zinc-800">
                <div className="h-full bg-pink-400" style={{ width: `${mood}%` }} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 px-2">
             <Timer className="animate-pulse text-indigo-400" size={20} />
             <span className="font-mono text-xl font-bold tracking-widest">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* 底部控制栏 (专注模式时只显示停止按钮) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        {!isFocusMode ? (
          <>
            <button onClick={feed} className="btn-pixel text-orange-800 bg-orange-50 hover:bg-orange-100"><Utensils size={20} /> Feed</button>
            <button onClick={play} className="btn-pixel text-blue-800 bg-blue-50 hover:bg-blue-100"><Zap size={20} /> Play</button>
            <button onClick={cycleSkin} className="btn-pixel text-purple-800 bg-purple-50 hover:bg-purple-100"><Palette size={20} /> Skin</button>
            <button onClick={toggleFocus} className="btn-pixel text-white bg-zinc-800 hover:bg-zinc-700 hover:scale-105"><Timer size={20} /> Focus</button>
          </>
        ) : (
          <button onClick={toggleFocus} className="btn-pixel text-red-100 bg-red-600 hover:bg-red-500 border-red-900">
            <X size={20} /> Stop Focus
          </button>
        )}
      </div>

      {/* 宠物本体 */}
      <motion.div
        drag={!isFocusMode} // 专注时禁止拖拽
        dragConstraints={containerRef}
        dragMomentum={false}
        onDragStart={() => !isFocusMode && setAction('happy')}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={position}
        className={cn(
          "absolute w-16 h-16 z-20 touch-none flex items-center justify-center",
          !isFocusMode ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        )}
      >
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white border-2 border-zinc-800 px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold z-30"
            >
              {message}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b-2 border-r-2 border-zinc-800 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 宠物渲染：传入当前皮肤颜色 */}
        <div style={{ transform: `scaleX(${direction}) scale(1.5)` }} className="transition-transform duration-300">
          <PetSprite action={action} color={SKINS[skinIndex].color} />
        </div>

        {action === 'sleep' && (
          <motion.div 
            animate={{ y: -20, x: 20, opacity: [0, 1, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 right-0 text-blue-600 font-bold text-lg"
          >
            Zzz
          </motion.div>
        )}
      </motion.div>

      <div className={cn("absolute bottom-2 right-2 text-[10px] transition-colors", isFocusMode ? "text-zinc-600" : "text-zinc-400")}>
        Pixel Pal v2.0
      </div>
    </div>
  );
}

export default App;