---
name: Nova Productivity Platform
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  sidebar-width: 15rem
  sidebar-collapsed-width: 3.5rem
  kanban-col-width: 18rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
---

## Brand & Style

The design system embodies a precision-engineered workspace calibrated for high-velocity teams, technical operators, and modern product builders. Merging the restrained discipline of Swiss modernism with the dynamic responsiveness of next-generation developer tooling, the interface balances high-density information architecture with visual calm.

### Philosophy & Visual Identity
- **Intentional Density:** Space is treated as a premium structural asset. Every pixel serves legibility, state recognition, or workflow momentum without visual clutter.
- **Surface Layering over Ornamentation:** The UI avoids artificial decoration. Hierarchy is articulated through subtle border values, meticulous tonal variations across slate layers, and disciplined micro-typography.
- **Kinetic Precision:** Interactive states feel mechanical, immediate, and tactically grounded. Transitions are short (100ms–150ms) and purposeful, reinforcing a feeling of instant software.

### Tone & Sensibility
- **Authoritative & Quiet:** Neutral slates dominate the field of view, keeping focus entirely on user data and creative flow.
- **Electric Precision:** High-chroma indigo accents are reserved strictly for intent, active execution states, and terminal focal points.

## Colors

The palette is engineered natively for a dark-first environment, prioritizing prolonged visual comfort and crisp separation across deeply nested data structures.

### Functional Palette Structure
- **Primary (`#6366F1` Indigo Accent):** Used for focal interactive states, primary action buttons, focused keyboard cues, and active selection perimeters.
- **Secondary (`#06B6D4` Electric Cyan):** Used for live collaborative presences, automated processes, sync indicators, and telemetry graphs.
- **Tertiary (`#10B981` Emerald):** Represents completion status, pipeline success, validation states, and performance velocity.
- **Neutral Palette (`#0F172A` Slate Base):**
  - `Canvas / Shell`: `#090D16` (Deepest canvas for application frame and global navigation backgrounds).
  - `Surface 1 (Base Panel)`: `#0F172A` (Default workspace and document background).
  - `Surface 2 (Elevated Card)`: `#1E293B` (Cards, Kanban columns, table rows, popovers).
  - `Surface 3 (Interactive / Hover)`: `#334155` (Hover overlays, segmented controllers, dropdown trigger highlights).
  - `Border Subtle`: `rgba(255, 255, 255, 0.07)` (Separators, structural grid dividers).
  - `Border Strong`: `rgba(255, 255, 255, 0.14)` (Active card borders, modal boundaries).
  - `Text Primary`: `#F8FAFC` (Headings, active values, primary cell data).
  - `Text Secondary`: `#94A3B8` (Descriptions, labels, inactive indicators).
  - `Text Tertiary / Muted`: `#64748B` (Keyboard shortcuts, empty state text, metadata).

## Typography

The type system balances human readability at small sizes with a disciplined, technical rhythm. Geist serves as the primary structural workhorse across headers and body copy, while JetBrains Mono anchors telemetry, technical IDs, status pills, shortcuts, and tabular data.

### Typographic Hierarchy Rules
- **Display & Section Headers:** Must utilize tight negative tracking (`-0.025em` to `-0.03em`) and medium/semibold weights to preserve crisp rendering against dark surfaces.
- **Dense Data & Meta Labels:** System tags, issue keys (e.g., `NOV-1402`), timestamps, hotkeys, and counter badges strictly mandate `JetBrains Mono` for rapid vertical alignment and tabular scanning.
- **Optical Balance:** Keep long-form text blocks bounded within a maximum line length of 65 characters to prevent horizontal drift across high-resolution displays.

## Layout & Spacing

A strict 4px base-unit scaling system governs layout geometry. Spatial relationships prioritize compact rhythm, allowing dense multi-column arrays, Kanban stacks, and side-by-side inspect drawers without horizontal overflow.

### Viewport Architecture
- **Global Shell (Desktop > 1280px):** Permanent collapsible utility sidebar (`15rem`), fluid main content stage, and an optional sliding contextual panel (`24rem`).
- **Workspace Canvas (Tablet 768px - 1279px):** Auto-collapsing sidebar (`3.5rem` icon state), 12-column fluid grid, scrollable Kanban boards with soft edge-masking indicators.
- **Handheld Canvas (< 768px):** Full-bleed stacked architecture. Boards transform to full-width segmented tab panels with anchored bottom action sheets.

### Grid & Density Rules
- High-density lists (e.g., issue trackers, log tables) use vertical padding of `0.375rem` (6px) per row with horizontal padding of `0.75rem` (12px).
- Kanban board columns maintain a standard `18rem` width with `0.75rem` gaps to permit three full pipelines on standard laptop viewports.

