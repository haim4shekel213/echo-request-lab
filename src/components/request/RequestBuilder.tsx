import { useState } from "react";
import { PostmanRequest, HttpMethod, PostmanHeader, PostmanAuth } from "@/types/postman";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestBuilderProps {
  request: PostmanRequest | null;
  onRequestChange: (request: PostmanRequest) => void;
  onExecuteRequest: (request: PostmanRequest) => void;
  onSaveRequest: () => void;
  isExecuting?: boolean;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

function getMethodColor(method: HttpMethod): string {
  const colors = {
    GET: "bg-http-get text-white",
    POST: "bg-http-post text-white",
    PUT: "bg-http-put text-white",
    DELETE: "bg-http-delete text-white",
    PATCH: "bg-http-patch text-white",
    HEAD: "bg-muted text-muted-foreground",
    OPTIONS: "bg-muted text-muted-foreground"
  };
  return colors[method] || "bg-muted text-muted-foreground";
}

export function RequestBuilder({ 
  request, 
  onRequestChange, 
  onExecuteRequest,
  onSaveRequest,
  isExecuting = false 
}: RequestBuilderProps) {
  const [activeTab, setActiveTab] = useState("body");

  if (!request) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Select a request</h3>
          <p className="text-sm">Choose a request from the collection to get started</p>
        </div>
      </div>
    );
  }

  const url = typeof request.url === 'string' ? request.url : request.url.raw;
  const headers = request.header || [];

  const updateRequest = (updates: Partial<PostmanRequest>) => {
    onRequestChange({ ...request, ...updates });
  };

  const updateUrl = (newUrl: string) => {
    updateRequest({ url: newUrl });
  };

  const updateMethod = (method: HttpMethod) => {
    updateRequest({ method });
  };

  const updateHeaders = (newHeaders: PostmanHeader[]) => {
    updateRequest({ header: newHeaders });
  };

  const updateBody = (body: string) => {
    updateRequest({ 
      body: { 
        mode: 'raw', 
        raw: body,
        options: { raw: { language: 'json' } }
      } 
    });
  };

  const updateAuth = (auth: PostmanAuth) => {
    updateRequest({ auth });
  };

  const addHeader = () => {
    const newHeaders = [...headers, { key: '', value: '', type: 'text' }];
    updateHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    updateHeaders(newHeaders);
  };

  const updateHeader = (index: number, field: keyof PostmanHeader, value: string | boolean) => {
    const newHeaders = headers.map((header, i) => 
      i === index ? { ...header, [field]: value } : header
    );
    updateHeaders(newHeaders);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Request URL Bar */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-2">
          <Select value={request.method} onValueChange={updateMethod}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  <Badge className={cn("text-xs", getMethodColor(method))}>
                    {method}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={url}
            onChange={(e) => updateUrl(e.target.value)}
            placeholder="Enter request URL"
            className="flex-1"
          />

          <Button 
            onClick={onSaveRequest}
            variant="outline"
            className="px-4"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Button 
            onClick={() => onExecuteRequest(request)}
            disabled={isExecuting}
            className="px-6"
          >
            {isExecuting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Send</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Request Configuration Tabs */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="m-4 mb-0">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="auth">Authorization</TabsTrigger>
            <TabsTrigger value="params">Params</TabsTrigger>
          </TabsList>

          <div className="flex-1 p-4">
            <TabsContent value="body" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Request Body</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <Textarea
                    value={request.body?.raw || ''}
                    onChange={(e) => updateBody(e.target.value)}
                    placeholder='{\n  "key": "value"\n}'
                    className="h-96 font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="headers">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Headers</CardTitle>
                  <Button variant="outline" size="sm" onClick={addHeader}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Header
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {headers.map((header, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={header.key}
                          onChange={(e) => updateHeader(index, 'key', e.target.value)}
                          placeholder="Header name"
                          className="flex-1"
                        />
                        <Input
                          value={header.value}
                          onChange={(e) => updateHeader(index, 'value', e.target.value)}
                          placeholder="Header value"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeader(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {headers.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-8">
                        No headers added yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Authorization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Auth Type</Label>
                      <Select 
                        value={request.auth?.type || 'noauth'} 
                        onValueChange={(type: 'noauth' | 'bearer' | 'oauth2') => 
                          updateAuth({ type, ...(type === 'noauth' ? {} : request.auth || {}) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="noauth">No Auth</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                          <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {request.auth?.type === 'bearer' && (
                      <div>
                        <Label>Token</Label>
                        <Input
                          value={request.auth.bearer?.[0]?.value || ''}
                          onChange={(e) => updateAuth({
                            type: 'bearer',
                            bearer: [{ key: 'token', value: e.target.value, type: 'string' }]
                          })}
                          placeholder="Enter bearer token"
                          type="password"
                        />
                      </div>
                    )}

                    {request.auth?.type === 'oauth2' && (
                      <div className="space-y-3">
                        <div>
                          <Label>Client ID</Label>
                          <Input
                            value={request.auth.oauth2?.find(o => o.key === 'clientId')?.value || ''}
                            onChange={(e) => {
                              const oauth2 = request.auth?.oauth2 || [];
                              const updated = oauth2.filter(o => o.key !== 'clientId');
                              updated.push({ key: 'clientId', value: e.target.value, type: 'string' });
                              updateAuth({ type: 'oauth2', oauth2: updated });
                            }}
                            placeholder="Enter client ID"
                          />
                        </div>
                        <div>
                          <Label>Client Secret</Label>
                          <Input
                            value={request.auth.oauth2?.find(o => o.key === 'clientSecret')?.value || ''}
                            onChange={(e) => {
                              const oauth2 = request.auth?.oauth2 || [];
                              const updated = oauth2.filter(o => o.key !== 'clientSecret');
                              updated.push({ key: 'clientSecret', value: e.target.value, type: 'string' });
                              updateAuth({ type: 'oauth2', oauth2: updated });
                            }}
                            placeholder="Enter client secret"
                            type="password"
                          />
                        </div>
                        <div>
                          <Label>Access Token URL</Label>
                          <Input
                            value={request.auth.oauth2?.find(o => o.key === 'accessTokenUrl')?.value || ''}
                            onChange={(e) => {
                              const oauth2 = request.auth?.oauth2 || [];
                              const updated = oauth2.filter(o => o.key !== 'accessTokenUrl');
                              updated.push({ key: 'accessTokenUrl', value: e.target.value, type: 'string' });
                              updateAuth({ type: 'oauth2', oauth2: updated });
                            }}
                            placeholder="Enter token endpoint URL"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="params">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Query Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Query parameters will be automatically parsed from the URL
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}