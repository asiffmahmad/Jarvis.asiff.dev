import type { Asset } from "@/lib/media/types";
import { Check } from "lucide-react";

interface Props {
  asset: Asset;
  isSelected: boolean;
  onSelect: () => void;
}

export function AssetCard({ asset, isSelected, onSelect }: Props) {
  return (
    <div 
      onClick={onSelect}
      className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300
        ${isSelected 
          ? "ring-2 ring-jarvis-primary shadow-[0_0_20px_rgba(52,245,208,0.2)]" 
          : "ring-1 ring-jarvis-panel-border hover:ring-jarvis-text-muted/50"
        }
      `}
    >
      {/* Background checkerboard for transparency */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMWExYjFmIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMWExYjFmIiAvPgo8L3N2Zz4=')] opacity-50" />
      
      {/* Asset Preview */}
      <div className="absolute inset-0 flex items-center justify-center bg-jarvis-bg-deepest/50">
        {asset.type === "image" ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="text-jarvis-text-muted font-heading tracking-widest text-xs uppercase">{asset.type}</div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 size-6 bg-jarvis-primary rounded-full flex items-center justify-center text-black">
          <Check className="size-4" />
        </div>
      )}

      {/* Details */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 translate-y-2 transition-all duration-300 ${isSelected ? "translate-y-0 opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-y-0"}`}>
        <p className="text-white text-xs font-medium truncate">{asset.name}</p>
        <p className="text-jarvis-text-muted text-[10px] mt-0.5">{(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
      </div>
    </div>
  );
}
