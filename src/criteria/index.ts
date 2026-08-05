// src/criteria/index.ts
// Barrel export — aggregates every criteria module into allCriteria.
// Import from 'src/criteria' resolves here.

import { abattoirSpecificCriteria } from './abattoirCriteria';
import { bakeryCriteria } from './bakeryCriteria';
import { baseCompressedGasCriteria } from './baseCompressedGasCriteria';
import { baseFoodCriteria } from './baseFoodCriteria';
import { baseGeneralCriteria } from './baseGeneralCriteria';
import { blacksmithCriteria } from './blacksmithCriteria';
import { carWashCriteria } from './carWashCriteria';
import { carpenteryCriteria } from './carpenteryCriteria';
import { coldRoomCriteria } from './coldRoomCriteria';
import { couvoirCriteria } from './couvoirCriteria';
import { gplCriteria } from './gplCriteria';
import { marbleCriteria } from './marbleCriteria';
import { mechanicCriteria } from './mechanicCriteria';
import { paintShopCriteria } from './paintShopCriteria';
import { printingCriteria } from './printingCriteria';
import { produceStorageCriteria } from './produceStorageCriteria';
import { semiPharmaCriteria } from './semiPharmaCriteria';
import { slaughterhouseSmallCriteria } from './slaughterhouseSmallCriteria';
import { uabCriteria } from './uabCriteria';
import { updCriteria } from './updCriteria';

export const allCriteria = [
  ...abattoirSpecificCriteria,
  ...bakeryCriteria,
  ...baseCompressedGasCriteria,
  ...baseFoodCriteria,
  ...baseGeneralCriteria,
  ...blacksmithCriteria,
  ...carWashCriteria,
  ...carpenteryCriteria,
  ...coldRoomCriteria,
  ...couvoirCriteria,
  ...gplCriteria,
  ...marbleCriteria,
  ...mechanicCriteria,
  ...paintShopCriteria,
  ...printingCriteria,
  ...produceStorageCriteria,
  ...semiPharmaCriteria,
  ...slaughterhouseSmallCriteria,
  ...uabCriteria,
  ...updCriteria,
];

// Named re-exports for per-module imports
export { abattoirSpecificCriteria } from './abattoirCriteria';
export { bakeryCriteria } from './bakeryCriteria';
export { baseCompressedGasCriteria } from './baseCompressedGasCriteria';
export { baseFoodCriteria } from './baseFoodCriteria';
export { baseGeneralCriteria } from './baseGeneralCriteria';
export { blacksmithCriteria } from './blacksmithCriteria';
export { carWashCriteria } from './carWashCriteria';
export { carpenteryCriteria } from './carpenteryCriteria';
export { coldRoomCriteria } from './coldRoomCriteria';
export { couvoirCriteria } from './couvoirCriteria';
export { gplCriteria } from './gplCriteria';
export { marbleCriteria } from './marbleCriteria';
export { mechanicCriteria } from './mechanicCriteria';
export { paintShopCriteria } from './paintShopCriteria';
export { printingCriteria } from './printingCriteria';
export { produceStorageCriteria } from './produceStorageCriteria';
export { semiPharmaCriteria } from './semiPharmaCriteria';
export { slaughterhouseSmallCriteria } from './slaughterhouseSmallCriteria';
export { uabCriteria } from './uabCriteria';
export { updCriteria } from './updCriteria';
