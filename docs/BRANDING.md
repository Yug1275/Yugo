# YUGO — Branding & Design System

---

## Brand Identity

**Name:** YUGO

**Tagline:** *Move smarter. Arrive better.*

**Brand Personality:**
- Confident and modern — not corporate, not casual
- Trust-first — safety and transparency baked into every interaction
- Urban energy — fast, direct, no fluff

---

## Color Palette

```
Primary Blue     #2563EB    → CTAs, links, active states, key highlights
Dark Navy        #0F172A    → Backgrounds (dark mode), headers
Success Green    #22C55E    → Ride confirmed, payment success, online status
Danger Red       #EF4444    → Cancel, error states, offline/suspended
Warning Amber    #F59E0B    → Pending states, low battery, warnings
White            #FFFFFF    → Light mode backgrounds, card surfaces
Light Gray       #F1F5F9    → Page backgrounds (light mode)
Medium Gray      #64748B    → Secondary text, placeholder text
Border Gray      #E2E8F0    → Dividers, input borders
```

### CSS Variables (to be defined in `index.css`)

```css
:root {
  --color-primary: #2563EB;
  --color-primary-dark: #1D4ED8;
  --color-secondary: #0F172A;
  --color-success: #22C55E;
  --color-danger: #EF4444;
  --color-warning: #F59E0B;
  --color-bg: #F1F5F9;
  --color-surface: #FFFFFF;
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --color-border: #E2E8F0;
}

[data-theme="dark"] {
  --color-bg: #0F172A;
  --color-surface: #1E293B;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-border: #334155;
}
```

---

## Typography

```
Display / Headings:  "Plus Jakarta Sans" (Google Fonts)
Body Text:           "Inter" (Google Fonts)
Monospace / IDs:     "JetBrains Mono" (for ride IDs, codes)
```

### Type Scale
```
h1: 2.25rem  / 700 weight
h2: 1.875rem / 700 weight
h3: 1.5rem   / 600 weight
h4: 1.25rem  / 600 weight
body-lg: 1.125rem / 400
body:    1rem     / 400
body-sm: 0.875rem / 400
caption: 0.75rem  / 400
```

---

## Spacing System (8px base grid)

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

---

## Border Radius

```
sm:   4px   → inputs, tags
md:   8px   → cards, modals
lg:   12px  → dashboard panels
full: 9999px → pills, badges, avatars
```

---

## Shadows

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05);
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.1);
--shadow-card: 0 2px 8px rgba(15,23,42,0.08);
```

---

## Component Conventions

### Buttons
```
Primary:   bg-primary, white text, rounded-md, hover: bg-primary-dark
Secondary: bg-transparent, border-primary, primary text
Danger:    bg-danger, white text
Ghost:     no border, no bg, primary text on hover
```

### Status Badges
```
pending:   amber bg, amber text
accepted:  blue bg, blue text
started:   green bg, green text
completed: gray bg, gray text
cancelled: red bg, red text
```

### Cards
```
bg-surface, border border-color, rounded-lg, shadow-card
Padding: 24px
```

---

## Logo Concept

```
YUGO
────
Logotype in "Plus Jakarta Sans" Bold
The letter "Y" with a subtle forward-motion arrow integrated
Color: #2563EB on white, White on dark backgrounds
```

---

## Icon Library

**Lucide React** — consistent stroke-based icons throughout

Key icons used:
- `MapPin` — locations
- `Car` — rides / drivers
- `Clock` — history / timing
- `CreditCard` — payments
- `Star` — reviews / ratings
- `Bell` — notifications
- `User` — profile
- `Shield` — admin / safety
- `TrendingUp` — analytics
- `Navigation` — active tracking
