/** Optional reference behaviour for the Casa Elida recipes. Framework applications use their own
 * component behaviour; these functions document the expected interaction and power the reference site.
 * Each one is progressive enhancement: the markup works (or degrades to readable content) without it. */

/** Tabs: role="tablist" with role="tab" buttons (aria-controls) and role="tabpanel" panels.
 * Arrow keys, Home and End move between tabs; activation is automatic. */
export function enhanceTabs(root = document) {
  for (const list of root.querySelectorAll('[role="tablist"]')) {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab, focus = true) => {
      for (const other of tabs) {
        const selected = other === tab;
        other.setAttribute('aria-selected', String(selected));
        other.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(other.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      }
      if (focus) tab.focus();
    };
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (event) => {
        const index = tabs.indexOf(tab);
        const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        select(tabs[(next + tabs.length) % tabs.length]);
      });
    });
    select(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0], false);
  }
}

/** Dialogs and drawers: a button with data-ce-open="<dialog id>" opens it with showModal(); any element
 * with data-ce-close inside closes it. Focus returns to the opener; Escape closes natively. */
export function enhanceDialogs(root = document) {
  const openers = new WeakMap();
  for (const opener of root.querySelectorAll('[data-ce-open]')) {
    const dialog = document.getElementById(opener.dataset.ceOpen);
    if (!dialog || typeof dialog.showModal !== 'function') continue;
    opener.setAttribute('aria-haspopup', 'dialog');
    opener.addEventListener('click', () => { openers.set(dialog, opener); dialog.showModal(); });
    if (dialog.dataset.ceEnhanced) continue;
    dialog.dataset.ceEnhanced = 'true';
    dialog.addEventListener('close', () => openers.get(dialog)?.focus());
  }
  for (const closer of root.querySelectorAll('dialog [data-ce-close]')) {
    closer.addEventListener('click', () => closer.closest('dialog').close());
  }
}

/** Quantity steppers: .ce-quantity with two buttons and a number input (min/max respected). */
export function enhanceQuantity(root = document) {
  for (const group of root.querySelectorAll('.ce-quantity')) {
    const input = group.querySelector('input');
    const [less, more] = group.querySelectorAll('button');
    const sync = () => {
      const value = Number(input.value);
      less.disabled = input.min !== '' && value <= Number(input.min);
      more.disabled = input.max !== '' && value >= Number(input.max);
    };
    less.addEventListener('click', () => { input.stepDown(); input.dispatchEvent(new Event('change', { bubbles: true })); sync(); });
    more.addEventListener('click', () => { input.stepUp(); input.dispatchEvent(new Event('change', { bubbles: true })); sync(); });
    input.addEventListener('input', sync);
    sync();
  }
}

/** Single-choice groups of pressed buttons (chips, swatches, store choice): [data-ce-choice]. */
export function enhanceChoices(root = document) {
  for (const group of root.querySelectorAll('[data-ce-choice]')) {
    const buttons = [...group.querySelectorAll('button[aria-pressed]')];
    for (const button of buttons) {
      button.addEventListener('click', () => {
        buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
        group.dispatchEvent(new CustomEvent('ce-choice', { bubbles: true, detail: { value: button.value || button.textContent.trim() } }));
      });
    }
  }
}

/** Copy buttons: data-ce-copy="<exact text>" writes the exact identifier and announces the result
 * in the nearest [role="status"]. Codes are copied as stored, never as their segmented display. */
export function enhanceCopy(root = document) {
  for (const button of root.querySelectorAll('[data-ce-copy]')) {
    button.addEventListener('click', async () => {
      const status = button.closest('[data-ce-copy-scope]')?.querySelector('[role="status"]') ?? document.querySelector('[role="status"]');
      try {
        await navigator.clipboard.writeText(button.dataset.ceCopy);
        if (status) status.textContent = 'Copiado';
      } catch {
        if (status) status.textContent = 'No se pudo copiar; selecciona el texto';
      }
    });
  }
}

/** Toggle buttons (favourite, compare): button[data-ce-toggle][aria-pressed] flips its pressed state.
 * The application persists the choice; this only reflects it. */
