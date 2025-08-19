import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
interface FormSection {
  id: string;
  title: string;
  completed: boolean;
}
interface FormNavigationProps {
  sections: FormSection[];
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
}
export function FormNavigation({
  sections,
  currentSection,
  onSectionChange
}: FormNavigationProps) {
  const currentIndex = sections.findIndex(s => s.id === currentSection);
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSectionChange(sections[currentIndex - 1].id);
    }
  };
  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      onSectionChange(sections[currentIndex + 1].id);
    }
  };
  return <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Page {currentIndex + 1} of {sections.length}
          </span>
        </div>
        
        
      </div>
      
      <div className="flex flex-wrap gap-2">
        {sections.map((section, index) => <Button key={section.id} variant={section.id === currentSection ? "default" : "outline"} size="sm" onClick={() => onSectionChange(section.id)} className="flex items-center space-x-1 text-xs">
            <span>{index + 1}. {section.title}</span>
          </Button>)}
      </div>
    </Card>;
}