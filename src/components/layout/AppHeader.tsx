import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileDown, Upload, Settings } from "lucide-react";

interface AppHeaderProps {
  onImportCollection: () => void;
  onExportCollection: () => void;
}

export function AppHeader({ onImportCollection, onExportCollection }: AppHeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">PostAPI</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search collections, requests..."
            className="pl-10 w-80"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onImportCollection}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Import</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCollection}
          className="flex items-center space-x-2"
        >
          <FileDown className="h-4 w-4" />
          <span>Export</span>
        </Button>
        
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}