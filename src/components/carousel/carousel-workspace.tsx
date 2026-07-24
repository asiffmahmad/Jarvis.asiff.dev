import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Carousel } from "@/lib/carousel/types";
import { SlideEditor } from "./slide-editor";

interface Props {
  carousel: Carousel;
  activeSlideId: string;
  setActiveSlideId: (id: string) => void;
  updateSlideContent: (slideId: string, elementId: string, content: string) => void;
  reorderSlides: (oldIndex: number, newIndex: number) => void;
}

export function CarouselWorkspace({
  carousel,
  activeSlideId,
  setActiveSlideId,
  updateSlideContent,
  reorderSlides,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = carousel.slides.findIndex((s) => s.id === active.id);
      const newIndex = carousel.slides.findIndex((s) => s.id === over.id);
      reorderSlides(oldIndex, newIndex);
    }
  };

  return (
    <div className="flex-1 relative flex items-center overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing hide-scrollbar px-32 pb-16">
      <div className="flex items-center gap-16 min-w-max">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={carousel.slides.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
            {carousel.slides.map((slide, index) => (
              <SlideEditor
                key={slide.id}
                slide={slide}
                index={index}
                isActive={activeSlideId === slide.id}
                onSelect={() => setActiveSlideId(slide.id)}
                updateContent={(elId, content) => updateSlideContent(slide.id, elId, content)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
