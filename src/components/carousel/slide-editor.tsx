import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CarouselSlide } from "@/lib/carousel/types";
import { GripVertical } from "lucide-react";

interface Props {
  slide: CarouselSlide;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  updateContent: (elementId: string, content: string) => void;
}

export function SlideEditor({ slide, index, isActive, onSelect, updateContent }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: slide.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`relative w-[400px] shrink-0 aspect-square rounded-[20px] p-8 flex flex-col transition-all duration-300 group
        ${
          isActive
            ? "ring-2 ring-jarvis-primary shadow-[0_0_30px_rgba(52,245,208,0.2)] bg-jarvis-panel"
            : "ring-1 ring-jarvis-panel-border bg-jarvis-panel/50 hover:ring-jarvis-text-muted hover:bg-jarvis-panel/80"
        }
      `}
    >
      {/* Slide number indicator */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-jarvis-text-muted font-heading tracking-widest text-sm opacity-50">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-jarvis-text-muted hover:text-jarvis-primary transition-all"
      >
        <GripVertical className="size-5" />
      </div>

      {/* Slide Content Editor MVP */}
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        {slide.elements.map((el) => {
          if (el.type === "title") {
            return (
              <textarea
                key={el.id}
                value={el.content}
                onChange={(e) => updateContent(el.id, e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none text-center font-heading text-3xl font-bold text-jarvis-text placeholder-jarvis-text-muted/50 focus:ring-0 break-words"
                placeholder="Slide Title"
                rows={3}
              />
            );
          }
          if (el.type === "paragraph") {
            return (
              <textarea
                key={el.id}
                value={el.content}
                onChange={(e) => updateContent(el.id, e.target.value)}
                className="w-full mt-4 bg-transparent border-none outline-none resize-none text-center font-body text-base text-jarvis-text-muted placeholder-jarvis-text-muted/30 focus:ring-0"
                placeholder="Write your text here..."
                rows={5}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
