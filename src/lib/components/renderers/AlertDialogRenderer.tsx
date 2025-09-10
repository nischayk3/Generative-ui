"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export const AlertDialogRenderer: React.FC<any> = (props) => {
  const { 
    trigger, 
    title, 
    description, 
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'default',
    className,
    open,
    onOpenChange,
    ...alertDialogProps 
  } = props;

  const [isOpen, setIsOpen] = React.useState(open || false);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (onOpenChange && typeof onOpenChange === 'function') {
      onOpenChange(newOpen);
    }
  };

  const handleConfirm = () => {
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm();
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (onCancel && typeof onCancel === 'function') {
      onCancel();
    }
    setIsOpen(false);
  };

  const renderTrigger = () => {
    if (typeof trigger === 'string') {
      return <Button variant="outline">{trigger}</Button>;
    }
    if (trigger && typeof trigger === 'object' && trigger.text) {
      return (
        <Button variant={trigger.variant || "outline"}>
          {trigger.text}
        </Button>
      );
    }
    if (React.isValidElement(trigger)) {
      return trigger;
    }
    return <Button variant="outline">Open Dialog</Button>;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange} {...alertDialogProps}>
      <AlertDialogTrigger asChild>
        {renderTrigger()}
      </AlertDialogTrigger>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
