"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DialogProps } from '../schemas';

export const DialogRenderer: React.FC<DialogProps> = ({
  title,
  description,
  content,
  trigger,
  open,
  onOpenChange,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {React.isValidElement(trigger) ? trigger : (
            <Button variant="outline">
              {typeof trigger === 'string' ? trigger : 'Open Dialog'}
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className={className} {...props}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        {content && (
          <div className="py-4">
            {React.isValidElement(content) ? content : (
              <div>{content}</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
