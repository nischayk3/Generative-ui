"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AccordionProps } from '../schemas';

export const AccordionRenderer: React.FC<AccordionProps> = ({
  items,
  type = 'single',
  collapsible = true,
  className,
  ...props
}) => {
  return (
    <Accordion
      type={type}
      collapsible={collapsible}
      className={className}
      {...props}
    >
      {items.map((item, index) => (
        <AccordionItem key={item.id || index} value={item.id || `item-${index}`}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
