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
  // ── Facility activity strings (exact match from facilitiesData.ts) ──────
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
  // ── Bug-fix aliases: exact strings from facilitiesData.ts that previously
  //    had no matching key and silently fell back to baseGeneralCriteria ────
  'ميكانيك السيارات': mechanicChecklist,                                    // was 'ميكانيك سيارات' (missing ال)
  'ورشة حدادة (صناعة السياج)': blacksmithChecklist,                        // variant with parenthetical
  'ورشة نجارة الألمنيوم': carpenteryChecklist,                              // was 'ورشة ألمنيوم'
  'مطبعة خاصة بإنتاج لوازم مدرسية ومستلزمات المكاتب': printingChecklist,  // full description variant
  // ── Under-construction facilities (const-* from facilitiesData.ts) ──────
  'ذبح الدواجن (أكثر من 500 كغ/ي وأقل من 2 طن/ي)': abattoirChecklist,    // Cat. 3 license, mid-scale poultry slaughter
};
