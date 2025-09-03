"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField as FormFieldType } from "@/src/types/components";

interface FormToolProps {
  title?: string;
  description?: string;
  fields: FormFieldType[];
  submitText?: string;
}

export const FormTool = ({ title, description, fields, submitText = "Submit" }: FormToolProps) => {
  // Dynamically create Zod schema based on form fields
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    fields.forEach((field: FormFieldType) => {
      let validator: z.ZodTypeAny;
      
      switch (field.type) {
        case "email":
          validator = z.string();
          if (field.required) {
            validator = (validator as z.ZodString).min(1, `${field.label} is required`);
          }
          validator = (validator as z.ZodString).email("Please enter a valid email address");
          break;
          
        case "number":
          validator = z.coerce.number();
          if (field.required) {
            validator = (validator as z.ZodNumber).min(0, `${field.label} is required`);
          }
          break;
          
        case "checkbox":
          validator = z.boolean().default(false);
          break;

        case "switch":
          validator = z.boolean().default(false);
          break;

        case "radio":
          validator = z.string();
          if (field.required) {
            validator = (validator as z.ZodString).min(1, `${field.label} is required`);
          }
          if (field.options && field.options.length > 0) {
            validator = (validator as z.ZodString).refine(
              (val) => field.options!.includes(val),
              `Please select a valid ${field.label}`
            );
          }
          break;

        default:
          validator = z.string();
          if (field.required) {
            validator = (validator as z.ZodString).min(1, `${field.label} is required`);
          }
          break;
      }
      
      if (!field.required && field.type !== "checkbox" && field.type !== "switch") {
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
    defaultValues: fields.reduce((acc, field) => {
      if (field.type === "checkbox" || field.type === "switch") {
        acc[field.name] = false as any;
      } else {
        acc[field.name] = "" as any;
      }
      return acc;
    }, {} as FormData)
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    alert("Form submitted successfully! Check console for data.");
  };

  // Safety check: if no fields provided, show a message
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto my-4">
        <CardHeader>
          <CardTitle className="text-black">Form Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No form fields defined. Please provide fields to generate a form.</p>
        </CardContent>
      </Card>
    );
  }

    const renderField = (field: FormFieldType, isFullWidth: boolean = false) => {
    const itemClass = isFullWidth ? "col-span-full" : "col-span-1";

    switch (field.type) {
      case "textarea":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={itemClass}>
                <FormLabel className="text-black text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    {...formField}
                    value={String(formField.value || '')}
                    className="min-h-[80px] text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={itemClass}>
                <FormLabel className="text-black text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <Select onValueChange={formField.onChange} defaultValue={formField.value as string}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        );

      case "checkbox":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={`${itemClass} flex flex-row items-start space-x-3 space-y-0`}>
                <FormControl>
                  <Checkbox
                    checked={Boolean(formField.value)}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-black">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "switch":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={`${itemClass} flex flex-row items-center justify-between rounded-lg border p-4`}>
                <div className="space-y-0.5">
                                  <FormLabel className="text-black text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                  {field.placeholder && (
                    <div className="text-sm text-muted-foreground">
                      {field.placeholder}
                    </div>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={Boolean(formField.value)}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        );

      case "radio":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={itemClass}>
                <FormLabel className="text-black text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    defaultValue={formField.value as string}
                    className="flex flex-col space-y-2"
                  >
                    {field.options?.map((option: string) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${field.name}-${option}`} />
                        <Label htmlFor={`${field.name}-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={itemClass}>
                <FormLabel className="text-black text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...formField}
                    value={String(formField.value || '')}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        );
    }
  };

  // Improved field grouping with better responsive layout
  const renderFieldGroups = () => {
    const groups: React.ReactElement[] = [];
    let currentGroup: FormFieldType[] = [];

    fields.forEach((field, index) => {
      // Fields that should be full-width
      const isFullWidth = field.type === 'textarea' || field.type === 'checkbox' || field.type === 'radio';

      // Fields that work better in single column on smaller screens
      const isSingleColumn = field.type === 'switch';

      if (isFullWidth) {
        // If we have a pending group, render it first
        if (currentGroup.length > 0) {
          groups.push(
            <div key={`group-${groups.length}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentGroup.map((groupField) => renderField(groupField, false))}
            </div>
          );
          currentGroup = [];
        }
        // Render full-width field
        groups.push(
          <div key={`fullwidth-${index}`} className="w-full">
            {renderField(field, true)}
          </div>
        );
      } else if (isSingleColumn) {
        // If we have a pending group, render it first
        if (currentGroup.length > 0) {
          groups.push(
            <div key={`group-${groups.length}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentGroup.map((groupField) => renderField(groupField, false))}
            </div>
          );
          currentGroup = [];
        }
        // Render single column field
        groups.push(
          <div key={`single-${index}`} className="w-full md:w-1/2">
            {renderField(field, false)}
          </div>
        );
      } else {
        currentGroup.push(field);

        // If we have 2 fields or this is the last field, render the group
        if (currentGroup.length === 2 || index === fields.length - 1) {
          groups.push(
            <div key={`group-${groups.length}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentGroup.map((groupField) => renderField(groupField, false))}
            </div>
          );
          currentGroup = [];
        }
      }
    });

    return groups;
  };

  return (
    <Card className="w-full max-w-none my-4">
      <CardHeader>
        <CardTitle className="text-black">{title || "Form"}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderFieldGroups()}
            <div className="pt-4 border-t">
              <Button type="submit" className="w-full h-9">
                {submitText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
