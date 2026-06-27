// components/inspection/SignaturePad.tsx
// Reusable WebView-based signature canvas. Works offline — no native module.
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, I18nManager } from 'react-native';
import { WebView } from 'react-native-webview';

I18nManager.forceRTL(true);

const SIGNATURE_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#f8fafc; display:flex; justify-content:center; align-items:center; height:100vh; }
  canvas {
    background:#fff; border:2px dashed #cbd5e1; border-radius:12px;
    cursor:crosshair; touch-action:none;
  }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let drawing = false;

function resize() {
  canvas.width = window.innerWidth - 32;
  canvas.height = window.innerHeight - 32;
}
window.addEventListener('resize', resize);
resize();

function pos(e) {
  const r = canvas.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return { x: src.clientX - r.left, y: src.clientY - r.top };
}
canvas.addEventListener('mousedown', e => { drawing=true; ctx.beginPath(); const p=pos(e); ctx.moveTo(p.x,p.y); });
canvas.addEventListener('mousemove', e => { if(!drawing) return; const p=pos(e); ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.strokeStyle='#1e293b'; ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x,p.y); });
canvas.addEventListener('mouseup', () => drawing=false);
canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing=true; ctx.beginPath(); const p=pos(e); ctx.moveTo(p.x,p.y); }, { passive:false });
canvas.addEventListener('touchmove', e => { e.preventDefault(); if(!drawing) return; const p=pos(e); ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.strokeStyle='#1e293b'; ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x,p.y); }, { passive:false });
canvas.addEventListener('touchend', () => drawing=false);

window.clearSignature = function() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
};
window.exportSignature = function() {
  const data = canvas.toDataURL('image/png');
  window.ReactNativeWebView.postMessage(JSON.stringify({ type:'signature', data }));
};
</script>
</body>
</html>
`;

export interface SignaturePadHandle {
  clear: () => void;
  export: () => void;
}

interface Props {
  onSignature: (base64: string) => void;
  label?: string;
}

const SignaturePad = forwardRef<SignaturePadHandle, Props>(({ onSignature, label }, ref) => {
  const webViewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    clear: () => webViewRef.current?.injectJavaScript('window.clearSignature(); true;'),
    export: () => webViewRef.current?.injectJavaScript('window.exportSignature(); true;'),
  }));

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'signature') {
        onSignature(msg.data);
      }
    } catch {}
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <WebView
        ref={webViewRef}
        source={{ html: SIGNATURE_HTML }}
        style={styles.webview}
        onMessage={handleMessage}
        scrollEnabled={false}
        javaScriptEnabled
        originWhitelist={['*']}
      />
    </View>
  );
});

export default SignaturePad;

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  label: {
    fontSize: 14, fontWeight: '600', color: '#374151',
    textAlign: 'right', marginBottom: 8,
  },
  webview: { flex: 1, backgroundColor: '#f8fafc' },
});
