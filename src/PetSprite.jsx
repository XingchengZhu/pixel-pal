import { motion } from 'framer-motion';

export const PetSprite = ({ action }) => {
  // 简单的像素猫 SVG
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      {/* 身体 */}
      <motion.rect 
        x="12" y="24" width="40" height="32" rx="4" fill="#333"
        animate={{ 
          scaleY: action === 'walk' ? [1, 0.95, 1] : 1,
          y: action === 'sleep' ? 30 : 24
        }}
        transition={{ repeat: Infinity, duration: 0.5 }}
      />
      
      {/* 耳朵 */}
      <path d="M12 24L4 12H20L12 24Z" fill="#333" />
      <path d="M52 24L60 12H44L52 24Z" fill="#333" />

      {/* 眼睛 (根据状态变化) */}
      {action === 'sleep' ? (
        // 睡觉眼: - -
        <g fill="#fff">
          <rect x="20" y="36" width="8" height="2" />
          <rect x="36" y="36" width="8" height="2" />
        </g>
      ) : action === 'happy' ? (
        // 开心眼: ^ ^
        <g stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M20 38L24 34L28 38" />
          <path d="M36 38L40 34L44 38" />
        </g>
      ) : (
        // 普通眼: O O (带眨眼动画)
        <g fill="#fff">
          <motion.rect 
            x="20" y="32" width="8" height="8" rx="2" 
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ repeat: Infinity, delay: 3, duration: 0.2, repeatDelay: 4 }}
          />
          <motion.rect 
            x="36" y="32" width="8" height="8" rx="2"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ repeat: Infinity, delay: 3, duration: 0.2, repeatDelay: 4 }}
          />
        </g>
      )}

      {/* 嘴巴 */}
      <path d="M30 46H34V48H30V46Z" fill="#ffaaa5" />
      
      {/* 腮红 */}
      <rect x="14" y="42" width="4" height="2" fill="#ffaaa5" opacity="0.6" />
      <rect x="46" y="42" width="4" height="2" fill="#ffaaa5" opacity="0.6" />

      {/* 尾巴 (摇摆动画) */}
      <motion.rect 
        x="48" y="44" width="12" height="4" rx="2" fill="#333"
        style={{ originX: 0 }}
        animate={{ rotate: action === 'happy' ? [0, 20, -20, 0] : [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
      />
    </svg>
  );
};