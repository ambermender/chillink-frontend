import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const cardVariants = {
  default: 'bg-white border border-secondary-200 shadow-sm',
  glass: 'backdrop-blur-sm bg-white/80 border border-white/20 shadow-lg',
  gradient: 'bg-gradient-to-br from-primary-500 via-accent-500 to-primary-700 text-white',
};

const cardPadding = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ 
  className, 
  variant = 'default', 
  padding = 'md',
  children, 
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        cardVariants[variant],
        cardPadding[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export function CardHeader({ className, title, subtitle, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {title && (
        <h3 className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-secondary-600">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div className={cn('pt-0', className)} {...props} />
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div className={cn('flex items-center pt-0', className)} {...props} />
  );
}