"use client";

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuProps } from '../schemas';
import { Button } from '@/components/ui/button';

export const DropdownMenuRenderer: React.FC<any> = (props) => {
  const { trigger, items = [], ...dropdownProps } = props;
  
  // Handle trigger - if it's an object, convert to button
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
    return <Button variant="outline">Open Menu</Button>;
  };

  return (
    <DropdownMenu {...dropdownProps}>
      <DropdownMenuTrigger asChild>
        {renderTrigger()}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((item: any, index: number) => (
          <React.Fragment key={index}>
            {item.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem 
              onClick={() => item.onClick && typeof item.onClick === 'function' && item.onClick()} 
              disabled={item.disabled}
            >
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
