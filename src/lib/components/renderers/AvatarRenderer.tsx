"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarProps } from '../schemas';

export const AvatarRenderer: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'default',
  name,
  description,
  className,
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6';
      case 'lg':
        return 'h-12 w-12';
      case 'xl':
        return 'h-16 w-16';
      default:
        return 'h-10 w-10';
    }
  };

  // If name or description are provided, render in a profile card layout
  if (name || description) {
    return (
      <div className={`flex items-center space-x-3 ${className || ''}`} {...props}>
        <Avatar className={getSizeClasses()}>
          {src && <AvatarImage src={src} alt={alt} />}
          {fallback && <AvatarFallback>{fallback}</AvatarFallback>}
        </Avatar>
        <div className="flex flex-col">
          {name && <span className="font-medium text-sm">{name}</span>}
          {description && <span className="text-xs text-gray-500">{description}</span>}
        </div>
      </div>
    );
  }

  // Default avatar-only rendering
  return (
    <Avatar className={`${getSizeClasses()} ${className || ''}`} {...props}>
      {src && <AvatarImage src={src} alt={alt} />}
      {fallback && <AvatarFallback>{fallback}</AvatarFallback>}
    </Avatar>
  );
};
