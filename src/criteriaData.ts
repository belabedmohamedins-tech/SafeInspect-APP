// src/criteriaData.ts
import { abattoirSpecificCriteria } from './criteria/abattoirCriteria';
import { bakerySpecificCriteria } from './criteria/bakeryCriteria';
import { baseFoodCriteria } from './criteria/baseFoodCriteria';
import { baseGeneralCriteria } from './criteria/baseGeneralCriteria';
import { blacksmithCriteria } from './criteria/blacksmithCriteria';
import { carpenteryCriteria } from './criteria/carpenteryCriteria';
import { carWashCriteria } from './criteria/carWashCriteria';
import { coldRoomSpecificCriteria } from './criteria/coldRoomCriteria';
import { couvoirSpecificCriteria } from './criteria/couvoirCriteria';
import { gplCriteria } from './criteria/gplCriteria';
import { marbleCriteria } from './criteria/marbleCriteria';
import { mechanicWorkshopCriteria } from './criteria/mechanicCriteria';
import { paintShopCriteria } from './criteria/paintShopCriteria';
import { printingCriteria } from './criteria/printingCriteria';
import { produceStorageCriteria } from './criteria/produceStorageCriteria';
import { semiPharmaCriteria } from './criteria/semiPharmaCriteria';
import { slaughterhouseSmallCriteria } from './criteria/slaughterhouseSmallCriteria';
import { uabSpecificCriteria } from './criteria/uabCriteria';
import { updSpecificCriteria } from './criteria/updCriteria';
import { InspectionItem } from './types';

const uabChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...baseFoodCriteria,
  ...uabSpecificCriteria,
];

const abattoirChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...baseFoodCriteria,
  ...abattoirSpecificCriteria,
];

const couvoirChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...baseFoodCriteria,
  ...couvoirSpecificCriteria,
];

// UPD = primary poultry production (not food processing).
// baseFoodCriteria (HACCP, food hygiene) does NOT apply here — removed per S5 audit.
const updChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...updSpecificCriteria,
];

const slaughterhouseSmallChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...baseFoodCriteria,
  ...slaughterhouseSmallCriteria,
];

const bakeryChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...baseFoodCriteria,
  ...bakerySpecificCriteria,
];

const coldRoomChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...baseFoodCriteria,
  ...coldRoomSpecificCriteria,
];

const mechanicChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...mechanicWorkshopCriteria,
];

const blacksmithChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...blacksmithCriteria,
];

const carpenteryChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...carpenteryCriteria,
];

const carWashChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...carWashCriteria,
];

const gplChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...gplCriteria,
];

const marbleChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...marbleCriteria,
];

const paintShopChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...paintShopCriteria,
];

const printingChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...printingCriteria,
];

const produceStorageChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...baseFoodCriteria,
  ...produceStorageCriteria,
];

const semiPharmaChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...semiPharmaCriteria,
];

export const criteriaByActivity: Record<string, InspectionItem[]> = {
  default: baseGeneralCriteria,
  'الديوان الوطني لأغذية الأنعام': uabChecklist,
  'وحدة مذابح الغرب': abattoirChecklist,
  'وحدة تفريخ الدواجن': couvoirChecklist,
  'وحدة تربية الدواجن': updChecklist,
  'مذبحة دواجن <500 كغ/يوم': slaughterhouseSmallChecklist,
  'مخبزة صناعية': bakeryChecklist,
  'غرفة تبريد': coldRoomChecklist,
  'ميكانيك سيارات': mechanicChecklist,
  'مذبحة دواجن ≤500 كغ/ي': slaughterhouseSmallChecklist,
  'منشأة صناعة تغذية حيوانية': uabChecklist,
  'إنتاج أغذية الأنعام (مؤسسة عمومية اقتصادية)': uabChecklist,
  'مفرخة الدواجن (مؤسسة عمومية اقتصادية)': couvoirChecklist,
  'تربية الدواجن (مؤسسة عمومية اقتصادية)': updChecklist,
  'ذبح وبيع الدواجن (مؤسسة عمومية اقتصادية)': slaughterhouseSmallChecklist,
  'ميكانيك': mechanicChecklist,
  'تربية الدواجن (07 حظائر)': updChecklist,
  'تربية الدواجن (03 حظائر)': updChecklist,
  'تربية الدواجن (حظيرتين)': updChecklist,
  'تربية الدواجن (حظيرة)': updChecklist,
  // ── New activity types ──────────────────────────────────────────────────
  'ورشة حدادة': blacksmithChecklist,
  'صناعة سياج': blacksmithChecklist,
  'ورشة نجارة': carpenteryChecklist,
  'ورشة ألمنيوم': carpenteryChecklist,
  'غسل وتشحيم السيارات': carWashChecklist,
  'تركيب GPL': gplChecklist,
  'تركيب GPL/C': gplChecklist,
  'صناعة الرخام': marbleChecklist,
  'ورشة طلاء السيارات': paintShopChecklist,
  'مطبعة': printingChecklist,
  'لوازم مدرسية ومكاتب': printingChecklist,
  'وحدة تخزين الزيتون والخضر': produceStorageChecklist,
  'تعبئة مواد شبه صيدلانية': semiPharmaChecklist,
};

// ─── Safe checklist lookup with unknown-activity guard ───────────────────────
//
// Always use this function instead of criteriaByActivity[activity] directly.
// If the activity key has no mapping, it logs a warning and returns the generic
// baseGeneralCriteria so the inspector is never silently evaluated against
// wrong criteria.

export function getChecklistForActivity(activity: string | undefined | null): InspectionItem[] {
  if (!activity) {
    if (__DEV__) {
      console.warn(
        '[criteriaData] getChecklistForActivity called with empty activity. Falling back to baseGeneralCriteria.',
      );
    }
    return baseGeneralCriteria;
  }

  const checklist = criteriaByActivity[activity];

  if (!checklist) {
    console.warn(
      `[criteriaData] Unknown activity key: "${activity}". No specific checklist found. ` +
        'Falling back to baseGeneralCriteria. Add this activity to criteriaByActivity to silence this warning.',
    );
    return baseGeneralCriteria;
  }

  return checklist;
}
