// src/types.ts
export type Severity = 'low' | 'medium' | 'high';
export type ControlType = 'visual' | 'doc' | 'test';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'na' | 'not-evaluated';
export type Category = 'تنظيمية' | 'بيئية' | 'صحيه' | 'سلامة' | 'نظافة' | 'عامة';

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
  /** The name of the inspector / writer who conducted the inspection. */
  inspectorName: string;
  items: InspectionItem[];
  /**
   * - 'completed'   — fully submitted inspection
   * - 'in-progress' — active checklist session
   * - 'draft'       — saved mid-session via back-navigation
   * getDrafts() returns both 'in-progress' and 'draft'.
   */
  status: 'completed' | 'in-progress' | 'draft';
  score?: number;
  grade?: string;
  signature?: string;

  officeName?: string;
  inspectionCause?: string;
  referenceDocument?: string;
  committeeMembers?: string[];
  coordinates?: { latitude: number; longitude: number };

  /**
   * djb2 hex digest of the inspection's canonical JSON at the moment it
   * was marked 'completed'. Set automatically by InspectionRepository.save().
   * Use IntegrityService.verifyInspection() to check for tampering.
   */
  integrityHash?: string;

  /**
   * Written when the inspector overrides the geofencing gate.
   * Contains the justification text entered by the inspector.
   * Null / undefined = inspector was within range (no override needed).
   */
  geofenceOverrideNote?: string;
}

export interface Facility {
  id: string;
  projectName: string;
  ownerName: string;
  activity: string;
  address: string;
  /**
   * Geographic coordinates for map display and geofencing.
   * Optional — populated when the facility has known GPS data.
   */
  lat?: number;
  lng?: number;
  // Fields below are metadata from the source data set.
  // They are rarely populated by app-created facilities — treat as optional.
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
  /**
   * Single source of truth for agenda item lifecycle:
   * - 'pending'   — scheduled, not yet acted on
   * - 'completed' — linked to a finished inspection or manually marked done
   * - 'cancelled' — explicitly cancelled by the user
   */
  status: 'pending' | 'completed' | 'cancelled';
  inspectionId?: string;
}

/**
 * A single corrective action item generated from a non-compliant
 * inspection finding. Part of the Corrective Action Plan (CAP) module.
 */
export interface CorrectiveAction {
  id: string;
  /** The inspection that generated this CAP item. */
  inspectionId: string;
  /** The specific InspectionItem id this CAP item addresses. */
  inspectionItemId: string;
  facilityId: string;
  facilityName: string;
  /** Copied from InspectionItem.criteria at creation time. */
  criteria: string;
  severity: Severity;
  /** ISO date string (YYYY-MM-DD) by which the violation must be remediated. */
  deadline: string;
  /** Name of the person / department responsible for fixing the violation. */
  assignedTo: string;
  status: 'open' | 'in-progress' | 'resolved' | 'overdue';
  notes?: string;
  createdAt: string;  // ISO datetime
  updatedAt: string;  // ISO datetime
  closedAt?: string;  // ISO datetime — set when status becomes 'resolved'
}
