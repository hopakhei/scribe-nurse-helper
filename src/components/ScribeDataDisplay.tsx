
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Clock, ChevronDown, ChevronUp, Bot, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ScribeEntry {
  id: string;
  transcript_text: string;
  extracted_fields?: any[];
  created_at: string;
  processed: boolean;
  assessment_id: string;
  user_id: string;
  expires_at: string;
}

interface FormFieldValue {
  field_id: string;
  field_label: string;
  value: string;
  data_source: string;
  ai_source_text?: string;
}

interface ScribeDataDisplayProps {
  assessmentId: string;
  currentFieldValues: Record<string, any>;
}

const ScribeDataDisplay: React.FC<ScribeDataDisplayProps> = ({
  assessmentId,
  currentFieldValues
}) => {
  const { toast } = useToast();
  const [scribeHistory, setScribeHistory] = useState<ScribeEntry[]>([]);
  const [aiFilledFields, setAiFilledFields] = useState<FormFieldValue[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadScribeHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('audio_transcripts')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading scribe history:', error);
        return;
      }

      setScribeHistory(data || []);
    } catch (error) {
      console.error('Error loading scribe history:', error);
    }
  };

  const loadAiFilledFields = async () => {
    try {
      const { data, error } = await supabase
        .from('form_field_values')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('data_source', 'ai-filled');

      if (error) {
        console.error('Error loading AI filled fields:', error);
        return;
      }

      setAiFilledFields(data || []);
    } catch (error) {
      console.error('Error loading AI filled fields:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([loadScribeHistory(), loadAiFilledFields()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (assessmentId) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([loadScribeHistory(), loadAiFilledFields()]);
        setLoading(false);
      };
      loadData();
    }
  }, [assessmentId]);

  // Set up real-time subscription for updates
  useEffect(() => {
    if (!assessmentId) return;

    const channel = supabase
      .channel('scribe-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_transcripts',
          filter: `assessment_id=eq.${assessmentId}`
        },
        () => {
          loadScribeHistory();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'form_field_values',
          filter: `assessment_id=eq.${assessmentId}`
        },
        () => {
          loadAiFilledFields();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assessmentId]);

  const getFieldDisplayName = (fieldName: string) => {
    const fieldMap: Record<string, string> = {
      'morse_history_falling': 'Fall History',
      'morse_secondary_diagnosis': 'Secondary Diagnosis',
      'morse_ambulatory_aid': 'Ambulatory Aid',
      'morse_iv_heparin': 'IV/Heparin Lock',
      'morse_gait': 'Gait/Transferring',
      'morse_mental_status': 'Mental Status',
      'chief_complaint': 'Chief Complaint',
      'systolic_bp': 'Systolic BP',
      'diastolic_bp': 'Diastolic BP',
      'pulse_rate': 'Pulse Rate',
      'respiratory_rate': 'Respiratory Rate',
      'temperature': 'Temperature',
      'oxygen_saturation': 'Oxygen Saturation',
      'pain_scale': 'Pain Scale',
      'consciousness_level': 'Consciousness Level',
      'allergies': 'Allergies',
      'current_medications': 'Current Medications',
      'medical_history': 'Medical History',
      'presenting_symptoms': 'Presenting Symptoms',
      'assessment_notes': 'Assessment Notes'
    };
    
    return fieldMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading scribe data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI-Filled Data Section */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI-Filled Data
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {aiFilledFields.length} fields filled
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={refreshing}
                className="p-1"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {aiFilledFields.length > 0 ? (
            <ScrollArea className="h-48 w-full">
              <div className="space-y-3">
                {aiFilledFields.map((field, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        {field.field_label || getFieldDisplayName(field.field_id)}
                      </span>
                      <Badge variant="default" className="text-xs">
                        AI Scribe
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground bg-muted p-2 rounded">
                      {field.value}
                    </p>
                    {field.ai_source_text && (
                      <p className="text-xs text-muted-foreground italic">
                        Source: "{field.ai_source_text}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-6">
              No data filled by AI yet. Start scribing to populate form fields automatically.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scribe History Section */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Scribe History ({scribeHistory.length})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent>
            {scribeHistory.length > 0 ? (
              <ScrollArea className="h-64 w-full">
                <div className="space-y-4">
                  {scribeHistory.map((entry, index) => (
                    <div key={entry.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Session {scribeHistory.length - index}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(entry.created_at)}
                          </div>
                        </div>
                        <Badge 
                          variant={entry.processed ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {entry.processed ? 'Processed' : 'Processing'}
                        </Badge>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-foreground leading-relaxed">
                          {entry.transcript_text.substring(0, 200)}
                          {entry.transcript_text.length > 200 && '...'}
                        </p>
                      </div>
                      
                      {entry.extracted_fields && entry.extracted_fields.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Fields extracted:</span>{' '}
                          {entry.extracted_fields.map((field: any, i: number) => (
                            <span key={i}>
                              {field.field_label || getFieldDisplayName(field.field_name)}
                              {i < entry.extracted_fields.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}

                      {index < scribeHistory.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-6">
                No scribe sessions yet. Start recording to create your first entry.
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ScribeDataDisplay;
