# Expo UI SwiftUI Integration Guide

## Core Philosophy

Use Expo UI SwiftUI components to create native iOS experiences where SwiftUI's design language provides superior UX. Maintain consistency with the existing React Native codebase while leveraging SwiftUI's native capabilities for iOS-specific features.

## When to Use SwiftUI vs React Native

### ✅ Use Expo UI SwiftUI For:

- **Native iOS Settings Screens** - Forms, toggles, and settings that benefit from native iOS design patterns
- **iOS-Specific Features** - Components that need to feel authentically iOS (e.g., iOS-style lists, native pickers)
- **Performance-Critical Views** - Native SwiftUI rendering can outperform React Native in complex scenarios
- **Apple Design Guidelines** - When strict adherence to Apple's HIG is required
- **Glass/Material Effects** - Native blur and glass effects (iOS 26+)

### ❌ Use React Native Instead For:

- **Cross-Platform Components** - Anything that needs to work on Android
- **Existing Component Library** - When you already have a working React Native component
- **Complex Animations** - react-native-reanimated provides better control
- **Custom Layouts** - Flexbox is more flexible than SwiftUI's layout system
- **Rapid Prototyping** - React Native development is faster

## Installation & Setup

```bash
npx expo install @expo/ui
```

**Requirements:**
- iOS only (no Android or web support)
- Expo SDK 52+
- For glass effects: Xcode 26+ and iOS 26+

## Core Concepts

### The Host Component

When using Expo UI, always wrap SwiftUI-powered children with the `<Host>` component. Think of the Host as a dedicated container—similar to an SVG element in the DOM or a Canvas in React Native Skia—that bridges the React Native tree with SwiftUI. Under the hood, Expo UI creates a `UIHostingController` to manage the SwiftUI view hierarchy for you.

```typescript
import { Host, CircularProgress } from 'expo-ui/swift-ui';

<Host>
  <CircularProgress />
</Host>
```

> Use `import { ... } from '@expo/ui/swift-ui'` if you're on the scoped package; the APIs are identical.

Use the `matchContents` prop whenever the SwiftUI layout should tightly hug its content instead of stretching to fill the React Native host view.

```typescript
import { Host, Text, VStack } from '@expo/ui/swift-ui';

// ✅ Good - Host wraps SwiftUI components
export function SettingsScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Host>
        <VStack spacing={16}>
          <Text>SwiftUI Content</Text>
        </VStack>
      </Host>
    </View>
  );
}

// ❌ Bad - Missing Host wrapper
export function SettingsScreen() {
  return (
    <VStack spacing={16}>
      <Text>This won't work!</Text>
    </VStack>
  );
}
```

**Key Rules:**
- Flexbox styles apply to `<Host>`, not SwiftUI components inside
- SwiftUI components use native SwiftUI layout system
- React Native components can nest inside, but with limitations

### Layout with Stacks

Expo UI mirrors SwiftUI's primary layout primitives. Use `HStack` to place items next to each other (like `flexDirection: 'row'`) and `VStack` to stack them vertically (`flexDirection: 'column'`). Spacing and alignment props replace `gap` and `alignItems`, so you can structure complex native layouts without falling back to React Native views.

## Building a UI with Expo UI

Building SwiftUI-powered cards or detail views follows the same React patterns you already use—compose a Host, drop in Expo UI primitives, and manage state with hooks.

### Hosting a Slider

Wrap interactive controls in a Host and opt into `matchContents` whenever you want the SwiftUI control to size itself rather than stretching to the Host's bounds.

```typescript
import { Host, Slider } from 'expo-ui/swift-ui';

<Host matchContents>
  <Slider value={0.5} onValueChange={(value) => console.log(value)} />
</Host>
```

### Wiring Up State

Expo UI callbacks behave like any other React component. You can derive SwiftUI state from hooks, compute labels, and feed everything back into your layout primitives.

```typescript
import { useState } from 'react';

const [mood, setMood] = useState('Neutral');
const [emoji, setEmoji] = useState('😐');

const fromSadToHappy = ['😢', '🙁', '😐', '🙂', '😄'];
const fromSadToHappyString = ['Sad', 'Low', 'Neutral', 'Good', 'Great'];

<Slider
  value={fromSadToHappyString.indexOf(mood)}
  maximumValue={fromSadToHappyString.length - 1}
  onValueChange={(value) => {
    const roundedNumber = Math.round(value);
    setEmoji(fromSadToHappy[roundedNumber]);
    setMood(fromSadToHappyString[roundedNumber]);
  }}
/>;
```

