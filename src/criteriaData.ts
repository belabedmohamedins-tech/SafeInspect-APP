// src/criteriaData.ts
import { abattoirSpecificCriteria } from './criteria/abattoirCriteria';
import { bakerySpecificCriteria } from './criteria/bakeryCriteria';
import { baseFoodCriteria } from './criteria/baseFoodCriteria';
import { baseGeneralCriteria } from './criteria/baseGeneralCriteria';
import { coldRoomSpecificCriteria } from './criteria/coldRoomCriteria';
import { couvoirSpecificCriteria } from './criteria/couvoirCriteria';
import { mechanicWorkshopCriteria } from './criteria/mechanicCriteria';
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

const updChecklist: InspectionItem[] = [
  ...baseGeneralCriteria,
  ...baseFoodCriteria,
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
};