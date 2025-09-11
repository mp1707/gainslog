# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens and layouts (e.g., `app/create.tsx`, `app/settings/`).
- `src/`: Reusable code.
  - `components/`, `hooks/`, `store/`, `utils/`, `theme/`, `types/`, `lib/`.
- `assets/`: Images, fonts, static assets.
- `supabase/`: Backend config and SQL/migrations (if used).
- `ios/`: Native iOS project (generated/managed by Expo where applicable).
- Path aliases: use `@/...` (see `tsconfig.json`). Example: `import { ThemedToastManager } from "@/components/shared/Toasts"`.

## Build, Test, and Development Commands
- `npm run start`: Launch Expo dev server.
- `npm run start:dev|start:preview|start:prod`: Start with `APP_VARIANT` set.
- `npm run ios` / `npm run android`: Run on simulator/emulator (requires setup).
- `npm run web`: Run in a web browser via Expo.
- EAS builds: `eas build --platform ios|android` (requires EAS CLI and project config in `eas.json`).

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true`). Prefer function components and hooks.
- Indentation: 2 spaces; single quotes; trailing commas allowed.
- Naming: Components `PascalCase` (files like `FoodCard.tsx`), functions/vars `camelCase`, constants `UPPER_SNAKE_CASE`.
- Modules: group by domain in `src/*`; screens live under `app/*`.
- Imports: prefer `@/` aliases over relative paths.

## Testing Guidelines
- No formal test setup yet. For new tests, use Jest + React Native Testing Library.
- Suggested naming: `*.test.ts` / `*.test.tsx` alongside source or under `__tests__/`.
- Manual QA: verify core flows — create/edit log (`app/create.tsx`, `app/edit/[id].tsx`), settings updates, image capture (`app/camera.tsx`).

## Commit & Pull Request Guidelines
- Commits: Imperative, concise subject (≤72 chars). Example: `create: add image resize util`.
- Body (when useful): what/why, notable trade-offs.
- PRs: clear description, screenshots for UI, steps to verify, link issues, note env or migration changes.
- Small, focused PRs are preferred.

## Security & Configuration Tips
- Env vars: copy `.env.example` → `.env`. Use `EXPO_PUBLIC_*` only for values safe on client.
- Secrets: never commit `.env` or credentials. iOS/Android keys managed via EAS if needed.
- Images/files: verify file-system permissions and cleanup temp artifacts.

