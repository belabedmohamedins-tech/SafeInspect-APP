// app/screens/onboarding.tsx — First-launch onboarding carousel
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';

const { width: SCREEN_W } = Dimensions.get('window');

interface Slide {
  key: string;
  icon: string;
  title: string;
  body: string;
  bg: string;
}

const SLIDES: Slide[] = [
  {
    key: '1',
    icon: '🛡️',
    title: 'مرحباً بك في SafeInspect',
    body: 'تطبيق متكامل للتفتيش الصحي والبيئي. ابدأ رحلتك نحو بيئة أكثر أماناً وصحة.',
    bg: '#1a6b3c',
  },
  {
    key: '2',
    icon: '📋',
    title: 'سير عمل التفتيش',
    body: 'من الجدول إلى التقرير — بريف سابق للزيارة، بوابة جيوفنسينج، قائمة تفتيش شاملة، وتوقيع رقمي.',
    bg: '#15548f',
  },
  {
    key: '3',
    icon: '⚡',
    title: 'متابعة الإجراءات التصحيحية',
    body: 'تتبع خطط العمل التصحيحية، استلم تذكيرات تلقائية بالمواعيد النهائية، وشارك التقارير بصيغة PDF.',
    bg: '#7d3c98',
  },
  {
    key: '4',
    icon: '🔒',
    title: 'أمان وموثوقية كاملة',
    body: 'بياناتك محمية بتوقيع رقمي وتحقق من سلامة البيانات. نسخ احتياطي واستعادة في أي وقت.',
    bg: '#a04000',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const finish = async () => {
    await SettingsRepository.set('onboardingDone', 'true');
    router.replace('/(tabs)/home');
  };

  const next = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      finish();
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <View style={[styles.slide, { width: SCREEN_W, backgroundColor: item.bg }]}>
      <Text style={styles.slideIcon}>{item.icon}</Text>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideBody}>{item.body}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={s => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setActiveIndex(idx);
        }}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={finish}>
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextBtn} onPress={next}>
          <Text style={styles.nextBtnText}>
            {activeIndex === SLIDES.length - 1 ? 'ابدأ الآن' : 'التالي'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a6b3c' },
  slide:     { flex: 1, alignItems: 'center', justifyContent: 'center',
               paddingHorizontal: 36, paddingTop: 80, paddingBottom: 180 },
  slideIcon: { fontSize: 72, marginBottom: 32 },
  slideTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center',
                marginBottom: 16, lineHeight: 36 },
  slideBody: { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center',
               lineHeight: 26 },
  dots:      { position: 'absolute', bottom: 120, left: 0, right: 0,
               flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 24 },
  controls:  { position: 'absolute', bottom: 48, left: 32, right: 32,
               flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipText:  { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  nextBtn:   { backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 28,
               paddingVertical: 12 },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#1a6b3c' },
});
