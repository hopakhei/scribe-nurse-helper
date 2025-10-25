import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabSection {
  id: string;
  title: string;
  completed: boolean;
  hasErrors?: boolean;
  fieldsCount?: number;
  completedFields?: number;
}

interface TabNavigationProps {
  sections: TabSection[];
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
  children: React.ReactNode;
}

export function TabNavigation({
  sections,
  currentSection,
  onSectionChange,
  children
}: TabNavigationProps) {
  const getTabIndicator = (section: TabSection) => {
    if (section.hasErrors) {
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
    if (section.completed) {
      return <Check className="w-4 h-4 text-green-600" />;
    }
    if (section.completedFields && section.fieldsCount) {
      const percentage = Math.round((section.completedFields / section.fieldsCount) * 100);
      return (
        <Badge variant="secondary" className="text-xs">
          {percentage}%
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <Tabs value={currentSection} onValueChange={onSectionChange} className="w-full">
        {/* Tab List with horizontal scrolling */}
        <div className="mb-6 overflow-x-auto">
          <TabsList className="inline-flex h-auto p-1 space-x-1 bg-ward-section-blue/10 rounded-lg min-w-full">
            {sections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-all",
                  "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                  "flex-shrink-0 min-w-fit whitespace-nowrap",
                  section.hasErrors && "text-destructive",
                  section.completed && "text-green-600"
                )}
              >
                <span>{section.title}</span>
                {getTabIndicator(section)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>


        {/* Tab Content */}
        {children}
      </Tabs>
    </Card>
  );
}