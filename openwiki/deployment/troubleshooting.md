# Troubleshooting — Common Errors

## 1. Build fails with TypeScript errors

**Symptom**: `pnpm run build` fails with type errors.

**Cause**: The project uses strict TypeScript with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Accessing an array by index may return `undefined`, and optional properties have strict rules.

**Solution**:
1. Run `pnpm run build` locally to see exact errors
2. Use optional chaining (`arr?.[index]`) or non-null assertion only when confirmed the value exists
3. Verify `exactOptionalPropertyTypes` isn't causing issues with optional props

**Verification**: `pnpm run build` completes without errors.

## 2. Tests fail with "React.act is not a function"

**Symptom**: Tests fail with the error `React.act is not a function`.

**Cause**: React 19 changed the `act()` API. `vitest.config.ts` forces `process.env.NODE_ENV` to `"development"` to use React development builds that include `act()`.

**Solution**:
1. Verify `vitest.config.ts` has `'process.env.NODE_ENV': '"development"'` in `define`
2. Verify `react`, `react-dom`, and `react-dom/test-utils` are in `server.deps.inline`

**Verification**: `pnpm test` runs all 83 tests without errors.

## 3. WebMCP not detected in browser

**Symptom**: Badge shows "WebMCP not detected" and tools are unavailable.

**Cause**: WebMCP requires Chrome 149+ with the `chrome://flags/#enable-webmcp-testing` flag enabled, or the ChatGPT desktop app with GPT-5.6 Sol/Terra.

**Solution**:
1. **Chrome 149+**: Go to `chrome://flags/#enable-webmcp-testing`, enable, restart Chrome
2. Install the official WebMCP extension from the Chrome Web Store
3. **ChatGPT desktop**: Open the PatchWork URL in the in-app browser
4. Verify in DevTools: `await document.modelContext.getTools()` should return 6 tools

**Verification**: Badge shows "WebMCP ready" and `document.modelContext.getTools()` returns 6 tools.

## 4. Garden state lost on reload

**Symptom**: Garden resets to initial state on page reload.

**Cause**: localStorage may be full, disabled, or the `patchwork-jardin-v1` key is corrupted.

**Solution**:
1. Verify localStorage isn't full: DevTools → Application → Local Storage
2. Verify the `patchwork-jardin-v1` key exists and has valid JSON
3. If corrupted, delete it and reload (the store will recreate initial state)

**Verification**: Plant a crop, reload the page, verify it's still planted.

## 5. Antagonist warnings not appearing

**Symptom**: Antagonist crops are planted together without warnings.

**Cause**: The crop's `antagonists` array doesn't include the other crop, or the relationship is one-directional in the data.

**Solution**:
1. Verify in `src/datos/cultivos.ts` that both crops list each other in `antagonists`
2. Run `pnpm test` — the `datos.test.ts` test verifies all companion/antagonist references are reciprocal

**Verification**: Planting tomato next to potato generates an `antagonist` warning.

## 6. ESLint fails with type-checking errors

**Symptom**: `pnpm run lint` fails with `typescript-eslint` errors.

**Cause**: The project uses `recommendedTypeChecked` and `stylisticTypeChecked` from typescript-eslint, which require type information. If `tsconfig.json` isn't configured correctly, ESLint can't analyze types.

**Solution**:
1. Verify `tsconfig.json` includes the problematic file in `include`
2. Run `pnpm run lint:fix` to auto-fix what's possible
3. Verify `parserOptions.projectService` is configured in `eslint.config.js`

**Verification**: `pnpm run lint` completes without errors.

## 7. Netlify deploy fails with timeout

**Symptom**: Deploy fails with timeout during build.

**Cause**: `pnpm run deploy:netlify` runs audit + lint + format + test + build sequentially. If tests or lint take too long, the build may exceed Netlify's timeout.

**Solution**:
1. Use `bash scripts/deploy-netlify.sh` directly (without prior checks)
2. Run checks locally before deploying
3. Verify `pnpm install` isn't downloading new dependencies on Netlify (use lockfile)

**Verification**: Deploy completes and the site is accessible at the Netlify URL.

## 8. Styles not applying after changes

**Symptom**: CSS changes don't reflect in the browser.

**Cause**: Netlify's aggressive caching for assets (`max-age=31536000, immutable`) may be serving an older version. Vite generates new hashes for each build, but if the HTML is cached, it may point to old assets.

**Solution**:
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Verify HTML has `Cache-Control: public, max-age=0, must-revalidate`
3. If persistent, clear browser cache for the site

**Verification**: New styles apply after a hard refresh.

## References

- [Deployment](./platform.md)
- [Testing](../development/testing.md)
- [Linting](../development/linting.md)
