import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExternalDataPopulationResult {
  success: boolean;
  results: {
    opas: any;
    evital: any;
    previousAssessment: any;
    alertFunction: any;
    errors: Array<{ system: string; error: string }>;
  };
  populated: string;
}

export function useExternalDataPopulation() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastPopulated, setLastPopulated] = useState<string | null>(null);
  const { toast } = useToast();

  const populateExternalData = async (assessmentId: string, patientId: string) => {
    setIsLoading(true);
    
    try {
      console.log('Populating external data for assessment:', assessmentId, 'patient:', patientId);
      
      const { data, error } = await supabase.functions.invoke('populate-external-data', {
        body: { assessmentId, patientId }
      });

      if (error) {
        console.error('Error calling populate-external-data:', error);
        toast({
          title: "External Data Error",
          description: "Failed to retrieve external data. Please try again.",
          variant: "destructive"
        });
        return null;
      }

      const result = data as ExternalDataPopulationResult;
      
      if (result.success) {
        setLastPopulated(result.populated);
        
        // Show success toast with details
        const successSystems = [];
        if (result.results.opas) successSystems.push('OPAS');
        if (result.results.evital) successSystems.push('eVital');
        if (result.results.previousAssessment) successSystems.push('History');
        if (result.results.alertFunction) successSystems.push('Alert Function');
        
        if (successSystems.length > 0) {
          toast({
            title: "External Data Loaded",
            description: `Successfully retrieved data from: ${successSystems.join(', ')}`,
            variant: "default"
          });
        }

        // Show error toast for failed systems
        if (result.results.errors.length > 0) {
          const errorSystems = result.results.errors.map(e => e.system).join(', ');
          toast({
            title: "Partial Data Retrieval",
            description: `Some systems failed: ${errorSystems}`,
            variant: "destructive"
          });
        }
      }

      return result;
      
    } catch (error) {
      console.error('Error in useExternalDataPopulation:', error);
      toast({
        title: "External Data Error",
        description: "An unexpected error occurred while retrieving external data.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshExternalData = async (assessmentId: string, patientId: string) => {
    return await populateExternalData(assessmentId, patientId);
  };

  return {
    populateExternalData,
    refreshExternalData,
    isLoading,
    lastPopulated
  };
}