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
  photoUri?: string;
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
   * - 'completed'  — fully submitted inspection
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
   *
   * Previously this was modelled as both `completed: boolean` AND
   * `status?: string` — those two fields have been collapsed here.
   */
  status: 'pending' | 'completed' | 'cancelled';
  inspectionId?: string;
}
