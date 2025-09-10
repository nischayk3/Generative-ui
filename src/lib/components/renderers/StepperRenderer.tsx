"use client";

import React from 'react';
import {
  Stepper,
  StepperItem,
  StepperIndicator,
  StepperSeparator,
  StepperContent,
} from '@/components/ui/stepper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Dynamic import to prevent circular dependency
const DynamicRenderer = dynamic(() => 
  import('../DynamicRenderer').then((mod) => ({ default: mod.DynamicRenderer })), 
  { ssr: false }
);

export const StepperRenderer: React.FC<any> = (props) => {
  const { 
    steps = [],
    currentStep = 0,
    onStepChange,
    showContent = true,
    allowSkip = false,
    showNavigation = true,
    className,
    ...stepperProps 
  } = props;

  const [activeStep, setActiveStep] = React.useState(currentStep);

  const handleStepChange = (newStep: number) => {
    if (newStep < 0 || newStep >= steps.length) return;
    if (!allowSkip && newStep > activeStep + 1) return;
    
    setActiveStep(newStep);
    if (onStepChange && typeof onStepChange === 'function') {
      onStepChange(newStep);
    }
  };

  const handleNext = () => {
    handleStepChange(activeStep + 1);
  };

  const handlePrevious = () => {
    handleStepChange(activeStep - 1);
  };

  if (steps.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No steps configured
        </CardContent>
      </Card>
    );
  }

  const currentStepData = steps[activeStep];

  return (
    <div className={`space-y-6 ${className || ''}`} {...stepperProps}>
      <Stepper>
        {steps.map((step: any, index: number) => (
          <React.Fragment key={index}>
            <StepperItem isLast={index === steps.length - 1}>
              <StepperIndicator
                step={index + 1}
                isActive={index === activeStep}
                isCompleted={index < activeStep}
              />
              <div className="ml-3 min-w-0 flex-1">
                <div className={`text-sm font-medium ${
                  index === activeStep 
                    ? 'text-primary' 
                    : index < activeStep 
                    ? 'text-foreground' 
                    : 'text-muted-foreground'
                }`}>
                  {step.title || `Step ${index + 1}`}
                </div>
                {step.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </StepperItem>
            {index < steps.length - 1 && (
              <StepperSeparator isCompleted={index < activeStep} />
            )}
          </React.Fragment>
        ))}
      </Stepper>

      {showContent && currentStepData && (
        <Card>
          <CardContent className="p-6">
            {currentStepData.title && (
              <h3 className="text-lg font-semibold mb-4">{currentStepData.title}</h3>
            )}
            {currentStepData.description && (
              <p className="text-muted-foreground mb-4">{currentStepData.description}</p>
            )}
            <div className="space-y-4">
              {currentStepData.content ? (
                typeof currentStepData.content === 'string' ? (
                  <div className="text-sm">{currentStepData.content}</div>
                ) : typeof currentStepData.content === 'object' && currentStepData.content.type ? (
                  <DynamicRenderer component={currentStepData.content} />
                ) : (
                  <div className="text-sm">
                    {JSON.stringify(currentStepData.content, null, 2)}
                  </div>
                )
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Step {activeStep + 1} content goes here
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showNavigation && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={activeStep === 0}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground flex items-center">
            Step {activeStep + 1} of {steps.length}
          </div>
          <Button
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
          >
            {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
};
