"use client";

import { useCarousel } from "@/lib/carousel/use-carousel";
import { CarouselSidebarLeft } from "@/components/carousel/carousel-sidebar-left";
import { CarouselWorkspace } from "@/components/carousel/carousel-workspace";
import { CarouselSidebarRight } from "@/components/carousel/carousel-sidebar-right";
import { CarouselToolbar } from "@/components/carousel/carousel-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function CarouselBuilderPage() {
  const carouselState = useCarousel();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        {/* Background HUD Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(52,245,208,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(52,245,208,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="flex-1 flex h-full relative z-10">
          <CarouselSidebarLeft />
          
          <CarouselWorkspace 
            carousel={carouselState.carousel} 
            activeSlideId={carouselState.activeSlideId}
            setActiveSlideId={carouselState.setActiveSlideId}
            updateSlideContent={carouselState.updateSlideContent}
            reorderSlides={carouselState.reorderSlides}
          />
          
          <CarouselSidebarRight />
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <CarouselToolbar 
            addSlide={carouselState.addSlide} 
            removeActiveSlide={() => carouselState.removeSlide(carouselState.activeSlideId)} 
          />
        </div>
      </div>
    </AppLayout>
  );
}
