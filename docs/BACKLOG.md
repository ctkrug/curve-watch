# Backlog

Epics and stories for the v1 build. All stories start unchecked. Acceptance criteria
are meant to be concretely verifiable by a later BUILD/QA run, not vibes.

## Epic 1 — The scrubbable curve (the wow moment)

- [ ] **1. Scrubbable year/month slider animates the full yield curve in real time**
      _(This is the wow moment — build everything else around this landing first.)_
  - Dragging the slider across its full range (earliest data → present) redraws the
    curve on every frame with no visible stutter (sampled at ≥30fps during a drag).
  - The slider's range endpoints are reachable and correspond exactly to the earliest
    and latest months present in the dataset.
  - The curve line tweens between months rather than snapping instantly between
    shapes (visually confirmed in QA: no single-frame teleport of the line).

- [ ] **2. Load and bake the full historical Treasury yield curve dataset**
  - The static dataset covers every tracked tenor from its own earliest available
    start date through the most recently published month, not just a sample window.
  - Data ships as a single static file bundled at build time — no runtime network
    fetch to load the curve history.
  - Tenor/date combinations with no published rate (e.g. 20Y before 1993) are
    represented as `null`, never as `0` or a dropped key.

- [ ] **3. Automatic inversion detection drives curve color and badge state**
  - `isInverted()` correctly flags the known historical inversions (spot-checked
    against 2000, 2006–07, 2019, and 2022–23) against the real dataset.
  - The curve stroke color and the "INVERTED"/"NORMAL" badge update within the same
    frame the slider crosses an inversion boundary, not on a delay.

- [ ] **4. Recession-lag shading overlays the timeline**
  - Every real NBER recession start/end date renders as a shaded band on the
    timeline scrubber at its historically correct position.
  - A recession band only becomes visible once the slider's current date reaches or
    passes that recession's start date (no shading revealed early).

- [ ] **5. Play/pause auto-scrub through the full 60-year history**
  - Pressing play advances the slider automatically at a fixed, readable pace;
    pressing pause, or manually dragging, stops auto-play immediately.
  - Auto-play stops cleanly at the latest available month without erroring or
    looping unexpectedly.

- [ ] **6. Design polish pass — Epic 1**
  - Chart, slider, badge, and play control match `docs/DESIGN.md` tokens (colors,
    fonts, spacing) with no default/unstyled browser control appearance remaining.
  - The core view composes with no horizontal scroll and no dead empty margins at
    390px, 768px, and 1440px viewport widths.

## Epic 2 — Point-in-time detail and storytelling

- [ ] **7. Hover/scrub point-in-time readout panel**
  - Hovering or scrubbing to any date updates a readout panel with that month's
    exact yield for every tracked tenor.
  - Tenors with no data at the selected date show an explicit placeholder (e.g. "—"),
    never a stale value carried over from the previous month.

- [ ] **8. Inversion + recession annotation list**
  - A list of every historical inversion period and the recession (if any) that
    followed it is generated programmatically from the data, not hand-typed.
  - Clicking an entry jumps the slider directly to that period's start date.

- [ ] **9. Persistent 10Y–3M spread mini-chart**
  - A small chart of the 10Y-minus-3M spread across the full history renders
    alongside the main curve, with a marker showing the slider's current position.
  - The mini-chart's zero line is visually distinct so a viewer can see exactly
    where the spread crosses from positive to negative.

- [ ] **10. Design polish pass — Epic 2**
  - The readout panel, annotation list, and mini-chart match `docs/DESIGN.md`
    tokens and its phone-width stacked layout.
  - Every interactive list entry has a themed hover and focus state — no unstyled
    native list or button appearance.

## Epic 3 — Ship quality: accessibility, responsiveness, deploy readiness

- [ ] **11. Keyboard and touch control of the slider**
  - The slider is operable via arrow keys (single-month step, with a larger step —
    e.g. Shift+arrow — for one year) without a mouse.
  - The slider is draggable via touch at a 390px viewport width with a hit target
    at least 44px tall.

- [ ] **12. Accessibility pass — focus, live region, reduced motion**
  - Every interactive control has a visible focus-visible state and a sane tab
    order.
  - The point-in-time readout is wrapped in an `aria-live` region so screen readers
    announce updates while scrubbing.
  - `prefers-reduced-motion` disables curve tweening and the wordmark draw-in
    animation while all functionality still works.

- [ ] **13. Favicon and animated wordmark signature detail**
  - An inline SVG favicon (bent-curve monogram, not a default globe/browser icon)
    is wired up and visible in the browser tab.
  - The wordmark's draw-in animation plays once on load and is skipped entirely
    when `prefers-reduced-motion` is set.

- [ ] **14. Static deploy readiness for subpath hosting**
  - `npm run build` produces a single self-contained directory using only relative
    asset paths, verified by serving the build output from a non-root subpath
    locally and confirming every asset still loads.
  - The README's documented build command and output directory match the STATUS
    block's `site_build_dir` / `build_cmd` exactly.

- [ ] **15. Final design self-review and QA pass**
  - Every D2/D3 craft-rule item in the design standard is checked against the live
    built site, with no unresolved anti-generic-ban item remaining.
  - `npm test` and `npm run build` both complete with zero errors immediately
    before closeout.
