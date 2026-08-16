# SPEC 06 — PDF report omits official reference fields; closing-meeting gate
not enforced before generation
Priority: P1. Dependencies: none.

## Problem A — generated report lacks chain-of-custody fields
`src/services/pdfService.ts` (1258 lines) builds a genuinely rich report —
embedded photos (base64), legal references, triple signature blocks
(inspector/facility manager/official stamp), committee members, GPS
coordinates. Confirmed via full-file grep: it never renders
`reportSequenceNumber`, `approvalStatus`, `approvedBy`/`approvedAt`, or
`integrityHash` anywhere.

## Problem B — closing-meeting gate is tracked but not enforced
`SavedInspection.closingMeetingDone` is documented in `src/types.ts`:
"True once the inspector confirms findings were verbally communicated to
the facility representative before signatures. Report PDF cannot be
generated until this is true." Confirmed via repo-wide grep: the field is
set (`meetingGateService.ts`), persisted, and synced to the server, but no
code path in `pdfService.ts` or its calling screens (`app/reports/[id].tsx`)
checks it before generating or sharing the PDF.

## Problem C — only 1 of 3 report signatures is ever digitally captured
`pdfService.ts`'s "triple signature block" (inspector / facility manager /
official stamp) only fills the inspector's box from `inspection.signature`
(the one field that exists on `SavedInspection`). The facility-manager and
stamp boxes are always empty print-only placeholders — there's no capture
mechanism anywhere in the app for them. This may be an intentional
operational choice (facility signs the printed copy on paper), but if so
it means the digital record — the one carrying the integrity hash — can
never prove the facility acknowledged the findings, only that the
inspector filled the form in.

## Problem D — signature confirmation is timing-based, not state-based
## (confirmed architecturally, not just a minor nitpick — there is no
## synchronization primitive available at all in the current design)
`app/screens/signature.tsx`: `onPress={() => { handleExport(); setTimeout(handleConfirm, 300); }}`.
Traced into `components/inspection/SignaturePad.tsx`, the pad backing
this: `export()` calls `webViewRef.current?.injectJavaScript(...)`, which
returns synchronously and immediately — it does NOT wait for the
injected JS to run. The actual signature data arrives later,
asynchronously, via the WebView's `postMessage` → React Native's
`onMessage` → `handleMessage` → `onSignature(base64)` callback chain —
inherent to how RN WebViews communicate, with no guaranteed timing and no
promise anywhere in this path. There is currently no way to know
synchronously when (or whether) `onSignature` has fired. The `setTimeout(300)`
is not "usually enough with an edge case" — it's fundamentally
disconnected from the actual completion signal, which already exists
(`onSignature`) and is simply not being used for this purpose.

## Problem E — stale severity labels in the final preview screen
`app/preview/index.tsx` defines `SEVERITY_LABEL`/`SEVERITY_COLOR` keyed by
`'critical' | 'major' | 'minor'` — but the real `Severity` type used
everywhere else in the app is `'critical' | 'high' | 'medium' | 'low'`
(confirmed: `'major'`/`'minor'` don't appear anywhere else in the
codebase — this is isolated stale code, not a second legitimate severity
system). Used at lines rendering `action.severity` for CAP items on the
final printable preview: `SEVERITY_COLOR[action.severity] ?? Colors.textTertiary`
and `SEVERITY_LABEL[action.severity] ?? action.severity`. Fails gracefully
(gray dot, raw English word) rather than crashing, but any CAP item with
severity `high`/`medium`/`low` shows literally "high"/"medium"/"low"
instead of an Arabic label on the document an inspector reviews before
signing.

## Desired behavior
1. Add a header/footer block to the report template(s) in `pdfService.ts`
   showing: `reportSequenceNumber` (or a clear "غير مرقّم رسمياً" placeholder
   if absent), `approvalStatus` translated to Arabic, `approvedBy` +
   `approvedAt` when present, and either the `integrityHash` itself (short
   form) or a QR code encoding it for verification.
2. Before generating/sharing a PDF, check `inspection.closingMeetingDone`.
   If false, block generation and surface the same `MeetingGateModal`
   pattern already used at checklist entry (`components/checklist/
   MeetingGateModal.tsx`) — reuse rather than build a new component.
3. Decide and document: should a DRAFT/unapproved report still be
   generatable (e.g. for internal review) but visibly watermarked as
   unapproved? Recommend yes — mirrors how the identical `criticalOverride`/
   grade badge is already color-coded elsewhere in this file
   (`gradeBadgeColor`). Flag this UX decision to the maintainer rather than
   assuming silently.
4. For Problem C: flag to the maintainer as a decision point rather than
   assuming — either build digital capture for the facility signature (a
   second `SignaturePad` step in the same flow, stored as a new
   `facilitySignature?: string` field), or explicitly document that the
   digital record is inspector-only and the printed copy is the
   countersigned original.
5. For Problem D: remove the `setTimeout` entirely. Call `handleConfirm`
   (or the equivalent "proceed" logic) directly from inside the existing
   `onSignature` callback — that's the actual, already-existing completion
   signal (it's how `setSignatureData` gets called today); the fix is
   restructuring `handleConfirm`'s trigger, not adding a wait. If the
   button needs to show a loading state between tap and `onSignature`
   firing, track that with a `useState` boolean, not a timer.
6. For Problem E: replace `preview/index.tsx`'s local `SEVERITY_LABEL`/
   `SEVERITY_COLOR` maps with the correct shared severity constants already
   used elsewhere (e.g. `scoringUtils.ts` or `corrective-actions.tsx`'s
   `SEVERITY_LABEL`/`SEVERITY_COLOR`, which do include `high`/`medium`/`low`
   correctly) rather than maintaining a third, drifted copy.

## Reason
This is the actual administrative document handed to a facility or filed in
a register. Without the sequence number it can't be cross-referenced against
the commune's official log; without approval status it's indistinguishable
from an unreviewed draft; without the closing-meeting gate, due process
(informing the facility before signatures) isn't actually guaranteed by the
software even though the data model was designed to guarantee it.

## Affected files
- `src/services/pdfService.ts` (template functions — multiple report
  variants exist in this file, apply consistently to all of them)
- `app/reports/[id].tsx` (gate check before calling the generation function)
- Reuse: `components/checklist/MeetingGateModal.tsx`
- `src/types.ts` (add `facilitySignature?: string` if Problem C's decision
  is to build digital capture)
- `app/screens/signature.tsx` (Problem D fix; would also need a second pass
  if Problem C adds facility-signature capture to this same screen)
- `app/preview/index.tsx` (Problem E — replace local severity maps)

## Tests required
- Snapshot/HTML-content test asserting `reportSequenceNumber`,
  `approvalStatus`, and `integrityHash` appear in generated HTML when
  present on the inspection object.
- Test that PDF generation is blocked (or clearly watermarked, per the
  decision in point 3) when `closingMeetingDone !== true`.
- Test asserting `preview/index.tsx` renders correct Arabic labels for CAP
  items with severity `high`/`medium`/`low`, not raw English fallback text.
