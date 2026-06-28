// src/hooks/useHomeData.ts
import { useFocusEffect as _useFocusEffect } from 'expo-router';
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
    openCapCount:           0,
  },
};

/**
 * useFocusEffect is injected as a parameter so tests can substitute a plain
 * useEffect-based stub without requiring a React Navigation context tree.
 * In production the default (_useFocusEffect from expo-router) is always used.
 */
export function useHomeData(
  focusEffect: (cb: () => void | (() => void)) => void = _useFocusEffect,
) {
  const [data, setData] = useState<HomeData>(EMPTY);

  focusEffect(
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
