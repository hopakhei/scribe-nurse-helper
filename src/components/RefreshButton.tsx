import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useExternalDataPopulation } from "@/hooks/useExternalDataPopulation";

interface RefreshButtonProps {
  assessmentId: string;
  patientId: string;
}

export function RefreshButton({ assessmentId, patientId }: RefreshButtonProps) {
  const { refreshExternalData, isLoading } = useExternalDataPopulation();

  const handleRefresh = async () => {
    await refreshExternalData(assessmentId, patientId);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isLoading}
      className="ml-2"
    >
      <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Syncing...' : 'Refresh'}
    </Button>
  );
}