const FALLBACK_PRICING = [
  { provider: "OpenAI", model: "GPT-6.1 Sol", input: 2, output: 10, cached: 0.1, asOf: "2026-10-28", source: "https://developers.openai.com/api/docs/pricing" },
  { provider: "OpenAI", model: "GPT-6 Luna", input: 0.1, output: 0.5, cached: 0.01, asOf: "2026-10-28", source: "https://developers.openai.com/api/docs/pricing" },
  { provider: "Anthropic", model: "Claude Sonnet 4", input: 3, output: 15, cached: 0.3, asOf: "2026-10-28", source: "https://www.anthropic.com/pricing" },
  { provider: "Anthropic", model: "Claude Haiku 3.5", input: 0.8, output: 4, cached: 0.08, asOf: "2026-10-28", source: "https://www.anthropic.com/pricing" },
  { provider: "Google", model: "Gemini 3.1 Flash-Lite", input: 0.25, output: 1.5, cached: 0.025, asOf: "2026-10-28", source: "https://ai.google.dev/gemini-api/docs/pricing" },
  { provider: "Google", model: "Gemini 4 Argon", input: 2, output: 10, cached: 0.1, asOf: "2026-10-28", source: "https://ai.google.dev/gemini-api/docs/pricing" }
];

const defaults = { tasks: 30000, inputTokens: 2500, outputTokens: 700, cache: 25, success: 92, toolCost: 0 };
let pricing = FALLBACK_PRICING;
const $ = (id) => document.getElementById(id);
const numberValue = (id) => Math.max(0, Number($(id).value) || 0);

function money(value, digits) {
  if (!Number.isFinite(value)) return "$0.00";
  if (value > 0 && value < 0.01) return "$" + value.toFixed(4);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits === undefined ? 2 : digits
  }).format(value);
}

function calculate(model) {
  const tasks = Math.max(1, numberValue("tasks"));
  const inputTokens = numberValue("inputTokens");
  const outputTokens = numberValue("outputTokens");
  const cacheShare = Math.min(100, numberValue("cache")) / 100;
  const successRate = Math.max(1, Math.min(100, numberValue("success"))) / 100;
  const toolCost = numberValue("toolCost");
  const inputCost = (inputTokens / 1000000) * (model.input * (1 - cacheShare) + model.cached * cacheShare);
  const outputCost = (outputTokens / 1000000) * model.output;
  const perAttempt = inputCost + outputCost + toolCost;
  const monthly = (perAttempt * tasks) / successRate;
  const successfulTasks = tasks * successRate;
  return Object.assign({}, model, {
    perTask: perAttempt,
    perSuccessfulTask: monthly / successfulTasks,
    monthly: monthly,
    attempts: tasks / successfulTasks
  });
}

function render() {
  const results = pricing.map(calculate).sort((a, b) => a.monthly - b.monthly);
  const cheapest = results[0];
  const lowestTask = results.slice().sort((a, b) => a.perTask - b.perTask)[0];
  const lowestSuccessful = results.slice().sort((a, b) => a.perSuccessfulTask - b.perSuccessfulTask)[0];
  $("best-monthly").textContent = money(cheapest.monthly);
  $("best-model").textContent = cheapest.provider + " · " + cheapest.model;
  $("best-task").textContent = money(lowestTask.perTask, 4);
  $("best-success").textContent = money(lowestSuccessful.perSuccessfulTask, 4);
  $("catalogDate").textContent = "Catalog checked " + pricing[0].asOf;

  const maxMonthly = Math.max.apply(null, results.map((item) => item.monthly).concat([1]));
  $("modelCards").innerHTML = results.slice(0, 3).map((item, index) => {
    const label = item.provider + (index === 0 ? " · LOWEST ESTIMATE" : "");
    const width = Math.max(4, (item.monthly / maxMonthly) * 100);
    return '<article class="model-card ' + (index === 0 ? "best" : "") + '">' +
      '<div class="provider">' + label + '</div>' +
      '<h3>' + item.model + '</h3>' +
      '<div class="big-number">' + money(item.monthly) + '</div>' +
      '<div class="label">estimated monthly cost</div>' +
      '<div class="bar"><i style="width:' + width + '%"></i></div>' +
      '</article>';
  }).join("");

  $("resultsBody").innerHTML = results.map((item) =>
    '<tr>' +
      '<td>' + item.provider + " · " + item.model + '</td>' +
      '<td>' + money(item.input, 4) + '</td>' +
      '<td>' + money(item.output, 4) + '</td>' +
      '<td><strong>' + money(item.perTask, 4) + '</strong></td>' +
      '<td><strong>' + money(item.perSuccessfulTask, 4) + '</strong></td>' +
      '<td><strong>' + money(item.monthly) + '</strong></td>' +
    '</tr>'
  ).join("");
}

function updateRangeLabels() {
  $("cacheValue").textContent = numberValue("cache") + "%";
  $("successValue").textContent = numberValue("success") + "%";
}

function reset() {
  Object.keys(defaults).forEach((id) => { $(id).value = defaults[id]; });
  updateRangeLabels();
  render();
}

["tasks", "inputTokens", "outputTokens", "cache", "success", "toolCost"].forEach((id) => {
  $(id).addEventListener("input", () => { updateRangeLabels(); render(); });
});
$("reset").addEventListener("click", reset);

fetch("data/pricing.json")
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("pricing catalog unavailable")))
  .then((catalog) => { if (Array.isArray(catalog) && catalog.length) pricing = catalog; })
  .catch(() => {})
  .finally(() => { updateRangeLabels(); render(); });
