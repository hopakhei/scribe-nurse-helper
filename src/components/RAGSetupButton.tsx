import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const RAGSetupButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const { toast } = useToast();

  const generateEmbeddings = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-field-embeddings');
      
      if (error) {
        throw new Error(error.message);
      }

      console.log('RAG embeddings generated:', data);
      
      toast({
        title: "RAG System Setup Complete",
        description: `Generated ${data.generatedEmbeddings} field embeddings for intelligent medical extraction.`,
      });
      
      setSetupComplete(true);
      
    } catch (error) {
      console.error('Error generating embeddings:', error);
      toast({
        variant: "destructive",
        title: "RAG Setup Failed",
        description: error.message || "Failed to generate field embeddings",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (setupComplete) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">RAG System Active</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-green-700">
            Medical field embeddings are ready. The system will now use intelligent RAG-based extraction for all audio transcripts.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <CardTitle>RAG Medical Extraction</CardTitle>
          </div>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Setup Required
          </Badge>
        </div>
        <CardDescription>
          Initialize the RAG (Retrieval-Augmented Generation) system with medical field embeddings for intelligent form extraction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">What does this do?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Creates vector embeddings for all 200+ medical form fields</li>
                  <li>• Enables intelligent field recognition from multilingual conversations</li>
                  <li>• Improves extraction accuracy for complex medical terminology</li>
                  <li>• Supports Cantonese and English medical conversations</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            onClick={generateEmbeddings}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Medical Field Embeddings...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Initialize RAG System
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RAGSetupButton;