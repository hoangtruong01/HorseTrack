# HorseTrack Design System

This design system is inspired by premium motorsport racing interfaces.
It does not copy Formula 1 logo, brand assets, proprietary fonts, or exact layouts.

Design direction:

- Premium racing dashboard
- Dark motorsport atmosphere
- Strong red accent
- High contrast
- Bold race-status UI
- Clean spacing
- Professional sports management feeling

## 2. Color Palette & Roles

### Primary

- **F1 Red** (`#E10600`): Primary CTA buttons, key interactive elements, danger/alert states, brand accent
- **Championship Black** (`#1C1C25`): Primary surface and container background; dominant neutral for text-on-light contexts

### Accent Colors

- **Teal Accent** (`#067E6A`): Secondary highlight for rich visual moments; trust-building accent on dark backgrounds
- **Deep Navy** (`#082145`): Heritage blue accent for international or premium contexts
- **Rust** (`#751500`): Tertiary accent for editorial or warming moments

### Interactive

- **White on Dark** (`#FFFFFF`): Text and interactive foreground on dark backgrounds; primary readability layer
- **Dark Text** (`#1C1C25`): Interactive text on light or neutral surfaces
- **Link Gray** (`#E0DEDC`): Secondary text and disabled interactive states; reduced emphasis navigation

### Neutral Scale

- **Pure White** (`#FFFFFF`): Primary background, card surfaces, high contrast
- **Off-White** (`#F7F4F1`): Subtle background tint for reduced visual contrast zones
- **Light Gray** (`#E0DEDC`): Tertiary text, borders, dividers
- **Medium Gray** (`#AAAAAA`): Muted text, metadata, supplementary info
- **Dark Gray** (`#58585B`): Secondary text on light backgrounds
- **Charcoal** (`#1A1A1A`): Alternative dark surface, high-contrast text

### Surface & Borders

- **Dark Surface** (`#15151E`): Deep container background for maximum contrast
- **Neutral Surface** (`#303037`): Secondary surface for cards and panels
- **Border Gray** (`#D3DADE`): Subtle dividers and card borders
- **Navigation Gray** (`#667175`): Text color for navigation systems

### Semantic / Status

- **Error Red** (`#E10600`): Error messages, destructive actions, critical alerts
- **Warning Yellow** (`#F8CD46`): Warning states, cautions, secondary alerts
- **Transparent Black** (`#0000`): Overlay, scrim, modal backgrounds

## 3. Typography Rules

### Font Family

**Primary:** Titillium Web (sans-serif; geometric, modern)  
Fallback: `'Titillium Web', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Secondary / Display:** Formula1 (custom, high-impact motorsport aesthetic)  
Fallback: `'Formula1', Georgia, serif`

### Hierarchy

| Role         | Font          | Size | Weight | Line Height | Letter Spacing | Notes                                               |
| ------------ | ------------- | ---- | ------ | ----------- | -------------- | --------------------------------------------------- |
| Display / H1 | Formula1      | 32px | 900    | 38px        | 0px            | High-impact headlines, hero moments, race standings |
| Heading / H2 | Titillium Web | 24px | 700    | 28px        | 0px            | Section titles, card headers, category breaks       |
| Heading / H3 | Titillium Web | 20px | 700    | 24px        | 0px            | Subsection headers, content groupings               |
| Subheading   | Titillium Web | 16px | 600    | 20px        | 0px            | Secondary headings, list titles, labels             |
| Body         | Titillium Web | 14px | 400    | 16px        | 0px            | Primary content, article text, descriptions         |
| Body Strong  | Titillium Web | 14px | 600    | 16px        | 0px            | Emphasized body text, important info inline         |
| Button / CTA | Titillium Web | 14px | 700    | 16px        | 0px            | Interactive button text, highly scannable           |
| Link         | Titillium Web | 14px | 700    | 16px        | 0px            | Underlined or colored hyperlinks                    |
| Caption      | Titillium Web | 12px | 400    | 14px        | 0px            | Image captions, metadata, timestamps                |
| Code / Mono  | Titillium Web | 12px | 600    | 14px        | 0px            | Technical content, race data, timing info           |

### Principles

- **Hierarchy via Weight & Scale:** Font weight (700 for action, 400 for passive) drives visual priority before size adjustments
- **Line Height Proportionality:** Always at least 1.25× the font size to ensure generous leading and readability
- **Formula1 Sparingly:** Reserve the custom Font for dramatic, single-line moments; overuse dilutes impact
- **All Caps for Emphasis:** Titles and labels use uppercase to command attention within the dark-dominated layout
- **Contrast Above All:** Every text layer must maintain legible contrast ratios (WCAG AA minimum) against its background
- **Mono for Data:** Race results, timing, driver numbers use monospace tracking for precision alignment

## 4. Component Stylings

### Buttons

#### Primary Button

- **Background:** `#E10600`
- **Text Color:** `#FFFFFF`
- **Font:** Titillium Web, 14px, weight 700
- **Padding:** `8px 16px`
- **Border Radius:** `1000px`
- **Border:** `none`
- **Height:** `32px`
- **Box Shadow:** `none`
- **Line Height:** `16px`
- **Hover State:** `background-color: #B80500;`
- **Active State:** `background-color: #8C0400;`
- **Disabled State:** `background-color: #AAAAAA; color: #FFFFFF;`

