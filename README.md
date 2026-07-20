# Curve Watch

An animated time-machine through 60 years of U.S. Treasury yield curves. Drag a year
slider from 1970 to today and watch the curve visibly invert and un-invert in real
time, with a shaded band marking the recession that historically followed 6–18 months
after each inversion.

Yield curve inversions are one of the most reliable recession signals in modern
economic history, but almost everyone who has heard the phrase "inverted yield curve"
has never actually _seen_ one happen. Curve Watch turns a wonky bond-market chart into
something you can feel: scrub the timeline and the short end of the curve visibly
climbs above the long end, then watch the recession band slide in right on schedule.

## Why this exists

Static yield-curve charts and data tables assume the reader already understands what
an inversion is. Curve Watch is built for the other 95% of people: a 20-second,
scrubbable "oh, I get it" moment, not a Bloomberg terminal replacement.

## What you can do

- **Scrub monthly curve history** from 1962 to the latest baked observation, with an
  animated yield curve that responds immediately to the range control.
- **Automatic inversion detection** — the curve visibly bends when the short end rises
  above the long end, with an on-chart indicator while inverted.
- **Recession timeline shading** — NBER recession bands reveal only as the selected
  month reaches their historical start.
- **Play/pause auto-scrub** through the full 60-year history as a guided tour.
- **Point-in-time tenor readout** — every maturity reports its exact selected-month
  yield, with unavailable historical series shown explicitly.
- **Generated inversion record** — jump directly to every detected inversion and see
  the NBER recession that followed it, if one appears in the available record.
- **Persistent spread context** — a full-history 10Y-minus-3M mini-chart keeps the
  selected month and the zero crossing in view.

The Treasury data is baked into the application from public FRED constant-maturity
series, so opening Curve Watch never depends on a market-data request. To deliberately
refresh this snapshot, run `npm run bake:data` and commit the resulting JSON file.

## Stack

- **TypeScript** for the application logic and data pipeline.
- **D3** for scales, interpolation, and the animated curve geometry.
- **Observable Plot** for the axis/legend scaffolding where a declarative grammar is a
  better fit than hand-rolled D3.
- **Vite** for a zero-server, static-output build (deployable as a single directory).
- **Vitest** for unit tests against the data-transform and inversion-detection logic.

See [`docs/VISION.md`](docs/VISION.md) for the full design rationale and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## Development

```sh
npm install
npm run dev      # local dev server
npm test         # run the test suite
npm run build    # produce the static site in dist/
npm run verify:static # serve dist/ from /curve-watch/ and check its assets
```

The Vite build uses a relative base path, so `dist/` can be served from a subpath such
as `apps.charliekrug.com/curve-watch/`. Run `npm run build && npm run verify:static`
before publishing to confirm the bundled CSS and JavaScript resolve from that subpath.

## License

MIT — see [`LICENSE`](LICENSE).
