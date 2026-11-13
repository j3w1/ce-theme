// The site is served under Astro's `base` (/ce-theme/ on GitHub Pages). Every hand-written internal URL goes through
// url(): page links, form actions, assets, downloads and the URLs inside island data. Imported CSS and fonts are rebased by
// the bundler. Write the path from the site root: url('/fundamentos/'), url('/assets/logo-wordmark-color.png').
// Outside Astro (plain Node tests that import site data) there is no base, and URLs stay root-relative; tests/dist checks the
// built site is under its base.
const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/?$/, '/');

export const url = (path = '/') => BASE + path.replace(/^\//, '');
