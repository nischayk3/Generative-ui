"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AccordionProps } from '../schemas';

export const AccordionRenderer: React.FC<AccordionProps> = ({
  sections = [],
  accordionType = 'single',
  collapsible = true,
  className,
  ...props
}) => {
  // Remove the conflicting 'type' prop from BaseComponentSchema and any other conflicting props
  const { type: _, id: __, ...cleanProps } = props;

  // Ensure we have valid sections
  if (!sections || sections.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No accordion sections to display
      </div>
    );
  }

  return (
    <Accordion
      type={accordionType as "single" | "multiple"}
      collapsible={collapsible}
      className={className}
      {...cleanProps}
    >
      {sections.map((section, index) => {
        const sectionId = section.id || `section-${index}`;
        return (
          <AccordionItem key={sectionId} value={sectionId}>
            <AccordionTrigger className="text-left">
              {section.title}
            </AccordionTrigger>
            <AccordionContent>
              <div className="prose prose-sm max-w-none">
                {typeof section.content === 'string' ? (
                  <p>{section.content}</p>
                ) : (
                  <div>{section.content as React.ReactNode}</div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
