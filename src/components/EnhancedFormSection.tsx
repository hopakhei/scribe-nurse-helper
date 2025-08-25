import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'radio' | 'date' | 'time' | 'calculated' | 'inline-group';
export type DataSource = 'pre-populated' | 'ai-filled' | 'manual';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  value?: string | boolean | number;
  options?: string[];
  required?: boolean;
  dataSource: DataSource;
  aiSourceText?: string;
  calculation?: (values: Record<string, any>) => string | number;
  inlineFields?: FormField[];
  conditionalFields?: FormField[];
  showCondition?: (value: any) => boolean;
}

export interface FormCard {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  columns?: number;
}

interface EnhancedFormSectionProps {
  title: string;
  description?: string;
  cards: FormCard[];
  layout?: 'single' | 'two-column' | 'three-column';
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

  const getFieldBackground = (dataSource: DataSource) => {
    const backgrounds = {
      'pre-populated': 'bg-medical-pre-populated',
      'ai-filled': 'bg-medical-ai-filled',
      'manual': 'bg-medical-manual-entry'
    };
    return backgrounds[dataSource];
  };

  const getDataSourceBadge = (dataSource: DataSource) => {
    const labels = {
      'pre-populated': 'EMR Data',
      'ai-filled': 'AI Filled',
      'manual': 'Manual Entry'
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
      id: `${templateField.id}_${Date.now()}`,
      dataSource: 'manual' as DataSource
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

    const currentValue = fieldValues[field.id] || field.value;

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'time':
        return (
          <Input
            type={field.type}
            value={currentValue as string || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            className={fieldClass}
            disabled={field.dataSource === 'pre-populated'}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={currentValue as string || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            className={fieldClass}
            disabled={field.dataSource === 'pre-populated'}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select
            value={currentValue as string || ''}
            onValueChange={(value) => onFieldChange(field.id, value)}
            disabled={field.dataSource === 'pre-populated'}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="Select option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
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
              checked={currentValue as boolean || false}
              onCheckedChange={(checked) => onFieldChange(field.id, checked)}
              disabled={field.dataSource === 'pre-populated'}
            />
            <Label className="text-sm">{field.label}</Label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={currentValue as string || ''}
            onValueChange={(value) => onFieldChange(field.id, value)}
            disabled={field.dataSource === 'pre-populated'}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
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
      
      default:
        return null;
    }
  };

  const renderCard = (card: FormCard) => {
    const cardDynamicFields = dynamicFields[card.id] || [];
    const allFields = [...card.fields, ...cardDynamicFields];

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
            card.columns === 2 && "grid grid-cols-2 gap-4 space-y-0",
            card.columns === 3 && "grid grid-cols-3 gap-4 space-y-0"
          )}>
            {allFields.map((field) => {
              // Check if field should be shown based on conditions
              if (field.showCondition && !field.showCondition(fieldValues[field.id])) {
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
                      {getDataSourceBadge(field.dataSource)}
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
                          {getDataSourceBadge(conditionalField.dataSource)}
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
                  dataSource: 'manual',
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
    switch (layout) {
      case 'two-column':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
      case 'three-column':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      default:
        return 'space-y-6';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      <div className={getLayoutClass()}>
        {cards.map(renderCard)}
      </div>
    </div>
  );
}