#### Secondary Button (White Outline)

- **Background:** `transparent`
- **Text Color:** `#FFFFFF`
- **Font:** Titillium Web, 14px, weight 700
- **Padding:** `8px 16px`
- **Border Radius:** `1000px`
- **Border:** `2px solid #FFFFFF`
- **Height:** `32px`
- **Box Shadow:** `none`
- **Line Height:** `16px`
- **Hover State:** `background-color: rgba(255, 255, 255, 0.1);`
- **Active State:** `background-color: rgba(255, 255, 255, 0.2);`

#### Ghost Button (Dark Text)

- **Background:** `transparent`
- **Text Color:** `#1C1C25`
- **Font:** Titillium Web, 14px, weight 700
- **Padding:** `8px 16px`
- **Border Radius:** `1000px`
- **Border:** `1px solid #1C1C25`
- **Height:** `32px`
- **Box Shadow:** `none`
- **Line Height:** `16px`
- **Hover State:** `background-color: #1C1C25; color: #FFFFFF;`
- **Active State:** `background-color: #000000; color: #FFFFFF;`

#### Compact Button (Header)

- **Background:** `#000000`
- **Text Color:** `#FFFFFF`
- **Font:** Titillium Web, 14px, weight 700
- **Padding:** `6px 16px`
- **Border Radius:** `1000px`
- **Border:** `none`
- **Height:** `28px`
- **Box Shadow:** `none`
- **Line Height:** `16px`
- **Hover State:** `background-color: #1C1C25;`

### Cards & Containers

#### Image Card (Hero)

- **Background:** `#AAAAAA` (image overlay fallback)
- **Text Color:** `#FFFFFF`
- **Font:** Titillium Web, 16px, weight 400
- **Padding:** `0px`
- **Border Radius:** `8px`
- **Border:** `none`
- **Height:** `312px`
- **Box Shadow:** `0px 4px 8px rgba(0, 0, 0, 0.2)`
- **Line Height:** `16px`
- **Content Position:** Absolute bottom with gradient overlay (`linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)`)

#### Content Card

- **Background:** `#FFFFFF`
- **Text Color:** `#1C1C25`
- **Font:** Titillium Web, 14px, weight 400
- **Padding:** `16px`
- **Border Radius:** `8px`
- **Border:** `1px solid #D3DADE`
- **Box Shadow:** `0px 2px 4px rgba(0, 0, 0, 0.1)`
- **Hover State:** `box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);`

#### Dark Card (Featured)

- **Background:** `#1C1C25`
- **Text Color:** `#FFFFFF`
- **Font:** Titillium Web, 16px, weight 400
- **Padding:** `24px`
- **Border Radius:** `8px`
- **Border:** `none`
- **Box Shadow:** `0px 4px 16px rgba(0, 0, 0, 0.4)`
- **Line Height:** `24px`

