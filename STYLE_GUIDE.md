# Comprehensive Design Style Guide

## Gainslog: AI Food Tracker Design Ethos: Focused Motivation

### 1. Look & Feel: "Focused Motivation"

The app will feel like a sharp, intelligent tool that respects your time. The design is built on a foundation of "Focused Clarity". Every screen has a single, clear purpose, eliminating the clutter and decision fatigue of competitor apps. We will use generous spacing and a strong visual hierarchy to make the interface feel calm and breathable.

However, the experience is not cold or clinical. It is brought to life through "Motivational Moments." When you log a meal or hit a nutritional target, the app responds with satisfying, energetic feedback—a flash of vibrant color, a subtle haptic buzz, or a smooth animation. This transforms the mundane task of tracking into a rewarding experience of relief and accomplishment.

### 2. Color Palette

The palette is built for clarity and energy. The default experience is Light Mode, with full support for a true-black Dark Mode. "Vibrant Coral" is our single, powerful accent color.

| Role                         | Light Mode | Dark Mode |
| ---------------------------- | ---------- | --------- |
| Accent (Vibrant Coral)       | #FF7A5A    | #FF7A5A   |
| Primary Background           | #F9F9F9    | #000000   |
| Secondary Background (Cards) | #FFFFFF    | #1C1C1E   |
| Primary Text                 | #111111    | #F2F2F7   |
| Secondary Text               | #8A8A8E    | #8D8D93   |
| Borders / Separators         | #EAEAEA    | #38383A   |
| Export to Sheets             |

### 3. Typography

The typography is designed to be friendly, approachable, and highly legible, reflecting the app's ease of use.

Font Family: Nunito
Weights: We will primarily use Regular, SemiBold, and Bold to create a clear hierarchy.

Typographic Scale:
| Role | Font | Size | Use Case |
|------|------|------|-----------|
| Title 1 | Nunito Bold | 28pt | Main dashboard greeting (e.g., "Hello, Alex") |
| Title 2 | Nunito Bold | 22pt | Screen titles (e.g., "Log Meal") |
| Headline | Nunito SemiBold | 17pt | Card titles, key metrics (e.g., "Protein") |
| Body | Nunito Regular | 17pt | Main text, descriptions |
| Subhead | Nunito Regular | 15pt | Secondary info, list items |
| Caption | Nunito Regular | 13pt | Timestamps, small annotations |
| Export to Sheets |

### 4. Iconography

#### System: Phosphor Icons

Implementation: Use the phosphor-react-native library for seamless Expo integration.

#### Style & Weight

- **Default State:** Use the Regular weight.
- **Active State:** Use the Fill weight to represent a selected or active state (e.g., in a tab bar).

#### Color

- **Default icons** use Primary Text or Secondary Text color.
- **The Accent color** is reserved for key interactive icons or active states.

### 5. Spacing & Layout (8pt Grid System)

All layout and spacing will adhere to a strict 8pt grid system for visual consistency and harmony.

- Page Margins: 20pt from the left and right edges.
- Small Spacing: 8pt (e.g., between an icon and its label).
- Medium Spacing: 16pt (e.g., vertical space between elements in a list, padding inside cards).
- Large Spacing: 24pt - 32pt (e.g., between distinct sections or cards).

### 6. Components & Visuals

- **Buttons (Primary Action):** A filled button using the Accent color (#FF7A5A) with white text. Use a corner radius of 12pt for a friendly, rounded feel.
- **Cards:** Use the Secondary Background color with a corner radius of 16pt to feel modern and distinct from the background. They should have a subtle shadow in Light Mode to lift them off the page.
- **Input Methods:** The primary AI input actions (Camera, Voice, Text) should be presented as large, clear tap targets on the main screen, using the Accent color to draw attention.
- **Data Visualization:** Graphs and charts should be clean and simple. Use bar charts for daily stats and line charts for weekly progress. The primary data series (e.g., Protein) should always be rendered in the Accent color.

### 7. Animation & Motion Guidelines

Animation should be purposeful: enhancing the user experience without being distracting. The guiding principle is "Fluid and Functional, with Moments of Delight."

**Functional Motion:** Standard, snappy iOS transitions should be used for navigation. Interactions should feel instant and responsive.

**Delightful Moments:**

- **On Log Success:** When a meal is logged, the relevant progress bar (e.g., Protein) animates smoothly to its new value. This is accompanied by a subtle haptic feedback (a light "tap") to confirm success without needing to look.
- **On Goal Completion:** When a daily goal is met, a non-disruptive celebration occurs. For example, the completed progress bar could emit a brief, soft shimmer or a few particles of the Accent color could float up from the metric. This provides a feeling of accomplishment without interrupting the user's flow.
