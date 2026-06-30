// src/types.ts
export type Severity = 'low' | 'medium' | 'high';
export type ControlType = 'visual' | 'doc' | 'test';

/**
 * Compliance status for a single checklist item.
 *
 * - 'compliant'        — criterion met
 * - 'non-compliant'    — criterion violated, counts toward score penalty
 * - 'na'               — criterion not applicable to this facility
 * - 'not-evaluated'    — inspector has not yet answered this item
 * - 'observation-only' — noted for awareness, NOT a violation, no score penalty
 * - 'unable-to-verify' — inspector could not establish the fact either way
 *                        (e.g. document not available on site). NOT a violation.
 *                        Auto-generates a follow-up task for next visit.
 */
export type ComplianceStatus =
  | 'compliant'
  | 'non-compliant'
  | 'na'
  | 'not-evaluated'
  | 'observation-only'
  | 'unable-to-verify';

export type Category = 'تنظيمية' | 'بيئية' | 'صحيه' | 'سلامة' | 'نظافة' | 'عامة';
export type ApprovalStatus = 'pending' | 'approved' | 'returned' | 'escalated';

/**
 * Inspection type — determines workflow and differential view behaviour.
 *
 * - 'routine'   — standard scheduled inspection
 * - 'follow-up' — verifies resolution of findings from a prior inspection;
 *                 requires priorInspectionId to be set on SavedInspection
 * - 'complaint' — triggered by a received complaint
 */
export type InspectionType = 'routine' | 'follow-up' | 'complaint';

/**
 * Administrative sanction tier for a criterion violation.
 * Drives the escalation advisor (Phase 6).
 *
 * - 'warning'        — administrative warning (Décret 06-198 Art. 20)
 * - 'wali-referral'  — refer to the Wali
 * - 'court-referral' — refer to court / prosecutor
 */
export type SanctionTier = 'warning' | 'wali-referral' | 'court-referral';

/**
 * Root-cause classification for a non-conformity.
 * Helps distinguish one-off lapses from structural problems.
 */
export type RootCause = 'lapse' | 'training' | 'structural' | 'unknown';

/** Notification types surfaced in the Notification Centre. */
export type NotificationType =
  | 'CAP_DEADLINE'
  | 'AGENDA_REMINDER'
  | 'APPROVAL_ACTION'
  | 'FOLLOW_UP'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;        // ISO datetime
  readAt?: string;          // ISO datetime — undefined = unread
  dismissed?: boolean;
  /** Deep-link target: screen name + params */
  link?: { screen: string; params?: Record<string, string> };
}

export interface InspectionItem {
  id: string;
  criteria: string;
  legalReference: string;
  severity: Severity;
  axis?: string;
  category?: Category;
  controlType?: ControlType;
  complianceStatus: ComplianceStatus;
  comment?: string;
  photoUri?: string;
  photos?: string[];

  // ── Phase 1.2: Numeric evidence fields ───────────────────────────────────
  /**
   * Measured value for quantitative criteria (temperature, chlorine, noise…).
   * Stored as a number for trend analysis — do NOT use free-text comments
   * for measurable quantities.
   */
  numericValue?: number;
  /** Unit of the numeric value, e.g. '°C', 'mg/L', 'dB'. */
  numericUnit?: string;

  // ── Phase 1.3: Repeat-violation fields ───────────────────────────────────
  /**
   * True when this exact criterion was also non-compliant in the immediately
   * preceding inspection for the same facility.
   * Populated automatically when inspectionType === 'follow-up'.
   */
  isRepeatViolation?: boolean;
  /** The compliance status this criterion had in the prior inspection. */
  priorInspectionStatus?: ComplianceStatus;

  // ── Phase 1.4: Root-cause classification ─────────────────────────────────
  /**
   * Root cause of a non-conformity. Helps the inspector and supervisor
   * prescribe the right corrective action type.
   */
  rootCause?: RootCause;

