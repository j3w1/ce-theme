// A reporter of the live smoke (issue #9 R6): a retry that passes counts only if its result arrives within the five-minute
// propagation budget (CE_LIVE_DEADLINE). Playwright reports a result after the test's own timeout, after hooks and fixture
// teardown, so the check is made here, on the result as it is counted, and a late pass fails the run.
export default class LiveBudget {
  late = [];

  onTestEnd(test, result) {
    const deadline = Number(process.env.CE_LIVE_DEADLINE);
    if (deadline && result.retry > 0 && result.status === 'passed' && Date.now() >= deadline) this.late.push(test.titlePath().filter(Boolean).join(' › '));
  }

  onEnd() {
    if (this.late.length === 0) return undefined;
    console.error(`These retries passed only after the five-minute propagation budget, so they count as failures:\n  ${this.late.join('\n  ')}`);
    return { status: 'failed' };
  }
}