## Elevation & Depth

Visual hierarchy is constructed through luminous tonal boundaries and faint optical perimeter highlights rather than heavy physical dropshadows.

### Layering Architecture
- **Layer 0 (App Canvas):** `#090D16` — The deepest backdrop beneath splitters and master navigation rails.
- **Layer 1 (Workspace Modules):** `#0F172A` with an inner border of `1px solid rgba(255, 255, 255, 0.05)`.
- **Layer 2 (Draggable Cards / Floating Cells):** `#1E293B` backed with an inset border highlight `inset 0 1px 0 0 rgba(255, 255, 255, 0.08)` and subtle structural border `1px solid rgba(255, 255, 255, 0.08)`.
- **Layer 3 (Modals / Popovers / Flyouts):** `#1E293B` surrounded by `1px solid rgba(99, 102, 241, 0.25)` (subtle primary hue infusion) with a concentrated ambient shadow: `0 16px 36px -8px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08)`.

### Glass & Backdrop Blurs
Sub-navigation bars, filter trays, and sticky headers apply `backdrop-filter: blur(12px)` over a 75% alpha background (`rgba(15, 23, 42, 0.75)`), preserving context during continuous scrolling.

## Shapes

The design system maintains a refined, technical geometry using subtle corner shaping (`roundedness: 1`). This reinforces the look of high-precision desktop software while avoiding visual softening.

### Radius Assignments
- **Micro Elements (Pills, Hotkey tags, Checkboxes):** `0.25rem` (4px).
- **Interactive Controls (Inputs, Buttons, Dropdown items):** `0.375rem` (6px).
- **Structural Containers (Cards, Kanban columns, Dialogs):** `0.5rem` (8px).
- **Avatars & Pure Status Bullets:** Complete circular geometry (`9999px`).

## Components

### Buttons
- **Primary:** Background `#6366F1`, text `#FFFFFF`, top edge highlight `inset 0 1px 0 rgba(255, 255, 255, 0.2)`. Hover: `#4F46E5`. Active: `#4338CA`. Transition: `all 120ms ease`.
- **Secondary / Ghost:** Background `transparent`, border `1px solid rgba(255, 255, 255, 0.1)`, text `#F8FAFC`. Hover: `rgba(255, 255, 255, 0.05)` with border `rgba(255, 255, 255, 0.18)`.
- **Size Specs:** Compact height `28px` (dense workflows), standard height `34px`. Padding `0.5rem 0.75rem`.

### Input Fields & Search Bars
- **Frame:** Background `#090D16`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#F8FAFC`, placeholder `#64748B`.
- **Focus State:** Border `#6366F1`, ring `0 0 0 1px #6366F1`, subtle ambient glow `0 0 12px rgba(99, 102, 241, 0.25)`.
- **Shortcut Hints:** Right-aligned inline pill rendered in `JetBrains Mono` with subtle background `rgba(255, 255, 255, 0.06)` (e.g., `⌘K`).

### Status Badges & Pills
- **Geometry:** Height `20px`, padding `0 6px`, radius `4px`, font `label-caps` (`JetBrains Mono`).
- **Variants:**
  - *In Progress:* Background `rgba(99, 102, 241, 0.12)`, border `1px solid rgba(99, 102, 241, 0.3)`, text `#818CF8`.
  - *Blocked / Alert:* Background `rgba(239, 68, 68, 0.12)`, border `1px solid rgba(239, 68, 68, 0.3)`, text `#F87171`.
  - *Complete:* Background `rgba(16, 185, 129, 0.12)`, border `1px solid rgba(16, 185, 129, 0.3)`, text `#34D399`.

### Kanban Columns & Task Cards
- **Column Shell:** Background `rgba(15, 23, 42, 0.5)`, border `1px solid rgba(255, 255, 255, 0.04)`, radius `8px`, padding `8px`.
- **Task Card:** Background `#1E293B`, border `1px solid rgba(255, 255, 255, 0.07)`, padding `12px`, radius `6px`.
- **Card Hover:** Border `rgba(255, 255, 255, 0.15)`, transform `translateY(-1px)`. Active drag: border `#6366F1`, shadow `0 12px 24px -4px rgba(0, 0, 0, 0.5)`.

### Selection Controls (Checkboxes & Radios)
- **Base:** `14px × 14px`, border `1px solid rgba(255, 255, 255, 0.2)`, background `rgba(255, 255, 255, 0.02)`.
- **Checked:** Background `#6366F1`, border `#6366F1`, white check indicator SVG centered.