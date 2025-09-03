"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartTool } from "./ChartTool";
import { TableTool } from "./TableTool";
import { FormTool } from "./FormTool";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  UserIcon,
  BuildingIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon
} from "lucide-react";
import Image from "next/image";
import { determineLayout, arrangeComponents, getResponsiveClasses, generateLayoutClasses } from "@/src/lib/layoutUtils";

interface CardAction {
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  action: string;
}

interface CardBadge {
  text: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

interface CardField {
  name: string;
  label: string;
  value: string | number;
  icon?: string;
}

type CardComponent = CardSection | CardTabs | { type: string; [key: string]: unknown };

interface CardSection {
  type: "section";
  title: string;
  fields?: CardField[];
  components?: CardComponent[];
  variant?: "default" | "info" | "success" | "warning";
}

interface CardTabs {
  type: "tabs";
  tabs: Array<{
    title: string;
    content: CardComponent[];
  }>;
}

interface CardToolProps {
  title: string;
  description?: string;
  content?: string;
  components?: Array<CardSection | CardTabs | any>;
  actions?: CardAction[];
  badges?: CardBadge[];
  imageUrl?: string;
  variant?: "default" | "elevated" | "outlined" | "filled";
}

// Icon mapping for common field types
const getFieldIcon = (fieldName: string, value: string | number) => {
  const lowerName = fieldName.toLowerCase();
  const lowerValue = String(value).toLowerCase();
  
  if (lowerName.includes('date') || lowerName.includes('time')) return <CalendarIcon className="h-4 w-4" />;
  if (lowerName.includes('user') || lowerName.includes('name')) return <UserIcon className="h-4 w-4" />;
  if (lowerName.includes('company') || lowerName.includes('department')) return <BuildingIcon className="h-4 w-4" />;
  if (lowerName.includes('status')) {
    if (lowerValue.includes('complete') || lowerValue.includes('done')) return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
    if (lowerValue.includes('pending') || lowerValue.includes('waiting')) return <ClockIcon className="h-4 w-4 text-yellow-600" />;
    if (lowerValue.includes('error') || lowerValue.includes('failed')) return <AlertCircleIcon className="h-4 w-4 text-red-600" />;
    return <InfoIcon className="h-4 w-4" />;
  }
  return null;
};

// Get section styling based on variant
const getSectionStyle = (variant: string = "default") => {
  switch (variant) {
    case "info":
      return "border-blue-200 bg-blue-50";
    case "success":
      return "border-green-200 bg-green-50";
    case "warning":
      return "border-yellow-200 bg-yellow-50";
    default:
      return "border-gray-200 bg-gray-50";
  }
};

// Recursive component renderer
const renderNestedComponent = (component: any, key: string) => {
  if (!component || typeof component !== 'object') return null;

  switch (component.type) {
    case 'section':
      return (
        <div key={key} className={`space-y-4 p-4 border rounded-lg ${getSectionStyle(component.variant)}`}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-black text-lg">{component.title}</h3>
            {component.variant && component.variant !== 'default' && (
              <Badge variant={component.variant === 'success' ? 'default' : 'secondary'}>
                {component.variant}
              </Badge>
            )}
          </div>
          
          {component.fields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {component.fields.map((field: CardField, fieldIndex: number) => (
                <div key={fieldIndex} className="flex items-center gap-3 p-3 bg-white rounded-md border">
                  {getFieldIcon(field.name, field.value)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700">{field.label}</div>
                    <div className="text-sm text-black truncate">{field.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {component.components && (
            <div className="space-y-4 mt-4">
              {component.components.map((subComponent: any, subIndex: number) => 
                renderNestedComponent(subComponent, `${key}-${subIndex}`)
              )}
            </div>
          )}
        </div>
      );

    case 'tabs':
      return (
        <div key={key} className="w-full">
          <Tabs defaultValue={component.tabs[0]?.title || "tab1"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4">
              {component.tabs.map((tab: any, tabIndex: number) => (
                <TabsTrigger key={tabIndex} value={tab.title} className="text-sm">
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {component.tabs.map((tab: any, tabIndex: number) => (
              <TabsContent key={tabIndex} value={tab.title} className="mt-4">
                <div className="space-y-4">
                  {tab.content.map((contentItem: any, contentIndex: number) => 
                    renderNestedComponent(contentItem, `${key}-tab-${tabIndex}-${contentIndex}`)
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      );

    case 'form':
      return <FormTool key={key} {...component} />;

    case 'table':
      return <TableTool key={key} {...component} />;

    case 'chart':
      return <ChartTool key={key} {...component} />;

    case 'avatar':
      return (
        <div key={key} className="flex items-center space-x-4 p-4">
          <Avatar className={component.size === 'large' ? 'h-16 w-16' : component.size === 'small' ? 'h-8 w-8' : 'h-12 w-12'}>
            <AvatarImage src={component.src} alt={component.alt || 'Avatar'} />
            <AvatarFallback>{component.fallback || 'U'}</AvatarFallback>
          </Avatar>
          {component.name && (
            <div>
              <h4 className="font-semibold text-black">{component.name}</h4>
              {component.description && (
                <p className="text-sm text-gray-600">{component.description}</p>
              )}
            </div>
          )}
        </div>
      );

    default:
      // If it's a plain object with data, try to render it as a simple section
      if (component.title && (component.fields || component.data)) {
        return (
          <div key={key} className="space-y-3 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold text-black text-lg">{component.title}</h3>
            {component.fields && (
              <div className="space-y-2">
                {component.fields.map((field: any, fieldIndex: number) => (
                  <div key={fieldIndex} className="flex justify-between">
                    <span className="font-medium text-gray-700">{field.label}:</span>
                    <span className="text-black">{field.value}</span>
                  </div>
                ))}
              </div>
            )}
            {component.data && (
              <div className="text-sm text-gray-600">
                <pre className="whitespace-pre-wrap">{JSON.stringify(component.data, null, 2)}</pre>
              </div>
            )}
          </div>
        );
      }
      return null;
  }
};

// Intelligent layout renderer for multiple components
const renderComponentsWithLayout = (components: any[]) => {
  if (!components || components.length === 0) return null;

  // Extract component types for layout determination
  const componentTypes = components.map(comp => comp.type || 'unknown');
  const componentLayouts = arrangeComponents(componentTypes);
  const layoutConfig = determineLayout(componentLayouts);

  // Apply intelligent layout
  const layoutClasses = generateLayoutClasses(layoutConfig);

  return (
    <div className={layoutClasses}>
      {components.map((component, index) => {
        const responsiveClasses = getResponsiveClasses(layoutConfig, component.type || 'unknown');
        return (
          <div key={`component-${index}`} className={responsiveClasses}>
            {renderNestedComponent(component, `layout-${index}`)}
          </div>
        );
      })}
    </div>
  );
};

export const CardTool = ({ 
  title, 
  description, 
  content, 
  components,
  actions, 
  badges, 
  imageUrl,
  variant = "default"
}: CardToolProps) => {
  const handleAction = (actionId: string, label: string) => {
    console.log(`Action triggered: ${actionId}`);
    alert(`Action "${label}" was triggered!\n\nAction ID: ${actionId}`);
  };

  const getCardStyle = () => {
    switch (variant) {
      case "elevated":
        return "shadow-lg border-0";
      case "outlined":
        return "border-2 border-gray-200 shadow-none";
      case "filled":
        return "bg-gray-50 border-gray-200";
      default:
        return "shadow-md";
    }
  };

  return (
    <Card className={`w-full max-w-none my-4 ${getCardStyle()}`} style={{ minWidth: '100%', width: '100%' }}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-black text-xl">{title}</CardTitle>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || "default"}>
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 w-full" style={{ minWidth: '100%', width: '100%' }}>
        {imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '' ? (
          <div className="relative w-full h-48 rounded-md overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt={title}
              width={400}
              height={192}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        ) : null}
        
        {content && (
          <div className="text-black whitespace-pre-wrap leading-relaxed w-full">
            {content}
          </div>
        )}
        
        {/* Render nested components with intelligent layout */}
        {components && Array.isArray(components) && components.length > 0 && (
          <div className="w-full" style={{ minWidth: '100%', width: '100%' }}>
            {renderComponentsWithLayout(components)}
          </div>
        )}
        
        {actions && actions.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-3 pt-2 w-full">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={() => handleAction(action.action, action.label)}
                size="sm"
                  className="min-w-[120px]"
              >
                {action.label}
              </Button>
            ))}
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
