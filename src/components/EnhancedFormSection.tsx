import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calculator, CalendarIcon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";

export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'radio' | 'date' | 'time' | 'calculated' | 'inline-group' | 'datepicker' | 'multi-select' | 'file' | 'file-upload' | 'dynamic-group' | 'nested-tabs' | 'dialog';
export type DataSource = 'pre-populated' | 'ai-filled' | 'manual';

interface OptionItem {
  value: string | number;
  label: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  value?: string | boolean | number;
  options?: string[] | OptionItem[];
  required?: boolean;
  dataSource?: DataSource; // Make dataSource optional
  aiSourceText?: string;
  calculation?: (values: Record<string, any>) => string | number;
  inlineFields?: FormField[];
  conditionalFields?: FormField[];
  showCondition?: (value: any) => boolean;
  displayCondition?: string;
  disabledCondition?: string;
  subLabel?: string;
  defaultValue?: string | number | boolean;
  accept?: string;
  multiple?: boolean;
  tabs?: { id: string; label: string; fields: FormField[] }[];
  addButtonLabel?: string;
  itemSchema?: FormField[];
  // Dialog-specific properties
  dialogTitle?: string;
  dialogFields?: FormField[];
  dialogTriggerLabel?: string;
}

export interface FormCard {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  columns?: number;
  gridColumns?: number; // alias for columns
  column?: 'left' | 'right'; // explicit column assignment
}

interface EnhancedFormSectionProps {
  title: string;
  description?: string;
  cards: FormCard[];
  layout?: 'single' | 'two-column' | 'three-column' | 'double' | 'triple';
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues?: Record<string, any>;
}

