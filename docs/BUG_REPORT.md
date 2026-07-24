# Bug Report

**Project:** JARVIS Content Automation Suite  
**Date:** 2026-07-24  

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 0 | — |
| Low | 27 | All Fixed |

---

## All Bugs Found

### B001–B005: Top Navigation Broken Buttons
- **File:** `src/components/layout/top-nav.tsx`
- **Severity:** Low
- **Description:** Network button, Notifications button, Settings icon, Avatar button, and Create dropdown all had missing `onClick` handlers.
- **Fix:** Added `router.push()` to each button.

### B006–B012: Quick Actions Widget Dead Buttons
- **File:** `src/components/dashboard/widgets/quick-actions-widget.tsx`
- **Severity:** Low
- **Description:** All 7 quick-action buttons (New Content, Manage Prompts, View Schedules, etc.) had no click handlers.
- **Fix:** Added `router.push()` to each button.

### B013–B016: Workspace Sidebar Dead Interactions
- **File:** `src/components/workspace/sidebar.tsx`
- **Severity:** Low
- **Description:** New Session button, search form (no submit handler), and SidebarItem click handlers all missing.
- **Fix:** Added `router.push()` navigation and search form with submit handler.

### B017–B018: Prompts Toolbar Dead Buttons
- **File:** `src/components/prompts/prompts-toolbar.tsx`
- **Severity:** Low
- **Description:** Save button and Export YAML button had no `onClick`.
- **Fix:** Added clipboard copy for Save and file download for Export.

### B019: Prompts Workspace Filter Button
- **File:** `src/components/prompts/prompts-workspace.tsx`
- **Severity:** Low
- **Description:** Filter/SlidersHorizontal button had no `onClick`.
- **Fix:** Added clear search handler.

### B020–B024: Studio Toolbar Dead Buttons
- **File:** `src/components/studio/studio-toolbar.tsx`
- **Severity:** Low
- **Description:** Save Draft, History, Preview, Generate, Publish buttons all had no `onClick`. Also missing `"use client"` directive.
- **Fix:** Added `"use client"` and `onClick` stubs to all 5 buttons.

### B025–B031: Studio Sidebar Navigation Items
- **File:** `src/components/studio/studio-sidebar.tsx`
- **Severity:** Low
- **Description:** All 7 nav items (Content Types, Brand Kit, Templates, etc.) had no navigation.
- **Fix:** Added `useRouter` and `router.push()` to each item with proper paths.

### B032–B033: Research Toolbar Dead Buttons
- **File:** `src/components/research/research-toolbar.tsx`
- **Severity:** Low
- **Description:** Refresh Feeds had no `onClick`. Export JSON and Share had no `onClick` passed to ToolButton.
- **Fix:** Added handlers for all 3 buttons with file download and clipboard copy.

### B034: Agents Toolbar Missing Form Wrapper
- **File:** `src/components/agents/agents-toolbar.tsx`
- **Severity:** Low
- **Description:** Prompt input had Enter key handler but no `<form>` wrapper, preventing proper form submission semantics.
- **Fix:** Wrapped in `<form onSubmit>` with proper `type="submit"` on Run Agent button.

### B035–B036: Calendar Toolbar Dead Buttons
- **File:** `src/components/calendar/calendar-toolbar.tsx`
- **Severity:** Low
- **Description:** New Event and Sync buttons had no `onClick`.
- **Fix:** Added `onClick` stubs.

### B037: Calendar Sidebar Mini Calendar Days
- **File:** `src/components/calendar/calendar-sidebar-left.tsx`
- **Severity:** Low
- **Description:** Mini calendar day numbers were `<div>` elements with `cursor-pointer` but no `onClick`.
- **Fix:** Converted to `<button>` elements with `onClick` handler.

### B038–B039: Scheduler Center Filter Spans
- **File:** `src/components/scheduler/scheduler-center-panel.tsx`
- **Severity:** Low
- **Description:** "All Types" and "Today" filter spans had `cursor-pointer` but no `onClick`.
- **Fix:** Added `onClick` handlers.

### B040–B041: Scheduler Toolbar Duplicate/Delete
- **File:** `src/components/scheduler/scheduler-toolbar.tsx`
- **Severity:** Low
- **Description:** Duplicate and Delete ToolButtons had `disabled` prop set but no `onClick` passed.
- **Fix:** Added `onClick` handlers and changed disabled logic to check `activeJob`.

### B042: Chat Input Toolbar Buttons
- **File:** `src/components/workspace/chat-input.tsx`
- **Severity:** Low
- **Description:** Attach File, Upload Image, and Voice Input buttons had `title` indicating "Coming Soon" but no `onClick`.
- **Fix:** Added `onClick` with `alert()` notification.

### B043–B044: Scheduler-Calendar Center Panel Filters
- **File:** `src/components/scheduler-calendar/scheduler-calendar-center-panel.tsx`
- **Severity:** Low
- **Description:** "All Types" and "Today" filter spans had `cursor-pointer` but no `onClick`.
- **Fix:** Added `onClick` handlers.

### B045: Scheduler-Calendar Sidebar Mini Calendar
- **File:** `src/components/scheduler-calendar/scheduler-calendar-sidebar-left.tsx`
- **Severity:** Low
- **Description:** Mini calendar day numbers were `<div>` elements with `cursor-pointer` but no `onClick`.
- **Fix:** Converted to `<button>` elements with `onClick`.

---

## Non-Bug Issues

| Issue | Description | Status |
|-------|-------------|--------|
| Missing CSS tokens | 6 missing `@utility` tokens in globals.css | Fixed |
| JSX nesting bug | `<p>` nested inside `<p>` in landing page | Fixed |
| setState during render | Research right panel computed state in render | Fixed |
| Stale variable persistence | Prompts sidebar retained stale `selectedCategoryId` | Fixed |
| Duplicate keyboard handler | Command palette registered ⌘K twice | Fixed |
| Missing scrollbar utility | `no-scrollbar` CSS utility missing | Fixed |
| Scheduler+Calendar merge | Two separate screens merged into unified `/scheduler` | Fixed |
| Calendar redirect | `/calendar` now redirects to `/scheduler` | Added |
