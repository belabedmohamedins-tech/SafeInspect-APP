// src/types.ts
export type Severity = 'low' | 'medium' | 'high';
export type ControlType = 'visual' | 'doc' | 'test';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'na' | 'not-evaluated';
export type Category = 'تنظيمية' | 'بيئية' | 'صحيه' | 'سلامة' | 'نظافة' | 'عامة';

/** Lifecycle of a supervisor approval decision on a completed inspection. */
export type ApprovalStatus = 'pending' | 'approved' | 'returned' | 'escalated';

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
  /** Primary photo URI (legacy — kept for backwards compat with existing drafts). */
  photoUri?: string;
  /** All evidence photos for this item. Use this for new code. */
  photos?: string[];
}

export interface SavedInspection {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  date: string;
  inspectorName: string;
  items: InspectionItem[];
  status: 'completed' | 'in-progress' | 'draft';
  score?: number;
  grade?: string;
  signature?: string;

  officeName?: string;
  inspectionCause?: string;
  referenceDocument?: string;
  committeeMembers?: string[];
  coordinates?: { latitude: number; longitude: number };

  /** djb2 hex digest — set by InspectionRepository.save() on completion. */
  integrityHash?: string;

  /** Geofencing override justification text (null = was within range). */
  geofenceOverrideNote?: string;

  // ── Supervisor Approval (FR-069→075) ─────────────────────────────────────
  /**
   * Approval lifecycle state. Defaults to 'pending' when inspection is
   * first completed. Set to 'approved' | 'returned' | 'escalated' by a
   * supervisor via ApprovalRepository.
   */
  approvalStatus?: ApprovalStatus;
  /** Display name of the supervisor who last acted on this inspection. */
  approvedBy?: string;
  /** ISO datetime of the approval / return / escalation action. */
  approvedAt?: string;
  /** Reason text when returned for revision. */
  returnedReason?: string;
  /** Optional supervisor note attached to any approval decision. */
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