export function EnhancedFormSection({ 
  title, 
  description, 
  cards, 
  layout = 'single',
  onFieldChange,
  fieldValues = {}
}: EnhancedFormSectionProps) {
  const [dynamicFields, setDynamicFields] = useState<Record<string, FormField[]>>({});

  // Normalize layout aliases
  const normalizedLayout = layout === 'double' ? 'two-column' : layout === 'triple' ? 'three-column' : layout;

  // Evaluate display condition
  const evaluateCondition = (condition: string, values: Record<string, any>): boolean => {
    try {
      // Handle includes condition for multi-select
      if (condition.includes('includes')) {
        const match = condition.match(/(\w+)\.includes\(['"]([^'"]+)['"]\)/);
        if (match) {
          const [, fieldId, value] = match;
          const fieldValue = values[fieldId];
          return Array.isArray(fieldValue) ? fieldValue.includes(value) : false;
        }
      }
      
      // Handle basic equality conditions with quoted strings
      const stringMatch = condition.match(/(\w+)\s*===?\s*['"]([^'"]+)['"]/);
      if (stringMatch) {
        const [, fieldId, value] = stringMatch;
        return values[fieldId] === value;
      }
      
      // Handle boolean equality conditions
      const booleanMatch = condition.match(/(\w+)\s*===?\s*(true|false)/);
      if (booleanMatch) {
        const [, fieldId, value] = booleanMatch;
        return values[fieldId] === (value === 'true');
      }
      
      return false;
    } catch {
      return false;
    }
  };

  // Normalize options to support both string[] and OptionItem[]
  const normalizeOptions = (options?: string[] | OptionItem[]): OptionItem[] => {
    if (!options) return [];
    return options.map(option => 
      typeof option === 'string' 
        ? { value: option, label: option }
        : option
    );
  };

  const getFieldBackground = (dataSource?: DataSource) => {
    if (!dataSource) return '';
    const backgrounds = {
      'pre-populated': 'bg-medical-pre-populated',
      'ai-filled': 'bg-medical-ai-filled',
      'manual': ''
    };
    return backgrounds[dataSource];
  };

  const getDataSourceBadge = (dataSource?: DataSource) => {
    if (!dataSource || dataSource === 'manual') return null;
    
    const labels = {
      'pre-populated': 'History',
      'ai-filled': 'AI Filled',
      'manual': ''
    };
    const variants = {
      'pre-populated': 'secondary',
      'ai-filled': 'default',
      'manual': 'outline'
    } as const;
    
    return (
      <Badge variant={variants[dataSource]} className="text-xs">
        {labels[dataSource]}
      </Badge>
    );
  };

  const addDynamicField = (cardId: string, templateField: FormField) => {
    const newField = {
      ...templateField,
      id: `${templateField.id}_${Date.now()}`
      // Remove dataSource assignment - let it be undefined for normal fields
    };
    
    setDynamicFields(prev => ({
      ...prev,
      [cardId]: [...(prev[cardId] || []), newField]
    }));
  };

  const renderField = (field: FormField) => {
    const fieldClass = cn(
      "transition-colors border-2",
      getFieldBackground(field.dataSource),
      field.dataSource === 'pre-populated' && "cursor-not-allowed opacity-75",
      field.dataSource === 'ai-filled' && "border-primary/20",
    );

    // Initialize with defaultValue if no current value exists
    const currentValue = fieldValues[field.id] ?? field.value ?? field.defaultValue;
    
    // Check display condition
    if (field.displayCondition && !evaluateCondition(field.displayCondition, fieldValues)) {
      return null;
    }
    
    // Check disabled condition
    const isDisabled = field.dataSource === 'pre-populated' || 
      (field.disabledCondition && evaluateCondition(field.disabledCondition, fieldValues));

    const normalizedOptions = normalizeOptions(field.options);

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'time':
        return (
          <div>
            <Input
              type={field.type}
              value={currentValue as string || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              className={fieldClass}
              disabled={isDisabled}
            />
            {field.subLabel && (
              <p className="text-xs text-muted-foreground mt-1">{field.subLabel}</p>
            )}
          </div>
        );
      
      case 'textarea':
        return (
          <div>
            <Textarea
              value={currentValue as string || ''}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              className={fieldClass}
              disabled={isDisabled}
              rows={3}
            />
            {field.subLabel && (
              <p className="text-xs text-muted-foreground mt-1">{field.subLabel}</p>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div>
            <Select
              value={currentValue as string || ''}
              onValueChange={(value) => onFieldChange(field.id, value)}
              disabled={isDisabled}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Select option..." />
              </SelectTrigger>
              <SelectContent className="z-50">
                {normalizedOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.subLabel && (
              <p className="text-xs text-muted-foreground mt-1">{field.subLabel}</p>
            )}
          </div>
        );
      
      case 'checkbox':
        // Handle checkbox with multiple options (checkbox group)
        if (field.options && field.options.length > 0) {
          const selectedValues = Array.isArray(currentValue) ? currentValue : [];
          
          return (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{field.label}</Label>
              <div className="space-y-2">
                {normalizedOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedValues.includes(String(option.value))}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...selectedValues, String(option.value)]
                          : selectedValues.filter(v => v !== String(option.value));
                        onFieldChange(field.id, newValues);
                      }}
                      disabled={isDisabled}
                      id={`${field.id}-${option.value}`}
                    />
                    <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              {field.subLabel && (
                <p className="text-xs text-muted-foreground mt-1">{field.subLabel}</p>
              )}
            </div>
          );
        }
        
        // Handle single checkbox (boolean)
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={currentValue as boolean || false}
              onCheckedChange={(checked) => onFieldChange(field.id, checked)}
              disabled={isDisabled}
            />
            <Label className="text-sm">{field.label}</Label>
          </div>
        );

      case 'radio':
        return (
          <div>
            <RadioGroup
              value={currentValue as string || ''}
              onValueChange={(value) => onFieldChange(field.id, value)}
              disabled={isDisabled}
            >
              {normalizedOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={String(option.value)} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {field.subLabel && (
              <p className="text-xs text-muted-foreground mt-1">{field.subLabel}</p>
            )}
          </div>
        );

      case 'calculated':
        const calculatedValue = field.calculation ? field.calculation(fieldValues) : '';
        return (
          <div className="flex items-center space-x-2">
            <Input
              value={calculatedValue}
              className={cn(fieldClass, "bg-muted")}
              disabled
            />
            <Badge variant="secondary" className="text-xs">
              <Calculator className="w-3 h-3 mr-1" />
              Auto
            </Badge>
          </div>
        );

      case 'datepicker':
        const dateValue = currentValue ? new Date(currentValue) : undefined;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateValue && "text-muted-foreground",
                  fieldClass
                )}
                disabled={field.dataSource === 'pre-populated'}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => onFieldChange(field.id, date ? date.toISOString() : '')}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(currentValue) ? currentValue : [];
        return (
          <div>
            <div className="space-y-2">
              {normalizedOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedValues.includes(String(option.value))}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, String(option.value)]
                        : selectedValues.filter(v => v !== String(option.value));
                      onFieldChange(field.id, newValues);
                    }}
                    disabled={isDisabled}
                  />
                  <Label className="text-sm">{option.label}</Label>
                </div>
              ))}
            </div>
            {field.subLabel && (
              <p className="text-xs text-muted-foreground mt-1">{field.subLabel}</p>
            )}
          </div>
        );

      case 'inline-group':
        return (
          <div className="flex items-center space-x-2">
            {field.inlineFields?.map((inlineField) => (
              <div key={inlineField.id} className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  {inlineField.label}
                </Label>
                {renderField(inlineField)}
              </div>
            ))}
          </div>
        );

      case 'file':
      case 'file-upload':
        return (
          <div>
            <Input
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  const fileArray = Array.from(files);
                  onFieldChange(field.id, field.multiple ? fileArray : fileArray[0]);
                }
              }}
              className={fieldClass}
              disabled={isDisabled}
            />
            {field.subLabel && (
              <p className="text-xs text-muted-foreground mt-1">{field.subLabel}</p>
            )}
          </div>
        );

      case 'dynamic-group':
        const groupItems = Array.isArray(currentValue) ? currentValue : [];
        return (
          <div className="space-y-4">
            {groupItems.map((item: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItems = groupItems.filter((_, i) => i !== index);
                      onFieldChange(field.id, newItems);
                    }}
                  >
                    Remove
                  </Button>
                </div>
                {field.itemSchema?.map((schemaField) => (
                  <div key={schemaField.id} className="mb-3">
                    <Label className="text-sm font-medium mb-1 block">
                      {schemaField.label}
                    </Label>
                    {renderField({
                      ...schemaField,
                      id: `${field.id}_${index}_${schemaField.id}`,
                      value: item[schemaField.id]
                    })}
                  </div>
                ))}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newItem = {};
                const newItems = [...groupItems, newItem];
                onFieldChange(field.id, newItems);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {field.addButtonLabel || 'Add Item'}
            </Button>
          </div>
        );

      case 'nested-tabs':
        return (
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Nested tabs feature coming soon...
            </p>
          </div>
        );

      case 'dialog':
        const isDialogEnabled = currentValue === true;
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isDialogEnabled}
              onCheckedChange={(checked) => onFieldChange(field.id, checked)}
              disabled={isDisabled}
            />
            <Label className="text-sm">{field.label}</Label>
            {isDialogEnabled && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2">
                    <Settings className="w-4 h-4 mr-1" />
                    {field.dialogTriggerLabel || 'Configure'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{field.dialogTitle || field.label}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {field.dialogFields?.map((dialogField) => (
                      <div key={dialogField.id} className="space-y-2">
                        <Label className="text-sm font-medium">
                          {dialogField.label}
                          {dialogField.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {renderField(dialogField)}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderCard = (card: FormCard) => {
    const cardDynamicFields = dynamicFields[card.id] || [];
    const allFields = [...card.fields, ...cardDynamicFields];
    
    // Support gridColumns as alias for columns
    const columns = card.gridColumns || card.columns;

    return (
      <Card key={card.id} className="h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{card.title}</CardTitle>
          {card.description && (
            <p className="text-sm text-muted-foreground">{card.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className={cn(
            "space-y-4",
            columns === 2 && "grid grid-cols-2 gap-4 space-y-0",
            columns === 3 && "grid grid-cols-3 gap-4 space-y-0"
          )}>
            {allFields.map((field) => {
              // Check if field should be shown based on conditions
              if (field.showCondition && !field.showCondition(fieldValues[field.id])) {
                return null;
              }
              if (field.displayCondition && !evaluateCondition(field.displayCondition, fieldValues)) {
                return null;
              }

              return (
                <div key={field.id} className={cn(
                  "space-y-2",
                  field.type === 'checkbox' && "flex items-center space-y-0"
                )}>
                  {field.type !== 'checkbox' && field.type !== 'inline-group' && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {field.dataSource && getDataSourceBadge(field.dataSource)}
                    </div>
                  )}
                  
                  {renderField(field)}
                  
                  {/* Conditional fields */}
                  {field.conditionalFields && field.conditionalFields.map(conditionalField => {
                    if (!conditionalField.showCondition || !conditionalField.showCondition(fieldValues[field.id])) {
                      return null;
                    }
                    return (
                       <div key={conditionalField.id} className="ml-4 mt-2 p-3 bg-muted/50 rounded">
                         <div className="flex items-center justify-between mb-2">
                           <Label className="text-sm font-medium">
                             {conditionalField.label}
                           </Label>
                           {conditionalField.dataSource && getDataSourceBadge(conditionalField.dataSource)}
                         </div>
                         {renderField(conditionalField)}
                       </div>
                    );
                  })}
                  
                  {field.aiSourceText && field.dataSource === 'ai-filled' && (
                    <div className="text-xs text-medical-ai-filled-foreground bg-medical-ai-filled/50 p-2 rounded border">
                      <strong>AI Source:</strong> "{field.aiSourceText}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dynamic field addition button */}
          {card.id === 'skin-wounds' && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addDynamicField(card.id, {
                  id: 'wound_detail',
                  label: 'Wound Details',
                  type: 'textarea',
                  required: false
                })}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Wound
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const getLayoutClass = () => {
    switch (normalizedLayout) {
      case 'two-column':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start';
      case 'three-column':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start';
      default:
        return 'space-y-6';
    }
  };

  // Check if any cards have column assignments
  const hasColumnAssignments = cards.some(card => card.column);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {hasColumnAssignments ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {cards.filter(card => card.column === 'left').map(renderCard)}
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {cards.filter(card => card.column === 'right').map(renderCard)}
          </div>
        </div>
      ) : (
        <div className={getLayoutClass()}>
          {cards.map(renderCard)}
        </div>
      )}
    </div>
  );
}