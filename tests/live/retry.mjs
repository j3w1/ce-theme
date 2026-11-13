// The live smoke's retries (issue #9 R6): a failure caused by GitHub Pages propagation is retried after a pause, within the
// one five-minute budget the smoke started with (CE_LIVE_DEADLINE, set by tests/live/propagation.mjs). Ordinary runs set no
// deadline and never retry, so the hooks do nothing there.
//
// A retry starts only while a whole test timeout is left before the deadline. Playwright ends an attempt (pass, fail or
// timeout) within that timeout of the test's start, which is no later than this hook's start, so every retry ends by the
// deadline. The pause runs inside that timeout. refuseLatePass is a backstop: a retry that ends after the deadline never
// counts as a pass.
const PAUSE = 15_000;
const SPENT = 'The five-minute propagation budget does not leave time for another attempt; this failure counts.';
const deadline = () => Number(process.env.CE_LIVE_DEADLINE);

/** Registers the retry hooks on a spec file's `test`. */
export function liveRetries(test) {
  test.beforeEach(pauseBeforeRetry);
  test.afterEach(refuseLatePass);
}

export async function pauseBeforeRetry({}, testInfo) {
  const end = deadline();
  if (!end || testInfo.retry === 0) return;
  if (!(testInfo.timeout > 0) || end - Date.now() < testInfo.timeout) throw new Error(SPENT);
  await new Promise((resolve) => setTimeout(resolve, Math.min(PAUSE, testInfo.timeout / 4)));
}

export async function refuseLatePass({}, testInfo) {
  const end = deadline();
  if (end && testInfo.retry > 0 && Date.now() >= end) throw new Error(SPENT);
}
