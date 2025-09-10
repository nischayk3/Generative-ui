"use client";

import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PopoverProps } from '../schemas';
import { Button } from '@/components/ui/button';

export const PopoverRenderer: React.FC<PopoverProps> = ({
  trigger,
  content,
  ...props
}) => {
  return (
    <Popover {...props}>
      <PopoverTrigger asChild>
        {trigger || <Button variant="outline">Open Popover</Button>}
      </PopoverTrigger>
      <PopoverContent>{content}</PopoverContent>
    </Popover>
  );
};