### Styling with Modifiers

Modifiers mirror SwiftUI's `View` modifiers. Pass an array to the `modifiers` prop to layer background, padding, corner radius, and more.

```typescript
import { Host, VStack } from 'expo-ui/swift-ui';
import { background, padding, cornerRadius } from 'expo-ui/swift-ui/modifiers';

<Host>
  <VStack
    modifiers={[
      background('white'),
      padding(16),
      cornerRadius(16)
    ]}
  >
    {/* ...content... */}
  </VStack>
</Host>
```

## Platform Considerations

Expo UI currently ships for iOS only. Provide graceful fallbacks for Android and web by colocating platform files—e.g. `NormalView.tsx` for the shared implementation and `NormalView.ios.tsx` for the Expo UI version. React Native's resolver automatically prefers the `.ios.tsx` file when the app runs on iOS.

## Component Reference

### Layout Components

#### VStack (Vertical Stack)

```typescript
import { Host, VStack, Text } from '@expo/ui/swift-ui';

// ✅ Good - Proper VStack usage
<Host>
  <VStack spacing={16} alignment="leading">
    <Text>First Item</Text>
    <Text>Second Item</Text>
    <Text>Third Item</Text>
  </VStack>
</Host>

// With modifiers
<Host>
  <VStack
    spacing={12}
    modifiers={[
      padding({ all: 20 }),
      background({ color: 'white' })
    ]}
  >
    <Text>Styled Stack</Text>
  </VStack>
</Host>
```

**Props:**
- `spacing?: number` - Space between items
- `alignment?: 'leading' | 'center' | 'trailing'`
- `modifiers?: Modifier[]`

#### HStack (Horizontal Stack)

```typescript
import { Host, HStack, Text, Spacer } from '@expo/ui/swift-ui';

// ✅ Good - Horizontal layout
<Host>
  <HStack spacing={8} alignment="center">
    <Text>Label</Text>
    <Spacer />
    <Text>Value</Text>
  </HStack>
</Host>
```

**Props:**
- `spacing?: number` - Space between items
- `alignment?: 'top' | 'center' | 'bottom'`
- `modifiers?: Modifier[]`

### Text Component

```typescript
import { Host, Text } from '@expo/ui/swift-ui';
import { padding, foregroundStyle } from '@expo/ui/swift-ui/modifiers';

// ✅ Good - SwiftUI Text with modifiers
<Host>
  <Text
    modifiers={[
      padding({ horizontal: 16, vertical: 8 }),
      foregroundStyle({ color: 'primary' })
    ]}
  >
    Native iOS Text
  </Text>
</Host>

// ❌ Bad - Mixing AppText styling approaches
// Don't try to use AppText role prop with SwiftUI Text
<Host>
  <Text role="headline">This won't work</Text>
</Host>
```

**When to Use:**
- iOS-specific text that needs native rendering
- Text within SwiftUI layouts
- Integration with SwiftUI modifiers

**When to Use AppText Instead:**
- Cross-platform text
- Text with your custom theme system
- Text outside SwiftUI Host components

### Button Component

```typescript
import { Host, Button, Text } from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';

// ✅ Good - SwiftUI Button
<Host>
  <Button
    action={() => {
      handlePress();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }}
    modifiers={[padding({ all: 16 })]}
  >
    <Text>Tap Me</Text>
  </Button>
</Host>

// With Link for navigation
import { Link } from '@expo/ui/swift-ui';

<Host>
  <Link href="/settings">
    <Button>
      <Text>Go to Settings</Text>
    </Button>
  </Link>
</Host>
```

**Props:**
- `action: () => void` - Callback when pressed
- `modifiers?: Modifier[]`
- Children: SwiftUI components to render inside

**Integration Tips:**
- Combine with expo-haptics for feedback
- Use with your store for state updates
- Can wrap with Link for navigation

### Switch Component

