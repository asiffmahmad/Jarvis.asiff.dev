import { useState, useEffect, useMemo, useCallback } from "react";
import { KnowledgeService } from "./knowledge-service";
import type { KnowledgeItem, Folder, Tag, ItemType } from "./types";

export type KnowledgeState = ReturnType<typeof useKnowledge>;

export function useKnowledge() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Navigation State
  const [selectedView, setSelectedView] = useState<ItemType | "ALL" | "FAVORITES" | "ARCHIVE">("ALL");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Editor State
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const service = useMemo(() => KnowledgeService.getInstance(), []);

  const refresh = useCallback(() => {
    setItems(service.getItems());
    setFolders(service.getFolders());
    setTags(service.getTags());
  }, [service]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const unsubscribe = service.subscribe(() => { refresh(); });
    return () => { unsubscribe(); };
  }, [service, refresh]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter by Folder
    if (selectedFolderId) {
      result = result.filter(i => i.folderId === selectedFolderId);
    }

    // Filter by View
    if (selectedView === "FAVORITES") {
      result = result.filter(i => i.isFavorite);
    } else if (selectedView === "ARCHIVE") {
      result = result.filter(i => i.isArchived);
    } else if (selectedView !== "ALL") {
      result = result.filter(i => i.type === selectedView && !i.isArchived);
    } else {
      // ALL view hides archived
      result = result.filter(i => !i.isArchived);
    }

    // Search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.content.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, selectedView, selectedFolderId, searchQuery]);

  const activeItem = useMemo(() => items.find(i => i.id === activeItemId) || null, [items, activeItemId]);

  return {
    // Data
    items: filteredItems,
    folders,
    tags,
    activeItem,
    
    // State
    selectedView,
    setSelectedView,
    selectedFolderId,
    setSelectedFolderId,
    searchQuery,
    setSearchQuery,
    activeItemId,
    setActiveItemId,

    // Actions
    saveItem: (item: KnowledgeItem) => service.saveItem(item),
    deleteItem: (id: string) => {
      service.deleteItem(id);
      if (activeItemId === id) setActiveItemId(null);
    },
    toggleFavorite: (id: string) => service.toggleFavorite(id),
    createNote: () => {
      const newItem: KnowledgeItem = {
        id: `item_${Date.now()}`,
        type: "NOTE",
        title: "Untitled Note",
        content: "",
        folderId: selectedFolderId,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        isArchived: false,
      };
      service.saveItem(newItem);
      setActiveItemId(newItem.id);
    },
    addFolder: (name: string) => service.addFolder(name)
  };
}
