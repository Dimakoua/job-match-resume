
# ui_design.md

**Reference Implementation:**
The canonical source for UI/component implementation is the code in:
`web_app/frontend/doc/stitch_resume_builder_dashboard/`
Each subfolder contains the actual HTML/CSS for the respective screens and should be consulted for authoritative details on structure, classes, and patterns.

**Version:** 1.0
**Last updated:** 2026-01-27
**Status:** Active
**Authority:** Visual source of truth for Vue Components and Tailwind configurations.

---


## 1. Design Philosophy

**"Invisible & Professional"**

The UI is inspired by modern SaaS tools (Linear, Notion, Vercel) and is implemented as a clean, whitespace-rich, distraction-free workspace. The resume is always the hero; UI is a subtle frame.

* **Cleanliness:** Generous whitespace, subtle borders, minimal shadows, and clear separation of navigation, editor, and preview.
* **Trust:** Blue tones (`#2463eb`), consistent alignments, high legibility, and dark mode support.
* **Focus:** Builder and Wizard views minimize headers/footers, use sticky/fixed nav, and keep the user in context.

---


## 2. Color System (Tailwind + Custom)

The implementation uses Tailwind with custom extensions:

### 2.1 Brand & Background
| Role | Class/Hex | Usage |
|:---|:---|:---|
| **Primary** | `#2463eb` (`primary`) | Buttons, links, nav, AI accents |
| **Background Light** | `#f6f6f8` (`background-light`) | App background (light mode) |
| **Background Dark** | `#111621` (`background-dark`) | App background (dark mode) |
| **Surface** | `bg-white`/`dark:bg-background-dark` | Cards, modals, preview |
| **Border** | `#e7ebf3`/`dark:#2d364f` | Card/input borders |

### 2.2 Semantic
| Role | Class/Hex | Usage |
|:---|:---|:---|
| **Error** | `#f43f5e` | Validation, destructive |
| **Success** | `#10b981` | Toasts, status |
| **AI/Magic** | `#8b5cf6`/`#6366f1` | AI buttons, icons |

### 2.3 Accent Palette
Blue, Indigo, Violet, Emerald, Rose, Slate — used for user accent selection in resume styling.

---


## 3. Typography

**Font Family:**
- UI: `Inter`, sans-serif (always)
- Resume Preview: User-selectable (Inter, Playfair Display, Lora, Roboto Mono, Open Sans)

### 3.1 Type Scale (UI)
* **H1 (Page Title):** `text-4xl font-black` (Dashboard), `text-3xl font-bold` (Wizard)
* **H2 (Section):** `text-2xl font-bold`, `text-xl font-bold` (Studio)
* **Body:** `text-base` or `text-sm` (gray-500/700)
* **Label:** `text-xs font-medium uppercase tracking-wider`

### 3.2 Resume Preview
* Font size, line height, and font family are user-adjustable in Studio 1 (see controls for base size, line height, heading/body font)

---


## 4. Component Library (Atoms)

### 4.1 Buttons
* **Primary:** `bg-primary text-white rounded-lg h-10 px-4 font-bold shadow-sm hover:bg-blue-700 transition-all`
* **AI Action:** `bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md hover:shadow-lg` or `.ai-glow` (Wizard)
* **Secondary:** `bg-white text-primary border border-[#e7ebf3] hover:bg-gray-50 rounded-lg`
* **Icon:** `bg-[#e7ebf3] dark:bg-gray-800 text-[#0e121b] dark:text-white rounded-lg`

### 4.2 Inputs (Forms)
* **Standard:** `rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm`
* **Textarea:** Same as above, with `min-h-[160px]` or `min-h-[220px]` (Wizard)
* **Validation Error:** `border-red-300 text-red-900 focus:ring-red-500`

### 4.3 Cards & Panels
* **Resume Card:** `bg-white dark:bg-[#1a202c] aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-[#e7ebf3] dark:border-[#2d364f] group-hover:shadow-lg transition-all`
* **Section Card:** `p-5 rounded-xl border bg-white dark:bg-gray-900 mb-4 shadow-sm`
* **Empty State:** `border-2 border-dashed border-[#d0d7e7] bg-white/50 px-6 py-20 rounded-xl`

---


## 5. Layout Patterns

### 5.1 Dashboard
* **Top Nav:** Sticky, logo left, nav links (Dashboard, Templates, Examples), user avatar right
* **Grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for resume cards
* **Resume Card:** Preview image, title, last edited, actions (Edit, Download, View)
* **Empty State:** Prominent "Start from Scratch" card

### 5.2 Studio (Builder)
* **Header:** Sticky, logo, resume title/status, nav links, actions (Download, Share)
* **Sidebar:** Vertical, icons for sections (edit, customize, view, font, history)
* **Main Panel:** Editor (form sections, style controls, etc.)
* **Preview Panel:** A4 preview, floating zoom/layer controls, always visible on desktop

### 5.3 Wizard
* **Header:** Sticky, logo, nav, avatar
* **Main:** Centered card, progress bar, stepper, form (textarea, tone select, etc.)
* **Footer:** Actions (Back, Generate Draft)

### 5.4 Template Selection
* **Grid:** Template cards with hover actions, live preview on right

### 5.5 Section Manager
* **List:** Draggable/toggleable section cards, add custom section

### 5.6 Mobile
* **Responsive:** Panels stack, preview toggles, nav collapses

---


## 6. AI UX Behaviors

### 6.1 AI Actions
* **AI Enhance:** Button in summary/description sections, triggers AI improvement (icon: `auto_fix_high`)
* **AI Glow:** `.ai-glow` class for animated button shadow (Wizard)
* **Popover:** Shows "AI Powered Editor" or similar when hovering AI-enhanced fields

### 6.2 Wizard Flow
* **Steps:**
    1. Paste Job Description (textarea, word count, helper text)
    2. Select Tone (Professional, Creative, Bold)
    3. Generate Draft (progress bar, fun messages)
* **Progress Bar:** `bg-primary` with % width, stepper labels
* **Footer:** Back/Generate buttons, AI-glow effect

---


## 7. Feedback & Interaction

### 7.1 Loading States
* **AI/Section:** Skeleton loader (`animate-pulse`), shimmer on AI fields
* **Button:** Spinner inside button, text hidden

### 7.2 Notifications
* **Toasts:** Bottom-right, slide/fade, auto-dismiss, success/error/info

### 7.3 Transitions
* **Cards/Modals:** `transition-all`, `hover:shadow-lg`, `scale`, `opacity` for modals
* **Live Preview:** Badge with pulse animation

---


## 8. Accessibility (A11y) Checkpoints

1. **Focus Rings:** Never remove `outline` unless replaced with Tailwind `ring`. All interactive elements are keyboard accessible.
2. **Contrast:** Sufficient contrast for all text, especially on dark backgrounds.
3. **Labels:** All inputs have visible or `sr-only` labels.
4. **ARIA:** Use `aria-busy="true"` on AI/async loading states.
5. **Custom Controls:** Switches, drag handles, and popovers are accessible and labeled.