```typescript
import { useState } from 'react';
import { Host, HStack, Text, Switch } from '@expo/ui/swift-ui';
import * as Haptics from 'expo-haptics';

// ✅ Good - Integrated with your patterns
export function NotificationToggle() {
  const [enabled, setEnabled] = useState(false);
  const { theme } = useTheme();

  return (
    <Host>
      <HStack spacing={12} alignment="center">
        <Text>Enable Notifications</Text>
        <Switch
          value={enabled}
          onValueChange={(value) => {
            setEnabled(value);
            Haptics.impactAsync(
              Haptics.ImpactFeedbackStyle[theme.haptics.impact]
            );
          }}
        />
      </HStack>
    </Host>
  );
}
```

**Props:**
- `value: boolean` - Current state
- `onValueChange: (value: boolean) => void` - Callback
- `modifiers?: Modifier[]`

### Progress Indicators

#### CircularProgress

```typescript
import { Host, CircularProgress, VStack, Text } from '@expo/ui/swift-ui';

// ✅ Good - Loading indicator
<Host>
  <VStack spacing={16} alignment="center">
    <CircularProgress
      color="blue"
      modifiers={[padding({ all: 20 })]}
    />
    <Text>Loading...</Text>
  </VStack>
</Host>
```

**Props:**
- `color?: string` - Progress indicator color
- `modifiers?: Modifier[]`

#### LinearProgress

```typescript
import { Host, LinearProgress, VStack, Text } from '@expo/ui/swift-ui';

// ✅ Good - Progress bar for workouts
export function WorkoutProgress({ completed, total }: Props) {
  const progress = completed / total;

  return (
    <Host>
      <VStack spacing={8}>
        <HStack>
          <Text>Workout Progress</Text>
          <Spacer />
          <Text>{Math.round(progress * 100)}%</Text>
        </HStack>
        <LinearProgress
          progress={progress}
          color="green"
          modifiers={[frame({ height: 8 })]}
        />
      </VStack>
    </Host>
  );
}
```

**Props:**
- `progress: number` - Value between 0 and 1
- `color?: string` - Progress bar color
- `modifiers?: Modifier[]`

### Form Components

#### Form & Section

```typescript
import { Host, Form, Section, HStack, Text, Switch } from '@expo/ui/swift-ui';

// ✅ Good - iOS-style settings form
export function SettingsForm() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  return (
    <Host>
      <Form>
        <Section header="Notifications">
          <HStack>
            <Text>Push Notifications</Text>
            <Spacer />
            <Switch
              value={settings.pushEnabled}
              onValueChange={(value) =>
                updateSettings({ pushEnabled: value })
              }
            />
          </HStack>
        </Section>

        <Section header="Display">
          <HStack>
            <Text>Dark Mode</Text>
            <Spacer />
            <Switch
              value={settings.darkMode}
              onValueChange={(value) =>
                updateSettings({ darkMode: value })
              }
            />
          </HStack>
        </Section>
      </Form>
    </Host>
  );
}
```

**Props:**
- `Section.header?: string` - Section title
- `Section.footer?: string` - Section description

## Modifiers API

Modifiers customize the appearance and behavior of SwiftUI components. They're applied via the `modifiers` prop as an array.

### Import Modifiers

```typescript
import {
  padding,
  background,
  foregroundStyle,
  frame,
  clipShape,
  glassEffect,
  shadow,
  cornerRadius
} from '@expo/ui/swift-ui/modifiers';
```

### Padding

```typescript
// All sides
modifiers={[padding({ all: 16 })]}

// Specific sides
modifiers={[padding({ horizontal: 20, vertical: 12 })]}
modifiers={[padding({ top: 8, bottom: 8, leading: 16, trailing: 16 })]}

// Individual sides
modifiers={[padding({ leading: 16 })]}
```

### Background

```typescript
// Solid color
modifiers={[background({ color: 'blue' })]}

// Theme colors (use your theme values)
const { theme } = useTheme();
modifiers={[background({ color: theme.colors.background })]}

// With material effect
modifiers={[background({ material: 'regular' })]}
```

### Frame (Sizing)

```typescript
// Fixed size
modifiers={[frame({ width: 200, height: 100 })]}

// Min/max constraints
modifiers={[frame({ minWidth: 100, maxWidth: 300 })]}

// Full width
modifiers={[frame({ maxWidth: Infinity })]}

// Ideal size (preferred size)
modifiers={[frame({ idealWidth: 200, idealHeight: 100 })]}
```

### Foreground Style (Text Color)

```typescript
// Solid color
modifiers={[foregroundStyle({ color: 'primary' })]}

// Custom color
modifiers={[foregroundStyle({ color: '#FF6B6B' })]}

// Theme integration
const { theme } = useTheme();
modifiers={[foregroundStyle({ color: theme.colors.text })]}
```

