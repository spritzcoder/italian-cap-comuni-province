# Lightweight postal-code validation in browsers

## Motivation

An address form may only need to know whether a five-digit postal code exists.
Calling `getComuniByCAP(cap).length > 0` through the root entry also loads the
municipality, province and region tables and initializes their objects and search
indices. A named import does not remove that initialization. In a shared client
component, this adds substantial JavaScript to the application's frontend.

The `/cap` entry separates this use case from geographic search. It exposes
`hasCAP(cap: string): boolean`, backed by a `Set` of unique postal-code strings.
Builds derive the list from the same validated source data, preserving leading
zeros, deduplicating and sorting deterministically. The list is bundled into the
entry, so validation requires no additional network request.

The existing root API remains unchanged. Applications that need geographic
results should continue using it. The complete npm package still includes both
entries and all geographic assets; this optimization reduces the browser bundle
when the application imports `/cap` alone.

## Reproducible measurements

Run from a clean checkout with Node.js 24 and the locked dependencies:

```sh
npm ci
npm run test:package
```

The test packs the library, installs that tarball into a temporary consumer, and
bundles these equivalent membership checks separately:

```typescript
// Full geographic lookup
import { getComuniByCAP } from 'italian-cap-comuni-province';
globalThis.hasCAP = (cap) => getComuniByCAP(cap).length > 0;

// Dedicated membership lookup (a separate bundle)
import { hasCAP } from 'italian-cap-comuni-province/cap';
globalThis.hasCAP = hasCAP;
```

Measurements recorded on 2026-11-21 with Node.js 24.22.1 and esbuild 0.27.2,
using the unchanged source data from upstream commit `f577868`: 8,458
municipality/CAP records, 110 provinces, 20 regions and 4,671 unique CAPs.
Both bundles use `platform: 'browser'`, `format: 'iife'`, `target: 'es2020'`,
`bundle: true` and `minify: true`. Gzip uses Node's `gzipSync` defaults.

| Isolated browser entry | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| Root `getComuniByCAP` membership check | 1,500,669 | 315,268 |
| `/cap` `hasCAP` | 37,458 | 10,744 |

The dedicated entry is **97.50% smaller minified** and **96.59% smaller with
gzip** for this snapshot. These are isolated browser bundles, not the complete
Next.js/application build, the npm tarball size or a measurement of deployed
HTTP traffic. Transfer compression depends on the application's hosting setup.
Applications that also import the root entry in client code still need its data.

## Compatibility and regression checks

- `hasCAP` trims surrounding whitespace and preserves leading zeros. It returns
  `false` for malformed or unknown codes and matches dataset membership for all
  100,000 possible five-digit strings.
- Membership is distinct from the existing root `isValidCAP` format/range check
  and from business service coverage. Generic or historical codes absent from
  the dataset, including `00100` and `20100`, are not added automatically.
  Consumer-specific compatibility rules should remain in the application.
- Unit tests check deterministic generation, source updates, duplicate removal,
  leading zeros, malformed input and consistency with the existing API.
- Build/watch tests verify that changing source CAPs updates the bundled entry
  without a generated-file rebuild loop.
- Installed-package tests cover native CommonJS and ESM, TypeScript consumers
  (`.cts` and `.mts`) and execution of the browser bundle. The bundle's input
  graph must exclude the root entry and all full geographic tables.
- The browser regression budgets are **45,000 minified bytes** and **14,000 gzip
  bytes**, allowing modest source growth while catching accidental full-data
  imports. Existing CI runs these checks through `npm run test:package`.
