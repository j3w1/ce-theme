// The live smoke's retries (issue #9 R6): a failure caused by GitHub Pages propagation is retried after a pause, within the
// one five-minute budget the smoke started with (CE_LIVE_DEADLINE, set by tests/live/propagation.mjs). Ordinary runs set no
// deadline and never retry, so the hook does nothing there.
//
// A retry starts only while a whole test timeout is left before the deadline, so its test body ends in time; the pause runs
// inside that timeout. Whether a retry's pass counts is decided on its reported result by tests/live/budget.mjs.
const PAUSE = 15_000;
const SPENT = 'The five-minute propagation budget does not leave time for another attempt; this failure counts.';

/** Registers the retry hook on a spec file's `test`. */
export function liveRetries(test) {
  test.beforeEach(pauseBeforeRetry);
}

export async function pauseBeforeRetry({}, testInfo) {
  const end = Number(process.env.CE_LIVE_DEADLINE);
  if (!end || testInfo.retry === 0) return;
  if (!(testInfo.timeout > 0) || end - Date.now() < testInfo.timeout) throw new Error(SPENT);
  await new Promise((resolve) => setTimeout(resolve, Math.min(PAUSE, testInfo.timeout / 4)));
}