### Clip Shape

```typescript
// Rounded rectangle
modifiers={[clipShape({ type: 'roundedRectangle', cornerRadius: 12 })]}

// Circle
modifiers={[clipShape({ type: 'circle' })]}

// Capsule
modifiers={[clipShape({ type: 'capsule' })]}
```

### Corner Radius

```typescript
// Simple corner radius
modifiers={[cornerRadius({ radius: 12 })]}

// Specific corners
modifiers={[cornerRadius({
  topLeading: 16,
  topTrailing: 16,
  bottomLeading: 0,
  bottomTrailing: 0
})]}
```

### Glass Effect (iOS 26+)

```typescript
// Clear glass
modifiers={[glassEffect({ glass: { variant: 'clear' } })]}

// Frosted glass
modifiers={[glassEffect({ glass: { variant: 'frosted' } })]}

// Tinted glass
modifiers={[glassEffect({
  glass: { variant: 'tinted', tint: 'blue' }
})]}
```

### Shadow

```typescript
// Simple shadow
modifiers={[shadow({ radius: 8, x: 0, y: 4 })]}

// Shadow with color
modifiers={[shadow({
  radius: 10,
  x: 0,
  y: 5,
  color: 'rgba(0, 0, 0, 0.1)'
})]}
```

### Chaining Modifiers

```typescript
// ✅ Good - Multiple modifiers in order
<Host>
  <VStack
    modifiers={[
      padding({ all: 20 }),
      background({ color: 'white' }),
      cornerRadius({ radius: 16 }),
      shadow({ radius: 8, x: 0, y: 4 }),
    ]}
  >
    <Text>Styled Container</Text>
  </VStack>
</Host>

// Order matters! Modifiers apply in sequence
// padding -> background -> cornerRadius -> shadow
```

## Integration with Your Tech Stack

### Theme System Integration

```typescript
import { Host, VStack, Text, HStack } from '@expo/ui/swift-ui';
import { background, foregroundStyle, padding, cornerRadius } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from '@/hooks/useTheme';

// ✅ Good - Using your theme with SwiftUI
export function ThemedCard({ title, value }: Props) {
  const { theme } = useTheme();

  return (
    <Host>
      <VStack
        spacing={theme.spacing.md}
        modifiers={[
          padding({ all: theme.spacing.lg }),
          background({ color: theme.colors.cardBackground }),
          cornerRadius({ radius: theme.borderRadius.lg }),
        ]}
      >
        <Text modifiers={[foregroundStyle({ color: theme.colors.textSecondary })]}>
          {title}
        </Text>
        <Text modifiers={[foregroundStyle({ color: theme.colors.text })]}>
          {value}
        </Text>
      </VStack>
    </Host>
  );
}
```

### State Management with Store

```typescript
import { Host, Form, Section, HStack, Text, Switch } from '@expo/ui/swift-ui';
import { useStore } from '@/utils/store';
import * as Haptics from 'expo-haptics';

// ✅ Good - Integrated with zustand store
export function UserSettings() {
  const settings = useStore((state) => state.userSettings);
  const updateSettings = useStore((state) => state.updateUserSettings);
  const { theme } = useTheme();

  return (
    <Host>
      <Form>
        <Section header="Preferences">
          <HStack spacing={12}>
            <Text>Metric Units</Text>
            <Spacer />
            <Switch
              value={settings.useMetric}
              onValueChange={(value) => {
                updateSettings({ useMetric: value });
                Haptics.impactAsync(
                  Haptics.ImpactFeedbackStyle[theme.haptics.impact]
                );
              }}
            />
          </HStack>
        </Section>
      </Form>
    </Host>
  );
}
```

### Navigation with Expo Router

```typescript
import { Host, Button, Text } from '@expo/ui/swift-ui';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import * as Haptics from 'expo-haptics';

// ✅ Good - Using your safe router
export function NavigationButton() {
  const router = useSafeRouter();
  const { theme } = useTheme();

  return (
    <Host>
      <Button
        action={() => {
          Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle[theme.haptics.impact]
          );
          router.push('/settings');
        }}
      >
        <Text>Go to Settings</Text>
      </Button>
    </Host>
  );
}
```

### Mixing React Native and SwiftUI

