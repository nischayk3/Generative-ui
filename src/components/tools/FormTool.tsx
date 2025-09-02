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

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "select" | "checkbox" | "number";
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormToolProps {
  title?: string;
  description?: string;
  fields: FormField[];
  submitText?: string;
}

export const FormTool = ({ title, description, fields, submitText = "Submit" }: FormToolProps) => {
  // Dynamically create Zod schema based on form fields
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    fields.forEach(field => {
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
          
        default:
          validator = z.string();
          if (field.required) {
            validator = (validator as z.ZodString).min(1, `${field.label} is required`);
          }
          break;
      }
      
      if (!field.required && field.type !== "checkbox") {
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
      if (field.type === "checkbox") {
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

    const renderField = (field: FormField, isFullWidth: boolean = false) => {
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
                <FormLabel className="text-black">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    {...formField}
                    value={String(formField.value || '')}
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
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
                <FormLabel className="text-black">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <select
                    {...formField}
                    value={String(formField.value || '')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
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

      default:
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={itemClass}>
                <FormLabel className="text-black">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...formField}
                    value={String(formField.value || '')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  // Group fields in pairs, but handle full-width fields (textarea, checkbox)
  const renderFieldGroups = () => {
    const groups: React.ReactElement[] = [];
    let currentGroup: FormField[] = [];

    fields.forEach((field, index) => {
      const isFullWidth = field.type === 'textarea' || field.type === 'checkbox';

      if (isFullWidth) {
        // If we have a pending group, render it first
        if (currentGroup.length > 0) {
          groups.push(
            <div key={`group-${groups.length}`} className="grid grid-cols-2 gap-4">
              {currentGroup.map((groupField, groupIndex) => renderField(groupField, false))}
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
      } else {
        currentGroup.push(field);

        // If we have 2 fields or this is the last field, render the group
        if (currentGroup.length === 2 || index === fields.length - 1) {
          groups.push(
            <div key={`group-${groups.length}`} className="grid grid-cols-2 gap-4">
              {currentGroup.map((groupField, groupIndex) => renderField(groupField, false))}
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderFieldGroups()}
            <Button type="submit" className="w-full">
              {submitText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
