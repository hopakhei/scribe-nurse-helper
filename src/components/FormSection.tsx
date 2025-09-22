import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'radio' | 'date' | 'time';
export type DataSource = 'opas' | 'evital' | 'previous-assessment' | 'alert-function' | 'ai-filled' | 'manual';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  value?: string | boolean | number;
  options?: string[];
  required?: boolean;
  dataSource?: DataSource;
  sourceSystem?: string;
  lastSync?: string;
  aiSourceText?: string;
}

interface FormSectionProps {
  title: string;
  description?: string;
  fields: FormField[];
  onFieldChange: (fieldId: string, value: any) => void;
}

export function FormSection({ title, description, fields, onFieldChange }: FormSectionProps) {
  const getFieldBackground = (dataSource?: DataSource) => {
    if (!dataSource) return '';
    const backgrounds = {
      'opas': 'bg-blue-50 dark:bg-blue-950/50',
      'evital': 'bg-green-50 dark:bg-green-950/50',
      'previous-assessment': 'bg-purple-50 dark:bg-purple-950/50',
      'alert-function': 'bg-orange-50 dark:bg-orange-950/50',
      'ai-filled': 'bg-medical-ai-filled'
    };
    return backgrounds[dataSource];
  };

  const getDataSourceBadge = (dataSource?: DataSource) => {
    if (!dataSource) return null;
    
    const labels = {
      'opas': 'OPAS',
      'evital': 'eVital',
      'previous-assessment': 'Previous Assessment',
      'alert-function': 'Alert Function',
      'ai-filled': 'AI Filled',
      'manual': ''
    };
    const variants = {
      'opas': 'secondary',
      'evital': 'default',
      'previous-assessment': 'outline',
      'alert-function': 'destructive',
      'ai-filled': 'default'
    } as const;
    
    return (
      <Badge variant={variants[dataSource]} className="text-xs">
        {labels[dataSource]}
      </Badge>
    );
  };

  const renderField = (field: FormField) => {
    const fieldClass = cn(
      "transition-colors border-2",
      getFieldBackground(field.dataSource),
      (field.dataSource === 'opas' || field.dataSource === 'evital' || 
       field.dataSource === 'previous-assessment' || field.dataSource === 'alert-function') && 
      "cursor-not-allowed opacity-75",
      field.dataSource === 'ai-filled' && "border-primary/20",
    );

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'time':
        return (
          <Input
            type={field.type}
            value={field.value as string || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            className={fieldClass}
            disabled={field.dataSource === 'opas' || field.dataSource === 'evital' || 
                     field.dataSource === 'previous-assessment' || field.dataSource === 'alert-function'}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={field.value as string || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            className={fieldClass}
            disabled={field.dataSource === 'opas' || field.dataSource === 'evital' || 
                     field.dataSource === 'previous-assessment' || field.dataSource === 'alert-function'}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select
            value={field.value as string || ''}
            onValueChange={(value) => onFieldChange(field.id, value)}
            disabled={field.dataSource === 'opas' || field.dataSource === 'evital' || 
                     field.dataSource === 'previous-assessment' || field.dataSource === 'alert-function'}
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
              checked={field.value as boolean || false}
              onCheckedChange={(checked) => onFieldChange(field.id, checked)}
              disabled={field.dataSource === 'opas' || field.dataSource === 'evital' || 
                       field.dataSource === 'previous-assessment' || field.dataSource === 'alert-function'}
            />
            <Label className="text-sm">{field.label}</Label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${option}`}
                  name={field.id}
                  value={option}
                  checked={field.value === option}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                  disabled={field.dataSource === 'opas' || field.dataSource === 'evital' || 
                           field.dataSource === 'previous-assessment' || field.dataSource === 'alert-function'}
                  className="w-4 h-4"
                />
                <Label htmlFor={`${field.id}-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {getDataSourceBadge(field.dataSource)}
            </div>
            
            {renderField(field)}
            
            {field.aiSourceText && field.dataSource === 'ai-filled' && (
              <div className="text-xs text-medical-ai-filled-foreground bg-medical-ai-filled/50 p-2 rounded border">
                <strong>AI Source:</strong> "{field.aiSourceText}"
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
