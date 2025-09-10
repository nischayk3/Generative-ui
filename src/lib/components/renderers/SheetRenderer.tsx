"use client";

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export const SheetRenderer: React.FC<any> = (props) => {
  const { 
    trigger, 
    title, 
    description, 
    content, 
    side = 'right',
    className,
    open,
    onOpenChange,
    ...sheetProps 
  } = props;

  const [isOpen, setIsOpen] = React.useState(open || false);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (onOpenChange && typeof onOpenChange === 'function') {
      onOpenChange(newOpen);
    }
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
    return <Button variant="outline">Open Panel</Button>;
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange} {...sheetProps}>
      <SheetTrigger asChild>
        {renderTrigger()}
      </SheetTrigger>
      <SheetContent side={side} className={className}>
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        <div className="mt-6">
          {typeof content === 'string' ? (
            <div className="prose prose-sm max-w-none">
              <p>{content}</p>
            </div>
          ) : (
            content
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
