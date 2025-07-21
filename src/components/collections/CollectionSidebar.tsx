import { useState } from "react";
import { PostmanCollection, PostmanItem, HttpMethod } from "@/types/postman";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileText, 
  Plus,
  MoreHorizontal,
  Trash2,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CollectionSidebarProps {
  collections: PostmanCollection[];
  activeRequest: string | null;
  onSelectRequest: (collection: PostmanCollection, item: PostmanItem) => void;
  onCreateCollection: () => void;
  onDeleteCollection: (collectionId: string) => void;
  onCreateRequest: (collectionId: string, parentPath?: string) => void;
  onDeleteRequest: (collectionId: string, requestPath: string) => void;
}

interface CollectionItemProps {
  item: PostmanItem;
  level: number;
  path: string;
  isActive: boolean;
  onSelect: () => void;
  onCreateRequest: (parentPath: string) => void;
  onDeleteRequest: (requestPath: string) => void;
}

function getMethodColor(method: HttpMethod): string {
  const colors = {
    GET: "text-http-get",
    POST: "text-http-post", 
    PUT: "text-http-put",
    DELETE: "text-http-delete",
    PATCH: "text-http-patch",
    HEAD: "text-muted-foreground",
    OPTIONS: "text-muted-foreground"
  };
  return colors[method] || "text-muted-foreground";
}

function CollectionItemComponent({ 
  item, 
  level, 
  path,
  isActive, 
  onSelect, 
  onCreateRequest,
  onDeleteRequest
}: CollectionItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);

  const isFolder = !!item.item;
  const hasChildren = isFolder && item.item && item.item.length > 0;

  const handleRename = () => {
    setIsRenaming(false);
    // TODO: Implement rename functionality
  };

  return (
    <div>
      <div 
        className={cn(
          "flex items-center py-1 px-2 mx-1 rounded cursor-pointer hover:bg-accent group",
          isActive && "bg-accent text-accent-foreground",
          !isFolder && "pl-" + ((level + 1) * 4)
        )}
        style={{ paddingLeft: isFolder ? `${level * 16 + 8}px` : `${(level + 1) * 16 + 8}px` }}
        onClick={isFolder ? () => setIsExpanded(!isExpanded) : onSelect}
      >
        {isFolder && (
          <div className="flex items-center mr-1">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>
        )}

        <div className="flex items-center mr-2">
          {isFolder ? (
            <Folder className="h-4 w-4 text-muted-foreground" />
          ) : (
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {item.request && (
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  getMethodColor(item.request.method)
                )}>
                  {item.request.method}
                </span>
              )}
            </div>
          )}
        </div>

        {isRenaming ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setIsRenaming(false);
                setNewName(item.name);
              }
            }}
            className="h-6 text-sm flex-1"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm truncate">{item.name}</span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isFolder && (
              <DropdownMenuItem onClick={() => onCreateRequest(path)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Request
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDeleteRequest(path)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isFolder && isExpanded && item.item && (
        <div>
          {item.item.map((child, index) => (
            <CollectionItemComponent
              key={index}
              item={child}
              level={level + 1}
              path={`${path}.${index}`}
              isActive={false} // TODO: Implement proper active state
              onSelect={() => {}} // TODO: Implement proper selection
              onCreateRequest={onCreateRequest}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CollectionSidebar({
  collections,
  activeRequest,
  onSelectRequest,
  onCreateCollection,
  onDeleteCollection,
  onCreateRequest,
  onDeleteRequest,
}: CollectionSidebarProps) {
  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-sidebar-foreground">Collections</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateCollection}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {collections.map((collection) => (
          <div key={collection.info._postman_id} className="py-2">
            <div className="px-4 mb-2">
              <div className="flex items-center justify-between group">
                <h3 className="text-sm font-medium text-sidebar-foreground">
                  {collection.info.name}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onCreateRequest(collection.info._postman_id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Request
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteCollection(collection.info._postman_id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {collection.item.map((item, index) => (
              <CollectionItemComponent
                key={index}
                item={item}
                level={0}
                path={`${collection.info._postman_id}.${index}`}
                isActive={false} // TODO: Implement proper active state
                onSelect={() => onSelectRequest(collection, item)}
                onCreateRequest={(parentPath) => onCreateRequest(collection.info._postman_id, parentPath)}
                onDeleteRequest={(requestPath) => onDeleteRequest(collection.info._postman_id, requestPath)}
              />
            ))}
          </div>
        ))}

        {collections.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No collections yet</p>
            <p className="text-xs mt-1">Import a collection or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}