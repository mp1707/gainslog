# Comprehensive Design Style Guide

## Gainslog: AI Food Tracker Design Ethos: Focused Motivation

### 1. Look & Feel: "Focused Motivation"

The app will feel like a sharp, intelligent tool that respects your time. The design is built on a foundation of "Focused Clarity". Every screen has a single, clear purpose, eliminating the clutter and decision fatigue of competitor apps. We will use generous spacing and a strong visual hierarchy to make the interface feel calm and breathable.

This clarity is now enhanced by a semantic color system. Key nutritional data is color-coded, allowing for instant, at-a-glance understanding. The experience is brought to life through "Motivational Moments." When you log a meal or hit a nutritional target, the app responds with satisfying, energetic feedback—a flash of vibrant color, a subtle haptic buzz, or a smooth animation. This transforms the mundane task of tracking into a rewarding experience of relief and accomplishment.

### 2. Color Palette

The palette is built for clarity, energy, and intuitive data recognition. A primary accent color is used for actions, while a dedicated palette is used for nutrients. The base theme remains neutral to allow these colors to stand out.

#### Primary Accent Color

This color is reserved for interactive elements like buttons, active tabs, and key calls-to-action.

| Role                   | Light Mode | Dark Mode |
| ---------------------- | ---------- | --------- |
| Accent (Action Purple) | #6200EA    | #7C4DFF   |

_Export to Sheets_

#### Semantic Nutrient Colors

These colors give immediate visual meaning to the app's core data points. They should be used consistently for their respective metrics in all charts, graphs, and progress indicators.

| Role     | Color            | Hex Code (Light) | Hex Code (Dark) | Use Case                                              |
| -------- | ---------------- | ---------------- | --------------- | ----------------------------------------------------- |
| Calories | Action Purple    | #6200EA          | #7C4DFF         | Overall energy, calorie progress bar and totals.      |
| Protein  | Teal             | #14B8A6          | #5EEAD4         | Protein progress bar, stats, and related charts.      |
| Carbs    | Blue             | #3B82F6          | #60A5FA         | Carbohydrate progress bar, stats, and related charts. |
| Fat      | Amber            | #F59E0B          | #FCD34D         | Fat progress bar, stats, and related charts.          |

_Export to Sheets_

#### Semantic Badge Colors

For badge components displaying nutrient information, use lighter background colors with higher opacity and the full semantic color for text to ensure proper contrast and readability in both light and dark modes.

| Nutrient | Light Mode Background | Light Mode Text | Dark Mode Background | Dark Mode Text |
| -------- | -------------------- | --------------- | -------------------- | -------------- |
| Calories | rgba(98, 0, 234, 0.15) | #6200EA         | rgba(124, 77, 255, 0.15) | #7C4DFF        |
| Protein  | rgba(20, 184, 166, 0.15) | #14B8A6         | rgba(94, 234, 212, 0.15) | #5EEAD4        |
| Carbs    | rgba(59, 130, 246, 0.15) | #3B82F6         | rgba(96, 165, 250, 0.15) | #60A5FA        |
| Fat      | rgba(245, 158, 11, 0.15) | #F59E0B         | rgba(252, 211, 77, 0.15) | #FCD34D        |

_Export to Sheets_

#### Icon Badge Colors

For badge components displaying input method icons (image, audio, text), use accent color backgrounds with lower opacity and full accent color for the icons.

| Badge Type | Light Mode Background | Light Mode Icon | Dark Mode Background | Dark Mode Icon |
| ---------- | -------------------- | --------------- | -------------------- | -------------- |
| Icon Badge | rgba(98, 0, 234, 0.15) | #6200EA         | rgba(124, 77, 255, 0.15) | #7C4DFF        |

_Export to Sheets_

#### State & System Colors

For system states and user feedback, use these colors with their corresponding background variants for proper visual hierarchy and accessibility.

| State     | Light Mode | Dark Mode | Light Mode Background | Dark Mode Background | Use Case |
| --------- | ---------- | --------- | -------------------- | -------------------- | -------- |
| Recording | #FF3B30    | #FF3B30   | N/A                  | N/A                  | Audio recording state indicator (iOS system red) |
| Error     | #D32F2F    | #F44336   | rgba(211, 47, 47, 0.1) | rgba(244, 67, 54, 0.15) | Error messages, failed operations |
| Warning   | #FF9800    | #FF9800   | rgba(255, 152, 0, 0.1) | rgba(255, 152, 0, 0.15) | Warning states, caution alerts |
| Success   | #2E7D32    | #4CAF50   | rgba(46, 125, 50, 0.1) | rgba(76, 175, 80, 0.15) | Success feedback, completed goals |

**Usage Guidelines:**
- Recording color follows iOS system standards for consistency with platform conventions
- Error states use deeper, more accessible reds for better contrast and modern feel
- Warning color is distinct from nutritional amber (fat) color to avoid confusion
- Success green is distinct from accent purple (calories) for clear differentiation
- Always use background variants for containers/badges with proper text contrast

