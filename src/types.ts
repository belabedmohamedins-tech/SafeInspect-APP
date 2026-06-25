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
  // existing fields
  id: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  date: string;
  inspectorName: string; // now will be the "writer" name
  items: InspectionItem[];
  status: 'completed' | 'in-progress' | 'draft';
  score?: number;
  grade?: string;
  signature?: string;

  // new fields
  officeName?: string;          // name of the health office
  inspectionCause?: string;     // routine, complaint, follow-up, etc.
  referenceDocument?: string;   // optional reference number
  committeeMembers?: string[];  // list of names present
  coordinates?: { latitude: number; longitude: number };
}

export interface Facility {
  id: string;
  projectName: string;
  ownerName: string;
  activity: string;
  address: string;
  licenseType: string;
  licenseDetails: string;
  year: string;
  category: string;
  notes: string;
}

export interface AgendaItem {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityAddress?: string;
  activity?: string;
  date: string;
  notes: string;
  completed: boolean;
  inspectionId?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}