#### Large Heading Card

- **Font:** Formula1, 24px, weight 500
- **Color:** `#FFFFFF`
- **Line Height:** `28px`
- **Padding:** `0px`
- **Background:** `transparent`

### Inputs & Forms

#### Text Input

- **Background:** `#FFFFFF`
- **Text Color:** `#1C1C25`
- **Font:** Titillium Web, 14px, weight 400
- **Padding:** `8px 12px`
- **Border Radius:** `4px`
- **Border:** `1px solid #D3DADE`
- **Height:** `40px`
- **Line Height:** `16px`
- **Focus State:** `border-color: #E10600; box-shadow: 0px 0px 0px 3px rgba(225, 6, 0, 0.1);`
- **Error State:** `border-color: #E10600; background-color: rgba(225, 6, 0, 0.05);`
- **Disabled State:** `background-color: #F7F4F1; color: #AAAAAA;`

#### Checkbox

- **Size:** `16px × 16px`
- **Border Radius:** `2px`
- **Border:** `2px solid #1C1C25`
- **Background (Unchecked):** `#FFFFFF`
- **Background (Checked):** `#E10600`
- **Checkmark Color:** `#FFFFFF`
- **Hover State:** `border-color: #E10600;`

#### Radio Button

- **Size:** `16px × 16px`
- **Border Radius:** `50%`
- **Border:** `2px solid #1C1C25`
- **Background (Unchecked):** `#FFFFFF`
- **Inner Circle (Checked):** `#E10600`, radius `50%`, size `8px`
- **Hover State:** `border-color: #E10600;`

#### Select / Dropdown

- **Background:** `#FFFFFF`
- **Text Color:** `#1C1C25`
- **Font:** Titillium Web, 14px, weight 400
- **Padding:** `8px 12px`
- **Border Radius:** `4px`
- **Border:** `1px solid #D3DADE`
- **Height:** `40px`
- **Arrow Icon Color:** `#1C1C25`
- **Focus State:** `border-color: #E10600; box-shadow: 0px 0px 0px 3px rgba(225, 6, 0, 0.1);`

### Navigation

#### Top Navigation Bar

- **Background:** `#1C1C25`
- **Text Color:** `#E0DEDC`
- **Font:** Titillium Web, 16px, weight 400
- **Padding:** `16px 24px`
- **Height:** `72px`
- **Border Bottom:** `1px solid #303037`
- **Line Height:** `16px`

#### Navigation Link (Default)

- **Color:** `#E0DEDC`
- **Font:** Titillium Web, 16px, weight 400
- **Padding:** `8px 16px`
- **Border Radius:** `0px`
- **Border Bottom:** `none`
- **Hover State:** `color: #FFFFFF; border-bottom: 2px solid #E10600;`
- **Active State:** `color: #FFFFFF; border-bottom: 3px solid #E10600;`

#### Navigation Link (Mobile)

- **Font:** Titillium Web, 14px, weight 600
- **Color:** `#1C1C25`
- **Padding:** `12px 16px`
- **Background (Hover):** `#F7F4F1`
- **Border Radius:** `4px`

#### Dropdown Menu (Open)

- **Background:** `#15151E`
- **Border:** `1px solid #303037`
- **Box Shadow:** `0px 8px 24px rgba(0, 0, 0, 0.4)`
- **Padding:** `8px 0px`
- **Border Radius:** `4px`

### Badges

#### Status Badge (Primary)

- **Background:** `#E10600`
- **Text Color:** `#FFFFFF`
- **Font:** Titillium Web, 12px, weight 700
- **Padding:** `4px 8px`
- **Border Radius:** `2px`
- **Height:** `20px`
- **Line Height:** `12px`

#### Status Badge (Warning)

- **Background:** `#F8CD46`
- **Text Color:** `#1C1C25`
- **Font:** Titillium Web, 12px, weight 700
- **Padding:** `4px 8px`
- **Border Radius:** `2px`
- **Height:** `20px`

#### Status Badge (Secondary)

- **Background:** `#303037`
- **Text Color:** `#FFFFFF`
- **Font:** Titillium Web, 12px, weight 600
- **Padding:** `4px 8px`
- **Border Radius:** `2px`
- **Height:** `20px`

