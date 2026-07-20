import * as Plot from "@observablehq/plot";
import { RECESSIONS } from "./data/recessions";
import history from "./data/treasury-yield-curves.json";
import { unavailableStateMarkup } from "./lib/startup";
import {
  TENORS_MONTHS,
  clampObservationIndex,
  formatTenor,
  formatObservationMonth,
  formatYield,
  inversionAnnotations,
  isInverted,
  spread,
  type RecessionPeriod,
  type YieldObservation,
  visibleRecessions,
} from "./lib/yieldCurve";

const observations = history.observations as unknown as YieldObservation[];
const recessions: readonly RecessionPeriod[] = RECESSIONS;
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) throw new Error("Curve Watch could not find its application root.");

if (observations.length === 0) {
  app.innerHTML = unavailableStateMarkup("The bundled Treasury history is unavailable. Please reload the page.");
} else {
app.innerHTML = `
  <main class="page-shell">
    <header class="masthead">
      <a class="wordmark" href="./" aria-label="Curve Watch home">Curve <em>Watch</em><svg viewBox="0 0 180 18" aria-hidden="true"><path d="M2 4 C40 4 50 15 90 15 S140 4 178 4" /></svg></a>
      <p>Watch the Treasury curve bend — and see what came next.</p>
    </header>
    <section class="experience" aria-labelledby="curve-heading">
      <div class="chart-heading">
        <div><p class="eyebrow">U.S. Treasury constant-maturity yields</p><h1 id="curve-heading">The shape of a warning</h1></div>
        <span class="state-badge" id="curve-state">NORMAL</span>
      </div>
      <div class="chart-frame" id="curve-chart" aria-label="Treasury yield curve chart"></div>
      <div class="timeline" aria-label="Historical timeline">
        <div class="recession-track" id="recession-track" aria-hidden="true"></div>
        <input id="time-slider" type="range" min="0" step="1" aria-label="Select a month in Treasury yield curve history" />
        <div class="timeline-boundaries"><span id="timeline-start"></span><span id="timeline-end"></span></div>
      </div>
      <div class="control-row">
        <button class="play-button" id="play-button" type="button" aria-label="Play history"><span aria-hidden="true">▶</span></button>
        <p class="timeline-hint">Drag through the decades. Gold bands appear when recessions begin.</p>
        <div class="readout" aria-live="polite" aria-atomic="true">
          <time id="selected-date"></time><strong id="selected-spread"></strong><span id="selected-copy"></span>
        </div>
      </div>
      <section class="yield-detail" aria-labelledby="yield-detail-heading">
        <div class="detail-heading"><p class="eyebrow">Point in time</p><h2 id="yield-detail-heading">Every maturity, that month</h2></div>
        <dl class="yield-grid" id="yield-grid" aria-live="polite" aria-label="Selected Treasury yields"></dl>
      </section>
      <section class="history-notes" aria-labelledby="history-notes-heading">
        <div class="detail-heading"><p class="eyebrow">The record</p><h2 id="history-notes-heading">When the curve warned</h2></div>
        <p>Each period is detected from the 3-month and 10-year rates. Select one to revisit its first inverted month.</p>
        <ol class="inversion-list" id="inversion-list"></ol>
      </section>
      <section class="spread-history" aria-labelledby="spread-history-heading">
        <div class="detail-heading"><p class="eyebrow">Context</p><h2 id="spread-history-heading">10Y minus 3M, across the record</h2></div>
        <div class="spread-chart" id="spread-chart" aria-label="Historical 10-year minus 3-month Treasury spread"></div>
      </section>
    </section>
  </main>`;

const chart = document.querySelector<HTMLDivElement>("#curve-chart")!;
const slider = document.querySelector<HTMLInputElement>("#time-slider")!;
const state = document.querySelector<HTMLSpanElement>("#curve-state")!;
const playButton = document.querySelector<HTMLButtonElement>("#play-button")!;
const dateReadout = document.querySelector<HTMLElement>("#selected-date")!;
const spreadReadout = document.querySelector<HTMLElement>("#selected-spread")!;
const copyReadout = document.querySelector<HTMLElement>("#selected-copy")!;
const track = document.querySelector<HTMLDivElement>("#recession-track")!;
const yieldGrid = document.querySelector<HTMLDListElement>("#yield-grid")!;
const inversionList = document.querySelector<HTMLOListElement>("#inversion-list")!;
const spreadChart = document.querySelector<HTMLDivElement>("#spread-chart")!;

slider.max = String(observations.length - 1);
slider.value = String(observations.length - 1);
document.querySelector("#timeline-start")!.textContent = formatObservationMonth(observations[0].date);
document.querySelector("#timeline-end")!.textContent = formatObservationMonth(observations.at(-1)!.date);

for (const annotation of inversionAnnotations(observations, recessions)) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  const recession = annotation.recession
    ? `Recession began ${formatObservationMonth(annotation.recession.start)}.`
    : "No later recession in the available record.";
  button.type = "button";
  button.innerHTML = `<strong>${formatObservationMonth(annotation.start)}–${formatObservationMonth(annotation.end)}</strong><span>${recession}</span>`;
  button.addEventListener("click", () => {
    const target = observations.findIndex((observation) => observation.date === annotation.start);
    if (target >= 0) update(target);
  });
  item.append(button);
  inversionList.append(item);
}

let index = observations.length - 1;
let playback: number | undefined;

