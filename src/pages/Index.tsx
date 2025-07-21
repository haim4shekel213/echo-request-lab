import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { CollectionSidebar } from "@/components/collections/CollectionSidebar";
import { RequestBuilder } from "@/components/request/RequestBuilder";
import { ResponseViewer } from "@/components/response/ResponseViewer";
import { useCollections } from "@/hooks/useCollections";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const {
    collections,
    activeRequest,
    lastResponse,
    isExecuting,
    importCollection,
    exportCollections,
    createCollection,
    deleteCollection,
    createRequest,
    deleteRequest,
    selectRequest,
    updateActiveRequest,
    executeRequest
  } = useCollections();

  const { toast } = useToast();

  const handleImportCollection = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (importCollection(content)) {
            toast({
              title: "Collection imported",
              description: "The collection has been successfully imported."
            });
          } else {
            toast({
              title: "Import failed",
              description: "Failed to import the collection. Please check the file format.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportCollection = () => {
    const data = exportCollections();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postapi-collections.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Collections exported",
      description: "Your collections have been exported successfully."
    });
  };

  const handleCreateCollection = () => {
    const name = prompt("Enter collection name:");
    if (name) {
      createCollection(name);
      toast({
        title: "Collection created",
        description: `Collection "${name}" has been created.`
      });
    }
  };

  const handleDeleteCollection = (collectionId: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      deleteCollection(collectionId);
      toast({
        title: "Collection deleted",
        description: "The collection has been deleted."
      });
    }
  };

  const handleCreateRequest = (collectionId: string, parentPath?: string) => {
    createRequest(collectionId, parentPath);
    toast({
      title: "Request created",
      description: "A new request has been added to the collection."
    });
  };

  const handleDeleteRequest = (collectionId: string, requestPath: string) => {
    if (confirm("Are you sure you want to delete this request?")) {
      deleteRequest(collectionId, requestPath);
      toast({
        title: "Request deleted",
        description: "The request has been deleted."
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <AppHeader
        onImportCollection={handleImportCollection}
        onExportCollection={handleExportCollection}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <CollectionSidebar
          collections={collections}
          activeRequest={activeRequest ? "active" : null}
          onSelectRequest={selectRequest}
          onCreateCollection={handleCreateCollection}
          onDeleteCollection={handleDeleteCollection}
          onCreateRequest={handleCreateRequest}
          onDeleteRequest={handleDeleteRequest}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex">
            <RequestBuilder
              request={activeRequest}
              onRequestChange={updateActiveRequest}
              onExecuteRequest={executeRequest}
              isExecuting={isExecuting}
            />
          </div>
          
          <div className="h-1/2 border-t border-border">
            <ResponseViewer
              response={lastResponse}
              isLoading={isExecuting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
