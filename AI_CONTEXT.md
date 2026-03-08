# AI Development Context

Project: MathViz Architect

MathViz Architect is a desktop educational application for creating mathematical visualizations, diagrams, and teaching materials for students in grades 5–11.

Tech stack:
- React 18
- TypeScript
- Vite
- TailwindCSS
- Electron

Architecture principles:

1. Minimal changes
Always modify the smallest amount of code necessary to fix a bug or implement a feature.

2. No unexpected refactors
Do not restructure components, rename files, or change architecture unless explicitly requested.

3. Preserve project structure
Respect the existing folder structure and component organization.

4. Single responsibility
Components should remain focused and simple.

5. Do not introduce new dependencies unless clearly necessary.

Canvas system rules:

- Canvas rendering is handled in Canvas.tsx
- Object creation logic lives in ObjectCreator.tsx
- Types are defined in src/lib/types.ts
- Shared utilities are in src/lib/utils.ts
- Global state is handled in hooks/useAppState.ts

Interactive modules:

Located in:
src/components/interactive/

Each module should:
- keep logic self-contained
- avoid affecting other modules
- render clean SVG visuals
- maintain good performance for animations

Development guidelines:

- Prefer small targeted fixes
- Avoid rewriting entire components
- Maintain existing coding style
- Use TypeScript types consistently

Debugging approach:

1. Identify the minimal location of the bug.
2. Fix the logic locally.
3. Avoid side effects in unrelated modules.
4. Preserve UX behavior.