```typescript
import { View, StyleSheet } from 'react-native';
import { Host, VStack, Text, HStack } from '@expo/ui/swift-ui';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';

// ✅ Good - Combining React Native and SwiftUI
export function MixedComponent() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* React Native header */}
      <AppText role="headline">Workout Summary</AppText>

      {/* SwiftUI content */}
      <Host style={{ marginTop: theme.spacing.md }}>
        <VStack spacing={12}>
          <HStack>
            <Text>Duration</Text>
            <Spacer />
            <Text>45 min</Text>
          </HStack>
          <HStack>
            <Text>Calories</Text>
            <Spacer />
            <Text>320 kcal</Text>
          </HStack>
        </VStack>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

## Layout Patterns

### SwiftUI Layout vs React Native Flexbox

```typescript
// ❌ Bad - Trying to use flexbox on SwiftUI components
<Host>
  <VStack style={{ flexDirection: 'column', gap: 16 }}>
    <Text>This won't work!</Text>
  </VStack>
</Host>

// ✅ Good - Using SwiftUI layout
<Host>
  <VStack spacing={16} alignment="leading">
    <Text>This works!</Text>
  </VStack>
</Host>

// ✅ Good - Flexbox on Host, SwiftUI layout inside
<Host style={{ flex: 1, padding: 16 }}>
  <VStack spacing={16}>
    <Text>SwiftUI Layout</Text>
  </VStack>
</Host>
```

### Spacer Component

```typescript
import { Host, HStack, Text, Spacer } from '@expo/ui/swift-ui';

// ✅ Good - Using Spacer for flexible space
<Host>
  <HStack>
    <Text>Left</Text>
    <Spacer />
    <Text>Right</Text>
  </HStack>
</Host>

// Push items to edges
<Host>
  <VStack>
    <Text>Top</Text>
    <Spacer />
    <Text>Bottom</Text>
  </VStack>
</Host>
```

### Alignment Patterns

```typescript
// Vertical alignment in HStack
<Host>
  <HStack alignment="top">
    <Text>Top aligned</Text>
    <Text>Also top</Text>
  </HStack>
</Host>

// Horizontal alignment in VStack
<Host>
  <VStack alignment="leading">
    <Text>Left aligned</Text>
    <Text>Also left</Text>
  </VStack>
</Host>

// Center everything
<Host>
  <VStack alignment="center">
    <HStack alignment="center">
      <Text>Centered</Text>
    </HStack>
  </VStack>
</Host>
```

## Event Handling & State Management

### Local State

```typescript
import { useState } from 'react';
import { Host, VStack, Button, Text } from '@expo/ui/swift-ui';

// ✅ Good - Standard React state
export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <Host>
      <VStack spacing={16} alignment="center">
        <Text>Count: {count}</Text>
        <Button action={() => setCount(count + 1)}>
          <Text>Increment</Text>
        </Button>
      </VStack>
    </Host>
  );
}
```

### Store Integration

```typescript
import { Host, Form, Section, HStack, Text, Switch } from '@expo/ui/swift-ui';
import { useStore } from '@/utils/store';

// ✅ Good - Zustand store with SwiftUI
export function WorkoutSettings() {
  const autoStartTimer = useStore((state) => state.workoutSettings.autoStartTimer);
  const updateWorkoutSettings = useStore((state) => state.updateWorkoutSettings);

  return (
    <Host>
      <Form>
        <Section header="Timer">
          <HStack>
            <Text>Auto-start Timer</Text>
            <Spacer />
            <Switch
              value={autoStartTimer}
              onValueChange={(value) =>
                updateWorkoutSettings({ autoStartTimer: value })
              }
            />
          </HStack>
        </Section>
      </Form>
    </Host>
  );
}
```

### Callbacks and Props

```typescript
interface SettingToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

// ✅ Good - Props-based callbacks
export function SettingToggle({ label, value, onValueChange }: SettingToggleProps) {
  return (
    <Host>
      <HStack spacing={12}>
        <Text>{label}</Text>
        <Spacer />
        <Switch value={value} onValueChange={onValueChange} />
      </HStack>
    </Host>
  );
}

// Usage
<SettingToggle
  label="Notifications"
  value={enabled}
  onValueChange={(value) => {
    setEnabled(value);
    saveToStorage(value);
  }}
