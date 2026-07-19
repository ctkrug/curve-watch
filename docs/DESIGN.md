# Design direction

## Aesthetic direction

**Editorial serif** — Curve Watch reads like a New York Times "Upshot" data feature:
warm off-white newsprint, a serif display face for the wordmark and headline numbers,
restrained ink-on-paper color with exactly two accents reserved for meaning (a rust red
for "inverted," a steel blue for "normal"). The audience is a curious general reader,
not a trading desk — the page should feel like something you'd read in a magazine
about the economy, not a Bloomberg terminal or a dark "fintech dashboard" template.

This is a deliberate departure from the glassy-dark / terminal-mono treatments used
across recent factory ships (e.g. Bankroll, Skew, Slope, Burn Rate) — no dark
background, no neon accent, no monospace-everything. Paper, ink, and two purposeful
colors instead.

## Tokens

| Token                | Value                                                                                              | Use                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `--bg`               | `#f6f1e7`                                                                                          | page background — warm newsprint, not pure white                |
| `--surface-1`        | `#fffdf7`                                                                                          | the chart card / raised panel                                   |
| `--surface-2`        | `#ece4d3`                                                                                          | scrubber track, secondary panels                                |
| `--ink`              | `#231f1a`                                                                                          | primary text, axis lines, curve stroke (normal)                 |
| `--ink-muted`        | `#6b6255`                                                                                          | captions, tick labels, helper text                              |
| `--accent-inverted`  | `#b23a2f`                                                                                          | curve stroke + badge while inverted (rust red)                  |
| `--accent-normal`    | `#2f5d8a`                                                                                          | curve stroke while normal (steel blue)                          |
| `--accent-recession` | `#c9a13b`                                                                                          | recession-band fill, low opacity (dulled gold)                  |
| `--danger`           | `#b23a2f`                                                                                          | shared with `--accent-inverted` — inversion IS the danger state |
| `--success`          | `#3c7a52`                                                                                          | reserved for confirmations (e.g. copied-link toast)             |
| Display font         | "Source Serif 4" (Google Fonts), fallback `Georgia, "Times New Roman", serif`                      | wordmark, big date/year readout, section headings               |
| UI font              | "Inter" (Google Fonts), fallback `system-ui, sans-serif`                                           | slider labels, tick labels, body copy, controls                 |
| Spacing unit         | 8px scale (8/16/24/32/48/64)                                                                       | all layout spacing                                              |
| Corner radius        | 6px controls, 12px cards                                                                           | consistent rounding, never sharp AND never pill-shaped          |
| Shadow               | `0 1px 2px rgba(35,31,26,0.06), 0 8px 24px rgba(35,31,26,0.08)`                                    | soft paper-lift, no glow                                        |
| Motion               | UI transitions 150–200ms ease-out; curve redraw tween 180ms ease-out; recession band fade-in 220ms | calm, not snappy-tech                                           |

## Layout intent

The hero is **the curve chart itself with its year scrubber directly beneath it** —
together they occupy the vertical and horizontal center of the page and take ~65% of
the viewport height on desktop. Above it: a short masthead (wordmark + one-line
subhead). Below/beside it: the point-in-time readout (date, spread value, a small
"INVERTED" / "NORMAL" badge) and the play/pause control.

- **1440×900 desktop:** masthead top-left, curve card centered filling most of the
  width (max ~960px so line weight stays readable), scrubber full-width beneath it,
  readout panel to the right of the scrubber at desktop widths (not below — keeps the
  eye on one horizontal band). Generous paper margin around the card, not empty dead
  space — the page background itself carries a very subtle paper-grain texture so
  margins never read as "blank."
- **390×844 phone:** masthead collapses to a single line, curve card goes full-bleed
  width with side padding, scrubber below it full-width, readout panel moves below the
  scrubber (stacked, not beside), play/pause becomes a large 48px circular button
  centered under the readout. No horizontal scroll at any width.

## Signature detail

The **wordmark treats "Curve" as an actual bent curve** — the crossbar of the "u" or an
underline beneath the whole wordmark is a small drawn SVG path that itself dips below
baseline and rises again, echoing an inversion. It's animated on load with a short
draw-in (stroke-dashoffset, ~600ms ease-out), then sits static. It's the one flourish
that ties the brand mark directly to the phenomenon the site explains.

## Interaction & feedback plan

Not a game, but scrubbing is the entire interaction and must feel immediate:

- Dragging the slider redraws the curve every frame with no perceptible lag; the curve
  path itself tweens between months (~180ms) rather than snapping, so fast scrubbing
  reads as motion, not a flipbook.
- Crossing into/out of an inverted period swaps the curve stroke color
  (`--accent-normal` ↔ `--accent-inverted`) and toggles the badge with a small scale-pop
  (1 → 1.04 → 1, 150ms), so the moment of inversion has a distinct "tick."
  the recession band fades in (220ms) rather than appearing instantly.
- Play/pause auto-scrubs at a pace where at least one full inversion-to-recession cycle
  is readable (not a blur); pressing any slider key or dragging pauses auto-play.
- Respects `prefers-reduced-motion`: disables the auto-tween and wordmark draw-in,
  jumps directly to target states, keeps all functionality.
- No audio — this is an informational visualization, not a toy; sound would be noise
  here, not signal.

## Brand assets

- Favicon: inline SVG data URI, `--surface-1` circle with the same bent-curve glyph
  from the wordmark in `--accent-inverted`, monogram-style.
- Wordmark: "Curve Watch" set in the display serif, tight tracking on "Curve," the bent
  underline glyph beneath the full lockup.
