"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const Stepper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between w-full", className)}
    {...props}
  />
));
Stepper.displayName = "Stepper";

const StepperItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isActive?: boolean;
    isCompleted?: boolean;
    isLast?: boolean;
  }
>(({ className, isActive, isCompleted, isLast, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center",
      !isLast && "flex-1",
      className
    )}
    {...props}
  />
));
StepperItem.displayName = "StepperItem";

const StepperIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isActive?: boolean;
    isCompleted?: boolean;
    step?: number;
  }
>(({ className, isActive, isCompleted, step, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
      isCompleted
        ? "bg-primary text-primary-foreground"
        : isActive
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-muted-foreground",
      className
    )}
    {...props}
  >
    {isCompleted ? <Check className="h-4 w-4" /> : step}
  </div>
));
StepperIndicator.displayName = "StepperIndicator";

const StepperSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isCompleted?: boolean;
  }
>(({ className, isCompleted, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 h-0.5 mx-4 transition-colors",
      isCompleted ? "bg-primary" : "bg-muted",
      className
    )}
    {...props}
  />
));
StepperSeparator.displayName = "StepperSeparator";

const StepperContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
StepperContent.displayName = "StepperContent";

export {
  Stepper,
  StepperItem,
  StepperIndicator,
  StepperSeparator,
  StepperContent,
};