/>
```

## Performance Considerations

### When SwiftUI Performs Better

```typescript
// ✅ Good - Native iOS list with many items
<Host>
  <Form>
    {items.map((item) => (
      <Section key={item.id}>
        <HStack>
          <Text>{item.name}</Text>
          <Spacer />
          <Text>{item.value}</Text>
        </HStack>
      </Section>
    ))}
  </Form>
</Host>
```

### When React Native Performs Better

```typescript
// ✅ Good - Complex animations with reanimated
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function AnimatedCard() {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isPressed.value ? 0.95 : 1) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {/* Use React Native for complex animations */}
    </Animated.View>
  );
}
```

### Optimization Tips

```typescript
// ✅ Good - Memoize complex SwiftUI components
const MemoizedSettingsSection = React.memo(({ settings }: Props) => (
  <Host>
    <Section header="Settings">
      {/* Complex SwiftUI layout */}
    </Section>
  </Host>
));

// ✅ Good - Avoid unnecessary re-renders
export function OptimizedSettings() {
  const settings = useStore((state) => state.settings, shallow);

  return <MemoizedSettingsSection settings={settings} />;
}
```

## Best Practices

### Do's ✅

```typescript
// ✅ Use SwiftUI for iOS-native settings screens
<Host>
  <Form>
    <Section header="Profile">
      <HStack>
        <Text>Name</Text>
        <Spacer />
        <Text>{userName}</Text>
      </HStack>
    </Section>
  </Form>
</Host>

// ✅ Apply modifiers in logical order
modifiers={[
  padding({ all: 16 }),        // 1. Spacing
  background({ color: 'white' }), // 2. Background
  cornerRadius({ radius: 12 }),   // 3. Shape
  shadow({ radius: 8 })           // 4. Effects
]}

// ✅ Use Spacer for flexible layouts
<HStack>
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</HStack>

// ✅ Integrate with your theme
const { theme } = useTheme();
modifiers={[
  padding({ all: theme.spacing.md }),
  background({ color: theme.colors.background })
]}

// ✅ Add haptics to interactions
<Switch
  value={enabled}
  onValueChange={(value) => {
    setEnabled(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }}
/>

// ✅ Use Host for containerization
<View style={{ flex: 1 }}>
  <Host>
    <VStack spacing={16}>
      {/* SwiftUI content */}
    </VStack>
  </Host>
</View>
```

### Don'ts ❌

```typescript
// ❌ Don't use SwiftUI without Host
<VStack spacing={16}>
  <Text>Missing Host!</Text>
</VStack>

// ❌ Don't apply flexbox to SwiftUI components
<Host>
  <VStack style={{ flexDirection: 'column', gap: 16 }}>
    <Text>Use spacing prop instead!</Text>
  </VStack>
</Host>

// ❌ Don't mix AppText with SwiftUI Text
<Host>
  <VStack>
    <AppText role="headline">Don't mix these</AppText>
    <Text>Use one or the other</Text>
  </VStack>
</Host>

// ❌ Don't use SwiftUI for cross-platform screens
// If it needs to work on Android, use React Native
<Host>
  <VStack>
    <Text>iOS only!</Text>
  </VStack>
</Host>

// ❌ Don't hardcode colors
modifiers={[background({ color: '#FF0000' })]}
// Use theme instead:
modifiers={[background({ color: theme.colors.primary })]}

// ❌ Don't use SwiftUI for complex animations
// Use react-native-reanimated instead
<Host>
  <VStack>
    {/* Complex animation here - wrong tool! */}
  </VStack>
</Host>

// ❌ Don't forget haptic feedback
<Switch value={enabled} onValueChange={setEnabled} />
// Add haptics:
<Switch
  value={enabled}
  onValueChange={(value) => {
    setEnabled(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }}
/>
```

## Common Patterns for Gainslog

### Settings Screen

```typescript
import { Host, Form, Section, HStack, Text, Switch, Spacer } from '@expo/ui/swift-ui';
import { useStore } from '@/utils/store';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';

export function SettingsScreen() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const { theme } = useTheme();

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({ [key]: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle[theme.haptics.impact]);
  };

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section header="Units">
          <HStack spacing={12}>
            <Text>Use Metric Units</Text>
            <Spacer />
            <Switch
              value={settings.useMetric}
              onValueChange={(value) => handleToggle('useMetric', value)}
            />
          </HStack>
        </Section>

        <Section header="Tracking">
          <HStack spacing={12}>
            <Text>Auto-log Nutrition</Text>
            <Spacer />
            <Switch
              value={settings.autoLogNutrition}
              onValueChange={(value) => handleToggle('autoLogNutrition', value)}
            />
          </HStack>

          <HStack spacing={12}>
            <Text>Track Body Weight</Text>
            <Spacer />
            <Switch
              value={settings.trackWeight}
              onValueChange={(value) => handleToggle('trackWeight', value)}
            />
          </HStack>
        </Section>

        <Section header="Notifications">
          <HStack spacing={12}>
            <Text>Workout Reminders</Text>
            <Spacer />
            <Switch
              value={settings.workoutReminders}
              onValueChange={(value) => handleToggle('workoutReminders', value)}
            />
          </HStack>
        </Section>
      </Form>
    </Host>
  );
}
```

### Progress Indicator

```typescript
import { Host, VStack, HStack, Text, LinearProgress, Spacer } from '@expo/ui/swift-ui';
import { padding, background, cornerRadius } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from '@/hooks/useTheme';

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  color: string;
}

