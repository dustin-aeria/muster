# MUSTER Brand Package

**Operations Assembled**

---

## Logo Files

| File | Use |
|------|-----|
| `muster-logo-mark.svg` | Icon/mark only — favicons, app icons, avatars |
| `muster-logo-horizontal.svg` | Full lockup — headers, documents, presentations |
| `muster-logo-horizontal-dark.svg` | Full lockup for dark backgrounds |
| `muster-logo-mark-dark.svg` | Mark only for dark backgrounds |
| `muster-logo-mark-mono.svg` | Single color (navy) — print, embroidery |
| `muster-logo-mark-mono-white.svg` | Single color (white) — dark print applications |
| `muster-wordmark.svg` | Text only — when mark is already established |
| `muster-favicon.svg` | Optimized for 16-32px sizes |

---

## Integration

### File Locations (Action: NEW)

```
/public/images/
  └── muster-logo-mark.svg
  └── muster-logo-horizontal.svg
  └── muster-logo-horizontal-dark.svg
  └── muster-logo-mark-dark.svg
  └── muster-logo-mark-mono.svg
  └── muster-logo-mark-mono-white.svg
  └── muster-favicon.svg

/src/styles/
  └── muster-variables.css

/ (root)
  └── muster-tailwind.config.js  (MERGE into existing tailwind.config.js)
```

### React Component

```jsx
// Simple inline logo component
const MusterLogo = ({ size = 64, variant = 'default' }) => {
  const dotColor = variant === 'dark' ? '#CBD5E1' : '#1E3A5F';
  const centerColor = '#F5A623';
  
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="10" r="5" fill={dotColor} opacity="0.4"/>
      <circle cx="12" cy="32" r="5" fill={dotColor} opacity="0.4"/>
      <circle cx="52" cy="32" r="5" fill={dotColor} opacity="0.4"/>
      <circle cx="20" cy="50" r="4" fill={dotColor} opacity="0.3"/>
      <circle cx="44" cy="50" r="4" fill={dotColor} opacity="0.3"/>
      <circle cx="32" cy="32" r="10" fill={centerColor}/>
    </svg>
  );
};
```

---

## Colors

| Name | Hex | CSS Variable | Use |
|------|-----|--------------|-----|
| Navy | `#1E3A5F` | `--muster-navy-primary` | Primary brand, headings |
| Navy Light | `#2D5A87` | `--muster-navy-light` | Hover states, gradients |
| Amber | `#F5A623` | `--muster-amber` | CTAs, accents, logo center |
| Amber Dark | `#D4920F` | `--muster-amber-dark` | Pressed states |
| Slate | `#5A7B9A` | `--muster-slate` | Secondary text |
| Slate Light | `#A8C5DB` | `--muster-slate-light` | Borders, backgrounds |
| Success | `#2E7D4A` | `--muster-success` | Ready/go states |

---

## Typography

| Use | Font | Weight |
|-----|------|--------|
| Headlines & Wordmark | Outfit | 700 (Bold) |
| Body & UI | Inter | 400-600 |
| Monospace/Data | JetBrains Mono | 400-500 |

### Google Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## Logo Concept

The Muster logo represents **gathering** — five points assembling around a central muster point. The outer dots (navy, faded) represent crew, equipment, and assets. The center amber dot is the rally point where everything comes together.

Clean. Simple. Says "meet here."

---

*Muster Brand Package v1.0*
