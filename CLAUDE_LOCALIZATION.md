# Localization Guide for GainsLog

This document outlines our clean, modern approach to internationalization (i18n) using i18next and Expo's official localization tools.

## Philosophy

We follow a **simple, best-practice approach** for localization:

- Use i18next (industry standard) with react-i18next for React integration
- Use expo-localization for device locale detection
- Centralized JSON translation files (one per language)
- No custom wrappers or abstractions - use i18next directly
- Compatible with i18n-ally VS Code extension for excellent developer experience
- Organized by feature/screen for maintainability

## React Compiler & Performance

This project uses **React 19.1.0** with the **React Compiler enabled** (via Expo SDK 54+).

**What this means for you:**

- **Automatic memoization**: The React Compiler automatically optimizes your components by memoizing values and functions. You don't need to manually use `useMemo`, `useCallback`, or `React.memo` in most cases.
- **Write simple code first**: Focus on clean, readable code. Trust the compiler to handle optimization.
- **Only optimize when needed**: Only add manual memoization (`useMemo`, `useCallback`) if profiling reveals an actual performance bottleneck. Don't prematurely optimize.

**For i18n specifically:**

- Getter functions (like `getLabels()`) are still needed because `i18next.t()` must be called after i18n initialization
- You don't need to wrap getter function calls in `useMemo` - just call them directly
- The React Compiler will handle the optimization automatically

## Supported Languages

- **English (en)** - Default fallback language
- **German (de)** - First localized language

Additional languages can be added by creating new JSON files in `src/locales/`.

## File Structure

```
src/
├── lib/
│   └── i18n.ts                 # i18next configuration
├── locales/
│   ├── en.json                 # English translations (fallback)
│   └── de.json                 # German translations
└── [app files]

.vscode/
└── settings.json               # i18n-ally configuration
```

## How It Works

### 1. Automatic Language Detection

The app automatically detects the device language on startup:

```typescript
import { getLocales } from 'expo-localization';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
```

- If the device is set to German → app shows German
- If the device is set to any other language → app shows English (fallback)

### 2. Translation File Structure

Translations are organized by feature/screen in nested JSON:

```json
{
  "nutrients": {
    "calories": {
      "label": "Calories",
      "unit": "kcal"
    },
    "protein": {
      "label": "Protein",
      "unit": "g"
    }
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong"
  }
}
```

### 3. Using Translations in Components

Use the `useTranslation` hook from react-i18next:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('nutrients.calories.label')}</Text>
      <Text>{t('common.loading')}</Text>
    </View>
  );
}
```

### 4. Using Translations in Components

Just use `t("key")` directly - no special handling needed:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('nutrients.calories.label')}</Text>
      <Text>{t('nutrients.protein.label')}</Text>
    </View>
  );
}
```

That's it! Don't overcomplicate things.

## The Simple Pattern

**That's it. This is 90% of your translation usage:**

```typescript
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t("home.welcome.title")}</Text>
      <Text>{t("home.welcome.subtitle")}</Text>
      <Button>{t("common.save")}</Button>
    </View>
  );
}
```

**Rules:**
1. Import `useTranslation` hook
2. Call it to get `t`
3. Use `t("key")` anywhere in your component

**Don't:**
- Don't import `i18next` directly
- Don't wrap `t()` calls in `useMemo` (React Compiler handles it)
- Don't overthink it

## Translation Keys Naming Convention

Follow this consistent pattern:

```
{feature/screen}.{component/section}.{specific_string}
```

**Examples:**
- `nutrients.calories.label` - Nutrient label
- `nutrients.protein.unit` - Nutrient unit
- `home.welcome.title` - Home screen welcome title
- `settings.profile.edit` - Settings profile edit button
- `common.save` - Common save button
- `common.cancel` - Common cancel button

**Guidelines:**
- Use descriptive, semantic keys (not generic like `text1`, `label2`)
- Group related translations under the same parent key
- Place reusable strings under `common.*`
- Use lowercase with underscores for multi-word keys: `daily_summary`, `food_log`

## Adding New Translations

### Step 1: Add to English (en.json)

Add your translation to the appropriate section:

```json
{
  "nutrients": {
    "calories": {
      "label": "Calories",
      "unit": "kcal",
      "description": "Daily calorie intake"  // NEW
    }
  }
}
```

### Step 2: Add to All Other Languages

