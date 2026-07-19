import * as Plot from "@observablehq/plot";
import sample from "./data/sample-yield-curve.json";
import { TENORS_MONTHS, isInverted, type YieldObservation } from "./lib/yieldCurve";

const observations = sample.observations as unknown as YieldObservation[];

// Placeholder single-curve render proving the D3/Plot + data pipeline wiring end to end.
// BUILD replaces this with the scrubbable multi-decade animation described in docs/VISION.md.
function renderLatestCurve(observation: YieldObservation): HTMLElement | SVGSVGElement {
  const points = TENORS_MONTHS.filter((m) => observation.yields[m] != null).map((m) => ({
    months: m,
    yield: observation.yields[m] as number,
  }));

  return Plot.plot({
    width: 640,
    height: 360,
    marginLeft: 48,
    x: { type: "log", label: "Maturity (months)" },
    y: { label: "Yield (%)" },
    marks: [
      Plot.line(points, { x: "months", y: "yield", stroke: isInverted(observation) ? "#b23a2f" : "#2f6fb2" }),
      Plot.dot(points, { x: "months", y: "yield" }),
    ],
  });
}

const app = document.querySelector<HTMLDivElement>("#app")!;
const latest = observations[observations.length - 1];
const heading = document.createElement("h1");
heading.textContent = `Curve Watch — ${latest.date}`;
app.append(heading, renderLatestCurve(latest));
