import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Clock, ChevronDown, ChevronUp, Bot } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assessmentId) {
      loadScribeHistory();
    }
  }, [assessmentId]);

  const getFieldDisplayName = (fieldName: string) => {
    const fieldMap: Record<string, string> = {
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

  const getAIFilledFields = () => {
    const filledFields: Array<{field: string, value: any, source: string}> = [];
    
    // Get fields that have been filled by AI
    Object.entries(currentFieldValues).forEach(([field, value]) => {
      if (value && field !== 'patient_gender') {
        // Check if this field was filled by recent scribe sessions
        const recentScribe = scribeHistory.find(entry => 
          entry.extracted_fields?.some((extractedField: any) => 
            extractedField.field_name === field
          )
        );
        
        if (recentScribe || field.includes('_')) {
          filledFields.push({
            field,
            value,
            source: recentScribe ? 'AI Scribe' : 'Manual Entry'
          });
        }
      }
    });
    
    return filledFields;
  };

  const aiFilledFields = getAIFilledFields();

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
            <Badge variant="secondary" className="text-xs">
              {aiFilledFields.length} fields filled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {aiFilledFields.length > 0 ? (
            <ScrollArea className="h-48 w-full">
              <div className="space-y-3">
                {aiFilledFields.map(({ field, value, source }, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        {getFieldDisplayName(field)}
                      </span>
                      <Badge 
                        variant={source === 'AI Scribe' ? 'default' : 'outline'} 
                        className="text-xs"
                      >
                        {source}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground bg-muted p-2 rounded">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </p>
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
                              {getFieldDisplayName(field.field_name)}
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