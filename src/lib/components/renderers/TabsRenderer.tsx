"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsProps } from '../schemas';
import { DynamicRenderer } from '../DynamicRenderer';
import { ComponentType } from '../schemas';

// Helper function to render tab content
const renderTabContent = (content: any, tabId: string) => {
  // Check if content is a component object
  if (content && typeof content === 'object' && content.type) {
    return (
      <DynamicRenderer
        component={content as ComponentType}
        onError={(error, componentType) => {
          console.error(`Tab content error for ${componentType}:`, error);
        }}
      />
    );
  }

  // Check if content is an array of components
  if (Array.isArray(content)) {
    return (
      <div className="space-y-4">
        {content.map((item, index) => {
          if (item && typeof item === 'object' && item.type) {
            return (
              <DynamicRenderer
                key={`${tabId}-content-${index}`}
                component={item as ComponentType}
                onError={(error, componentType) => {
                  console.error(`Tab content item error for ${componentType}:`, error);
                }}
              />
            );
          }
          // Handle primitive values
          if (typeof item === 'string' || typeof item === 'number') {
            return <p key={`${tabId}-content-${index}`}>{item}</p>;
          }
          return null;
        })}
      </div>
    );
  }

  // Handle primitive values
  if (typeof content === 'string') {
    return <p>{content}</p>;
  }

  if (typeof content === 'number') {
    return <p>{content}</p>;
  }

  // Handle React elements
  if (React.isValidElement(content)) {
    return content;
  }

  // Fallback for other types
  if (content) {
    return <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>;
  }

  return <p className="text-gray-500 italic">No content available</p>;
};

export const TabsRenderer: React.FC<TabsProps> = ({
  tabs,
  defaultValue,
  orientation = 'horizontal',
  className,
  ...props
}) => {
  // Ensure tabs is an array and has at least one tab
  if (!tabs || !Array.isArray(tabs) || tabs.length === 0) {
    return (
      <div className="p-4 border border-yellow-200 rounded-md bg-yellow-50">
        <p className="text-yellow-800 text-sm">No tabs data available</p>
      </div>
    );
  }

  // Generate IDs for tabs that don't have them
  const tabsWithIds = tabs.map((tab, index) => ({
    ...tab,
    id: tab.id || `tab-${index}`,
    title: tab.title || `Tab ${index + 1}`
  }));

  const firstTabValue = tabsWithIds[0]?.id || 'tab-0';

  return (
    <Tabs
      defaultValue={defaultValue || firstTabValue}
      orientation={orientation}
      className={className}
      {...props}
    >
      <TabsList className={orientation === 'vertical' ? 'flex-col h-auto' : ''}>
        {tabsWithIds.map((tab, index) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
          >
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabsWithIds.map((tab, index) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="mt-4"
        >
          {renderTabContent(tab.content, tab.id)}
        </TabsContent>
      ))}
    </Tabs>
  );
};
