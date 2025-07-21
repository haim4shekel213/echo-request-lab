// Postman Collection v2.1.0 Types

export interface PostmanCollection {
  info: {
    _postman_id: string;
    name: string;
    schema: string;
    _exporter_id?: string;
  };
  item: PostmanItem[];
}

export interface PostmanItem {
  name: string;
  item?: PostmanItem[]; // For folders
  request?: PostmanRequest;
  response?: any[];
  protocolProfileBehavior?: any;
}

export interface PostmanRequest {
  auth?: PostmanAuth;
  method: HttpMethod;
  header?: PostmanHeader[];
  body?: PostmanBody;
  url: PostmanUrl | string;
}

export interface PostmanAuth {
  type: 'noauth' | 'bearer' | 'oauth2';
  bearer?: { key: string; value: string; type: string }[];
  oauth2?: { key: string; value: string; type: string }[];
}

export interface PostmanHeader {
  key: string;
  value: string;
  type?: string;
  disabled?: boolean;
}

export interface PostmanBody {
  mode: 'raw' | 'formdata' | 'urlencoded';
  raw?: string;
  options?: {
    raw?: {
      language?: string;
    };
  };
}

export interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  port?: string;
  path?: string[];
  query?: { key: string; value: string }[];
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Request execution types
export interface RequestExecution {
  id: string;
  request: PostmanRequest;
  response?: ResponseData;
  status: 'pending' | 'success' | 'error';
  timestamp: number;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  size: number;
}

// UI State types
export interface CollectionState {
  collections: PostmanCollection[];
  activeCollection: string | null;
  activeRequest: string | null;
  selectedItem: PostmanItem | null;
}

export interface RequestBuilderState {
  method: HttpMethod;
  url: string;
  headers: PostmanHeader[];
  body: string;
  auth: PostmanAuth;
}