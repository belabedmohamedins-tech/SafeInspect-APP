# SPEC 11 — Agenda "add" screen can save a mismatched facility name/id pair
Priority: P2 (minor severity, but a confirmed real bug with a clean fix
demonstrated by its sibling screen). Dependencies: none.

## Problem
`app/agenda/add.tsx`'s facility search input:
```
<TextInput
  ...
  value={facilityName}
  onChangeText={setFacilityName}
  onFocus={() => setShowPicker(true)}
  ...
/>
```
Selecting a facility via `selectFacility()` sets both `facilityName` and
`facilityId` together. But if the user then edits the search text again
(to fix a typo, search for something else, then changes their mind without
re-selecting from the list) `onChangeText` only updates `facilityName` —
`facilityId` is never cleared, so it stays pointed at the earlier
selection. Pressing "حفظ المهمة" (Save) in that state saves an
`AgendaItem` where `facilityName` (the edited text) and `facilityId` (the
stale reference) refer to two different facilities.

## Confirmed by contrast with the sibling edit screen
`app/agenda/edit.tsx` handles the identical interaction correctly:
```
onChangeText={t => { setFacilityName(t); setFacilityId(''); }}
```
Clearing `facilityId` forces the user to re-select from the picker before
the form is valid again (the existing `if (!facilityId) { Alert.alert(...); return; }`
guard in both screens' save handlers already depends on this being empty
when no valid selection is active — `edit.tsx` upholds that invariant,
`add.tsx` doesn't).

## Desired behavior
Apply the same fix to `add.tsx`:
```
onChangeText={t => { setFacilityName(t); setFacilityId(''); }}
```
No other changes needed — the existing `if (!facilityId)` validation in
`handleSave()` will then correctly block saving until the user re-selects.

## Reason
Small, one-line fix, but a real data-integrity gap with a concrete,
confirmed downstream consequence: `app/agenda/index.tsx`'s `handleLaunch()`
resolves the facility to inspect via `getFacilityById(item.facilityId)` —
not by `facilityName`. If `add.tsx` saved a mismatched pair, the agenda
list would display one facility's name, but tapping to launch the
inspection would open the checklist for a DIFFERENT facility — silently,
with no indication anything is wrong. This audit's earlier findings about
the agenda screen having no risk/priority awareness (SPEC 07) compound
with any confusion here about which facility is actually scheduled.

## Affected files
- `app/agenda/add.tsx` (one-line fix, `onChangeText` handler)

## Tests required
- Test: select a facility, then change the search text without
  re-selecting, then attempt to save — assert the save is blocked (the
  `facilityId` empty-check fires) rather than saving a mismatched pair.
