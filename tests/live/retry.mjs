// The live smoke's retries (issue #9 R6): a failure caused by GitHub Pages propagation is retried after a pause, within the
// one five-minute budget the smoke started with (CE_LIVE_DEADLINE, set by tests/live/propagation.mjs). Once the budget is
// spent the failure counts. Ordinary runs set no deadline and never retry, so the hook does nothing there.
const PAUSE = 15_000;

export async function pauseBeforeRetry({}, testInfo) {
  const deadline = Number(process.env.CE_LIVE_DEADLINE);
  if (!deadline || testInfo.retry === 0) return;
  const left = deadline - Date.now();
  if (left <= 0) throw new Error('The five-minute propagation budget is spent; this failure counts.');
  await new Promise((resolve) => setTimeout(resolve, Math.min(PAUSE, left)));
}
