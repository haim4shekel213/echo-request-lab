import { useState } from "react";
import { ResponseData } from "@/types/postman";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Clock, Download, FileText } from "lucide-react";

interface ResponseViewerProps {
  response: ResponseData | null;
  isLoading?: boolean;
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "bg-success text-success-foreground";
  if (status >= 300 && status < 400) return "bg-warning text-warning-foreground";
  if (status >= 400) return "bg-destructive text-destructive-foreground";
  return "bg-muted text-muted-foreground";
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatJson(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export function ResponseViewer({ response, isLoading = false }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState("pretty");

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Sending request...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No response yet</h3>
          <p className="text-sm">Send a request to see the response here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Response Status Bar */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge className={cn("px-3 py-1", getStatusColor(response.status))}>
              {response.status} {response.statusText}
            </Badge>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{response.responseTime}ms</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Download className="h-4 w-4" />
              <span>{formatSize(response.size)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Response Content Tabs */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="m-4 mb-0">
            <TabsTrigger value="pretty">Pretty</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </TabsList>

          <div className="flex-1 p-4">
            <TabsContent value="pretty" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Response Body</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <ScrollArea className="h-96 w-full">
                    <pre className="text-sm font-mono bg-editor-background p-4 rounded border border-editor-border">
                      <code className="language-json">
                        {formatJson(response.data)}
                      </code>
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="raw" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Raw Response</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <ScrollArea className="h-96 w-full">
                    <pre className="text-sm font-mono bg-editor-background p-4 rounded border border-editor-border whitespace-pre-wrap">
                      {typeof response.data === 'string' ? response.data : formatJson(response.data)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="headers">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Response Headers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border last:border-b-0">
                        <span className="font-medium text-sm">{key}</span>
                        <span className="text-sm text-muted-foreground font-mono">{value}</span>
                      </div>
                    ))}
                    {Object.keys(response.headers).length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-8">
                        No headers received
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}