  // ── Phase 1.5: Sanction tier ─────────────────────────────────────────────
  /**
   * The administrative escalation tier associated with a violation of this
   * criterion. Shown to inspectors so they know the legal consequence before
   * marking non-compliant.
   */
  sanctionTier?: SanctionTier;
}

/** Counts of non-compliant items by severity level. */
export interface ViolationSummary {
  high:   number;
  medium: number;
  low:    number;
  total:  number;
}

export interface SavedInspection {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  date: string;
  /** The name of the inspector / writer who conducted the inspection. */
  inspectorName: string;
  items: InspectionItem[];
  /**
   * - 'completed'   — fully submitted inspection
   * - 'in-progress' — active checklist session
   * - 'draft'       — saved mid-session via back-navigation
   */
  status: 'completed' | 'in-progress' | 'draft';

  // ── Phase 1.6: Inspection type ───────────────────────────────────────────
  /**
   * Type of this inspection run.
   * Defaults to 'routine' when not set (backwards-compatible).
   */
  inspectionType?: InspectionType;

  // ── Phase 1.7: Follow-up linkage ─────────────────────────────────────────
  /**
   * ID of the prior inspection this follow-up is verifying.
   * Required when inspectionType === 'follow-up'.
   * Used by the differential view (Phase 3) and repeat-violation
   * detection (Phase 2).
   */
  priorInspectionId?: string;

  // ── Phase 1.8: Meeting gate flags ────────────────────────────────────────
  /**
   * True once the inspector completes the formal opening-meeting step
   * (permit check + representative ID + scope confirmation).
   * Checklist cannot be started until this is true.
   */
  openingMeetingDone?: boolean;
  /**
   * True once the inspector confirms findings were verbally communicated
   * to the facility representative before signatures.
   * Report PDF cannot be generated until this is true.
   */
  closingMeetingDone?: boolean;

  // ── Phase 1.9: Report sequence number ────────────────────────────────────
  /**
   * Sequential reference number tying this report to the commune's
   * official inspection register. Format: COMMUNE-YEAR-NNNN.
   * Generated at report finalisation (Phase 8).
   */
  reportSequenceNumber?: string;

  // ── Scoring ──────────────────────────────────────────────────────────────
  /** Severity-weighted compliance score, 0–100. */
  score?: number;
  /** Prioritisation grade: A / B / C / D. */
  grade?: string;
  /** Risk level 1 (low) – 4 (critical). Drives inspection frequency. */
  riskLevel?: 1 | 2 | 3 | 4;
  /** Violation counts by severity. */
  violations?: ViolationSummary;
  /** True when a critical override rule changed the score-derived grade. */
  criticalOverride?: boolean;
  /** True when fewer than 60 % of items were evaluated (grade not meaningful). */
  incomplete?: boolean;
  /** Recommended days to next inspection based on grade. */
  nextInspectionDays?: number;

  // ── Decision support (Phase 6) ───────────────────────────────────────────
  /**
   * If the inspector overrode the system's suggested escalation action,
   * this field stores their stated reason. Required on override.
   */
  escalationOverrideReason?: string;

  // ── Metadata ─────────────────────────────────────────────────────────────
  signature?: string;
  officeName?: string;
  inspectionCause?: string;
  referenceDocument?: string;
  committeeMembers?: string[];
  coordinates?: { latitude: number; longitude: number };
  integrityHash?: string;
  geofenceOverrideNote?: string;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  returnedReason?: string;
  approvalNote?: string;
}

export interface Facility {
  id: string;
  projectName: string;
  ownerName: string;
  activity: string;
  address: string;
  lat?: number;
  lng?: number;
  licenseType?: string;
  licenseDetails?: string;
  year?: string;
  category?: string;
  notes?: string;
}

export interface AgendaItem {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityAddress?: string;
  activity?: string;
  date: string;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  inspectionId?: string;
}

export interface CorrectiveAction {
  id: string;
  inspectionId: string;
  inspectionItemId: string;
  facilityId: string;
  facilityName: string;
  criteria: string;
  severity: Severity;
  deadline: string;
  assignedTo: string;
  status: 'open' | 'in-progress' | 'resolved' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}
