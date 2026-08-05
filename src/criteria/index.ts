// src/criteria/index.ts
// Barrel export — re-exports every criteria module.
// Import from 'src/criteria' or 'src/criteria/index' resolves here.

export * from './abattoirCriteria';
export * from './bakeryCriteria';
export * from './baseCompressedGasCriteria';
export * from './baseFoodCriteria';
export * from './baseGeneralCriteria';
export * from './blacksmithCriteria';
export * from './carWashCriteria';
export * from './carpenteryCriteria';
export * from './coldRoomCriteria';
export * from './couvoirCriteria';
export * from './gplCriteria';
export * from './marbleCriteria';
export * from './mechanicCriteria';
export * from './paintShopCriteria';
export * from './printingCriteria';
export * from './produceStorageCriteria';
export * from './semiPharmaCriteria';
export * from './slaughterhouseSmallCriteria';
export * from './uabCriteria';
export * from './updCriteria';

// Convenience aggregate — all criteria from every module in one flat array.
import { abattoirSpecificCriteria }      from './abattoirCriteria';
import { bakerySpecificCriteria }        from './bakeryCriteria';
import { baseCompressedGasCriteria }     from './baseCompressedGasCriteria';
import { baseFoodCriteria }              from './baseFoodCriteria';
import { baseGeneralCriteria }           from './baseGeneralCriteria';
import { blacksmithCriteria }            from './blacksmithCriteria';
import { carWashCriteria }               from './carWashCriteria';
import { carpenteryCriteria }            from './carpenteryCriteria';
import { coldRoomSpecificCriteria }      from './coldRoomCriteria';
import { couvoirSpecificCriteria }       from './couvoirCriteria';
import { gplCriteria }                   from './gplCriteria';
import { marbleCriteria }                from './marbleCriteria';
import { mechanicWorkshopCriteria }      from './mechanicCriteria';
import { paintShopCriteria }             from './paintShopCriteria';
import { printingCriteria }              from './printingCriteria';
import { produceStorageCriteria }        from './produceStorageCriteria';
import { semiPharmaCriteria }            from './semiPharmaCriteria';
import { slaughterhouseSmallCriteria }   from './slaughterhouseSmallCriteria';
import { uabSpecificCriteria }           from './uabCriteria';
import { updSpecificCriteria }           from './updCriteria';
import { InspectionItem }                from '../types';

export const allCriteria: InspectionItem[] = [
  ...abattoirSpecificCriteria,
  ...bakerySpecificCriteria,
  ...baseCompressedGasCriteria,
  ...baseFoodCriteria,
  ...baseGeneralCriteria,
  ...blacksmithCriteria,
  ...carWashCriteria,
  ...carpenteryCriteria,
  ...coldRoomSpecificCriteria,
  ...couvoirSpecificCriteria,
  ...gplCriteria,
  ...marbleCriteria,
  ...mechanicWorkshopCriteria,
  ...paintShopCriteria,
  ...printingCriteria,
  ...produceStorageCriteria,
  ...semiPharmaCriteria,
  ...slaughterhouseSmallCriteria,
  ...uabSpecificCriteria,
  ...updSpecificCriteria,
];
