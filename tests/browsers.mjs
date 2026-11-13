// Browser projects for both Playwright configs. Chromium always runs. WebKit runs in hosted CI, which installs it with its
// system libraries; elsewhere it runs only when asked (CE_WEBKIT=1), and the run says that it did not.
const webkit = Boolean(process.env.CI || process.env.CE_WEBKIT);
if (!webkit && !process.env.TEST_WORKER_INDEX) console.log('WebKit was not run: hosted CI runs it; set CE_WEBKIT=1 where its system libraries are installed.');

export const projects = [
  { name: 'chromium', use: { browserName: 'chromium' } },
  ...(webkit ? [{ name: 'webkit', use: { browserName: 'webkit' } }] : []),
];
