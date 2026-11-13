// A first failure waits for GitHub Pages to propagate: the smoke starts once the site serves the expected commit, retrying
// for at most 5 minutes before the failure counts.
export default async function waitForDeploy() {
  const site = process.env.CE_SITE_URL.replace(/\/?$/, '/');
  const commit = process.env.CE_EXPECT_COMMIT;
  const deadline = Date.now() + 5 * 60_000;
  let seen = 'no response';
  for (;;) {
    try {
      const response = await fetch(site, { cache: 'no-store' });
      const html = await response.text();
      if (response.status === 200 && html.includes(`/commit/${commit}"`)) return;
      seen = response.status === 200 ? 'HTTP 200 with another commit' : `HTTP ${response.status}`;
    } catch (error) {
      seen = error.message;
    }
    if (Date.now() > deadline) throw new Error(`${site} did not serve commit ${commit} within 5 minutes (last seen: ${seen}).`);
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  }
}
