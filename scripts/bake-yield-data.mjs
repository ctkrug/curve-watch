import { writeFile } from "node:fs/promises";

const series = {
  1: "DGS1MO",
  3: "DGS3MO",
  6: "DGS6MO",
  12: "DGS1",
  24: "DGS2",
  36: "DGS3",
  60: "DGS5",
  84: "DGS7",
  120: "DGS10",
  240: "DGS20",
  360: "DGS30",
};

function monthlyAverage(csv) {
  const values = new Map();
  for (const row of csv.trim().split("\n").slice(1)) {
    const [date, value] = row.split(",");
    const parsed = Number(value);
    if (!date || !Number.isFinite(parsed)) continue;
    const month = `${date.slice(0, 7)}-01`;
    const bucket = values.get(month) ?? [];
    bucket.push(parsed);
    values.set(month, bucket);
  }
  return new Map([...values].map(([month, bucket]) => [
    month,
    Number((bucket.reduce((sum, value) => sum + value, 0) / bucket.length).toFixed(3)),
  ]));
}

const entries = await Promise.all(
  Object.entries(series).map(async ([tenor, id]) => {
    const response = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`);
    if (!response.ok) throw new Error(`Could not download ${id}: ${response.status}`);
    return [Number(tenor), monthlyAverage(await response.text())];
  }),
);

const months = [...new Set(entries.flatMap(([, values]) => [...values.keys()]))].sort();
const observations = months.map((date) => ({
  date,
  yields: Object.fromEntries(entries.map(([tenor, values]) => [tenor, values.get(date) ?? null])),
}));

await writeFile(
  new URL("../src/data/treasury-yield-curves.json", import.meta.url),
  `${JSON.stringify({ source: "FRED daily constant-maturity Treasury series; monthly arithmetic averages", observations })}\n`,
);
console.log(`Baked ${observations.length} monthly observations.`);
