import { useState, useRef } from "react";
import { Search, ChevronRight, UploadCloud } from "lucide-react";
import type { useMedia } from "@/lib/media/use-media";
import { AssetCard } from "./asset-card";

interface Props {
  mediaState: ReturnType<typeof useMedia>;
}

export function MediaWorkspace({ mediaState }: Props) {
  const { activeAssets, breadcrumbs, searchQuery, setSearchQuery, selectedAssetId, setSelectedAssetId, uploadAsset } = mediaState;
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadAsset(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col relative h-full bg-jarvis-bg-deepest/50"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Header & Breadcrumbs */}
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center justify-between px-6 shrink-0 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.id || idx} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight className="size-4 text-jarvis-text-muted" />}
              <span className={`font-semibold tracking-wide ${idx === breadcrumbs.length - 1 ? "text-jarvis-text" : "text-jarvis-text-muted hover:text-jarvis-text cursor-pointer transition-colors"}`}>
                {crumb.name}
              </span>
            </div>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-jarvis-text-muted" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-jarvis-panel/40 border border-jarvis-panel-border rounded-full pl-9 pr-4 py-1.5 text-sm text-jarvis-text placeholder-jarvis-text-muted focus:outline-none focus:border-jarvis-primary/50 focus:ring-1 focus:ring-jarvis-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="flex-1 overflow-y-auto p-6" onClick={() => setSelectedAssetId(null)}>
        {activeAssets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
            <UploadCloud className="size-16 mb-4" />
            <p className="text-lg font-heading tracking-widest">No assets found</p>
            <p className="text-sm mt-2">Drag and drop files here to upload</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {activeAssets.map((asset) => (
              <div key={asset.id} onClick={(e) => e.stopPropagation()}>
                <AssetCard 
                  asset={asset} 
                  isSelected={selectedAssetId === asset.id}
                  onSelect={() => setSelectedAssetId(asset.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-jarvis-bg-deepest/80 backdrop-blur-sm border-2 border-dashed border-jarvis-primary flex flex-col items-center justify-center">
          <UploadCloud className="size-20 text-jarvis-primary animate-bounce shadow-jarvis-primary drop-shadow-[0_0_15px_rgba(52,245,208,0.8)]" />
          <h3 className="font-heading text-2xl mt-4 text-jarvis-text tracking-widest uppercase text-glow">Drop Files to Upload</h3>
        </div>
      )}

      {/* Hidden File Input for Toolbar use */}
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files) uploadAsset(Array.from(e.target.files));
        }}
      />
    </div>
  );
}
