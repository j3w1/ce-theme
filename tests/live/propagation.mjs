import { cssUrls, elements, jsImports } from '../dist/output.mjs';
import { ROUTES } from './routes.mjs';

// GitHub Pages propagation (issue #9 R6, "A first failure waits for propagation, retrying for at most 5 minutes before it
// counts"). As the repository lead decided for #9, this preflight is that wait. Before any test runs, it waits until
// everything the smoke reads is served from the new deploy:
//   - every route with the expected commit and package version;
//   - every same-site link and resource those pages use: stylesheets and their fonts, scripts and their imports, the island
//     bundles and the downloads.
// A first failure is retried for at most five minutes from the first attempt, then counts. Every request is aborted at that
// deadline, so nothing is accepted after it. After the preflight the functional checks run once, with no retry.
const BUDGET = 5 * 60_000;
const PAUSE = 15_000;
const SPENT = 'the five-minute budget ran out';
/** An error code or class name such as ECONNREFUSED or TypeError; anything else is not printed. */
const named = (value) => (typeof value === 'string' && /^[A-Za-z]\w*$/.test(value) ? value : undefined);

export default async function waitForDeploy() {
  const site = new URL(process.env.CE_SITE_URL.replace(/\/?$/, '/'));
  const where = `${site.origin}${site.pathname}`; // never the credentials, query or fragment of the URL
  const commit = process.env.CE_EXPECT_COMMIT;
  const version = process.env.CE_EXPECT_VERSION;
  const deadline = Date.now() + BUDGET;
  const get = async (url) => {
    const left = deadline - Date.now();
    if (left <= 0) throw new Error(SPENT);
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(left) });
    const text = await response.text();
    if (Date.now() >= deadline) throw new Error(SPENT); // an answer that completes after the deadline is not accepted
    return { status: response.status, text };
  };
  const ours = (url) => url.origin === site.origin && url.pathname.startsWith(site.pathname);

  // One pass: undefined when everything is served from the expected deploy, otherwise what is not yet.
  async function pass() {
    const pending = [];
    const seen = new Set();
    const add = (value, base) => {
      let url;
      try { url = new URL(value, base); } catch { return; }
      url.hash = '';
      if (ours(url) && !seen.has(url.href)) { seen.add(url.href); pending.push(url); }
    };
    for (const route of ROUTES) {
      const page = new URL(route, site);
      const { status, text } = await get(page);
      if (status !== 200) return `${page.pathname} answers HTTP ${status}`;
      if (!text.includes(`@casaelida/vue ${version} · commit <a href="https://github.com/j3w1/ce-theme/commit/${commit}">`)) return `${page.pathname} does not show ${version} and commit ${commit.slice(0, 7)} yet`;
      for (const element of elements(text)) {
        for (const [name, value] of element.attrs) if (['href', 'src', 'component-url', 'renderer-url', 'before-hydration-url'].includes(name)) add(value, page);
        if (element.name === 'script' && element.body) for (const specifier of jsImports(element.body)) add(specifier, page);
      }
    }
    while (pending.length) {
      const url = pending.shift();
      const { status, text } = await get(url);
      if (status !== 200) return `${url.pathname} answers HTTP ${status}`;
      if (url.pathname.endsWith('.css')) for (const ref of cssUrls(text)) add(ref, url);
      if (/\.m?js$/.test(url.pathname)) for (const specifier of jsImports(text)) add(specifier, url);
    }
    return undefined;
  }

  let last = 'no answer';
  for (;;) {
    try {
      const waiting = await pass();
      if (waiting === undefined && Date.now() < deadline) return;
      if (waiting === undefined) throw new Error(SPENT);
      last = waiting;
    } catch (error) {
      // The last reason that says what was not served yet is kept: running out of time is not one, and a request cut off at the
      // deadline is added to the earlier reason instead of replacing it. A request error is named by its code, never by its
      // message, which can repeat the URL.
      if (error.message !== SPENT) {
        const cutOff = error.name === 'TimeoutError' || error.name === 'AbortError';
        const failed = `a request failed: ${named(error.cause?.code) ?? named(error.name) ?? 'unknown error'}`;
        last = !cutOff ? failed : last === 'no answer' ? 'a request reached the deadline' : `${last}; then a request reached the deadline`;
      }
    }
    const left = deadline - Date.now();
    if (left <= 0) throw new Error(`${where} did not serve the expected deploy within five minutes (last: ${last}).`);
    await new Promise((resolve) => setTimeout(resolve, Math.min(PAUSE, left)));
  }
}
