"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AccordionProps } from '../schemas';

export const AccordionRenderer: React.FC<AccordionProps> = ({
  sections, // Changed from items to sections
  accordionType = 'single',
  collapsible = true,
  className,
  ...props
}) => {
  // Remove the conflicting 'type' prop from BaseComponentSchema
  const { type: _, ...accordionProps } = props;

  return (
    <Accordion
      type={accordionType}
      collapsible={collapsible}
      className={className}
      {...accordionProps}
    >
      {sections.map((item:any, index:number) => ( // Changed from items.map to sections.map
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
