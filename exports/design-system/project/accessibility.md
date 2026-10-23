# Accessibility baseline

Target WCAG 2.2 AA for the web recipes and reference site. Automated checks support review; they do not certify every downstream composition or physical display.

## Color and text

Normal text must reach 4.5:1 contrast; large text and control boundaries must reach 3:1. `ce-theme.json` records the semantic pairs checked by `pnpm validate`. Brand red `#E6303D` is not the default small white-text button fill. Action red `#DA2E3A` provides the separate accessible role. Yellow always uses dark text.

Decorative divider gray is not a sufficient control boundary. Inputs use the darker control token. A change of color alone does not communicate an error, status, or selected state: include words, icons, borders, or pressed/current state.

Photo overlays need visual validation at the final crop. Use the dark scrim or an opaque card; do not rely only on text shadow. The general contrast test checks opaque semantic pairs, not arbitrary image pixels or every campaign asset.

## Navigation and controls

Use native interactive elements, visible labels, and native keyboard behavior. The reference navigation has an explicit mobile menu toggle, an expanded state, Escape recovery, and a skip link. Controls have 44–48px targets. Focus uses a 2px outline with a 3px offset. Disabled controls remain native disabled elements.

Code labels are selectable text. Keep identifiers intact; wrap long values. Product names, details, and prices are text, with a complete screen-reader name for prices whose visual fragments would otherwise read awkwardly. Images have purpose-specific alternative text; decorative icons use `aria-hidden`.

## Responsive and motion behavior

Check 390px, 768px, and 1440px layouts, 200% text sizing, long identifiers, multiline names, and missing product images. Wide token/data tables may scroll within their own region; the page itself must not overflow. Respect `prefers-reduced-motion` and avoid autoplay.

The web test suite scans every content route with axe, exercises the mobile menu and keyboard, validates downloadable exports, changes the application format, and checks products and controls at multiple viewport sizes. Final physical signage readability, full screen-reader workflows, and downstream integrations require their own environment checks.
