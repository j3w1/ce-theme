// The live smoke's retries (issue #9 R6): a failure caused by GitHub Pages propagation is retried after a pause, within the
// one five-minute budget the smoke started with (CE_LIVE_DEADLINE, set by tests/live/propagation.mjs). A retry never passes
// after that budget: it fails if the budget is spent before or after its pause, and its timeout ends at the deadline. Ordinary
// runs set no deadline and never retry, so the hook does nothing there.
const PAUSE = 15_000;

export async function pauseBeforeRetry({}, testInfo) {
  const deadline = Number(process.env.CE_LIVE_DEADLINE);
  if (!deadline || testInfo.retry === 0) return;
  const began = Date.now();
  const unspent = () => { if (Date.now() >= deadline) throw new Error('The five-minute propagation budget is spent; this failure counts.'); };
  unspent();
  await new Promise((resolve) => setTimeout(resolve, Math.min(PAUSE, deadline - Date.now())));
  unspent();
  // The test's timeout counts from its start; this attempt may run only until the deadline, so a late pass times out.
  testInfo.setTimeout(Math.min(testInfo.timeout, Date.now() - began + (deadline - Date.now())));
}
