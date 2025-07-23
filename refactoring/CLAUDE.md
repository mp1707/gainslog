---
# CLAUDE.md

> **Purpose:**
> This file defines strict rules and conventions for Claude Code when refactoring our Expo React Native app. It guides the AI through each step of the refactoring process, optimizing for agentic collaboration, clarity, and maintainability.

---

## 1. Core Principles

1. **Context as Signal**  
   - Always maximize signal-to-noise: break code into small, single-responsibility files (≤200 lines).
   - Use descriptive file and folder names to serve as meta-prompts.
   - Co-locate implementation (`.tsx`) and styles (`.styles.ts`) for each component.

2. **Context Window Management**  
   - Ensure any file provided fits entirely within the LLM’s context window.
   - When code exceeds the window, rely on RAG: index, retrieve, and augment only relevant snippets.

3. **Hybrid Feature-Based + Atomic Design**  
   - **Features**: Group domain-specific logic under `src/features/<feature>/` (e.g., `cart`, `profile`).
   - **Shared UI**: Global atoms under `src/shared/ui/atoms/`, molecules under `src/shared/ui/molecules/`.
   - **Public API**: Each feature slice must export its interface via an `index.ts` barrel file.

4. **StyleSheet.create**  
   - Use classic `StyleSheet.create` in each component’s `.styles.ts` file.
   - Keep style objects concise; reuse style keys via descriptive names.

5. **Atomic Layering**  
   - **Atoms**: Stateless, smallest units (`<Button>`, `<TextInput>`).
   - **Molecules**: Composed atoms (`SearchForm`, `FormField`).
   - **Organisms**: Groups of molecules/atoms (`Header`, `Footer`).
   - **Templates & Pages**: Layouts and final screens.

---

## 2. Folder Structure

```text
my-app/
└── src/
    ├── app/                     # Application-wide logic
    │   ├── providers/           # Context & state wrappers (e.g., Zustand, Redux)
    │   ├── navigation/          # Root navigation stacks (React Navigation)
    │   └── store/               # Global store (e.g., Zustand store definition)
    ├── shared/                  # Truly global components and utilities
    │   └── ui/
    │       ├── atoms/
    │       │   ├── Button/
    │       │   │   ├── Button.tsx
    │       │   │   ├── Button.styles.ts
    │       │   │   └── index.ts
    │       └── molecules/
    │           └── FormField/
    │               ├── FormField.tsx
    │               ├── FormField.styles.ts
    │               └── index.ts
    ├── features/                # Feature-based modules
    │   └── cart/                # Example feature (Cart)
    │       ├── ui/
    │       │   └── CartScreen.tsx
    │       ├── api.ts
    │       ├── hooks.ts
    │       ├── types.ts         # Feature-specific types
    │       └── index.ts
    ├── theme/                   # Design tokens for seed files
    │   ├── colors.ts
    │   ├── typography.ts
    │   └── spacing.ts
    ├── types/                   # Globally shared TS types
    │   └── index.ts
    ├── lib/                     # Pure utility functions
    │   └── utils.ts
    └── App.tsx                  # Entry point with providers & navigator wiring
```  

- **Global vs Local:**
  - `src/app/`, `src/theme/`, `src/types/`, and `src/shared/` are truly global.
  - Each feature in `src/features/` owns its own `api.ts`, `hooks.ts`, and `types.ts`—do not mix with global dirs.

---

## 3. Refactoring Protocol

### Phase 0: Analysis & Planning
1. **Feed** the monolithic file (`App.tsx`) to Claude.
2. **Prompt:**  
   "Analyze and propose a refactoring plan to hybrid feature-based + atomic design with an `app/` directory. List features, atoms, molecules, global providers, navigation, and folder structure."
3. **Output:** Structured plan with folder skeleton.

### Phase 1: Scaffolding
- **Create** directories and barrels (`index.ts`).
- **Configure** `babel.config.js` & `tsconfig.json` for absolute imports (`@/app`, `@/features`, `@/shared`, `@/theme`).
- **Extract**:
  - Types → `src/types/index.ts`
  - Design tokens → `src/theme/*.ts`
  - Utils → `src/lib/utils.ts`

### Phase 2: Atomic Componentization
1. **Identify & extract Atoms:**  
   Prompt: "Extract smallest UI elements into `src/shared/ui/atoms` with `.tsx` + `.styles.ts`."
2. **Compose Molecules:**  
   Prompt: "Using atoms, build `FormField` in `src/shared/ui/molecules`. Replace inline JSX in screens."

### Phase 3: Feature Slicing
- **For each feature** (e.g., `cart`): move related UI (`ui/`), logic (`api.ts`, `hooks.ts`), and types into `src/features/<feature>/`.
- **Enforce** public API via `index.ts` only.

### Phase 4: State & Navigation Integration
- **Providers:** Wrap root in `src/app/providers` context, e.g., `<StoreProvider>`, `<ThemeProvider>`.
- **Navigation:** Define root stacks in `src/app/navigation`, reference in `App.tsx`.
- **Global Store:** Initialize and export store in `src/app/store/index.ts`.

---

## 4. Prompting & Interaction Guidelines

- **Single-File Focus:** Direct prompts at one file/folder at a time.
- **Seed Files:** Always provide `src/theme` token files when asking for new UI components.
- **Explicit Constraints:** "Use only `StyleSheet.create` in `.styles.ts` files."
- **Feedback Loop:** After each AI output, compile or run tests, then report errors.

---

## 5. Golden Rules

1. **Small Steps:** One atomic change per prompt.
2. **Descriptive Imports:** Use `@/` aliases everywhere.
3. **Barrel Safety:** Import exclusively from `index.ts` at slice roots.
4. **Cohesion over DRY:** Prefer clarity and context over avoiding minimal duplication.
5. **Document Intent:** Add JSDoc for modules and public functions.

---

> **Remember:** Follow this guide as a rigid protocol. Refactor contextually, preserve functionality, and enable efficient AI-human collaboration.

