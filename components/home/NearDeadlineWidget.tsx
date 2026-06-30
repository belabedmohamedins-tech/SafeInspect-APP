// components/home/NearDeadlineWidget.tsx
// Phase-18: Amber banner surfacing CAP items due within 3 days
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';

export default function NearDeadlineWidget() {
  const [count, setCount] = useState(0);
  const router            = useRouter();
  const fadeAnim          = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    try {
      const stats = await CorrectiveActionRepository.getStats();
      const n     = stats.nearDeadlineCount ?? 0;
      setCount(n);
      if (n > 0) {
        // Fade in when banner first appears
        Animated.timing(fadeAnim, {
          toValue:         1,
          duration:        350,
          useNativeDriver: true,
        }).start();
      } else {
        fadeAnim.setValue(0);
      }
    } catch { /* non-fatal */ }
  }, [fadeAnim]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (count === 0) return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.banner}
        onPress={() =>
          router.push({ pathname: '/(tabs)/actions', params: { filter: 'open' } })
        }
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={`${count} إجراءات تصحيحية تستحق خلال 3 أيام، اضغط للعرض`}
      >
        {/* Icon */}
        <View style={styles.iconWrap}>
          <FontAwesome name="clock-o" size={18} color="#e65100" />
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.headline}>
            {count === 1
              ? 'إجراء تصحيحي يستحق خلال 3 أيام'
              : `${count} إجراءات تصحيحية تستحق خلال 3 أيام`}
          </Text>
          <Text style={styles.sub}>اضغط للاطلاع على المهام المفتوحة</Text>
        </View>

        {/* Chevron */}
        <FontAwesome name="angle-left" size={16} color="#e65100" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginBottom:     10,
  },
  banner: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  '#fff8e1',
    borderRadius:     10,
    borderWidth:      1,
    borderColor:      '#ffe082',
    paddingVertical:  10,
    paddingHorizontal: 12,
    gap:              10,
    elevation:        2,
    shadowColor:      '#e65100',
    shadowOffset:     { width: 0, height: 1 },
    shadowOpacity:    0.08,
    shadowRadius:     3,
  },
  iconWrap: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: '#fff3e0',
    alignItems:      'center',
    justifyContent:  'center',
  },
  textBlock: {
    flex:    1,
    gap:     2,
  },
  headline: {
    fontSize:   13,
    fontWeight: '700',
    color:      '#bf360c',
    textAlign:  'right',
  },
  sub: {
    fontSize:  11,
    color:     '#e65100',
    textAlign: 'right',
  },
});