export function enhanceToggles(root = document) {
  for (const button of root.querySelectorAll('button[data-ce-toggle][aria-pressed]')) {
    button.addEventListener('click', () => button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true')));
  }
}

/** Rails: buttons with data-ce-rail="prev|next" and aria-controls="<rail id>" scroll the rail by one view.
 * The rail stays a native scroll container, so touch, trackpad and keyboard scrolling keep working. */
export function enhanceRails(root = document) {
  for (const button of root.querySelectorAll('[data-ce-rail][aria-controls]')) {
    const rail = document.getElementById(button.getAttribute('aria-controls'));
    if (!rail) continue;
    const direction = button.dataset.ceRail === 'prev' ? -1 : 1;
    const sync = () => {
      const max = rail.scrollWidth - rail.clientWidth - 1;
      button.disabled = direction < 0 ? rail.scrollLeft <= 0 : rail.scrollLeft >= max;
    };
    button.addEventListener('click', () => {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      rail.scrollBy({ left: direction * rail.clientWidth * 0.9, behavior: smooth ? 'smooth' : 'auto' });
    });
    rail.addEventListener('scroll', sync, { passive: true });
    sync();
  }
}

/** Gallery position on narrow screens: .ce-gallery with a sibling .ce-gallery-status (aria-live="polite")
 * announces “Imagen 2 de 5” as the customer swipes. */
export function enhanceGallery(root = document) {
  for (const gallery of root.querySelectorAll('.ce-gallery')) {
    const status = gallery.parentElement?.querySelector('.ce-gallery-status');
    const items = [...gallery.children];
    if (!status || items.length < 2) continue;
    let current = -1;
    const update = () => {
      const index = Math.round(gallery.scrollLeft / Math.max(1, gallery.clientWidth));
      if (index === current) return;
      current = index;
      status.textContent = `Imagen ${Math.min(index + 1, items.length)} de ${items.length}`;
    };
    gallery.addEventListener('scroll', update, { passive: true });
    update();
  }
}

/** Marker visibility: button[data-ce-markers="<tagged media id>"] hides or shows the letters on a photo.
 * The product list below the photo is unaffected, so no information is lost. */
export function enhanceMarkers(root = document) {
  for (const button of root.querySelectorAll('button[data-ce-markers]')) {
    const media = document.getElementById(button.dataset.ceMarkers);
    if (!media) continue;
    button.setAttribute('aria-pressed', String(media.dataset.ceMarkers !== 'hidden'));
    button.addEventListener('click', () => {
      const show = media.dataset.ceMarkers === 'hidden';
      media.dataset.ceMarkers = show ? 'shown' : 'hidden';
      button.setAttribute('aria-pressed', String(show));
    });
  }
}

/** Feature tags that come from data: keeps every .ce-feature-tag inside its frame and clear of the other tags and the markers.
 * A tag whose label would leave the frame is flipped with ce-feature-tag--start; a tag that touches another is moved up or down in
 * steps of its own height. Authors still choose sensible positions; this is the guard for positions nobody checked by eye. */
export function placeFeatureTags(frame, { gap = 6 } = {}) {
  const box = frame.getBoundingClientRect();
  const taken = [...frame.querySelectorAll('.ce-hotspot')].map((el) => el.getBoundingClientRect());
  const clash = (r) => taken.some((o) => r.left < o.right + gap && r.right > o.left - gap && r.top < o.bottom + gap && r.bottom > o.top - gap);
  let moved = 0;
  for (const tag of frame.querySelectorAll('.ce-feature-tag')) {
    const base = tag.dataset.ceY ??= tag.style.getPropertyValue('--ce-y') || '50%';
    tag.style.setProperty('--ce-y', base);
    tag.classList.remove('ce-feature-tag--auto-start');
    let rect = tag.getBoundingClientRect();
    if (rect.right > box.right + 0.5 && !tag.matches('.ce-feature-tag--start, .ce-feature-tag--above, .ce-feature-tag--below')) { tag.classList.add('ce-feature-tag--start', 'ce-feature-tag--auto-start'); rect = tag.getBoundingClientRect(); }
    const step = rect.height + gap;
    for (const offset of [0, 1, -1, 2, -2, 3, -3].map((n) => n * step)) {
      const top = rect.top + offset, bottom = rect.bottom + offset;
      if (top < box.top || bottom > box.bottom) continue;
      if (!clash({ left: rect.left, right: rect.right, top, bottom })) {
        if (offset) { tag.style.setProperty('--ce-y', `calc(${base} + ${offset}px)`); moved += 1; }
        taken.push(tag.getBoundingClientRect());
        break;
      }
    }
  }
  return moved;
}

/** Runs placeFeatureTags on every frame marked data-ce-tags="auto", now and when the frame is resized. */
export function enhanceFeatureTags(root = document) {
  for (const frame of root.querySelectorAll('.ce-tagged-media[data-ce-tags="auto"]')) {
    placeFeatureTags(frame);
    if (typeof ResizeObserver === 'function') new ResizeObserver(() => placeFeatureTags(frame)).observe(frame);
  }
}

/** Share images: run on each .ce-share-card after document.fonts.ready and before the server captures it. The text band is narrow
 * so the centred square crop stays clean; long words such as “Antideslizante” must not be split
 * mid-word. Adds break opportunities after slashes (“vidrio/bambú”), then scales the band's text
 * down evenly, keeping the NAME / Description ratio, until every word fits (not below `min`). */
export function fitShareCard(card, { min = 0.6, step = 0.04 } = {}) {
  const block = card.querySelector('.ce-share-card-text');
  if (!block || card.matches('.ce-share-card--text, .ce-share-card--brand')) return 1;
  const items = [...block.querySelectorAll('p, .ce-code')];
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) node.data = node.data.replace(/\/(?!​)/g, '/​');
  const base = items.map((el) => parseFloat(getComputedStyle(el).fontSize));
  const overflows = () => items.some((el) => {
    const wrap = el.style.overflowWrap;
    el.style.overflowWrap = 'normal';
    const over = el.scrollWidth > el.clientWidth + 1;
    el.style.overflowWrap = wrap;
    return over;
  });
  let factor = 1;
  while (overflows() && factor - step >= min) {
    factor -= step;
    items.forEach((el, index) => { el.style.fontSize = `${(base[index] * factor).toFixed(1)}px`; });
  }
  return factor;
}

export function enhanceAll(root = document) {
  enhanceTabs(root); enhanceDialogs(root); enhanceQuantity(root); enhanceChoices(root); enhanceCopy(root);
  enhanceToggles(root); enhanceRails(root); enhanceGallery(root); enhanceMarkers(root); enhanceFeatureTags(root);
}