export function MacroProgress({ label, current, target, color }: MacroProgressProps) {
  const { theme } = useTheme();
  const progress = Math.min(current / target, 1);
  const remaining = Math.max(target - current, 0);

  return (
    <Host>
      <VStack
        spacing={theme.spacing.sm}
        modifiers={[
          padding({ all: theme.spacing.md }),
          background({ color: theme.colors.cardBackground }),
          cornerRadius({ radius: theme.borderRadius.md })
        ]}
      >
        <HStack>
          <Text>{label}</Text>
          <Spacer />
          <Text>{remaining}g remaining</Text>
        </HStack>

        <LinearProgress
          progress={progress}
          color={color}
          modifiers={[
            frame({ height: 8 }),
            cornerRadius({ radius: 4 })
          ]}
        />

        <HStack>
          <Text>{current}g</Text>
          <Spacer />
          <Text>{target}g</Text>
        </HStack>
      </VStack>
    </Host>
  );
}
```

### Loading State

```typescript
import { Host, VStack, CircularProgress, Text } from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';

export function LoadingView({ message = 'Loading...' }: { message?: string }) {
  return (
    <Host style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <VStack
        spacing={16}
        alignment="center"
        modifiers={[padding({ all: 32 })]}
      >
        <CircularProgress color="blue" />
        <Text>{message}</Text>
      </VStack>
    </Host>
  );
}
```

### Workout Summary Card

```typescript
import { Host, VStack, HStack, Text, Spacer } from '@expo/ui/swift-ui';
import { padding, background, cornerRadius, shadow } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from '@/hooks/useTheme';

interface WorkoutSummaryProps {
  duration: string;
  calories: number;
  exercises: number;
  sets: number;
}

export function WorkoutSummary({ duration, calories, exercises, sets }: WorkoutSummaryProps) {
  const { theme } = useTheme();

  return (
    <Host>
      <VStack
        spacing={theme.spacing.md}
        modifiers={[
          padding({ all: theme.spacing.lg }),
          background({ color: theme.colors.cardBackground }),
          cornerRadius({ radius: theme.borderRadius.lg }),
          shadow({ radius: 8, x: 0, y: 4 })
        ]}
      >
        <Text>Workout Complete!</Text>

        <VStack spacing={theme.spacing.sm}>
          <HStack>
            <Text>Duration</Text>
            <Spacer />
            <Text>{duration}</Text>
          </HStack>

          <HStack>
            <Text>Calories Burned</Text>
            <Spacer />
            <Text>{calories} kcal</Text>
          </HStack>

          <HStack>
            <Text>Exercises</Text>
            <Spacer />
            <Text>{exercises}</Text>
          </HStack>

          <HStack>
            <Text>Total Sets</Text>
            <Spacer />
            <Text>{sets}</Text>
          </HStack>
        </VStack>
      </VStack>
    </Host>
  );
}
```

## Advanced Usage

Once you're comfortable with the core primitives, explore the richer SwiftUI surface area that Expo UI exposes:

- Charts for animated visualizations
- Context menus without extra native modules
- Native date and time pickers
- Switches and buttons with liquid glass effects

```typescript
import {
  Host,
  VStack,
  HStack,
  Text as UIText,
  Slider,
  Switch,
  LinearProgress
} from 'expo-ui/swift-ui';

