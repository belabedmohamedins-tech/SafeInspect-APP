# SPEC 04 — Photographic evidence never leaves the device
Priority: P0. Dependencies: SPEC 01 (shares the backup payload shape).

## Problem
Photos are copied into permanent local storage correctly
(`src/services/PhotoService.ts` → `<documentDirectory>photos/`), and this
survives app restarts on the SAME device. But neither export path transmits
the actual image bytes:

- `BackupService.buildPhotoUriMap()` (in `exportBackup()`) only captures the
  local `file://` URI STRING per inspection item, never the file contents.
  A restored backup on a different device (or after reinstall, which clears
  `documentDirectory`) leaves `photoUri`/`photos` fields pointing at files
  that don't exist.
- `SyncService.flush()` POSTs `JSON.stringify(item.inspection)` directly —
  same problem: the server receives a local file path string, never the
  image.

`PhotoService.ts`'s own header comment claims photos "survive restarts and
backups" — the backup half of that claim is false as currently implemented.

## Desired behavior
Two independent fixes are needed (pick one as primary based on infra
constraints — recommend both if a server exists):

### A. Backup: embed photo bytes in the export
- `exportBackup()` reads each referenced photo file via `expo-file-system`
  and embeds it base64-encoded in the JSON payload (acceptable for
  reasonable per-inspection photo counts; if payload size becomes a
  concern, switch to a zip/archive export instead of flat JSON — flag this
  tradeoff to the maintainer rather than deciding unilaterally).
- `importBackup()` decodes and writes each photo back into
  `<documentDirectory>photos/` via `PhotoService`-equivalent logic, THEN
  rewrites the `photoUri`/`photos` fields to point at the new local paths
  (same pattern already used for the URI remap, just adding the byte
  round-trip).

### B. Sync: upload photo files alongside the inspection JSON
- `SyncService.flush()` changes from a JSON-only POST to a multipart
  request (or a second upload step per photo) that transmits the actual
  image files referenced by the inspection being synced.
- Server-side contract change required — flag this explicitly, this is not
  a client-only fix.

## Reason
Photographic evidence is the primary proof behind a non-compliance finding
in this system (see `InspectionItem.photoUri`/`photos`, and the CAP
evidence-linkage gap in SPEC 03). If it never leaves the device, evidence is
unrecoverable after device loss and invisible to any remote supervisor —
which defeats the purpose of the supervisor approval workflow entirely.

## Affected files
- `src/services/BackupService.ts` (`buildPhotoUriMap` / `applyPhotoUriMap`)
- `src/services/PhotoService.ts` (expose a byte-read helper if not already
  trivial via `expo-file-system`)
- `src/services/SyncService.ts` (`flush()` — payload construction)
- Server-side sync endpoint (out of this repo's scope — flag as a
  cross-repo dependency)

## Tests required
- Backup round-trip test with a fixture photo: export → wipe
  `documentDirectory` (simulating reinstall) → import → assert the photo
  file exists at the new path AND its bytes match the original fixture.
- Sync test (mock server): assert the multipart/upload request actually
  contains photo bytes, not just the JSON inspection object.
