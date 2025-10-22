import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Mic, 
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { validateExtractedFields, getValidationSummary, ExtractedFieldValidation } from '@/utils/aiExtractionValidator';
import { COMPREHENSIVE_FIELD_MAPPING } from '@/utils/comprehensiveFieldMapping';

interface ScribeEntry {
  id: string;
  transcript_text: string;
  processed: boolean;
  created_at: string;
}

interface FormFieldValue {
  id: string;
  field_id: string;
  section_id: string;
  field_label: string;
  value: string;
  data_source: 'opas' | 'evital' | 'previous-assessment' | 'alert-function' | 'ai-filled' | 'manual' | 'pre-populated';
  ai_source_text?: string;
  created_at: string;
}

interface EnhancedScribeDataDisplayProps {
  assessmentId: string;
  currentFieldValues: Record<string, any>;
  patientId?: string; // for loading history across dates
}

interface FieldValidationDisplay {
  fieldData: FormFieldValue;
  validation: ExtractedFieldValidation;
}

export interface EnhancedScribeDataDisplayRef {
  refresh: () => Promise<void>;
}

export const EnhancedScribeDataDisplay = forwardRef<EnhancedScribeDataDisplayRef, EnhancedScribeDataDisplayProps>(
  ({ assessmentId, currentFieldValues, patientId }, ref) => {
  const [scribeHistory, setScribeHistory] = useState<ScribeEntry[]>([]);
  const [aiFilledFields, setAiFilledFields] = useState<FormFieldValue[]>([]);
  const [validatedFields, setValidatedFields] = useState<FieldValidationDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isValidationExpanded, setIsValidationExpanded] = useState(true);
  
// Load scribe history from Supabase
const loadScribeHistory = useCallback(async () => {
  if (!assessmentId && !patientId) return;
  try {
    if (patientId) {
      const { data, error } = await supabase
        .from('audio_transcripts')
        .select('id, transcript_text, processed, created_at, assessment_id, patient_assessments!inner(patient_id)')
        .eq('patient_assessments.patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) {
        console.error('Error loading scribe history (by patient):', error);
      } else {
        setScribeHistory((data as any) || []);
      }
    } else {
      const { data, error } = await supabase
        .from('audio_transcripts')
        .select('*')
        .eq('assessment_id', assessmentId!)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error loading scribe history (by assessment):', error);
      } else {
        setScribeHistory(data || []);
      }
    }
  } catch (error) {
    console.error('Error in loadScribeHistory:', error);
  }
}, [assessmentId, patientId]);