### Modal / Dialog

#### Modal Container

- **Background:** `#FFFFFF`
- **Border Radius:** `8px`
- **Box Shadow:** `0px 8px 32px rgba(0, 0, 0, 0.3)`
- **Padding:** `32px`
- **Max Width:** `600px`
- **Overlay:** `rgba(0, 0, 0, 0.6)` backdrop blur optional

#### Modal Header

- **Font:** Formula1 or Titillium Web (600 weight), 24px
- **Color:** `#1C1C25`
- **Padding Bottom:** `16px`
- **Border Bottom:** `1px solid #D3DADE`

#### Modal Actions (Footer)

- **Padding Top:** `24px`
- **Border Top:** `1px solid #D3DADE`
- **Display:** flex, gap `12px`, justify-content flex-end

## 5. Layout Principles

### Spacing System

**Base Unit:** `4px`

**Scale Progression:** All spacing follows multiples of 4px:

- **Micro Spacing:** `4px` — gap between closely related elements
- **Tight Spacing:** `8px` — padding within compact components (badges, small buttons)
- **Standard Spacing:** `12px` — standard gap between form fields, list items
- **Relaxed Spacing:** `16px` — common padding for cards, sections
- **Medium Spacing:** `24px` — spacing between major sections, container padding
- **Large Spacing:** `32px` — generous spacing for visual separation
- **Extra Large Spacing:** `44px` — spacing between hero sections, full-width breaks
- **Hero Spacing:** `48px` — top/bottom margins for display content
- **Maximum Padding:** `64px` — container padding for premium white-space layouts

**Usage Context:**

- Cards: `16px` internal padding
- Buttons: `8px` vertical, `16px` horizontal
- Form fields: `12px` gap between inputs
- Section separators: `24px` to `32px`
- Container margins: `24px` to `32px` on desktop, `16px` on mobile
- Header/footer padding: `16px` to `24px`

### Grid & Container

**Max Container Width:** `1280px` (desktop)  
**Padding (Max Width):** `32px` left and right on desktop

**Column Strategy:**

- **Desktop:** 12-column grid with `24px` gutter
- **Tablet:** 8-column grid with `16px` gutter
- **Mobile:** 4-column grid with `12px` gutter

**Section Patterns:**

- **Hero Full Bleed:** No side padding; extends edge-to-edge with contained text overlay
- **Featured Content:** `2/3 + 1/3` split on desktop; full-width stacked on mobile
- **Card Grid:** 3 columns on desktop, 2 on tablet, 1 on mobile; `24px` gap
- **Sidebar Layout:** Content (70%) + Sidebar (30%) on desktop; full-width single column below 768px

### Whitespace Philosophy

F1's design prioritizes **breathing room over density**. Dark backgrounds receive generous white space to allow content to command attention. Light sections use measured negative space to guide the eye through hierarchy. Avoid crowding; every element benefits from surrounding space. Hero imagery dominates with text overlays only where necessary. Supporting content (metadata, timestamps) receives reduced visual weight through color and size reduction, not proximity.

### Border Radius Scale

- **Minimal Radius:** `2px` — badges, status indicators, small UI accents
- **Card Radius:** `8px` — cards, panels, modal dialogs, rounded corners for contained regions
- **Large Radius:** `16px` — larger containers, hero cards, expansive panel backgrounds
- **Pill/Button Radius:** `1000px` (full circle) — buttons, pills, toggles, compact actions

## 6. Depth & Elevation

| Level        | Treatment                                       | Use                                                            |
| ------------ | ----------------------------------------------- | -------------------------------------------------------------- |
| Flat (0)     | `none`                                          | Navigation, text links, inline elements, disabled states       |
| Subtle (1)   | `box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);`   | Card borders, subtle content distinction                       |
| Raised (2)   | `box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);`   | Content cards, image cards, slightly elevated panels           |
| Elevated (3) | `box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);`  | Dropdowns, popovers, medium-priority overlays                  |
| Modal (4)    | `box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.3);`  | Modals, dialogs, full-screen overlays                          |
| Maximum (5)  | `box-shadow: 0px 12px 40px rgba(0, 0, 0, 0.4);` | Top-priority modals, critical alerts, highest visual hierarchy |

