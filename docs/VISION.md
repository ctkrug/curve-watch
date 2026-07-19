# Vision

## The problem

An inverted yield curve — short-term Treasuries yielding more than long-term ones — is
one of the most reliable recession leading indicators in modern economic history. Every
recession since the 1960s was preceded by one. But the concept lives entirely in
financial-media shorthand: a headline says "the curve inverted" and a static line chart
gets embedded, and the reader either already knows what that means or bounces off it.
Nothing in the standard presentation lets a newcomer _watch_ the phenomenon happen and
connect it, viscerally, to what followed.

## Who it's for

Someone who has heard "inverted yield curve" in the news and has never seen one. Not a
bond trader — a curious, financially-literate generalist: an economics student, a
newsletter reader, someone scrolling a "here's a cool thing" link. They will give it
about 20 seconds unless it immediately rewards attention.

## The core idea

Treat 60+ years of Treasury yield curves as a single scrubbable animation instead of 60
years of separate snapshots. Put a slider under a chart that always draws the _shape_
of the curve — yield vs. maturity, 3 months out to 30 years — and let dragging the
slider through time animate that shape smoothly. When the short end lifts above the
long end, the line visibly bends backward instead of monotonically rising: an
inversion isn't described, it's _seen_. A translucent band then slides in over the
chart's timeline scrubber 6–18 months after each inversion is detected, marking the
recession that followed, so cause and effect sit in the same frame.

## Key design decisions

- **The curve shape is the hero, not a spread number.** Plenty of finance sites already
  chart the 10Y-minus-3M spread as a single line crossing zero. That's accurate but
  abstract. Curve Watch draws the actual curve (yield on the y-axis, maturity on the
  x-axis) so the inversion is a literal, visible bend, not a sign change on an
  unrelated chart.
- **Recession shading is automatic and historically grounded, not decorative.** Spans
  are derived from real NBER recession start/end dates and rendered on the same
  timeline the year slider drives, so the 6–18 month lag between inversion and
  downturn is something the viewer can see and roughly measure, not just read as a
  factoid in a caption.
- **One dataset, one interaction.** The whole experience is a single view: chart +
  slider + play button. No dashboards, no tabs, no configuration. Depth comes from
  polish on that one view (animation smoothness, the recession-band reveal, a designed
  empty/loading state), not breadth of features.
- **Static and serverless.** Treasury constant-maturity yield history is a bounded,
  slow-changing dataset (one new data point a month). It ships as a static JSON file
  baked into the build — no backend, no API keys, no rate limits — so the whole thing
  is a single deployable directory.
- **Real data, not illustrative data.** The shipped dataset is the actual historical
  series (U.S. Treasury constant-maturity yields, e.g. via FRED), not synthetic curves
  standing in for the real ones — the entire premise depends on the viewer trusting
  what they're seeing actually happened.

## What "v1 done" looks like

- The full month-by-month Treasury yield curve (all tracked tenors, 1962 or as far back
  as each tenor's series starts, through the most recent published month) is baked into
  the build as static data.
- Dragging the year/month slider from the earliest available date to the present
  animates the curve smoothly, in both directions, at interactive frame rates.
- Every historical inversion is detected automatically from the data (no hand-curated
  list) and the curve visibly bends during those periods.
- Every NBER recession that followed an inversion is shaded on the timeline at its
  correct historical position, and the shading appears as the slider crosses into it
  during scrubbing or auto-play.
- A play/pause control auto-scrubs through the full history as a guided tour, at a
  pace where inversions and their following recessions are readable, not a blur.
- Hovering or scrubbing to any point shows the exact date and the yield at every
  tenor for that month.
- The page is a single static site (see `docs/DESIGN.md` for the visual direction),
  fully responsive from phone to desktop, deployable to a static host with relative
  asset paths.
