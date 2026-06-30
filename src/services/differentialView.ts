// src/services/differentialView.ts
//
// Phase-3: Differential follow-up view.
//
// Compares the current inspection's item list against the prior inspection
// to produce a merged diff that the UI and PDF can render.
//
// The diff drives:
//   - The DifferentialBanner at the top of the follow-up checklist (3.2)
//   - The green "تم التصحيح" / red "لا يزال غير مطابق" per-item indicators (3.3, 3.4)
//   - The PDF verification section (3.5)
//   - The escalation suggestion when any violation is unresolved (3.6)

import { ComplianceStatus, InspectionItem, SavedInspection } from '../types';
import { InspectionRepository } from '../repositories/InspectionRepository';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Diff status for a single criterion in a follow-up inspection.
 *
 * - 'resolved'      Prior was non-compliant, current is compliant. ✓
 * - 'still-failing' Prior was non-compliant, current is still non-compliant. ⚠
 * - 'new-violation' Not non-compliant in prior, now non-compliant. 🆕
 * - 'unchanged'     Was compliant (or N/A) and remains so. (Not shown in banner.)
 * - 'not-in-prior'  Criterion did not exist in prior inspection.
 */
export type DiffStatus =
  | 'resolved'
  | 'still-failing'
  | 'new-violation'
  | 'unchanged'
  | 'not-in-prior';

/** One entry in the differential view. */
export interface DiffEntry {
  item: InspectionItem;         // current item
  priorStatus: ComplianceStatus | undefined;
  diffStatus: DiffStatus;
}

/** Grouped output of buildDifferentialView. */
export interface DifferentialView {
  /** All diff entries, same order as current inspection.items. */
  all: DiffEntry[];
  /** Previously non-compliant items that are now compliant. */
  resolved: DiffEntry[];
  /** Previously non-compliant items still non-compliant. */
  stillFailing: DiffEntry[];
  /** Newly non-compliant items (not violations in prior). */
  newViolations: DiffEntry[];
  /** True when at least one prior violation is still unresolved. */
  hasUnresolvedPriorViolations: boolean;
  /** The prior inspection used for comparison (may be null). */
  priorInspection: SavedInspection | null;
}

// ─── Core builder ─────────────────────────────────────────────────────────────

/**
 * Builds a DifferentialView by comparing `currentInspection` against the
 * appropriate prior completed inspection.
 *
 * Resolution order for the prior inspection:
 *   1. If `currentInspection.priorInspectionId` is set, use that specific record.
 *   2. Otherwise use the most-recent completed inspection for the same facility,
 *      excluding `currentInspection.id`.
 *   3. If no prior exists, all items get diffStatus 'not-in-prior'.
 *
 * @param currentInspection  The inspection currently being viewed or filled.
 * @returns                  DifferentialView ready for rendering.
 */
export async function buildDifferentialView(
  currentInspection: SavedInspection,
): Promise<DifferentialView> {
  // ── Resolve prior inspection ──────────────────────────────────────────────
  let prior: SavedInspection | null = null;

  if (currentInspection.priorInspectionId) {
    const specific = await InspectionRepository.getById(
      currentInspection.priorInspectionId,
    );
    if (specific?.status === 'completed') prior = specific;
  }

  if (!prior) {
    const all = await InspectionRepository.getAll();
    const candidates = all
      .filter(
        i =>
          i.facilityId === currentInspection.facilityId &&
          i.status === 'completed' &&
          i.id !== currentInspection.id,
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    prior = candidates[0] ?? null;
  }

  // ── Build diff entries ────────────────────────────────────────────────────
  const priorMap = new Map<string, ComplianceStatus>();
  if (prior) {
    for (const pi of prior.items) {
      priorMap.set(pi.id, pi.complianceStatus);
    }
  }

  const all: DiffEntry[] = currentInspection.items.map(item => {
    const priorStatus = priorMap.get(item.id);
    let diffStatus: DiffStatus;

    if (!prior || priorStatus === undefined) {
      diffStatus = 'not-in-prior';
    } else if (priorStatus === 'non-compliant' && item.complianceStatus === 'compliant') {
      diffStatus = 'resolved';
    } else if (priorStatus === 'non-compliant' && item.complianceStatus === 'non-compliant') {
      diffStatus = 'still-failing';
    } else if (priorStatus !== 'non-compliant' && item.complianceStatus === 'non-compliant') {
      diffStatus = 'new-violation';
    } else {
      diffStatus = 'unchanged';
    }

    return { item, priorStatus, diffStatus };
  });

  const resolved      = all.filter(e => e.diffStatus === 'resolved');
  const stillFailing  = all.filter(e => e.diffStatus === 'still-failing');
  const newViolations = all.filter(e => e.diffStatus === 'new-violation');

  return {
    all,
    resolved,
    stillFailing,
    newViolations,
    hasUnresolvedPriorViolations: stillFailing.length > 0,
    priorInspection: prior,
  };
}

// ─── Sync helper for PDF (no await needed in HTML builder) ───────────────────

/**
 * Builds a DifferentialView synchronously from an already-loaded prior
 * inspection object. Used inside pdfService.ts where async is unavailable.
 *
 * Pass null for `prior` to get a no-op diff (all entries 'not-in-prior').
 */
export function buildDifferentialViewSync(
  current: SavedInspection,
  prior: SavedInspection | null,
): DifferentialView {
  const priorMap = new Map<string, ComplianceStatus>();
  if (prior) {
    for (const pi of prior.items) {
      priorMap.set(pi.id, pi.complianceStatus);
    }
  }

  const all: DiffEntry[] = current.items.map(item => {
    const priorStatus = priorMap.get(item.id);
    let diffStatus: DiffStatus;

    if (!prior || priorStatus === undefined) {
      diffStatus = 'not-in-prior';
    } else if (priorStatus === 'non-compliant' && item.complianceStatus === 'compliant') {
      diffStatus = 'resolved';
    } else if (priorStatus === 'non-compliant' && item.complianceStatus === 'non-compliant') {
      diffStatus = 'still-failing';
    } else if (priorStatus !== 'non-compliant' && item.complianceStatus === 'non-compliant') {
      diffStatus = 'new-violation';
    } else {
      diffStatus = 'unchanged';
    }

    return { item, priorStatus, diffStatus };
  });

  const resolved      = all.filter(e => e.diffStatus === 'resolved');
  const stillFailing  = all.filter(e => e.diffStatus === 'still-failing');
  const newViolations = all.filter(e => e.diffStatus === 'new-violation');

  return {
    all,
    resolved,
    stillFailing,
    newViolations,
    hasUnresolvedPriorViolations: stillFailing.length > 0,
    priorInspection: prior,
  };
}