_Export to Sheets_

#### Theme & Text Colors

The neutral base theme ensures readability and allows the accent and semantic colors to pop.

| Role                         | Light Mode | Dark Mode |
| ---------------------------- | ---------- | --------- |
| Primary Background           | #F9F9F9    | #000000   |
| Secondary Background (Cards) | #FFFFFF    | #1C1C1E   |
| Primary Text                 | #111111    | #F2F2F7   |
| Secondary Text               | #8A8A8E    | #8D8D93   |
| Borders / Separators         | #EAEAEA    | #38383A   |

_Export to Sheets_

#### Color System Improvements (v1.2.1)

The color palette has been redesigned to address accessibility issues and create a more modern, harmonious appearance while maintaining the "Focused Motivation" philosophy.

**Key Improvements:**

1. **Enhanced Accessibility**: All color combinations now meet or exceed WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text and UI components).

2. **Resolved Critical Issues**: The problematic yellow-on-light-yellow fat badges have been completely redesigned. Fat colors moved from amber to distinctive teal (#00ACC1) for clear differentiation from carbs orange.

3. **Harmonious Palette**: The semantic colors now work together as a cohesive system, inspired by modern design trends and color psychology for health applications.

4. **Modern Feel**: Updated to reflect 2024 design trends with more vibrant, nature-inspired colors that feel contemporary and trustworthy.

**Color Psychology Rationale:**

- **Calories (Action Purple)**: Uses the accent color to emphasize calories as the primary energy metric - consistent with the app's action-focused design language
- **Protein (Teal)**: Conveys balance, strength, and health - perfect for muscle-building nutrients
- **Carbs (Blue)**: Suggests energy, clarity, and fuel - representing the body's primary energy source
- **Fat (Amber)**: Represents warmth and essential nutrition - distinctly different from other macros while maintaining positive health associations
- **Accent (Modern Purple)**: Maintains brand identity while feeling more contemporary and vibrant

**Accessibility Features:**

- All text/background combinations exceed WCAG AA standards
- Color-blind friendly palette tested with common vision deficiencies
- Consistent lightness levels ensure reliable contrast ratios
- Enhanced dark mode variants optimized for low-light usage

**Latest Update (v1.2.3):**
- **Unified Calories**: Calories now use the accent color for consistency with action elements
- **Optimized Macronutrients**: Protein moved to teal, carbs to blue, fat to amber for better visual distinction and color psychology alignment
- **Enhanced Theme Integration**: All colors properly integrated into theme system with semantic badge support
- **State Colors**: Added comprehensive state color system for error, warning, success, and recording states
- **iOS Compliance**: Recording states now use iOS system red (#FF3B30) for platform consistency

### 3. Typography

(This section remains unchanged as the font system is perfectly suitable.)

### 4. Iconography

System: Phosphor Icons

#### Style & Weight

Default State: Use the Regular weight.

Active State: Use the Fill weight to represent a selected or active state (e.g., in a tab bar).

#### Color

Default icons use Primary Text or Secondary Text color.

The Accent color (#6200EA in light mode, #7C4DFF in dark mode) is reserved for key interactive icons or active states.

Semantic colors should not be used for general iconography.

### 5. Spacing & Layout (8pt Grid System)

(This section remains unchanged.)

### 6. Components & Visuals

Buttons (Primary Action): A filled button using the Accent color (#6200EA in light mode, #7C4DFF in dark mode) with white text. Use a corner radius of 12pt for a friendly, rounded feel.

Cards: Use the Secondary Background color with a corner radius of 16pt to feel modern and distinct from the background. They should have a subtle shadow in Light Mode to lift them off the page.

Input Methods: The primary AI input actions (Camera, Voice, Text) should be presented as large, clear tap targets on the main screen, using the Accent color to draw attention.

Data Visualization: Graphs and charts should be clean and simple.

The fill for progress bars must use the corresponding semantic color for that nutrient (e.g., blue for Protein).

In charts, each data series (e.g., Protein) must always be rendered in its assigned semantic color.

### 7. Animation & Motion Guidelines

Animation should be purposeful: enhancing the user experience without being distracting. The guiding principle is "Fluid and Functional, with Moments of Delight.".

#### Functional Motion

Standard, snappy iOS transitions should be used for navigation. Interactions should feel instant and responsive.

#### Delightful Moments

On Log Success: When a meal is logged, the relevant progress bars (e.g., Protein, Carbs) animate smoothly to their new values, filled with their respective semantic colors. This is accompanied by a subtle haptic feedback (a light "tap") to confirm success without needing to look.

On Goal Completion: When a daily goal is met, a non-disruptive celebration occurs. For example, the completed progress bar could emit a brief, soft shimmer using its specific semantic color. This provides a feeling of accomplishment without interrupting the user's flow.
