/** Campaign colour check. Campaign colours are chosen per campaign (never written into the global
 * brand tokens) and must keep text legible: 4.5:1 for normal text, 3:1 for large text (24px+, or
 * 18.66px+ bold) and for non-text marks. */

const HEX = /^#([0-9a-f]{6})$/i;

function luminance(hex) {
  const match = HEX.exec(hex);
  if (!match) throw new TypeError(`Use a six-digit hex colour, not ${JSON.stringify(hex)}.`);
  const channels = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(foreground, background) {
  const [a, b] = [luminance(foreground), luminance(background)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

/** Returns { ok, ratio, minimum, style } where `style` holds the CSS custom properties for `.ce-campaign`. */
export function campaignColors({ background, text, largeText = false }) {
  const ratio = contrastRatio(text, background);
  const minimum = largeText ? 3 : 4.5;
  return {
    ok: ratio >= minimum,
    ratio: Math.round(ratio * 100) / 100,
    minimum,
    style: { '--ce-campaign-surface': background.toLowerCase(), '--ce-campaign-text': text.toLowerCase() },
  };
}
