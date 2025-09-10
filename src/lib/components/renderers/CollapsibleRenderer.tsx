"use client";

import React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export const CollapsibleRenderer: React.FC<any> = (props) => {
  const { 
    title, 
    content, 
    defaultOpen = false,
    disabled = false,
    trigger,
    className,
    ...collapsibleProps 
  } = props;

  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const renderTrigger = () => {
    if (trigger) {
      if (typeof trigger === 'string') {
        return (
          <Button variant="outline" className="justify-between w-full">
            {trigger}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        );
      }
      if (React.isValidElement(trigger)) {
        return trigger;
      }
    }

    return (
      <Button variant="outline" className="justify-between w-full">
        {title || 'Toggle'}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
    );
  };

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      disabled={disabled}
      className={className}
      {...collapsibleProps}
    >
      <CollapsibleTrigger asChild>
        {renderTrigger()}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {typeof content === 'string' ? (
          <div className="rounded-md border px-4 py-3 text-sm">
            {content}
          </div>
        ) : (
          content
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
