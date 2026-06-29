// src/types.ts
export type Severity = 'low' | 'medium' | 'high';
export type ControlType = 'visual' | 'doc' | 'test';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'na' | 'not-evaluated';
export type Category = 'تنظيمية' | 'بيئية' | 'صحيه' | 'سلامة' | 'نظافة' | 'عامة';
export type ApprovalStatus = 'pending' | 'approved' | 'returned' | 'escalated';

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
