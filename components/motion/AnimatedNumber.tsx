'use client';

import {animate} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';

interface AnimatedNumberProps {
  value: number;
  formatter: (v: number) => string;
  reducedMotion?: boolean;
  className?: string;
}

export function AnimatedNumber({
  value,
  formatter,
  reducedMotion = false,
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;

    if (reducedMotion || from === value) {
      let cancelled = false;
      void Promise.resolve().then(() => {
        if (!cancelled) setDisplayValue(value);
      });
      return () => {
        cancelled = true;
      };
    }

    const controls = animate(from, value, {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value, reducedMotion]);

  return <span className={className}>{formatter(displayValue)}</span>;
}
