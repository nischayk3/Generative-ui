"use client";

import React from 'react';
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ResizableProps } from '../schemas';

export const ResizableRenderer: React.FC<ResizableProps> = ({
  direction = 'horizontal',
  children,
  ...props
}) => {
  return (
    <ResizablePanelGroup
      direction={direction}
      className="rounded-lg border"
      {...props}
    >
      {children}
    </ResizablePanelGroup>
  );
};
