"use client";

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { AlertProps } from '../schemas';

export const AlertRenderer: React.FC<AlertProps> = ({
  title,
  description,
  variant = 'default',
  className,
  ...props
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'destructive':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <Alert className={`${getVariantClasses()} ${className || ''}`} {...props}>
      {getIcon()}
      <AlertDescription>
        {title && <div className="font-medium">{title}</div>}
        {description && <div className={title ? 'mt-1' : ''}>{description}</div>}
      </AlertDescription>
    </Alert>
  );
};
