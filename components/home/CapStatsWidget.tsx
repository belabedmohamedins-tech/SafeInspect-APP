// components/home/CapStatsWidget.tsx
// Phase-13: CAP summary card for the home dashboard
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';

interface CapStats {
  open:       number;
  inProgress: number;
  overdue:    number;
  resolved:   number;
  total:      number;
}

const EMPTY_STATS: CapStats = { open: 0, inProgress: 0, overdue: 0, resolved: 0, total: 0 };

// ── Animated progress bar ─────────────────────────────────────────────────────
function ProgressBar({ resolved, total }: { resolved: number; total: number }) {
  const anim   = useRef(new Animated.Value(0)).current;
  const ratio  = total > 0 ? resolved / total : 0;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:         ratio,
      duration:        600,
      useNativeDriver: false,
    }).start();
  }, [ratio, anim]);

  const widthInterp = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={pbStyles.track}>
      <Animated.View
        style={[
          pbStyles.fill,
          { width: widthInterp,
            backgroundColor: ratio >= 1 ? '#2e7d32' : ratio >= 0.5 ? '#1565c0' : '#e65100' },
        ]}
      />
      <Text style={pbStyles.label}>
        {total > 0 ? `${Math.round(ratio * 100)}%` : '—'}
      </Text>
    </View>
  );
}
const pbStyles = StyleSheet.create({
  track: {
    height:          10,
    backgroundColor: '#eee',
    borderRadius:    5,
    overflow:        'hidden',
    marginTop:       10,
    marginBottom:    4,
    position:        'relative',
  },
  fill: {
    position:     'absolute',
    top: 0, left: 0, bottom: 0,
    borderRadius: 5,
  },
  label: {
    position:    'absolute',
    right:        6,
    top:         -1,
    fontSize:    9,
    fontWeight:  '700',
    color:       '#555',
    lineHeight:  12,
  },
});

// ── Stat column ───────────────────────────────────────────────────────────────
function StatCol({
  value, label, bg, fg,
}: { value: number; label: string; bg: string; fg: string }) {
  return (
    <View style={[colStyles.col, { backgroundColor: bg }]}>
      <Text style={[colStyles.value, { color: fg }]}>{value}</Text>
      <Text style={[colStyles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}
const colStyles = StyleSheet.create({
  col:   { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, marginHorizontal: 3 },
  value: { fontSize: 22, fontWeight: '800', lineHeight: 26 },
  label: { fontSize: 10, fontWeight: '600', marginTop: 2, textAlign: 'center' },
});

// ── Widget ──────────────────────────────────────────────────────────────────────
export default function CapStatsWidget() {
  const [stats, setStats] = useState<CapStats>(EMPTY_STATS);
  const router            = useRouter();

  const load = async () => {
    try {
      const all = await CorrectiveActionRepository.getAll();
      const s: CapStats = {
        open:       all.filter(a => a.status === 'open').length,
        inProgress: all.filter(a => a.status === 'in-progress').length,
        overdue:    all.filter(a => a.status === 'overdue').length,
        resolved:   all.filter(a => a.status === 'resolved').length,
        total:      all.length,
      };
      setStats(s);
    } catch { /* non-fatal */ }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (stats.total === 0) return null;

  const handleViewAll = () => {
    router.push({
      pathname: '/(tabs)/actions',
      params: stats.overdue > 0 ? { filter: 'overdue' } : {},
    });
  };

  return (
    <View style={widgetStyles.card}>
      {/* Header */}
      <View style={widgetStyles.header}>
        <View style={widgetStyles.headerLeft}>
          <FontAwesome name="tasks" size={15} color="#7b1fa2" />
          <Text style={widgetStyles.title}>متابعة الإجراءات التصحيحية</Text>
        </View>
        <View style={widgetStyles.headerRight}>
          {stats.overdue > 0 && (
            <View style={widgetStyles.overdueBadge}>
              <FontAwesome name="exclamation-triangle" size={10} color="#c62828" />
              <Text style={widgetStyles.overdueBadgeText}>{stats.overdue} متأخر</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleViewAll} style={widgetStyles.viewAllBtn}>
            <Text style={widgetStyles.viewAllText}>عرض الكل</Text>
            <FontAwesome name="angle-left" size={12} color="#7b1fa2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stat grid */}
      <View style={widgetStyles.statRow}>
        <StatCol value={stats.open}       label="مفتوح"  bg="#e3f2fd" fg="#1565c0" />
        <StatCol value={stats.inProgress} label="جارٍ"    bg="#fff9c4" fg="#f57f17" />
        <StatCol value={stats.overdue}    label="متأخر"   bg={stats.overdue > 0 ? '#ffebee' : '#f5f5f5'} fg={stats.overdue > 0 ? '#c62828' : '#999'} />
        <StatCol value={stats.resolved}   label="محلول"   bg="#e8f5e9" fg="#2e7d32" />
      </View>

      {/* Progress bar: resolved / total */}
      <ProgressBar resolved={stats.resolved} total={stats.total} />
      <Text style={widgetStyles.progressLabel}>
        {stats.resolved} محلول من إجمالي {stats.total} إجراء
      </Text>
    </View>
  );
}

const widgetStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white ?? '#fff',
    borderRadius:    12,
    marginHorizontal: 12,
    marginBottom:    12,
    padding:         14,
    elevation:        3,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.09,
    shadowRadius:    4,
    borderWidth:     1,
    borderColor:     '#ede7f6',
  },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerLeft:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title:          { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  headerRight:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  overdueBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffebee', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  overdueBadgeText: { fontSize: 11, fontWeight: '700', color: '#c62828' },
  viewAllBtn:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewAllText:    { fontSize: 12, color: '#7b1fa2', fontWeight: '600' },
  statRow:        { flexDirection: 'row', marginBottom: 2 },
  progressLabel:  { fontSize: 11, color: '#888', textAlign: 'center', marginTop: 2 },
});
