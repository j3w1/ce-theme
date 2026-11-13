# CE Systems design workbench

The CE Systems design workbench is a set of 251 static HTML design boards for Casa Elida's future systems: the storefront, the staff workspace, and the specifications, decisions and prototypes that connect them. It is design work only. Every price, stock figure, store, order and person on a board is simulated, and no board approves a business rule. The boards show how CE Theme is used in context and they revealed gaps in it; those gaps are written up as [change requests](change-requests/README.md).

This repository holds documentation about the workbench. It does not hold the boards, the tools, the configuration or any image.

## Where things live

- **Main copy of the boards:** three private published artifacts, named by title only here because their links are private. Together they hold 253 published boards: the 251 source boards plus two generated per-artifact indexes.
  - "CE Systems — Storefront" (160 boards, public pages and the buying prototype);
  - "CE Systems — Workspace" (68 boards, staff pages and the publishing prototype);
  - "CE Systems — Specs, Decisions and Prototypes" (25 boards, index, flows, decisions, contracts and data).
- **Working files** (boards, build and audit tools, configuration, images): kept outside Git, in a git-ignored `workbench/` folder of a task worktree, and in the owner's preserved archive of the original working copy. `.gitignore` lists `/workbench/` so the folder cannot be committed by accident.
- **Rules and proposals:** [the design canon](design-canon.md) and [the change requests](change-requests/README.md), both in this repository.

## Standing rules

These are the owner's rules for the workbench. They are not reopened by individual tasks.

- Design only. No website implementation, no deployment, no real business data, and no automatic synchronisation of CE Theme from the boards. Business approvals come later and separately.
- Explanations in English; Spanish only for interface strings and retail examples. The brand is spelled `Casa Elida`.
- The external retail site used for layout inspiration is never named in any file, note or commit; say "the external retail reference". Its content is not copied.
- The guidelines are the authority, not the look of the photographs. Photographs are media previews, edited to fit the guidelines: no baked prices, codes or names on them.
- CE invariants: NAME uppercase on its own line above the Description; exact one-line CE codes; prices are supplied decimal strings with no arithmetic; no store means no amount; unknown availability is never shown as sold out.
- Every commercial and staff board carries the demonstration cue «Demostración — datos y operaciones simulados». Stores are «Tienda A — demostración» and «Tienda B — demostración». There is one admin navigation.
- A board is 40 to 8000 px tall, and its stored preview height equals its measured natural height. Re-measure before trusting a single audit flag, because measurements wobble by tens of pixels under load.
- Never ask anyone for passwords or tokens. No private portfolio source, customer data or secrets in assets.
- The full rule set is [the design canon](design-canon.md) (R-01 to R-21). The owner approved it for design prototypes only; it creates no business rule, no photograph-rights record and no CE Theme change.

## Photograph policy

The product photographs on the boards are edited images from Casa Elida's public social-media posts. Their image rights are not recorded, so **they are kept out of this public repository**. Their provenance manifests (source post, edit steps, pin positions) stay with the working files. The photographs are illustrative media for the prototypes and are not approved assets. The 16 jar NAMEs shown with some photographs are invented demonstration placeholders and must be replaced with catalogue NAMEs before any real use.

## Run, build, audit and publish

These commands run from the root of the working `workbench/` folder. They need Python 3 and Node 18 or later with Playwright and Chromium. Before auditing, set `CE_WB_SCRATCH` to a writable folder for the audit output; the tools' default is an owner-specific evidence folder that another account or machine cannot write.

```sh
# Preview server for the boards (leave it running)
python3 -I tools/serve.py retail/project blobs runtime.js 8102

# Audit all boards, in sequential chunks of 25
export CE_WB_SCRATCH=/path/to/writable/audit-output
python3 -I tools/session2/audit_chunks.py 25

# After any board changed: rerun every chunk (a plain rerun skips finished chunks
# without checking whether their boards changed)
python3 -I tools/session2/audit_chunks.py 25 --redo

# Assemble an artifact folder, or an offline kit, for one scope
python3 -I tools/build_scope.py <scope> publish --blobmap build/blobmap.<scope>.json
python3 -I tools/build_scope.py <scope> kit
```

`<scope>` is `storefront`, `workspace` or `specs` (`all` also works for kits).

- **Linux Chromium.** Launch it with `--font-render-hinting=none`. Without the flag, Linux text hinting makes boards measure up to a couple of hundred pixels taller than on Windows. The workbench tools already pass it.
- **Audits run one at a time.** Parallel audits, or an audit next to another browser job, give false flags and can crash Chromium. If a board is edited, re-measure it, update its stored height, re-audit that board, then rebuild the publish folder.
- **Publishing.** A publish folder is uploaded to the matching private artifact with the Artifact tool, after reading the latest live version. Publish the Specs artifact first, then Storefront, then Workspace, and compare each readback with the local build. Publishing is an owner-authorised step and is never automatic.
- **Generated pages.** The per-artifact `Indice` boards are generated, never hand-edited. Board sources keep relative links; links to a board in another artifact are rewritten only at build time.

## Relation to CE Theme

The workbench uses a copy of CE Theme that is deliberately not re-synchronised from here. Where the boards needed something CE Theme does not provide, or contradicts, the finding is a change request rather than an edit:

- [Change requests](change-requests/README.md): CR-01 to CR-10, each written as a proposal with evidence, a proposed change, acceptance checks and owner decisions. Each request's status line says whether it is implemented in CE Theme; none approves a business rule.
- [Design canon](design-canon.md): the workbench's own rules for its simulated boards.

A change request becomes part of CE Theme only through a normal pull request that follows [the workflow](workflow.md): the owner decides, the change is made in tokens, recipes or components, generated files are regenerated, and the checks in `AGENTS.md` pass. The boards keep their local patches until an owner-approved re-synchronisation task.
