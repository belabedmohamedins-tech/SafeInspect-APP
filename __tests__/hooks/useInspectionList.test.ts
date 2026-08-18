// __tests__/hooks/useInspectionList.test.ts
//
// W89: file previously contained only `export {}` which caused Jest to abort
// with "Your test suite must contain at least one test."
// Added a minimal smoke test so the suite registers as valid.
// Full hook behaviour is covered by src/__tests__/useInspectionList.test.ts.

import { useInspectionList } from '../../src/hooks/useInspectionList';

describe('useInspectionList (smoke)', () => {
  it('exports the useInspectionList hook', () => {
    expect(typeof useInspectionList).toBe('function');
  });
});
