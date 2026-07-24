import { motion } from "framer-motion";
import { Info, Tag, History, Download, Trash2, SlidersHorizontal } from "lucide-react";
import type { useMedia } from "@/lib/media/use-media";

interface Props {
  mediaState: ReturnType<typeof useMedia>;
}

export function MediaSidebarRight({ mediaState }: Props) {
  const { assets, selectedAssetId, deleteAsset } = mediaState;
  
  const asset = assets.find((a) => a.id === selectedAssetId);

  return (
    <motion.aside
      initial={{ x: 260 }}
      animate={{ x: 0 }}
      className="w-[280px] flex-shrink-0 h-full border-l border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading text-sm font-bold tracking-widest text-jarvis-secondary uppercase text-glow">
          Asset Info
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!asset ? (
          <div className="h-full flex items-center justify-center p-6 text-center text-sm text-jarvis-text-muted/50">
            Select an asset to view details and metadata.
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Preview Mini */}
            <div className="aspect-square w-full rounded-xl overflow-hidden border border-jarvis-panel-border bg-jarvis-bg-deepest relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt={asset.name} className="object-cover w-full h-full" />
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Info className="size-3" /> File Name
                </label>
                <div className="text-sm text-jarvis-text truncate" title={asset.name}>{asset.name}</div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <SlidersHorizontal className="size-3" /> Details
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs text-jarvis-text">
                  <div><span className="text-jarvis-text-muted">Type:</span> {asset.type.toUpperCase()}</div>
                  <div><span className="text-jarvis-text-muted">Size:</span> {(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB</div>
                  {asset.metadata?.width && (
                    <div className="col-span-2">
                      <span className="text-jarvis-text-muted">Resolution:</span> {asset.metadata.width} x {asset.metadata.height}
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-jarvis-text-muted">Added:</span> {new Date(asset.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[10px] font-semibold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Tag className="size-3" /> Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-jarvis-panel border border-jarvis-panel-border rounded text-xs text-jarvis-text-muted">
                      {tag}
                    </span>
                  ))}
                  <button className="px-2 py-1 bg-transparent border border-dashed border-jarvis-panel-border hover:border-jarvis-secondary rounded text-xs text-jarvis-text-muted transition-colors">
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Prompt Info if AI Generated */}
              {asset.metadata?.aiPrompt && (
                <div>
                  <label className="text-[10px] font-semibold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <History className="size-3" /> Generation Prompt
                  </label>
                  <div className="p-3 bg-jarvis-panel/30 border border-jarvis-panel-border/50 rounded-lg text-xs text-jarvis-text-muted italic">
                    &quot;{asset.metadata.aiPrompt}&quot;
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="pt-4 border-t border-jarvis-panel-border/30 grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 py-2 bg-jarvis-panel hover:bg-jarvis-panel-border rounded-lg text-sm text-jarvis-text transition-colors">
                <Download className="size-4" /> Download
              </button>
              <button 
                onClick={() => deleteAsset(asset.id)}
                className="flex items-center justify-center gap-2 py-2 bg-jarvis-danger/10 hover:bg-jarvis-danger/20 text-jarvis-danger rounded-lg text-sm transition-colors"
              >
                <Trash2 className="size-4" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
