import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
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
}

interface FormSectionProps {
  title: string;
  description?: string;
  fields: FormField[];
  onFieldChange: (fieldId: string, value: any) => void;
}

export function FormSection({ title, description, fields, onFieldChange }: FormSectionProps) {
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

  const renderField = (field: FormField) => {
    const fieldClass = cn(
      "transition-colors border-2",
      getFieldBackground(field.dataSource),
      field.dataSource === 'pre-populated' && "cursor-not-allowed opacity-75",
      field.dataSource === 'ai-filled' && "border-primary/20",
    );

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <Input
            type={field.type}
            value={field.value as string || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            className={fieldClass}
            disabled={field.dataSource === 'pre-populated'}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={field.value as string || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            className={fieldClass}
            disabled={field.dataSource === 'pre-populated'}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select
            value={field.value as string || ''}
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
              checked={field.value as boolean || false}
              onCheckedChange={(checked) => onFieldChange(field.id, checked)}
              disabled={field.dataSource === 'pre-populated'}
            />
            <Label className="text-sm">{field.label}</Label>
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