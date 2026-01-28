# ui_design.md

**Version:** 1.0
**Last updated:** 2026-01-27
**Status:** Active
**Authority:** Visual source of truth for Vue Components and Tailwind configurations.

---

## 1. Design Philosophy

**"Invisible & Professional"**

The UI should feel like a modern professional tool (like Linear, Notion, or Vercel). It should be unobtrusive. The user's content (the resume) is the hero; the interface is merely the frame.

* **Cleanliness:** Generous whitespace, subtle borders, minimal shadows.
* **Trust:** Blue tones, consistent alignments, high legibility.
* **Focus:** The "Builder View" eliminates distractions (no heavy headers/footers).

---

## 2. Color System (Tailwind Palette)

We use the standard Tailwind colors with a specific semantic mapping.

### 2.1 Brand Colors
| Role | Tailwind Class | Hex | Usage |
|:---|:---|:---|:---|
| **Primary** | `blue-600` | `#2563EB` | Primary Buttons, Links, Active States, AI Accents. |
| **Primary Hover** | `blue-700` | `#1D4ED8` | Hover states for primary actions. |
| **Secondary** | `slate-900` | `#0F172A` | Headings, Heavy text, Navigation active items. |

### 2.2 Neutral / Backgrounds
| Role | Tailwind Class | Usage |
|:---|:---|:---|
| **Canvas** | `bg-slate-50` | Page background (off-white for contrast against white cards). |
| **Surface** | `bg-white` | Cards, Modals, Input backgrounds, The "Paper" preview. |
| **Border** | `border-slate-200` | Subtle dividers, Input borders. |

### 2.3 Semantic Colors
| Role | Class | Usage |
|:---|:---|:---|
| **Error** | `red-500` | Validation errors, Delete actions. |
| **Success** | `emerald-600` | "Saved" toasts, high score indicators. |
| **AI/Magic** | `violet-600` | Specific gradients or icons indicating AI functionality. |

---

## 3. Typography

**Font Family:** `Inter` (Google Fonts) for UI.  
*Note: The Resume Preview itself may use different fonts (Serif/Sans) based on the template, but the **App UI** always uses Inter.*

### 3.1 Type Scale
* **H1 (Page Titles):** `text-2xl font-semibold tracking-tight text-slate-900`.
* **H2 (Section Headers):** `text-lg font-medium text-slate-900`.
* **Body:** `text-sm text-slate-600` (Standard UI text).
* **Label:** `text-xs font-medium text-slate-500 uppercase tracking-wider`.

---

## 4. Component Library (Atoms)

### 4.1 Buttons
* **Primary:** `bg-blue-600 text-white hover:bg-blue-700 rounded-md px-4 py-2 shadow-sm transition-colors`.
* **Secondary:** `bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md px-4 py-2 shadow-sm`.
* **Ghost:** `text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md px-3 py-2`.
* **AI Action:** `bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md hover:shadow-lg`.

### 4.2 Inputs (Forms)
* **Standard:** `w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`.
* **Textarea:** Same as above, but with `resize-y` and `min-h-[100px]`.
* **Validation Error:** Add `border-red-300 text-red-900 focus:ring-red-500`.

### 4.3 Cards
* **Standard:** `bg-white rounded-lg border border-slate-200 shadow-sm`.
* **Hoverable (Dashboard):** `transition-shadow hover:shadow-md cursor-pointer`.

---

## 5. Layout Patterns

### 5.1 Dashboard (List/Grid)
* **Top Nav:** Minimalist. Logo left, User Avatar right. Sticky.
* **Grid:** Responsive grid for resume thumbnails.
    * Mobile: 1 column.
    * Tablet: 2 columns.
    * Desktop: 3 or 4 columns.

### 5.2 The Builder (Split Screen)
This is the core complex view.

* **Container:** `h-screen flex overflow-hidden`.
* **Left Panel (Editor):**
    * Width: `w-full md:w-1/2 lg:w-5/12`.
    * Behavior: Scrollable `overflow-y-auto`.
    * Padding: `p-6`.
* **Right Panel (Preview):**
    * Width: `hidden md:block md:w-1/2 lg:w-7/12`.
    * Background: `bg-slate-100` (Simulates a desk).
    * Content: Centered `div` simulating A4 paper (`w-[210mm] min-h-[297mm] bg-white shadow-lg`).
    * Behavior: Sticky/Fixed. Does not scroll with the form, but scales using CSS `transform: scale()` to fit viewport.

### 5.3 Mobile Editing Strategy
Since split-screen fails on mobile:
* Use **Tabs** at the top: `[ Edit ] | [ Preview ]`.
* User toggles between the Form and the Rendered Resume.

---

## 6. AI UX Behaviors

### 6.1 The "Magic Wand"
* **Trigger:** Small, unobtrusive icon inside or near Textareas (Summary, Description).
* **State - Loading:**
    * Input field disables.
    * Show a "Shimmer/Pulse" skeleton effect inside the field.
    * Text: "AI is writing..."
* **State - Result:**
    * Do not overwrite user text immediately.
    * Show a Diff or a Popover: "Accept Improvement?".
    * Allow "Undo".

### 6.2 Generator Wizard
* **Step-by-step:** Do not overwhelm.
    1.  Paste JD.
    2.  Select Tone (Professional/Creative).
    3.  Generating (Progress Bar with fun messages: "Analyzing Keywords...", "Structuring History...").
    4.  Redirect to Builder.

---

## 7. Feedback & Interaction

### 7.1 Loading States
* **Initial Load:** Full screen spinner (centered brand logo pulsing).
* **Section Load:** Skeleton loader (`bg-slate-200 animate-pulse rounded`).
* **Button Load:** Spinner inside the button, text hidden.

### 7.2 Notifications (Toasts)
* Position: Bottom-Right.
* Animation: Slide up/fade in.
* Auto-dismiss: 4 seconds.
* Types:
    * Success (Green check).
    * Error (Red X).
    * Info (Blue i).

### 7.3 Transitions
Use Vue's `<Transition>` wrapper.
* **Modals:** `scale-95 opacity-0` -> `scale-100 opacity-100` (Ease-out-quad).
* **Page Navigation:** Subtle fade (`opacity-0` -> `opacity-100`).

---

## 8. Accessibility (A11y) Checkpoints

1.  **Focus Rings:** Never remove `outline` unless replacing with a custom Tailwind `ring`. Keyboard navigation is mandatory.
2.  **Contrast:** Ensure `text-slate-500` is not used on dark backgrounds. Use `text-slate-400` or lighter.
3.  **Labels:** All inputs must have a label (visible or `sr-only`).
4.  **ARIA:** Use `aria-busy="true"` on AI loading states.