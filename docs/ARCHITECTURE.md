# Architecture

Curve Watch is a Vite static application. It ships its historical data with the
bundle and does not make runtime network requests.

## Key modules

- `src/main.ts` builds the single-page experience: Observable Plot curve rendering,
  range input, playback, live readout, and recession-band reveal.
- `src/lib/yieldCurve.ts` contains the domain rules for inversions, spreads, timeline
  bounds, and reader-facing dates. Its unit tests cover normal, missing, and boundary
  states.
- `src/data/treasury-yield-curves.json` is the baked monthly Treasury dataset.
  `scripts/bake-yield-data.mjs` refreshes it from public FRED daily series.
- `src/data/recessions.ts` contains the NBER recession month periods used by the
  timeline.
- `src/style.css` implements the editorial serif design system and responsive layout.

## Data flow

The selected range index resolves to one `YieldObservation`. The app derives inversion
and 10Y–3M spread from that observation, redraws the curve, then filters recession
periods whose start dates have been reached for the timeline overlay.

## Local development

Run `npm run dev` for Vite development, `npm test` for Vitest, and `npm run build` to
type-check and produce the static `dist/` directory. Run `npm run bake:data` only when
intentionally refreshing the bundled data snapshot.
