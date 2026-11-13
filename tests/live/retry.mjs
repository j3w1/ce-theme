// The live smoke's retries (issue #9 R6): a failure caused by GitHub Pages propagation is retried after a pause, within the
// one five-minute budget the smoke started with (CE_LIVE_DEADLINE, set by tests/live/propagation.mjs). No retry starts once
// the budget is spent, and a retry that ends after it never counts as a pass: the failure counts. Ordinary runs set no
// deadline and never retry, so the hooks do nothing there.
const PAUSE = 15_000;
const SPENT = 'The five-minute propagation budget is spent; this failure counts.';
const deadline = () => Number(process.env.CE_LIVE_DEADLINE);

/** Registers the retry hooks on a spec file's `test`. */
export function liveRetries(test) {
  test.beforeEach(pauseBeforeRetry);
  test.afterEach(refuseLatePass);
}

export async function pauseBeforeRetry({}, testInfo) {
  const end = deadline();
  if (!end || testInfo.retry === 0) return;
  if (Date.now() >= end) throw new Error(SPENT);
  await new Promise((resolve) => setTimeout(resolve, Math.min(PAUSE, end - Date.now())));
  if (Date.now() >= end) throw new Error(SPENT);
}

// Playwright's test timeout counts from a start time this hook cannot see, so the deadline is enforced on the result instead.
export async function refuseLatePass({}, testInfo) {
  const end = deadline();
  if (end && testInfo.retry > 0 && Date.now() >= end) throw new Error(SPENT);
}
