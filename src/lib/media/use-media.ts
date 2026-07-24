import { useState, useCallback, useMemo } from "react";
import type { Asset, Folder } from "./types";

const MOCK_ASSETS: Asset[] = [
  {
    id: "asset-1",
    name: "Hero_Background.png",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    type: "image",
    sizeBytes: 2048000,
    createdAt: new Date().toISOString(),
    folderId: null,
    tags: ["background", "abstract"],
    metadata: {
      width: 2564,
      height: 1709,
    },
  },
  {
    id: "asset-2",
    name: "AI_Generated_City.webp",
    url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2574&auto=format&fit=crop",
    type: "image",
    sizeBytes: 1024000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    folderId: "folder-1",
    tags: ["city", "ai-generated"],
    metadata: {
      width: 1024,
      height: 1024,
      aiPrompt: "A futuristic neon city at night, highly detailed, 8k, cyberpunk style",
      model: "Stable Diffusion XL",
    },
  },
];

const MOCK_FOLDERS: Folder[] = [
  {
    id: "folder-1",
    name: "AI Generations",
    parentId: null,
    createdAt: new Date().toISOString(),
  },
];

export function useMedia() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [folders] = useState<Folder[]>(MOCK_FOLDERS);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const activeAssets = useMemo(() => {
    let filtered = assets;

    if (currentFolderId !== null) {
      filtered = filtered.filter((a) => a.folderId === currentFolderId);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.metadata?.aiPrompt?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [assets, currentFolderId, searchQuery]);

  const activeFolders = useMemo(() => {
    if (searchQuery) return []; // Hide folders when searching
    return folders.filter((f) => f.parentId === currentFolderId);
  }, [folders, currentFolderId, searchQuery]);

  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: "All Assets" }];
    let currentId = currentFolderId;
    const path = [];
    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return [...crumbs, ...path];
  }, [folders, currentFolderId]);

  const uploadAsset = useCallback((files: File[]) => {
    // Mock upload logic
    const newAssets: Asset[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "document",
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
      folderId: currentFolderId,
      tags: [],
    }));

    setAssets((prev) => [...newAssets, ...prev]);
  }, [currentFolderId]);

  const deleteAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (selectedAssetId === id) setSelectedAssetId(null);
  }, [selectedAssetId]);

  return {
    assets,
    folders,
    activeAssets,
    activeFolders,
    breadcrumbs,
    currentFolderId,
    setCurrentFolderId,
    searchQuery,
    setSearchQuery,
    selectedAssetId,
    setSelectedAssetId,
    uploadAsset,
    deleteAsset,
  };
}
