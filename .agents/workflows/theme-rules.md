---
description: SCharity UI Theme Rules & Design System — guiding consistent UI across the entire app
---

# SCharity — AI Instructor Theme Rules

> This document defines the design system, typography, colors, spacing, and component patterns for the SCharity platform. **Every page, component, and layout must follow these rules** to maintain a cohesive, premium look.

---

## 1. Typography

### Font
- **Primary font:** `Google Sans` (loaded via Google Fonts CDN)
- **Fallback chain:** `"Google Sans", "Google Sans Text", system-ui, -apple-system, sans-serif`
- **Never use:** serif fonts, monospace fonts, or browser default fonts

### Hierarchy
| Element | Weight | Size | Class |
|---|---|---|---|
| Hero headline (h1) | 900 (black) | `text-5xl md:text-7xl lg:text-8xl` | `font-black` |
| Section title (h2) | 700 (bold) | `text-4xl md:text-5xl` | `font-bold` |
| Card title (h3) | 600 (semibold) | `text-base` to `text-xl` | `font-semibold` |
| Body text | 400 (regular) | `text-sm` to `text-base` | — |
| Caption / label | 400–500 | `text-xs` to `text-sm` | `text-white/50` or `text-white/40` |

---

## 2. Color System

### Colors
| Token | HSL | Usage |
|---|---|---|
| `--background` | `0 0% 99%` | Page background |
| `--foreground` | `224 71% 4%` | Primary text |
| `--card` | `0 0% 100%` | Card background |
| `--border` | `220 13% 91%` | Borders |
| `--muted` | `220 14% 96%` | Muted backgrounds |
| `--muted-foreground`| `220 9% 46%` | Secondary text |

### Brand Colors (same in both modes)
| Name | Value | Usage |
|---|---|---|
| `--primary` | `346 77% 49%` (rose) | Primary actions, CTAs |
| `--secondary` | `262 83% 57%` (violet) | Accents, secondary actions |
| `--accent` | `38 92% 50%` (amber) | Highlights, progress |

### Gradient Patterns
- **Gradient text:** `linear-gradient(135deg, #f43f5e 0%, #8b5cf6 50%, #3b82f6 100%)` → use class `.gradient-text`
- **Warm gradient:** `linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)` → use class `.gradient-text-warm`
- **Progress bar:** `linear-gradient(90deg, #f43f5e, #8b5cf6)` → use class `.progress-fill`

---

## 3. Glassmorphism

All cards and overlays use glassmorphism. Do NOT use opaque solid backgrounds.

| Class | Effect |
|---|---|
| `.glass` | `bg: rgba(255,255,255,0.7)`, blur 12px, border `rgba(0,0,0,0.08)` |
| `.glass-card` | `bg: rgba(255,255,255,0.8)`, blur 20px, subtle shadow |

---

## 4. Spacing & Layout

- **Max width:** `max-w-7xl` (1280px) for content containers
- **Section padding:** `py-24 px-4`
- **Card padding:** `p-5` to `p-8`
- **Card border radius:** `rounded-2xl` (1rem) or `rounded-3xl` (1.5rem) for large cards
- **Grid:** Use Tailwind `grid` system: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for card grids
- **Gap:** `gap-6` to `gap-8` between cards

---

## 5. Component Library (JolyUI)

Always use these JolyUI components. **Do NOT reimplement similar patterns from scratch.**

| Component | Path | Usage |
|---|---|---|
| `RainbowButton` | `@/components/ui/rainbow-button` | Primary CTAs, "Donate", "Login" |
| `MorphingText` | `@/components/ui/text-morphing` | Hero headline word transitions |
| `NumberCounter` / `StatCounter` / `RollingCounter` / `CircularCounter` | `@/components/ui/number-counter` | Animated stats, progress |
| `BentoGrid` | `@/components/ui/bento-grid` | Feature showcases, dashboard grids |
| `AnimatedBeam` / `BeamContainer` / `BeamNode` | `@/components/ui/animated-beam` | Process flows, fund transparency diagrams |
| `Magnetic` | `@/components/ui/magnetic` | Wrap around CTAs for hover magnetic effect |
| `HighlightText` | `@/components/ui/highlight-text` | Emphasize key words (underline, circle, marker) |
| `VercelTabs` | `@/components/ui/vercel-tabs` | Tab navigation with animated indicator |
| `AnimatedThemeToggle` | `@/components/ui/animated-theme-toggle` | *(Not used — light mode only)* |
---

## 6. Page Structure

Every page follows this structure:

- **Important:** Animations must be subtle and purposeful, never distracting
- Use `motion` (framer-motion) for page-level animations
- Hover effects: `hover:-translate-y-1`, `hover:scale-110`, `transition-all duration-300`
- Progress bars: `transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1)`
- Glow effects: `.glow-rose`, `.glow-violet` for emphasis

---

## 8. Page Structure

Every page follows this structure:
```
<Navbar />   ← fixed, glass, z-50
<main>
  <section>  ← pt-24 (offset for fixed navbar)
    <div className="max-w-7xl mx-auto px-4">
      ...page content
    </div>
  </section>
</main>
<Footer />   ← border-t, mt-24
```

---

## 9. Icon System

- **Library:** `lucide-react`
- **Size:** `w-4 h-4` (small), `w-5 h-5` (medium), `w-6 h-6` (large)
- **Color:** Inherit from parent text color, or use `text-rose-400`, `text-violet-400`, etc.
- **Emoji usage:** OK for campaign images and decorative elements, NOT for UI icons

---

## 10. Vietnamese Content Rules

- All UI text in Vietnamese
- Currency: `₫` prefix, suffix `tr` (triệu), suffix `tỷ` (billion)
- Date format: `DD/MM/YYYY`
- Number format: Use `.` for thousands separator (e.g., `52.000`)
