import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskScore {
  name: string;
  score: number;
  maxScore: number;
  level: 'low' | 'medium' | 'high';
  description: string;
}

interface RiskScoreDisplayProps {
  scores: RiskScore[];
}

export function RiskScoreDisplay({ scores }: RiskScoreDisplayProps) {
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <Shield className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-risk-low text-risk-low-foreground border-risk-low-foreground/20';
      case 'medium':
        return 'bg-risk-medium text-risk-medium-foreground border-risk-medium-foreground/20';
      case 'high':
        return 'bg-risk-high text-risk-high-foreground border-risk-high-foreground/20';
      default:
        return 'bg-risk-low text-risk-low-foreground border-risk-low-foreground/20';
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
        Risk Assessment Scores
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scores.map((risk) => (
          <div
            key={risk.name}
            className={cn(
              "p-4 rounded-lg border transition-colors",
              getRiskColor(risk.level)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getRiskIcon(risk.level)}
                <span className="font-medium text-sm">{risk.name}</span>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs capitalize",
                  risk.level === 'high' && "border-destructive text-destructive",
                  risk.level === 'medium' && "border-warning text-warning",
                  risk.level === 'low' && "border-success text-success"
                )}
              >
                {risk.level}
              </Badge>
            </div>
            
            <div className="text-2xl font-bold mb-1">
              {risk.score}
              <span className="text-sm font-normal opacity-70">
                /{risk.maxScore}
              </span>
            </div>
            
            <p className="text-xs opacity-80">{risk.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}