function render(): void {
  const observation = observations[index];
  const inverted = isInverted(observation);
  const points = TENORS_MONTHS.filter((months) => observation.yields[months] != null).map((months) => ({
    months,
    yield: observation.yields[months]!,
  }));
  const width = Math.max(280, chart.clientWidth);
  const plot = Plot.plot({
    width,
    height: Math.max(320, Math.min(520, width * 0.5)),
    marginTop: 24,
    marginRight: 24,
    marginBottom: 56,
    marginLeft: 56,
    x: { type: "log", domain: [1, 360], ticks: [1, 3, 12, 60, 120, 360], label: "Maturity (months)" },
    y: { grid: true, label: "Yield (%)", tickFormat: (d) => `${d}%` },
    marks: [
      Plot.ruleY([0], { stroke: "#6b6255", strokeOpacity: 0.35 }),
      Plot.line(points, { x: "months", y: "yield", stroke: inverted ? "#b23a2f" : "#2f5d8a", strokeWidth: 4, curve: "catmull-rom" }),
      Plot.dot(points, { x: "months", y: "yield", fill: "#fffdf7", stroke: inverted ? "#b23a2f" : "#2f5d8a", strokeWidth: 2.5, r: 4.5 }),
    ],
  });
  chart.replaceChildren(plot);
  chart.classList.toggle("is-inverted", inverted);
  state.textContent = inverted ? "INVERTED" : "NORMAL";
  state.classList.toggle("is-inverted", inverted);
  dateReadout.textContent = formatObservationMonth(observation.date);
  const currentSpread = spread(observation);
  spreadReadout.textContent = currentSpread == null ? "—" : `${currentSpread.toFixed(2)} pp`;
  copyReadout.textContent = currentSpread == null ? "10Y–3M unavailable" : "10Y minus 3M";
  yieldGrid.replaceChildren(...TENORS_MONTHS.map((months) => {
    const term = document.createElement("div");
    const label = document.createElement("dt");
    const value = document.createElement("dd");
    label.textContent = formatTenor(months);
    value.textContent = formatYield(observation.yields[months]);
    term.append(label, value);
    return term;
  }));
  track.replaceChildren(...visibleRecessions(recessions, observation.date).map((period) => recessionBand(period)));
  renderSpreadHistory(observation);
}

function renderSpreadHistory(selected: YieldObservation): void {
  const points = observations.flatMap((observation) => {
    const value = spread(observation);
    return value == null ? [] : [{ date: new Date(`${observation.date}T00:00:00Z`), value }];
  });
  const selectedSpread = spread(selected);
  const width = Math.max(280, spreadChart.clientWidth);
  const plot = Plot.plot({
    width,
    height: 170,
    marginTop: 12,
    marginRight: 18,
    marginBottom: 28,
    marginLeft: 42,
    x: { type: "utc", label: null, tickFormat: "%Y" },
    y: { grid: true, label: null, tickFormat: (value) => `${value}%` },
    marks: [
      Plot.ruleY([0], { stroke: "#b23a2f", strokeWidth: 1.5, strokeDasharray: "3,3" }),
      Plot.line(points, { x: "date", y: "value", stroke: "#2f5d8a", strokeWidth: 1.8 }),
      ...(selectedSpread == null ? [] : [Plot.dot([{ date: new Date(`${selected.date}T00:00:00Z`), value: selectedSpread }], { x: "date", y: "value", fill: "#fffdf7", stroke: selectedSpread < 0 ? "#b23a2f" : "#2f5d8a", strokeWidth: 2.5, r: 5 })]),
    ],
  });
  spreadChart.replaceChildren(plot);
}

function recessionBand(period: RecessionPeriod): HTMLSpanElement {
  const first = new Date(`${observations[0].date}T00:00:00Z`).valueOf();
  const last = new Date(`${observations.at(-1)!.date}T00:00:00Z`).valueOf();
  const start = new Date(`${period.start}T00:00:00Z`).valueOf();
  const end = new Date(`${period.end}T00:00:00Z`).valueOf();
  const band = document.createElement("span");
  band.className = "recession-band";
  band.style.left = `${Math.max(0, ((start - first) / (last - first)) * 100)}%`;
  band.style.width = `${Math.min(100, ((end - start) / (last - first)) * 100)}%`;
  return band;
}

function update(next: number): void {
  index = clampObservationIndex(next, observations);
  slider.value = String(index);
  render();
}

function stopPlayback(): void {
  if (playback !== undefined) window.clearInterval(playback);
  playback = undefined;
  playButton.classList.remove("is-playing");
  playButton.setAttribute("aria-label", "Play history");
  playButton.innerHTML = '<span aria-hidden="true">▶</span>';
}

slider.addEventListener("input", () => { stopPlayback(); update(Number(slider.value)); });
slider.addEventListener("keydown", (event) => { if (event.shiftKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) { event.preventDefault(); stopPlayback(); update(index + (event.key === "ArrowRight" ? 12 : -12)); } });
playButton.addEventListener("click", () => {
  if (playback !== undefined) return stopPlayback();
  if (index === observations.length - 1) update(0);
  playButton.classList.add("is-playing"); playButton.setAttribute("aria-label", "Pause history"); playButton.innerHTML = '<span aria-hidden="true">Ⅱ</span>';
  playback = window.setInterval(() => { if (index >= observations.length - 1) return stopPlayback(); update(index + 1); }, 90);
});
new ResizeObserver(() => render()).observe(chart);
render();
}
