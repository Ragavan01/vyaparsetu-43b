'use client';

import {motion} from 'framer-motion';
import type {ReactNode} from 'react';

interface GlassRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  reducedMotion?: boolean;
}

export function GlassReveal({
  children,
  delay = 0,
  className = '',
  reducedMotion = false,
}: GlassRevealProps) {
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{opacity: 0, y: 14, scale: 0.99}}
      whileInView={{opacity: 1, y: 0, scale: 1}}
      viewport={{once: true, amount: 'some', margin: '140px 0px'}}
      transition={{
        duration: 0.38,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
