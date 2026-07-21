# Architecture

Curve Watch is a Vite static application. It ships its historical data with the
bundle and does not make runtime network requests.

## Key modules

- `src/main.ts` builds the single-page experience: Observable Plot curve and spread
  rendering, interruptible curve tweening, range input, playback, live tenor readout,
  generated inversion history, and recession-band reveal.
- `src/lib/curveTransition.ts` interpolates matching tenor points for the curve
  redraw, preserving true values when a historical tenor becomes newly available.
- `src/lib/historyValidation.ts` checks the baked JSON at the startup boundary so
  malformed records use the recoverable unavailable-data state instead of rendering.
- `src/lib/yieldCurve.ts` contains the domain rules for inversions, spreads, timeline
  bounds, reader-facing yield labels, and inversion-to-recession annotations. Its unit
  tests cover normal, missing, malformed, and boundary states.
- `src/data/treasury-yield-curves.json` is the baked monthly Treasury dataset.
  `scripts/bake-yield-data.mjs` refreshes it from public FRED daily series.
- `src/data/recessions.ts` contains the NBER recession month periods used by the
  timeline.
- `src/style.css` implements the editorial serif design system and responsive layout.
- `src/lib/staticDeploy.ts` holds the pure subpath-asset validation used by tests.
- `src/lib/startup.ts` creates the recoverable unavailable-data state for the app shell.
- `scripts/verify-static-build.mjs` serves `dist/` below `/curve-watch/` and requests
  the built document assets as a deployment smoke check.

## Data flow

The selected range index resolves to one `YieldObservation`. The app derives inversion
and 10Y–3M spread from that observation, tweening matching tenor points from the last
displayed curve before it redraws the curve and selected mini-chart marker. It then
rebuilds the exact-tenor detail and filters recession periods whose start dates have
been reached for the timeline overlay. The inversion list is built once from the full
history and jumps back into this same update path.

## Local development

Run `npm run dev` for Vite development, `npm test` for Vitest, and `npm run build` to
type-check and produce the static `dist/` directory. Run `npm run verify:static` after
a build to smoke-test the production bundle at its subpath. Run `npm run bake:data`
only when intentionally refreshing the bundled data snapshot.
