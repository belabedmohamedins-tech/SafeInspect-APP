// app/screens/map.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Colors, Spacing } from '../../constants';
import { getAllFacilities } from '../../src/facilitiesService';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { Facility } from '../../src/types';

/** Escape special HTML characters to prevent XSS in WebView popups. */
const escHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default function MapScreen() {
  const [html, setHtml]       = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const loadingRef            = useRef(false);   // guard against double-load on focus

  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const [facilities, inspections] = await Promise.all([
        getAllFacilities(),
        InspectionRepository.getCompleted(),
      ]);

      const points: { lat: number; lng: number; name: string; weight: number }[] = [];

      (facilities as Facility[]).forEach(facility => {
        const match = facility.notes?.match(/الإحداثيات:\s*([-\d.]+),\s*([-\d.]+)/);
        if (!match) return;
        const lng = parseFloat(match[1]);
        const lat = parseFloat(match[2]);
        if (isNaN(lat) || isNaN(lng)) return;

        const latest = inspections
          .filter(ins => ins.facilityId === facility.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        let weight = 1;
        if (latest?.grade === 'A')            weight = 0.5;
        else if (latest?.grade === 'B')       weight = 1.5;
        else if (latest?.grade === 'C')       weight = 3;
        else if (latest?.grade === 'D')       weight = 5;
        else if (latest?.score !== undefined) weight = ((100 - latest.score) / 100) * 5;

        // Fix: Facility type uses `projectName`, not `name`
        points.push({ lat, lng, name: facility.projectName ?? '', weight });
      });

      setHtml(generateMapHtml(points));
    } catch (e) {
      console.error('Failed to load map data', e);
      setError('تعذّر تحميل بيانات الخريطة');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useFocusEffect(
    useCallback(() => { loadData(); }, [loadData])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.hint}>جاري تحميل الخريطة...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !html) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'حدث خطأ غير متوقع'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  );
}

function generateMapHtml(points: { lat: number; lng: number; name: string; weight: number }[]) {
  const heatData = points.map(p => [p.lat, p.lng, p.weight]);
  const center   = points.length > 0 ? [points[0].lat, points[0].lng] : [35.25, -0.55];
  const zoom     = points.length > 0 ? 13 : 8;
  const markerColor = Colors.primary;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>خريطة المنشآت</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
  <style>body{margin:0;padding:0}#map{height:100vh;width:100vw}.custom-marker{background:transparent;border:none}</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView(${JSON.stringify(center)}, ${zoom});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
      attribution:'&copy; OpenStreetMap contributors &copy; CartoDB',
      subdomains:'abcd', maxZoom:19
    }).addTo(map);
    L.heatLayer(${JSON.stringify(heatData)},{
      radius:35, blur:20, maxZoom:17, minOpacity:0.4,
      gradient:{0.4:'blue',0.6:'lime',0.8:'yellow',1.0:'red'}
    }).addTo(map);
    ${points.map(p => `
      L.marker([${p.lat},${p.lng}],{
        icon:L.divIcon({
          className:'custom-marker',
          html:'<div style="background:${markerColor};width:10px;height:10px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.35)"></div>',
          iconSize:[10,10]
        })
      }).bindPopup('<b>${escHtml(p.name)}</b><br>وزن: ${p.weight.toFixed(1)}').addTo(map);
    `).join('')}
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  webview:   { flex: 1 },
  hint:      { fontSize: 13, color: Colors.textSecondary },
  errorText: { fontSize: 14, color: Colors.danger, textAlign: 'center', paddingHorizontal: Spacing.lg },
});
