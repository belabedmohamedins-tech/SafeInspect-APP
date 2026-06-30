// app/(tabs)/home.tsx
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AgendaSection from '../../components/home/AgendaSection';
import CapStatsWidget from '../../components/home/CapStatsWidget';
import HomeFAB from '../../components/home/HomeFAB';
import HomeHeader from '../../components/home/HomeHeader';
import InspectionSection from '../../components/home/InspectionSection';
import NearDeadlineWidget from '../../components/home/NearDeadlineWidget';
import StatsBar from '../../components/home/StatsBar';
import { Colors } from '../../constants';
import { useHomeData } from '../../src/hooks/useHomeData';
import { scheduleCapDeadlineNotifications } from '../../src/services/CapNotificationService';
import { AgendaItem, SavedInspection } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const {
    officeName, agendaItems, completedInspections,
    inProgressInspections, recentFacilities, stats, getFacilityForAgenda,
  } = useHomeData();

  useEffect(() => {
    scheduleCapDeadlineNotifications();
  }, []);

  const handleAgendaPress = (item: AgendaItem) => {
    const facility = getFacilityForAgenda(item);
    if (!facility) {
      Alert.alert('تنبيه', 'لم يتم العثور على المنشأة المرتبطة بهذه المهمة');
      return;
    }
    router.push({
      pathname: '/(tabs)/inspection/checklist',
      params: {
        facilityId:      facility.id,
        facilityName:    facility.projectName,
        facilityAddress: facility.address,
        activity:        facility.activity,
        agendaId:        item.id,
      },
    });
  };

  const handleDraftPress = (draft: SavedInspection) => {
    router.push({
      pathname: '/(tabs)/inspection/checklist',
      params: {
        draftId:         draft.id,
        facilityId:      draft.facilityId,
        facilityName:    draft.facilityName,
        facilityAddress: draft.facilityAddress,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <HomeHeader officeName={officeName} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <StatsBar
          totalCompleted={stats.totalCompleted}
          totalDrafts={stats.totalDrafts}
          nonCompliantFacilities={stats.nonCompliantFacilities}
          openCapCount={stats.openCapCount}
        />

        {/* Phase-13: CAP status breakdown */}
        <CapStatsWidget />

        {/* Phase-18: Near-deadline warning banner */}
        <NearDeadlineWidget />

        <AgendaSection
          items={agendaItems}
          onItemPress={handleAgendaPress}
          onAddPress={() => router.push('/agenda/add')}
          onViewAll={() => router.push('/agenda')}
        />

        <InspectionSection
          title="آخر التفتيشات المكتملة"
          items={completedInspections}
          emptyIcon="file-text"
          emptyText="لا توجد تفتيشات مكتملة"
          emptyActionLabel="+ بدء تفتيش"
          onItemPress={ins => router.push(`/reports/${ins.id}`)}
          onViewAll={() => router.push('/screens/reports')}
          onEmptyAction={() => router.push('/(tabs)/inspection/start')}
        />

        <InspectionSection
          title="مسودات جارية"
          items={inProgressInspections}
          emptyIcon="edit-2"
          emptyText="لا توجد مسودات"
          onItemPress={handleDraftPress}
          onViewAll={() => router.push('/(tabs)/inspection')}
        />

        {recentFacilities.length > 0 && (
          <InspectionSection
            title="آخر المنشآت المفتشة"
            items={recentFacilities.map(f => ({
              id:              f.id,
              facilityId:      f.id,
              facilityName:    f.projectName,
              facilityAddress: f.address ?? '',
              date:            new Date().toISOString(),
              inspectorName:   '',
              items:           [],
              status:          'completed' as const,
              officeName:      '',
              inspectionCause: '',
              referenceDocument: '',
              committeeMembers:  [],
            }))}
            emptyIcon="home"
            emptyText=""
            onItemPress={() => router.push('/screens/facilities')}
            onViewAll={() => router.push('/screens/facilities')}
          />
        )}
      </ScrollView>

      <HomeFAB
        onNewInspection={() => router.push('/(tabs)/inspection/start')}
        onNewAgenda={() => router.push('/agenda/add')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll:   { flex: 1 },
});
