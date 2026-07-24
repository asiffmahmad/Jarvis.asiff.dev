import { useState, useCallback } from "react";
import type { Carousel, CarouselSlide, ThemeConfig } from "./types";

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: "#34F5D0",
  secondaryColor: "#5CF5FF",
  backgroundColor: "#0D131C",
  fontHeading: "Orbitron, sans-serif",
  fontBody: "Inter, sans-serif",
};

const createEmptySlide = (): CarouselSlide => ({
  id: crypto.randomUUID(),
  elements: [
    {
      id: crypto.randomUUID(),
      type: "title",
      content: "Slide Title",
    },
  ],
});

export function useCarousel(initialId?: string) {
  const [carousel, setCarousel] = useState<Carousel>({
    id: initialId || crypto.randomUUID(),
    title: "Untitled Carousel",
    slides: [createEmptySlide()],
    theme: DEFAULT_THEME,
    updatedAt: new Date().toISOString(),
  });

  const [activeSlideId, setActiveSlideId] = useState<string>(carousel.slides[0]?.id);

  const addSlide = useCallback(() => {
    const newSlide = createEmptySlide();
    setCarousel((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
      updatedAt: new Date().toISOString(),
    }));
    setActiveSlideId(newSlide.id);
  }, []);

  const removeSlide = useCallback((id: string) => {
    setCarousel((prev) => {
      const newSlides = prev.slides.filter((s) => s.id !== id);
      // Ensure at least one slide exists
      if (newSlides.length === 0) newSlides.push(createEmptySlide());
      return {
        ...prev,
        slides: newSlides,
        updatedAt: new Date().toISOString(),
      };
    });
    setActiveSlideId((prevId) => (prevId === id ? carousel.slides[0]?.id : prevId));
  }, [carousel.slides]);

  const reorderSlides = useCallback((startIndex: number, endIndex: number) => {
    setCarousel((prev) => {
      const result = Array.from(prev.slides);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return {
        ...prev,
        slides: result,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateSlideContent = useCallback((slideId: string, elementId: string, newContent: string) => {
    setCarousel((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId) return s;
        return {
          ...s,
          elements: s.elements.map((el) => {
            if (el.id !== elementId) return el;
            return { ...el, content: newContent };
          }),
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addImageElement = useCallback((slideId: string, url: string) => {
    setCarousel((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId) return s;
        // Check if there's already an image element, if so, replace it. Otherwise append.
        const hasImg = s.elements.some(el => el.type === "image");
        const nextElements = hasImg 
          ? s.elements.map(el => el.type === "image" ? { ...el, content: url } : el)
          : [...s.elements, { id: crypto.randomUUID(), type: "image", content: url }];
        return {
          ...s,
          elements: nextElements,
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const removeElement = useCallback((slideId: string, elementId: string) => {
    setCarousel((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId) return s;
        return {
          ...s,
          elements: s.elements.filter(el => el.id !== elementId),
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  return {
    carousel,
    activeSlideId,
    setActiveSlideId,
    addSlide,
    removeSlide,
    reorderSlides,
    updateSlideContent,
    addImageElement,
    removeElement,
  };
}
