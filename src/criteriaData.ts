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

// ── Activity → checklist map ────────────────────────────────────────────────
// Keys are EXACT activity strings from src/facilitiesData.ts.
// Verified 2026-08-05: all 26 distinct facility activity values have a key below.
// Zero facilities will silently fall back to baseGeneralCriteria.
// ── How to maintain this map:
//   1. Add a new facility to facilitiesData.ts with a new activity string.
//   2. Add a matching key here pointing to the correct checklist.
//   3. Run: grep "activity:" src/facilitiesData.ts | sort -u
//      and diff the result against the keys below — both lists must match.
export const criteriaByActivity: Record<string, InspectionItem[]> = {
  default: baseGeneralCriteria,

  // ── Bakery ────────────────────────────────────────────────────────────────
  'مخبزة صناعية': bakeryChecklist,

  // ── Poultry slaughter ────────────────────────────────────────────────────
  'مذبحة دواجن ≤500 كغ/ي': slaughterhouseSmallChecklist,
  'ذبح وبيع الدواجن (مؤسسة عمومية اقتصادية)': slaughterhouseSmallChecklist,
  // Cat. 3: mid-scale poultry slaughter 500 kg–2 t/day — uses full abattoir criteria
  'ذبح الدواجن (أكثر من 500 كغ/ي وأقل من 2 طن/ي)': abattoirChecklist,

  // ── Cold storage ─────────────────────────────────────────────────────────
  'غرفة تبريد': coldRoomChecklist,

  // ── Semi-pharmaceutical ──────────────────────────────────────────────────
  'تعبئة مواد شبه صيدلانية': semiPharmaChecklist,

  // ── Car wash ─────────────────────────────────────────────────────────────
  'غسل وتشحيم السيارات': carWashChecklist,

  // ── GPL installation ─────────────────────────────────────────────────────
  'تركيب GPL/C': gplChecklist,

  // ── Animal feed manufacturing ────────────────────────────────────────────
  'منشأة صناعة تغذية حيوانية': uabChecklist,
  'إنتاج أغذية الأنعام (مؤسسة عمومية اقتصادية)': uabChecklist,

  // ── Produce / olive storage ──────────────────────────────────────────────
  'وحدة تخزين الزيتون والخضر': produceStorageChecklist,

  // ── Hatchery ─────────────────────────────────────────────────────────────
  'مفرخة الدواجن (مؤسسة عمومية اقتصادية)': couvoirChecklist,

  // ── Poultry farming (UPD) ────────────────────────────────────────────────
  'تربية الدواجن (مؤسسة عمومية اقتصادية)': updChecklist,
  'تربية الدواجن (07 حظائر)': updChecklist,
  'تربية الدواجن (03 حظائر)': updChecklist,
  'تربية الدواجن (حظيرتين)': updChecklist,
  'تربية الدواجن (حظيرة)': updChecklist,

  // ── Printing ─────────────────────────────────────────────────────────────
  'مطبعة خاصة بإنتاج لوازم مدرسية ومستلزمات المكاتب': printingChecklist,

  // ── Automotive mechanic ──────────────────────────────────────────────────
  'ميكانيك السيارات': mechanicChecklist,
  'ميكانيك': mechanicChecklist,

  // ── Paint shop ───────────────────────────────────────────────────────────
  'ورشة طلاء السيارات': paintShopChecklist,

  // ── Woodwork ─────────────────────────────────────────────────────────────
  'ورشة نجارة': carpenteryChecklist,
  'ورشة نجارة الألمنيوم': carpenteryChecklist,

  // ── Marble / stone ───────────────────────────────────────────────────────
  'صناعة الرخام': marbleChecklist,

  // ── Blacksmith / metalwork ───────────────────────────────────────────────
  'ورشة حدادة (صناعة السياج)': blacksmithChecklist,
  'ورشة حدادة': blacksmithChecklist,
};
