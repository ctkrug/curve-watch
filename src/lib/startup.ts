export function unavailableStateMarkup(reason: string): string {
  const message = typeof reason === "string" && reason.trim()
    ? reason.trim()
    : "The historical record could not be loaded.";
  return `<main class="startup-state" aria-labelledby="startup-heading"><p class="eyebrow">Curve Watch</p><h1 id="startup-heading">The curve is temporarily out of view.</h1><p>${message}</p><a href="./">Try again</a></main>`;
}
