# Component Library

JARVIS utilizes a centralized, highly-reusable component library located in `src/components/ui`.
This library strictly enforces the "Glassmorphism HUD" Design DNA.

## Core UI Primitives

We utilize [Radix UI](https://www.radix-ui.com/) for headless accessibility, styled entirely via Tailwind CSS.

### 1. ScrollArea
`<ScrollArea>` replaces the native scrollbar with a custom-styled macOS-like scrollbar that matches the Dark Mode DNA.
- **Props:** `className`, `orientation`
- **Usage:** Wrap any overflowing content.

### 2. Dialog
`<Dialog>` provides accessible, focus-trapping modal windows.
- **Composition:** `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`

### 3. Tooltip
`<Tooltip>` provides accessible hover hints.
- **Composition:** `TooltipProvider`, `TooltipTrigger`, `TooltipContent`

## Layout Components

### The 4-Panel Grid
Instead of explicit wrapper components, the architecture dictates that feature roots (e.g., `src/app/settings/page.tsx`) compose their views using flexbox with exact sizing matching the DNA:
- **Left Panel:** `w-[260px] flex-shrink-0`
- **Center Panel:** `flex-1` or `flex-[2]`
- **Right Panel:** `w-[300px] flex-shrink-0`
- **Bottom Toolbar:** `absolute bottom-6 left-1/2 -translate-x-1/2`

## Styling Utilities
The `cn()` utility (`src/lib/utils.ts`) is used heavily to merge Tailwind classes and resolve conflicts safely via `tailwind-merge`.
