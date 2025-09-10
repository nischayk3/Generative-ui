"use client";

import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent } from '@/components/ui/card';

export const AspectRatioRenderer: React.FC<any> = (props) => {
  const { 
    ratio = 16 / 9,
    children,
    content,
    className,
    showCard = false,
    placeholder = 'Content goes here',
    ...aspectRatioProps 
  } = props;

  const renderContent = () => {
    // Priority order: children > content > placeholder
    if (children) {
      return children;
    }
    
    if (content) {
      if (typeof content === 'string') {
        return (
          <div className="flex items-center justify-center h-full bg-muted rounded-md">
            <p className="text-muted-foreground text-sm font-medium">{content}</p>
          </div>
        );
      }
      return content;
    }
    
    // Default placeholder for when no content is provided
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-md border-2 border-dashed border-muted-foreground/25">
        <div className="text-center">
          <p className="text-muted-foreground text-sm font-medium">{placeholder}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Ratio: {ratio}</p>
        </div>
      </div>
    );
  };

  const aspectRatioContainer = (
    <AspectRatio ratio={ratio} className={className} {...aspectRatioProps}>
      {renderContent()}
    </AspectRatio>
  );

  // Optionally wrap in a card for better presentation
  if (showCard) {
    return (
      <Card>
        <CardContent className="p-0">
          {aspectRatioContainer}
        </CardContent>
      </Card>
    );
  }

  return aspectRatioContainer;
};