<Host>
  <VStack spacing={16}>
    <HStack spacing={32}>
      <UIText size={48}>{emoji}</UIText>
      <VStack>
        <UIText>{mood}</UIText>
        <Slider /* ...props... */ />
      </VStack>
    </HStack>
    <LinearProgress value={/* ...progress... */} />
    <Switch value={true} />
  </VStack>
</Host>
```

Combine these components with modifiers to produce native-feeling cards, dashboards, and controls while keeping your React state management intact.

## Limitations & Constraints

### Platform Support

- **iOS Only** - No Android or web support
- Must check platform before using:

```typescript
import { Platform } from 'react-native';

// ✅ Good - Platform check
export function SettingsScreen() {
  if (Platform.OS !== 'ios') {
    return <ReactNativeSettings />;
  }

  return (
    <Host>
      <Form>
        {/* SwiftUI settings */}
      </Form>
    </Host>
  );
}
```

### Layout Limitations

- SwiftUI components don't use React Native flexbox
- React Native components can be nested, but with constraints
- Layout calculation happens in native code

```typescript
// ❌ Won't work as expected
<Host>
  <VStack>
    <View style={{ flex: 1 }}>
      <Text>React Native View in SwiftUI</Text>
    </View>
  </VStack>
</Host>

// ✅ Better approach
<View style={{ flex: 1 }}>
  <Host>
    <VStack>
      <Text>Keep layouts separate</Text>
    </VStack>
  </Host>
</View>
```

### Feature Requirements

- Glass effects require iOS 26+ and Xcode 26+
- Some modifiers may not be available on older iOS versions
- Always test on target iOS versions

### Performance Considerations

- Host component creates a native view bridge
- Multiple Host components may impact performance
- Consider using a single Host per screen when possible

```typescript
// ❌ Less performant - Multiple Host components
{items.map((item) => (
  <Host key={item.id}>
    <Text>{item.name}</Text>
  </Host>
))}

// ✅ More performant - Single Host
<Host>
  <VStack spacing={8}>
    {items.map((item) => (
      <Text key={item.id}>{item.name}</Text>
    ))}
  </VStack>
</Host>
```

## Debugging Tips

### Check Component Hierarchy

```typescript
// ✅ Good - Proper hierarchy
<View> {/* React Native container */}
  <Host> {/* SwiftUI bridge */}
    <VStack> {/* SwiftUI layout */}
      <Text>Content</Text>
    </VStack>
  </Host>
</View>
```

### Verify Platform

```typescript
import { Platform } from 'react-native';

if (Platform.OS !== 'ios') {
  console.warn('Expo UI SwiftUI only works on iOS');
}
```

### Test Layout Issues

```typescript
// Add visual debugging
<Host>
  <VStack
    modifiers={[
      background({ color: 'red' }), // Visual debug
      padding({ all: 8 })
    ]}
  >
    <Text>Debug layout</Text>
  </VStack>
</Host>
```

## Migration Checklist

When converting existing React Native screens to SwiftUI:

- [ ] Screen is iOS-only
- [ ] Native iOS design patterns are desired
- [ ] No complex animations required
- [ ] Layout can be expressed with VStack/HStack
- [ ] Theme values are available
- [ ] Store integration is in place
- [ ] Haptic feedback is added
- [ ] Navigation uses useSafeRouter
- [ ] Platform checks are implemented
- [ ] Loading/error states use SwiftUI components
- [ ] Accessibility is maintained
- [ ] Performance is tested

## Quality Checklist

Before using Expo UI SwiftUI in production:

- [ ] All SwiftUI components are wrapped in Host
- [ ] Theme values are used instead of hardcoded colors
- [ ] Haptic feedback is implemented for interactions
- [ ] Platform checks are in place
- [ ] Store integration follows existing patterns
- [ ] Navigation uses useSafeRouter
- [ ] Loading states are implemented
- [ ] Error handling is in place
- [ ] Modifiers are in logical order
- [ ] Layout works on different screen sizes
- [ ] Component is memoized if complex
- [ ] No flexbox styles on SwiftUI components
- [ ] AppText is not mixed with SwiftUI Text
- [ ] Performance is acceptable
- [ ] Tested on target iOS versions

## Resources

- [Expo UI Documentation](https://docs.expo.dev/guides/expo-ui-swift-ui/)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

Remember: Use Expo UI SwiftUI to create truly native iOS experiences, but maintain consistency with your existing React Native architecture and patterns. Happy coding! 🚀
