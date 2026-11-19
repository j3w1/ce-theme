# Artifact synchronization

2026-11-14 · [B7 execution spec](https://github.com/j3w1/ce-theme/issues/33).

The three existing private artifacts were synchronized from reviewed CE Theme
`2fdfdeb199e3279ca698a34d1ae711269a330dfd` and the immutable
`@casaelida/vue` **0.5.0** release. The consumer reference is the implemented
application UI **0.2.0** snapshot; later records-only updates do not change this
visual source set.

| Artifact purpose | Native revision | Checked change |
| --- | --- | --- |
| Canonical Design System | 46 | Reviewed contracts, consumption guidance, assets and native generation |
| Messaging exploration | 36 | Foundation refresh and implemented / fixture / future labels |
| Retail & Systems archive | 65 | Foundation refresh and one tablet flex-row compatibility declaration |

Readbacks checked exact source forms, complete typed JSON objects, copied fonts,
logos and Inter OFL, and preserved identities, private status, unowned content,
archive history and frame geometry. The native editor generated CSS, API cards,
manifest and README consumption tail from the reviewed inputs, with separate
output hashes. The authored README body stayed exact. One forward correction
restored a final newline lost by the component-guideline editor.

The two cart SVGs retain identical canonical XML, attributes and path data;
their accepted stored form expands the self-closing path and omits the final
newline. Original and stored hashes are recorded separately. Preview media URL
rewrites were checked against exact expected forms. No arbitrary transformation
or generated-file patch was accepted.

Chromium mirror collection covered 209 boards at 100%, 150% and 200% text, plus
selected narrow layouts, accessibility and keyboard comparisons. Focused height
checks and sampled native-viewer checks covered the changed content, typography,
footer reachability and focus rings. One pre-existing definition-list
accessibility finding remains. Native checks cover sampled boards and their
scrolling areas. Artifact WebKit, screen-reader and physical-device acceptance
were not run. The Cover comparison used the source mirror. Repository CI browser
and packed-consumer checks are separate evidence.

Real messaging, business services and AI remain unconnected; application examples
are fixtures. The CR-02 documentation kit was excluded. This record does not
extend platform or backend acceptance.

## 2026-11-19 · CR-02 documentation kit and hosting note

[Issue #39](https://github.com/j3w1/ce-theme/issues/39) synchronized the three
private artifacts from CE Theme `943744fdbfa697bd4d52a3efa1a8a5787ec91600` and
the immutable `@casaelida/vue` **0.5.0** release.

| Artifact | Native revision | Verified change |
| --- | --- | --- |
| Canonical Design System | 46 → 52 | Five source files, revision index and page-generated outputs |
| Messaging exploration | 36 → 38 | Installed canonical revision 52 |
| Retail & Systems archive | 65 → 67 | Installed canonical revision 52 |

The five published source files were `README.md`, `apply-ce-theme.md`,
`decisions.md`, `doc-kit/README.md` and `doc-kit/state-frame.css`. All five
authored files matched Git byte for byte on final readback. The write to
`design-system.json` updated `lastChange`. The page later added the kit to
`docs.sections` and preserved the `lastChange` values.

One editor save appended a transient space to the kit README. The editor
stored the file without the space and final newline, so one forward correction
restored the exact Git bytes. The page appended the expected 11,873-byte
`Consuming` tail to the exact root README body and generated the expected
`manifest.json` containing both kit files. The token CSS, component bundles, API
cards, previews and blobs kept their hashes. The canonical title, namespace,
ownership, privacy and unowned content were preserved.

All 10 Messaging and 12 Retail & Systems copied files matched the canonical
by full SHA-256. Each complete canvas matched its prior state apart from the
pin version and copy time. Post-refresh path, size and 128-bit SHA-256 prefix
checks matched the prior listings for all 16 Messaging and 193 Retail board
files. The Retail platform files were outside that comparison.

In the live Chromium viewer, the kit rendered without clipping and both
exploration overviews drew their boards. The Chromium mirror exercised the
kit at desktop size and in a 360 px sheet at 100% and 200% root text. The wide
fragment scrolled inside the frame and the focused body showed the 2 px ring.

The local mirror also rendered two boards from each exploration at board
geometry. Text used Inter and none overflowed horizontally. Keyboard checks
used Tab traversal only. Sampled recipe controls showed the 2 px focus ring,
and the mobile board's own controls used Chromium's default outline. The Retail
before-and-after snapshots were byte-identical, including existing bottom
clipping of 57 and 84 px in two notes sections. Messaging pre-refresh snapshots
were unavailable.

Live kit focus and keyboard traversal, live exploration board-level checks,
live text scaling and narrow widths were unrun. The exploration mirrors were
checked at board geometry. Scaled text, narrow viewports, 200% browser zoom
and the 640 px breakpoint were unrun. The kit mirror's 200% test set the root
font size directly. Artifact Firefox, WebKit, screen-reader and physical-device
checks were unrun. Repository browser and packed-consumer checks are tracked
separately.

## 2026-11-19 · Hosting retirement decision

[Issue #41](https://github.com/j3w1/ce-theme/issues/41) synchronized the canonical
Design System from merged CE Theme `14e5d7cc9ef6c96b13dd36837e35f4972b0405fd`.
The native editor published `project/decisions.md` at revision 53. Its readback
matched the 37,721-byte Git export, including the final newline (SHA-256
`7e4a0f8f0d98428fb3fc603f5af860dd23a79d0b4c9a7e20a9d6634e0aebd9ed`).

The final write updated `project/design-system.json` at revision 54. Only
`lastChange` differed. The native before-and-after inventory showed identical
sizes and SHA-256 hashes for the other 246 of 248 project files. Both
exploration artifacts were left untouched because they do not copy this file.

The publishing session performed the native readback. The prior revision number,
asset-store inventory and rendered page were unverified.
