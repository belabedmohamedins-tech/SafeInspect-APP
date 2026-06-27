// src/hooks/useHomeData.ts
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AgendaItem, Facility } from '../types';
import { loadHomeData, getFacilityForAgenda as _getFacility, HomeData } from '../utils/loadHomeData';

const EMPTY: HomeData = {
  officeName:            '',
  agendaItems:           [],
  completedInspections:  [],
  inProgressInspections: [],
  recentFacilities:      [],
  userFacilities:        [],
  stats: {
    totalCompleted:         0,
    totalDrafts:            0,
    nonCompliantFacilities: 0,
    openCapCount:           0,   // fixed: was missing, causing TS mismatch
  },
};

export function useHomeData() {
  const [data, setData] = useState<HomeData>(EMPTY);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      loadHomeData()
        .then(result => { if (isActive) setData(result); })
        .catch(e => {
          console.error('useHomeData load error:', e);
          if (isActive) setData(EMPTY);
        });
      return () => { isActive = false; };
    }, [])
  );

  const getFacilityForAgenda = useCallback(
    (item: AgendaItem): Facility | undefined =>
      _getFacility(item, data.userFacilities),
    [data.userFacilities]
  );

  return { ...data, getFacilityForAgenda };
}