**Shadow Philosophy:**

F1's elevation system is understated yet purposeful. Rather than aggressive drop shadows, the system uses soft, diffuse shadows with low opacity to create depth without visual noise. All shadows use black with varying opacity (10–40%) to maintain cohesion with the dark-dominant palette. Shadows increase in blur radius and Y-offset as elevation increases, following natural light patterns. Overlay content (modals, popovers) receives stronger shadows to ensure they pop against the dark background without appearing harsh. On light backgrounds, shadows are reduced in opacity to preserve the clean, premium aesthetic.

## 7. Do's and Don'ts

### Do

- **Use F1 Red sparingly** for high-priority CTAs and danger states; its intensity commands attention and overuse diminishes impact
- **Maintain high contrast** between text and backgrounds; all body copy must meet WCAG AA accessibility standards
- **Leverage dark backgrounds** as the default canvas; they convey premium quality and create dramatic focal points for red accents
- **Keep typography clean** with generous line height (1.25–1.5×) and ample letter spacing on all-caps titles
- **Group related content** with `24px` to `32px` spacing; visual separation clarifies information hierarchy
- **Use shadows subtly** with soft blur and low opacity; avoid harsh or high-contrast shadows that feel dated
- **Maximize whitespace** on hero sections; allow breathing room for dramatic imagery and minimal text overlays
- **Pair Formula1 with action** — reserve the custom font for headlines, race standings, and high-impact moments
- **Align buttons to intent** — red for primary CTAs, white outline for secondary, ghost for tertiary or destructive
- **Test responsiveness early** — dark backgrounds and red accents must remain legible and impactful at all breakpoints

### Don't

- **Overuse red** outside of interactive or semantic moments; it loses urgency if applied to passive elements
- **Mix too many typefaces** — stick to Titillium Web for body and UI, Formula1 for headlines only
- **Create text on light red** backgrounds; red on white/light gray is difficult to read
- **Forget accessible contrast** on interactive elements; all links and buttons must remain scannable for users with color blindness
- **Add unnecessary decoration** — borders, gradients, and excessive shadows conflict with F1's minimalist aesthetic
- **Crowd cards with content** — use `16px` padding minimum; dense layouts feel cluttered and reduce premium perception
- **Ignore grid alignment** — ensure all elements snap to the 12-column grid and spacing scale
- **Use shadows excessively** on light backgrounds; they compete with content and reduce clarity
- **Forget touch targets on mobile** — buttons and links must be at least `44px × 44px` for reliable interaction
- **Break the color palette** for non-semantic moments; extend the defined palette rather than introducing ad-hoc colors

## 8. Responsive Behavior

### Breakpoints

| Name    | Width           | Key Changes                                                                                                 |
| ------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| Mobile  | < 640px         | Single column, `12px` gutters, `16px` container padding, stacked navigation, reduced font sizes (-2px)      |
| Tablet  | 640px – 1024px  | 2–3 column grids, `16px` gutters, `24px` container padding, tab-based navigation, full body text            |
| Desktop | 1024px – 1280px | 3–4 column grids, `24px` gutters, `32px` container padding, full horizontal navigation, standard typography |
| Wide    | > 1280px        | 4+ column grids, constrained max-width `1280px` with centered container, full navigation, enhanced spacing  |

### Touch Targets

- **Minimum Size:** `44px × 44px` (iOS/Android standard)
- **Buttons:** `32px` height minimum on desktop; `44px` on mobile and tablet
- **Links:** `32px` height minimum with adequate surrounding padding
- **Checkboxes/Radios:** `16px × 16px` minimum; wrap in `24px` touch-friendly containers
- **Form Inputs:** `40px` height minimum for comfortable thumb interaction on mobile
- **Navigation Links:** `16px` vertical padding on mobile to meet `44px` target height
- **Spacing Between Targets:** Minimum `8px` gap to prevent accidental mis-taps

