import { useState, useEffect } from "react";
import { PostmanCollection, PostmanItem, PostmanRequest, ResponseData } from "@/types/postman";

const STORAGE_KEY = "postapi_collections";

// Sample collection data
const sampleCollection: PostmanCollection = {
  info: {
    _postman_id: "sample-collection-1",
    name: "Sample API Collection",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    _exporter_id: "sample-exporter"
  },
  item: [
    {
      name: "Users",
      item: [
        {
          name: "Get All Users",
          request: {
            method: "GET",
            header: [
              {
                key: "Content-Type",
                value: "application/json",
                type: "text"
              }
            ],
            url: "https://jsonplaceholder.typicode.com/users"
          },
          response: []
        },
        {
          name: "Create User",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json",
                type: "text"
              }
            ],
            body: {
              mode: "raw",
              raw: "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"phone\": \"1-770-736-8031 x56442\"\n}",
              options: {
                raw: {
                  language: "json"
                }
              }
            },
            url: "https://jsonplaceholder.typicode.com/users"
          },
          response: []
        }
      ]
    },
    {
      name: "Posts",
      item: [
        {
          name: "Get All Posts",
          request: {
            method: "GET",
            header: [],
            url: "https://jsonplaceholder.typicode.com/posts"
          },
          response: []
        },
        {
          name: "Get Post by ID",
          request: {
            method: "GET",
            header: [],
            url: "https://jsonplaceholder.typicode.com/posts/1"
          },
          response: []
        }
      ]
    }
  ]
};

export function useCollections() {
  const [collections, setCollections] = useState<PostmanCollection[]>([]);
  const [activeRequest, setActiveRequest] = useState<PostmanRequest | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResponse, setLastResponse] = useState<ResponseData | null>(null);

  // Load collections from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedCollections = JSON.parse(stored);
        setCollections(parsedCollections);
      } catch (error) {
        console.error("Failed to parse stored collections:", error);
        setCollections([sampleCollection]);
      }
    } else {
      setCollections([sampleCollection]);
    }
  }, []);

  // Save collections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  }, [collections]);

  const importCollection = (collectionJson: string) => {
    try {
      const collection: PostmanCollection = JSON.parse(collectionJson);
      setCollections(prev => [...prev, collection]);
      return true;
    } catch (error) {
      console.error("Failed to import collection:", error);
      return false;
    }
  };

  const exportCollections = () => {
    return JSON.stringify(collections, null, 2);
  };

  const createCollection = (name: string) => {
    const newCollection: PostmanCollection = {
      info: {
        _postman_id: `collection-${Date.now()}`,
        name,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: []
    };
    setCollections(prev => [...prev, newCollection]);
  };

  const deleteCollection = (collectionId: string) => {
    setCollections(prev => prev.filter(c => c.info._postman_id !== collectionId));
  };

  const createRequest = (collectionId: string, parentPath?: string) => {
    const newRequest: PostmanItem = {
      name: "New Request",
      request: {
        method: "GET",
        header: [],
        url: "https://api.example.com/endpoint"
      },
      response: []
    };

    setCollections(prev => prev.map(collection => {
      if (collection.info._postman_id === collectionId) {
        if (!parentPath) {
          return {
            ...collection,
            item: [...collection.item, newRequest]
          };
        }
        // TODO: Handle nested creation in folders
        return collection;
      }
      return collection;
    }));
  };

  const deleteRequest = (collectionId: string, requestPath: string) => {
    // TODO: Implement request deletion
    console.log("Delete request:", collectionId, requestPath);
  };

  const selectRequest = (collection: PostmanCollection, item: PostmanItem) => {
    if (item.request) {
      setActiveRequest(item.request);
      setLastResponse(null);
    }
  };

  const updateActiveRequest = (request: PostmanRequest) => {
    setActiveRequest(request);
    
    // Save the updated request back to the collection
    if (activeRequest) {
      setCollections(prev => prev.map(collection => ({
        ...collection,
        item: updateRequestInItems(collection.item, request)
      })));
    }
  };

  const updateRequestInItems = (items: PostmanItem[], updatedRequest: PostmanRequest): PostmanItem[] => {
    return items.map(item => {
      if (item.request && 
          item.request.method === activeRequest?.method && 
          (typeof item.request.url === 'string' ? item.request.url : item.request.url?.raw) === 
          (typeof activeRequest?.url === 'string' ? activeRequest.url : activeRequest?.url?.raw)) {
        return { ...item, request: updatedRequest };
      }
      if (item.item) {
        return { ...item, item: updateRequestInItems(item.item, updatedRequest) };
      }
      return item;
    });
  };

  const executeRequest = async (request: PostmanRequest) => {
    setIsExecuting(true);
    const startTime = Date.now();

    try {
      const url = typeof request.url === 'string' ? request.url : request.url.raw;
      
      // Prepare headers
      const headers: Record<string, string> = {};
      request.header?.forEach(header => {
        if (!header.disabled && header.key && header.value) {
          headers[header.key] = header.value;
        }
      });

      // Add authorization header
      if (request.auth?.type === 'bearer' && request.auth.bearer?.[0]?.value) {
        headers.Authorization = `Bearer ${request.auth.bearer[0].value}`;
      }

      // Prepare request options
      const options: RequestInit = {
        method: request.method,
        headers,
      };

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body?.raw) {
        options.body = request.body.raw;
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }

      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;

      // Get response data
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Calculate response size (approximate)
      const responseSize = new Blob([JSON.stringify(data)]).size;

      const responseData: ResponseData = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
        responseTime,
        size: responseSize
      };

      setLastResponse(responseData);
    } catch (error) {
      const errorResponse: ResponseData = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        responseTime: Date.now() - startTime,
        size: 0
      };
      setLastResponse(errorResponse);
    } finally {
      setIsExecuting(false);
    }
  };

  return {
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
  };
}