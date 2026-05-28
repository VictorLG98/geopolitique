'use client';

import { motion, useReducedMotion } from 'motion/react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'left' | 'none';
}

export default function RevealOnScroll({
  children,
  delay = 0,
  className,
  direction = 'up',
}: RevealOnScrollProps) {
  const reduce = useReducedMotion();

  const initial =
    reduce || direction === 'none'
      ? false
      : direction === 'left'
        ? { opacity: 0, x: -20 }
        : { opacity: 0, y: 28 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