### Collapsing Strategy

- **Navigation:** Horizontal menu on desktop (1024px+); hamburger menu with slide-out drawer on mobile and tablet
- **Hero Section:** Full-width image on all breakpoints; text overlay font size reduces on mobile (`20px` → `16px`)
- **Card Grid:** 3 columns (desktop) → 2 columns (tablet) → 1 column (mobile); adjust gap from `24px` to `12px`
- **Sidebar Layout:** 70/30 split on desktop; full-width single column below 768px; sidebar moves below content
- **Buttons:** Full-width on mobile (except icon buttons); standard width on tablet+; grouped buttons stack vertically on mobile
- **Forms:** Input width `100%` on mobile; multi-column on tablet+; label above input on mobile, side-by-side on desktop
- **Tables:** Horizontal scroll on mobile; overflow-x auto with sticky header; tablet (640px+) switches to vertical card view if needed
- **Spacing:** `16px` margins on mobile → `24px` on tablet → `32px` on desktop; `12px` padding on mobile → `16px` on tablet → `24px` on desktop
- **Typography:** Headlines reduce by `2–4px` on mobile; body remains readable at `14px` minimum

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** F1 Red (`#E10600`) — buttons, highlighted links, actionable moments
- **Primary Background:** Championship Black (`#1C1C25`) — main container, dark surfaces
- **Deep Background:** Dark Navy (`#15151E`) — premium containers, hero overlays
- **Text on Dark:** Pure White (`#FFFFFF`) — primary readability on dark backgrounds
- **Text on Light:** Dark Text (`#1C1C25`) — default copy on light/neutral surfaces
- **Secondary Text:** Medium Gray (`#AAAAAA`) — metadata, reduced-emphasis content
- **Navigation:** Light Gray (`#E0DEDC`) — navigation links, secondary UI text
- **Accent Highlight:** Teal Accent (`#067E6A`) — trust-building secondary calls-to-action
- **Border / Divider:** Border Gray (`#D3DADE`) — subtle visual separation on light backgrounds
- **Status / Error:** Error Red (`#E10600`) — danger, error messages, critical alerts
- **Status / Warning:** Warning Yellow (`#F8CD46`) — cautions, secondary alerts

### Iteration Guide

1. **Always start with a dark background** (`#1C1C25` or `#15151E`) for premium perception; light backgrounds only for supporting content or modals.

2. **Red (`#E10600`) is reserved for primary actions and danger states**; use sparingly to maintain urgency and brand recognition.

3. **Typography hierarchy is driven by weight first, then size**; Titillium Web (400/600/700) for everyday content, Formula1 (900 weight) for hero headlines.

4. **Spacing always follows the 4px scale** (`4px, 8px, 12px, 16px, 24px, 32px, 44px, 48px, 64px`); never deviate for consistency.

5. **Cards and containers use `16px` padding minimum**; apply `8px` border-radius for small components, `8px` for medium cards, `1000px` for buttons and pills.

6. **Shadows are subtle and soft**; use `rgba(0, 0, 0, 0.1–0.4)` with increasing blur (2–40px) and Y-offset (2–12px) as elevation increases.

7. **Interactive elements (buttons, inputs) use `40px` height on desktop, `44px` on mobile/tablet** to meet touch target guidelines.

8. **Navigation links transition from white-on-dark (desktop) to side-drawer (mobile below 640px)**; maintain color consistency across all breakpoints.

9. **Form inputs apply `8px 12px` padding with `1px solid #D3DADE` borders**; focus state adds `#E10600` border and `3px` red glow.

10. **Grid layout is 12 columns on desktop with `24px` gutters, reducing to 8 columns (tablet, 16px) and 4 columns (mobile, 12px)**; ensure max-width `1280px` with `32px` container padding.

11. **All text must maintain WCAG AA contrast ratios**; white on dark = pass; dark on light = pass; test red on white/light gray = likely fail; use white or dark gray as fallback.

12. **Modal and overlay patterns use `box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.3)` with `32px` padding and `8px` border-radius**; apply `rgba(0, 0, 0, 0.6)` backdrop overlay behind modals.