// Load AI-filled fields from Supabase
const loadAiFilledFields = useCallback(async () => {
  if (!assessmentId && !patientId) return;
  try {
    if (patientId) {
      const { data, error } = await supabase
        .from('form_field_values')
        .select('id, field_id, section_id, field_label, value, data_source, ai_source_text, created_at, assessment_id, patient_assessments!inner(patient_id)')
        .eq('data_source', 'ai-filled')
        .eq('patient_assessments.patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) {
        console.error('Error loading AI-filled fields (by patient):', error);
      } else {
        const fields = (data as any) || [];
        setAiFilledFields(fields);
        const validations = validateExtractedFields(
          fields.map((field: any) => ({
            fieldId: field.field_id,
            value: field.value,
            confidenceScore: 0.8
          }))
        );
        const validatedDisplayData: FieldValidationDisplay[] = fields
          .filter((field: any) => field.field_id && field.value)
          .map((field: any) => {
            const validation = validations.find(v => v.fieldId === field.field_id);
            return {
              fieldData: field as FormFieldValue,
              validation: validation || {
                fieldId: field.field_id || '',
                originalValue: field.value || '',
                validation: {
                  isValid: true,
                  errors: [],
                  warnings: [],
                  normalizedValue: field.value || ''
                }
              }
            };
          });
        setValidatedFields(validatedDisplayData);
      }
    } else {
      const { data, error } = await supabase
        .from('form_field_values')
        .select('*')
        .eq('assessment_id', assessmentId!)
        .eq('data_source', 'ai-filled')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error loading AI-filled fields (by assessment):', error);
      } else {
        const fields = data || [];
        setAiFilledFields(fields);
        const validations = validateExtractedFields(
          fields.map(field => ({
            fieldId: field.field_id,
            value: field.value,
            confidenceScore: 0.8
          }))
        );
        const validatedDisplayData: FieldValidationDisplay[] = fields
          .filter(field => field.field_id && field.value)
          .map(field => {
            const validation = validations.find(v => v.fieldId === field.field_id);
            return {
              fieldData: field as FormFieldValue,
              validation: validation || {
                fieldId: field.field_id || '',
                originalValue: field.value || '',
                validation: {
                  isValid: true,
                  errors: [],
                  warnings: [],
                  normalizedValue: field.value || ''
                }
              }
            };
          });
        setValidatedFields(validatedDisplayData);
      }
    }
  } catch (error) {
    console.error('Error in loadAiFilledFields:', error);
  }
}, [assessmentId, patientId]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([loadScribeHistory(), loadAiFilledFields()]);
    setIsLoading(false);
  }, [loadScribeHistory, loadAiFilledFields]);

  // Expose refresh method via ref
  useImperativeHandle(ref, () => ({
    refresh: refreshData
  }), [refreshData]);

  // Initial load and real-time subscriptions
  useEffect(() => {
    refreshData();

    // Set up real-time subscriptions
    const transcriptsSubscription = supabase
      .channel('audio_transcripts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_transcripts',
          filter: `assessment_id=eq.${assessmentId}`,
        },
        () => {
          loadScribeHistory();
        }
      )
      .subscribe();

    const fieldsSubscription = supabase
      .channel('form_field_values_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'form_field_values',
          filter: `assessment_id=eq.${assessmentId}`,
        },
        () => {
          loadAiFilledFields();
        }
      )
      .subscribe();

    return () => {
      transcriptsSubscription.unsubscribe();
      fieldsSubscription.unsubscribe();
    };
  }, [assessmentId, patientId]);

  // Get field display name with enhanced mapping
  const getFieldDisplayName = (fieldName: string): string => {
    const fieldMapping = COMPREHENSIVE_FIELD_MAPPING[fieldName];
    if (fieldMapping) {
      return fieldMapping.fieldLabel;
    }
    
    // Fallback mappings for fields not in comprehensive mapping
    const fieldMappings: Record<string, string> = {
      'morse_history_falling': 'Fall History (Morse)',
      'morse_secondary_diagnosis': 'Secondary Diagnosis (Morse)',
      'morse_ambulatory_aid': 'Ambulatory Aid (Morse)',
      'morse_iv_therapy': 'IV Therapy/Heparin Lock (Morse)',
      'morse_gait': 'Gait/Transferring (Morse)',
      'morse_mental_status': 'Mental Status (Morse)',
    };
    
    return fieldMappings[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Get validation summary
  const validationSummary = getValidationSummary(validatedFields.map(f => f.validation));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading AI extraction data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced AI-Filled Data Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle className="text-xl font-bold">Enhanced AI-Extracted Data</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Comprehensive field extraction with validation from {aiFilledFields.length} AI-processed transcripts
          </CardDescription>
          
          {/* Validation Summary */}
          {validationSummary.totalFields > 0 && (
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                {validationSummary.validFields} Valid
              </Badge>
              {validationSummary.fieldsWithErrors > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {validationSummary.fieldsWithErrors} Errors
                </Badge>
              )}
              {validationSummary.fieldsWithWarnings > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                  {validationSummary.fieldsWithWarnings} Warnings
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {validatedFields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No AI-extracted data available yet.</p>
              <p className="text-sm mt-1">Start recording to extract patient information automatically.</p>
            </div>
          ) : (
            <Collapsible open={isValidationExpanded} onOpenChange={setIsValidationExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 w-full justify-start p-0 h-auto">
                  {isValidationExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="font-medium">
                    Extracted Fields ({validatedFields.length})
                  </span>
                  {validationSummary.criticalErrors.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {validationSummary.criticalErrors.length} Critical
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {validatedFields.map((fieldDisplay, index) => (
                      <div
                        key={`${fieldDisplay.fieldData.id}-${index}`}
                        className={`p-3 rounded-lg border ${
                          !fieldDisplay.validation.validation.isValid
                            ? 'border-red-200 bg-red-50'
                            : fieldDisplay.validation.validation.warnings.length > 0
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-green-200 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {getFieldDisplayName(fieldDisplay.fieldData.field_id)}
                              </span>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                {fieldDisplay.fieldData.section_id}
                              </Badge>
                            </div>
                            <div className="mt-1">
                              <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                                {fieldDisplay.validation.validation.normalizedValue}
                              </span>
                              {fieldDisplay.validation.originalValue !== fieldDisplay.validation.validation.normalizedValue && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  (normalized from: {fieldDisplay.validation.originalValue})
                                </span>
                              )}
                            </div>
                            
                            {/* Validation Messages */}
                            {fieldDisplay.validation.validation.errors.length > 0 && (
                              <div className="mt-2">
                                {fieldDisplay.validation.validation.errors.map((error, idx) => (
                                  <div key={idx} className="flex items-center gap-1 text-xs text-red-600">
                                    <XCircle className="h-3 w-3" />
                                    {error}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {fieldDisplay.validation.validation.warnings.length > 0 && (
                              <div className="mt-2">
                                {fieldDisplay.validation.validation.warnings.map((warning, idx) => (
                                  <div key={idx} className="flex items-center gap-1 text-xs text-yellow-600">
                                    <AlertCircle className="h-3 w-3" />
                                    {warning}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* AI Source Text */}
                            {fieldDisplay.fieldData.ai_source_text && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                <strong>Source:</strong> "{fieldDisplay.fieldData.ai_source_text}"
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 ml-3">
                            {fieldDisplay.validation.validation.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(fieldDisplay.fieldData.created_at).split(' ')[1]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      {/* Scribe History Section */}
      <Card>
        <Collapsible open={isHistoryExpanded} onOpenChange={setIsHistoryExpanded}>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 w-full justify-start p-0 h-auto">
                {isHistoryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <Clock className="h-4 w-4" />
                <CardTitle className="text-xl font-bold text-left">Scribe History ({scribeHistory.length})</CardTitle>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardDescription className="mt-2">
                Complete history of audio transcriptions and AI processing
              </CardDescription>
            </CollapsibleContent>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {scribeHistory.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No transcription history yet.</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {scribeHistory.map((entry, index) => (
                      <div key={entry.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={entry.processed ? 'default' : 'secondary'}>
                              {entry.processed ? 'Processed' : 'Processing'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatTimestamp(entry.created_at)}
                            </span>
                          </div>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm">
                          <p className="line-clamp-3">
                            {entry.transcript_text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
});