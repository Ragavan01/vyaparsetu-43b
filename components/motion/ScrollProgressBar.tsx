'use client';

import {motion, useScroll, useSpring} from 'framer-motion';

interface ScrollProgressBarProps {
  reducedMotion: boolean;
}

export function ScrollProgressBar({reducedMotion}: ScrollProgressBarProps) {
  const {scrollYProgress} = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="h-[2px] w-full overflow-hidden bg-white/[0.06]"
    >
      <motion.div
        style={{scaleX, transformOrigin: '0% 50%'}}
        className="h-full w-full bg-gradient-to-r from-[#6366F1] via-[#10B981] to-[#F59E0B]"
      />
    </div>
  );
}
