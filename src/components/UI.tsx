import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'neon-blue' | 'neon-purple';
}

export const Card: React.FC<CardProps> = ({ className, variant = 'default', children, ...props }) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 transition-all duration-300',
        variant === 'neon-blue' && 'border-blue-500/30 neon-blue',
        variant === 'neon-purple' && 'border-purple-500/30 neon-purple',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white neon-blue border-none',
    secondary: 'bg-purple-600 hover:bg-purple-500 text-white neon-purple border-none',
    outline: 'bg-transparent border border-white/20 hover:bg-white/10 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3.5 text-lg font-bold',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};
