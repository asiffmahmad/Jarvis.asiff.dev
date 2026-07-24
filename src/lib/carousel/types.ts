export type ElementType = "title" | "subtitle" | "paragraph" | "image" | "shape";

export interface CarouselElement {
  id: string;
  type: ElementType;
  content: string; // text or image URL
  style?: Record<string, string | number>;
}

export interface CarouselSlide {
  id: string;
  elements: CarouselElement[];
  background?: string;
  notes?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontHeading: string;
  fontBody: string;
}

export interface Carousel {
  id: string;
  title: string;
  slides: CarouselSlide[];
  theme: ThemeConfig;
  updatedAt: string;
}
