# PlantFlow-OS Agent Rules

## Immutable Core Doctrine

1. **NO RAW REGEX MODIFICATIONS:** Agents must NEVER use raw regex or string replacement scripts (like `.cjs` files using `fs.writeFileSync` and `replace`) to perform multi-file architecture or schema changes.
2. **PROTECTED FILES:** The core server file (`server.ts`), root configuration files (`vite.config.ts`, `package.json`), and authentication/routing wrappers (`App.tsx`) are protected. Any modifications to these files must be proposed explicitly to the human operator for review.
3. **VALIDATION:** Any autonomous changes must be syntactically valid TypeScript and checked against the linter (`npm run lint`).
4. **NO BYPASSING AUTH:** Agents must not attempt to bypass or remove authentication or rate-limiting middleware on any backend endpoints.
