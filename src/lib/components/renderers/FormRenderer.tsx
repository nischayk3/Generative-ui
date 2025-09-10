"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FormProps } from '../schemas';

interface FormFieldType {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export const FormRenderer: React.FC<FormProps> = ({
  title,
  description,
  fields = [],
  submitText = 'Submit',
  onSubmit,
  layout = 'vertical',
  className,
  ...props
}) => {
  // Create dynamic Zod schema from fields
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    // Safety check for undefined fields
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      console.warn('FormRenderer: fields prop is undefined, not an array, or empty:', fields);
      return z.object({
        _placeholder: z.string().optional() // Minimal schema to prevent TypeScript errors
      });
    }

    fields.forEach((field: FormFieldType) => {
      let validator: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          validator = z.string();
          if (field.required) {
            validator = (validator as z.ZodString).min(1, `${field.label} is required`);
          }
          validator = (validator as z.ZodString).email('Please enter a valid email address');
          break;

        case 'number':
          validator = z.coerce.number();
          if (field.required) {
            validator = (validator as z.ZodNumber).min(0, `${field.label} is required`);
          }
          break;

        case 'checkbox':
          validator = z.boolean().default(false);
          break;

        case 'switch':
          validator = z.boolean().default(false);
          break;

        case 'radio':
          validator = z.string();
          if (field.required) {
            validator = (validator as z.ZodString).min(1, `${field.label} is required`);
          }
          break;

        case 'datePicker':
          validator = z.date();
          if (field.required) {
            validator = validator.refine((date) => date !== undefined, `${field.label} is required`);
          }
          break;

        default:
          validator = z.string();
          if (field.required) {
            validator = (validator as z.ZodString).min(1, `${field.label} is required`);
          }
          break;
      }

      if (!field.required && field.type !== 'checkbox' && field.type !== 'switch' && field.type !== 'datePicker') {
        validator = validator.optional();
      } else if (!field.required && field.type === 'datePicker') {
        validator = validator.optional();
      }

      schemaFields[field.name] = validator;
    });

    return z.object(schemaFields);
  };

  const schema = createSchema();
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleSubmit = (data: FormData) => {
    if (onSubmit && typeof onSubmit === 'function') {
      (onSubmit as (data: any) => void)(data);
    }
  };

  const renderField = (field: FormFieldType) => {
    const { key, ...fieldProps } = {
      key: field.name,
      control: form.control,
      name: field.name,
      render: ({ field: formField }: any) => (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            {renderFieldControl(field, formField)}
          </FormControl>
          <FormMessage />
        </FormItem>
      ),
    };

    return <FormField key={key} {...fieldProps} />;
  };

  const renderFieldControl = (field: FormFieldType, formField: any) => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...formField}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'select':
        return (
          <Select onValueChange={formField.onChange} value={formField.value}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formField.value}
              onCheckedChange={formField.onChange}
              required={field.required}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {field.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={formField.value}
            onValueChange={formField.onChange}
          >
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <label htmlFor={option} className="text-sm font-medium leading-none">
                  {option}
                </label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={formField.value}
              onCheckedChange={formField.onChange}
            />
            <label className="text-sm font-medium leading-none">
              {field.label}
            </label>
          </div>
        );

      case 'slider':
        return (
          <Slider
            value={formField.value ? [formField.value] : [0]}
            onValueChange={(value) => formField.onChange(value[0])}
            max={100}
            step={1}
            className="w-full"
          />
        );

      case 'datePicker':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formField.value && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formField.value ? format(formField.value, 'PPP') : (
                  <span>{field.placeholder || 'Pick a date'}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formField.value}
                onSelect={formField.onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return (
          <Input
            {...formField}
            type={field.type}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 'grid':
        // Limit grid to a maximum of 2 columns for better form aesthetics
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      default:
        return 'space-y-4';
    }
  };

  return (
    <Card className={className} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className={getLayoutClasses()}>
            {fields && Array.isArray(fields) && fields.length > 0 ? (
              fields.map(renderField)
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No form fields configured
              </div>
            )}

            <div className="flex justify-end pt-4 md:col-span-2">
              <Button type="submit">
                {submitText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
