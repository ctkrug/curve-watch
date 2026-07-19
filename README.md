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

## Planned features

- **Scrubbable year slider** spanning 1970–present, animating the full Treasury yield
  curve (3M through 30Y) as it evolves month by month.
- **Automatic inversion detection** — the curve visibly bends when the short end rises
  above the long end, with an on-chart indicator while inverted.
- **Recession-lag shading** — a shaded band appears 6–18 months after each detected
  inversion, aligned to official NBER recession dates.
- **Play/pause auto-scrub** through the full 60-year history as a guided tour.
- **Point-in-time readout** — hovering or scrubbing to any month shows the exact yields
  across every maturity for that date.

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
```

## License

MIT — see [`LICENSE`](LICENSE).
