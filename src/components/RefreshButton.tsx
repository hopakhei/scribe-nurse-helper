import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useExternalDataPopulation } from "@/hooks/useExternalDataPopulation";

interface RefreshButtonProps {
  assessmentId: string;
  patientId: string;
  externalIsLoading?: boolean;
  onRefreshComplete?: () => void;
}

export function RefreshButton({ assessmentId, patientId, externalIsLoading, onRefreshComplete }: RefreshButtonProps) {
  const { refreshExternalData, isLoading } = useExternalDataPopulation();

  const handleRefresh = async () => {
    await refreshExternalData(assessmentId, patientId);
    if (onRefreshComplete) {
      onRefreshComplete();
    }
  };

  const isAnySyncing = isLoading || externalIsLoading;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isAnySyncing}
      className="ml-2"
    >
      <RefreshCw className={`h-4 w-4 mr-1 ${isAnySyncing ? 'animate-spin' : ''}`} />
      {isAnySyncing ? 'Syncing...' : 'Refresh'}
    </Button>
  );
}