import React from 'react';

interface TextProps {
  content: string;
  variant?: 'default' | 'muted' | 'lead' | 'small';
  className?: string;
}

export const TextRenderer: React.FC<TextProps> = ({
  content,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'text-base',
    muted: 'text-muted-foreground',
    lead: 'text-xl font-semibold',
    small: 'text-sm'
  };

  return (
    <p className={`${variantClasses[variant]} ${className}`}>
      {content}
    </p>
  );
};
