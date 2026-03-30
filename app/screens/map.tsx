import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { getAllFacilities } from '../../src/facilitiesService';
import { Facility, SavedInspection } from '../../src/types';

export default function MapScreen() {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const facilities = await getAllFacilities();
      const inspectionsData = await AsyncStorage.getItem('inspections');
      let inspections: SavedInspection[] = [];
      if (inspectionsData) {
        inspections = JSON.parse(inspectionsData).filter(
          (ins: SavedInspection) => ins.status === 'completed'
        );
      }

      const points: { lat: number; lng: number; weight: number }[] = [];

      facilities.forEach((facility: Facility) => {
        const match = facility.notes?.match(/الإحداثيات:\s*([-\d.]+),\s*([-\d.]+)/);
        if (!match) return;
        const lng = parseFloat(match[1]);
        const lat = parseFloat(match[2]);
        if (isNaN(lat) || isNaN(lng)) return;

        // Find latest inspection for this facility
        const facilityInspections = inspections.filter(
          (ins) => ins.facilityId === facility.id
        );
        const latest = facilityInspections.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        // Enhanced weight mapping for better visibility
        let weight = 1; // default
        if (latest?.grade === 'A') weight = 0.5;
        else if (latest?.grade === 'B') weight = 1.5;
        else if (latest?.grade === 'C') weight = 3;
        else if (latest?.grade === 'D') weight = 5;
        else if (latest?.score !== undefined) {
          // Use score: lower score = higher risk
          weight = ((100 - latest.score) / 100) * 5;
        }

        points.push({ lat, lng, weight });
      });
console.log('Points for heatmap:', points);
      // If no points, still show a map
      const mapHtml = generateMapHtml(points);
      setHtml(mapHtml);
    } catch (error) {
      console.error('Failed to load map data', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  if (loading || !html) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1986df" />
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

function generateMapHtml(points: { lat: number; lng: number; weight: number }[]) {
  const heatData = points.map(p => [p.lat, p.lng, p.weight]);
  const center = points.length > 0 ? [points[0].lat, points[0].lng] : [35.25, -0.55];
  const zoom = points.length > 0 ? 13 : 8;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>خريطة المنشآت</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .custom-marker {
          background: transparent;
          border: none;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView(${JSON.stringify(center)}, ${zoom});
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CartoDB',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        // Add heat layer with strong parameters
        var heat = L.heatLayer(${JSON.stringify(heatData)}, {
          radius: 35,
          blur: 20,
          maxZoom: 17,
          minOpacity: 0.4,
          gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
        }).addTo(map);

        // Optionally add small markers (comment out if not needed)
        ${points.map(p => `
          L.marker([${p.lat}, ${p.lng}], {
            icon: L.divIcon({
              className: 'custom-marker',
              html: '<div style="background-color: #1986df; width: 8px; height: 8px; border-radius: 50%; border: 1px solid white;"></div>',
              iconSize: [8, 8]
            })
          }).bindPopup('<b>وزن: ${p.weight.toFixed(1)}</b>').addTo(map);
        `).join('\n')}
      </script>
    </body>
    </html>
  `;

  return htmlContent;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fcff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  webview: { flex: 1 },
});