Add the same key to `de.json` and any other language files:

```json
{
  "nutrients": {
    "calories": {
      "label": "Kalorien",
      "unit": "kcal",
      "description": "Tägliche Kalorienaufnahme"  // NEW
    }
  }
}
```

### Step 3: Use in Code

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  const description = t('nutrients.calories.description');

  return <Text>{description}</Text>;
}
```

## Adding a New Language

To add a new language (e.g., Spanish):

### 1. Create Translation File

Create `src/locales/es.json` with all translations:

```json
{
  "nutrients": {
    "calories": {
      "label": "Calorías",
      "unit": "kcal"
    }
  }
}
```

### 2. Update i18n Configuration

Edit `src/lib/i18n.ts`:

```typescript
import en from "../locales/en.json";
import de from "../locales/de.json";
import es from "../locales/es.json"; // ADD THIS

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      es: { translation: es }, // ADD THIS
    },
    // ... rest of config
  });
```

### 3. Update VS Code Settings (Optional)

If using i18n-ally, it will auto-detect the new file.

That's it! The app will now support Spanish if the device language is set to Spanish.

## Advanced Features

### Interpolation (Variables in Translations)

Add dynamic values to translations:

**Translation:**
```json
{
  "common": {
    "itemCount": "You have {{count}} items"
  }
}
```

**Usage:**
```typescript
const { t } = useTranslation();
const message = t('common.itemCount', { count: 5 }); // "You have 5 items"
```

### Pluralization

Handle singular/plural forms using i18next's suffix notation:

**Translation:**
```json
{
  "common": {
    "items_zero": "No items",
    "items_one": "One item",
    "items_other": "{{count}} items"
  }
}
```

**Usage:**
```typescript
const { t } = useTranslation();
t('common.items', { count: 0 });  // "No items"
t('common.items', { count: 1 });  // "One item"
t('common.items', { count: 5 });  // "5 items"
```

### Changing Language Programmatically

```typescript
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View>
      <Button onPress={() => changeLanguage('en')} title="English" />
      <Button onPress={() => changeLanguage('de')} title="Deutsch" />
    </View>
  );
}
```

## Developer Experience: i18n-ally Extension

### Installation

Install the [i18n-ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) VS Code extension.

### Features

With our `.vscode/settings.json` configuration, you get:

- **Inline translation preview** - See translations directly in your code
- **Autocomplete** - Translation key suggestions as you type
- **Missing translation detection** - Highlights untranslated keys
- **Quick edit** - Edit translations without leaving your code
- **Translation progress** - See completion status for each language

### Usage

When you type `t('`, the extension shows available keys and their values in all languages.

## Real Example: NutrientDashboard Component

Here's how a real component uses translations in the app:

### Translation Files

**en.json:**
```json
{
  "nutrients": {
    "calories": { "label": "Calories" },
    "protein": { "label": "Protein" },
    "of": "of"
  }
}
```

**de.json:**
```json
{
  "nutrients": {
    "calories": { "label": "Kalorien" },
    "protein": { "label": "Protein" },
    "of": "von"
  }
}
```

### Simple Usage (Recommended)

```typescript
import { useTranslation } from "react-i18next";

const NutrientDashboard = () => {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t("nutrients.calories.label")}</Text>
      <Text>{t("nutrients.protein.label")}</Text>
      <Text>{t("nutrients.of")} {target}</Text>
    </View>
  );
};
```

That's it! No complexity needed.

### Advanced: With Module Constants

If you really need module-level constants (see "Advanced" section), you can use getter functions. But for most cases, the simple approach above is preferred.

## Best Practices

### ✅ Do

- Import `useTranslation` hook and get `t` from it
- Use `t("key")` directly in your components - that's it!
- Use semantic, descriptive translation keys (not `text1`, `label2`)
- Organize translations by feature/screen
- Keep common/reusable strings under `common.*`
- Add translations to ALL language files when adding new keys
- Test your app in different languages during development
- Trust React Compiler - don't wrap `t()` calls in `useMemo`

### ❌ Don't

- Don't hardcode strings - use `t("key")` instead
- **Don't import `i18next` directly** - use `useTranslation()` hook
- Don't wrap `t()` calls in `useMemo` (React Compiler handles it)
- Don't use generic keys like `text1`, `label2`
- Don't create deeply nested structures (max 3-4 levels)
- Don't overthink it - just use `t("key")`!

## Common Patterns

### Pattern 1: Simple Component Translation

```typescript
import { useTranslation } from "react-i18next";

function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t("home.welcome.title")}</Text>
      <Text>{t("home.welcome.subtitle")}</Text>
    </View>
  );
}
```

### Pattern 2: Interpolation (Variables in Translations)

```typescript
import { useTranslation } from "react-i18next";

function UserGreeting({ userName }: { userName: string }) {
  const { t } = useTranslation();

  return <Text>{t("common.greeting", { name: userName })}</Text>;
}

// Translation: "common.greeting": "Hello, {{name}}!"
```

## Advanced: Module-Level Constants

**Only use this pattern if you need translations in module-level constants** (outside of components). For 90% of cases, just use `t("key")` directly in your component.

### When You Need This

If you have constants defined outside components that need translations:

```typescript
// constants.ts
import type { TFunction } from "i18next";

// Getter function accepts t as parameter
export const getMenuItems = (t: TFunction) => [
  { id: 1, label: t("menu.home") },
  { id: 2, label: t("menu.settings") },
];

// Component.tsx
import { useTranslation } from "react-i18next";
import { getMenuItems } from "./constants";

function Menu() {
  const { t } = useTranslation();
  const items = getMenuItems(t); // Pass t to the getter

  return items.map(item => <MenuItem key={item.id} {...item} />);
}
```

**Why this pattern?**
- Can't use hooks at module level
- Getter functions stay pure and testable
- Only import the `TFunction` type, not `i18next` instance

**But remember:** Most of the time, just use `t("key")` directly in your component instead of creating constants.

## Testing Translations

### Test on Device

1. Change your device language to German in Settings
2. Restart the app
3. Verify all text appears in German

### Test in Development

You can temporarily change the language in your i18n.ts file:

```typescript
// src/lib/i18n.ts
// Change from:
lng: deviceLocale,

// To:
lng: "de", // Force German for testing
```

Or programmatically in your app:

```typescript
import i18next from "@/lib/i18n";

// During development, force a specific language
if (__DEV__) {
  i18next.changeLanguage("de");
}
```

## Troubleshooting

### Translation Not Showing

1. Check the translation key exists in ALL language files
2. Verify you're using the `useTranslation` hook in your component
3. Check for typos in translation keys
4. Ensure i18next is properly initialized in `src/lib/i18n.ts`
5. For constants, make sure you're using getter functions, not static objects

### i18n-ally Not Working

1. Verify `.vscode/settings.json` exists with correct configuration
2. Check `i18n-ally.localesPaths` points to `src/locales`
3. Ensure `i18n-ally.enabledFrameworks` is set to `["react-i18next"]`
4. Reload VS Code window (Cmd+Shift+P → "Developer: Reload Window")
5. Ensure JSON files are valid (no syntax errors)

### Wrong Language Displayed

1. Check device language settings
2. Verify fallback is working (should show English for unsupported languages)
3. Check i18next.language value in debugger
4. Ensure language code matches exactly (e.g., "en", "de", not "en-US")

### Stale Translations in Constants

If changing language doesn't update constants:

1. Ensure you're using getter functions with `t` parameter: `getLabels(t: TFunction)`
2. Verify you're NOT importing `i18next` directly in constants files
3. Make sure you're passing `t` from `useTranslation()` to the getter function
4. Ensure the component re-renders when language changes
5. Verify React Compiler is enabled (check babel-preset-expo version)

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Expo Localization Docs](https://docs.expo.dev/guides/localization/)
- [i18n-ally Extension](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally)
- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [Expo React Compiler Guide](https://docs.expo.dev/guides/react-compiler/)

## Summary

Our localization setup is:
- ✅ **Simple** - Import hook, get `t`, use `t("key")` - that's it!
- ✅ Industry standard (i18next with 9.3M weekly downloads)
- ✅ Clean and modern (no legacy code or wrappers)
- ✅ React-native friendly (proper hooks integration)
- ✅ Easy to maintain (just JSON files)
- ✅ Developer-friendly (excellent i18n-ally support)
- ✅ Scalable (add languages by creating new JSON files)
- ✅ Performance optimized (React Compiler handles optimization)

**The Pattern:**
```typescript
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t("my.translation.key")}</Text>;
}
```

Don't overthink it. Just use `t("key")` in your components.
