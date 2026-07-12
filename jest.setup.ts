/**
 * jest.setup.ts — LAYER 3 of the mock architecture
 *
 * Runs after the test framework is installed (setupFilesAfterEnv).
 * See jest.config.js for the full 4-layer mock architecture contract.
 *
 * RULE FOR THIS FILE:
 *   Only add mocks here when they CANNOT be handled by moduleNameMapper
 *   (Layer 2).  The canonical reason is: the mock needs jest.mock() hoisting
 *   semantics, or it must override something the preset already loaded.
 *
 *   ✅ OK here : react-native (Proxy), Platform, safe-area-context, expo-router
 *   ❌ NOT here : native module stubs → use moduleNameMapper + __mocks__/
 *
 * NOTE: configure({ defaultWrapper }) was removed.
 *   @testing-library/react-native's configure() does NOT accept defaultWrapper
 *   in the version installed — calling it throws "Unknown options passed to
 *   configure" on every test suite and corrupts renderHook so that
 *   result.current is always undefined.
 *   Each hook test file passes its own `wrapper` to renderHook() directly,
 *   which is the correct pattern for all RTLRN versions.
 *
 * NOTE: expo-router / useFocusEffect mock
 *
 *   THE BUG THIS COMMENT EXPLAINS (do not revert):
 *   A previous version of this mock called useEffect() from require('react')
 *   directly inside the useFocusEffect factory function:
 *
 *     useFocusEffect: (cb) => {
 *       useEffect(() => { cb(); }, []);   // ← WRONG
 *     }
 *
 *   This violates React's rules of hooks. useEffect (and all hooks) must be
 *   called inside a React component or another hook. The useFocusEffect mock
 *   is a plain factory function, not a component — React's hook dispatcher is
 *   null when it executes. The result: React silently aborts the render of
 *   every hook under test, leaving result.current === undefined in every
 *   renderHook call. All 39 hook tests failed with:
 *     TypeError: Cannot read properties of undefined (reading 'current')
 *
 *   THE FIX:
 *   Call the callback directly — no hooks involved. This is correct because
 *   the only purpose of the mock is to trigger the callback immediately when
 *   the hook mounts, which renderHook does synchronously. The real
 *   useFocusEffect fires on screen focus; in tests there is no navigation
 *   stack, so a direct call on mount is the correct equivalent.
 *
 *   useNavigation / useRouter: minimal stubs. Test files that need specific
 *   behaviour should override with jest.mock('expo-router', ...) at Layer 4.
 *
 * NOTE: expo-constants / IS_EXPO_GO guard
 *
 *   NotificationService captures IS_EXPO_GO = Constants.appOwnership === 'expo'
 *   at module-load time. The jest-expo preset sets appOwnership to 'expo' via
 *   its own resolver, which runs before moduleNameMapper. We override it here
 *   (Layer 3, post-preset) by mutating the already-loaded Constants object so
 *   that appOwnership is 'standalone'. This makes IS_EXPO_GO = false and allows
 *   the lazy require('expo-notifications') branch to execute.
 *
 * NOTE: fetch globals freeze — DO NOT REMOVE
 *
 *   jest-expo preset installs lazy getters for `fetch`, `Request`, `Response`,
 *   `Headers`, and `FormData` on `global` via expo/src/winter/installGlobal.ts.
 *   These getters fire on first access and execute:
 *     runtime.native.ts → fetch/index.ts → fetch/FetchResponse.ts
 *   which does `class FetchResponse extends Response { … }`. If `Response` is
 *   undefined at that moment (e.g., in certain test suites where module
 *   isolation clears globalThis), Babel's _inherits() throws:
 *     TypeError: Super expression must either be null or a function
 *
 *   The fix: after the preset runs (Layer 3 = setupFilesAfterEnv), reassign
 *   all five fetch globals with plain property assignments. A plain assignment
 *   replaces the lazy getter with a concrete value — the getter can never fire
 *   again, so FetchResponse.ts is never evaluated.
 *
 *   Values come from jest.polyfill.js (Layer 1), which loaded undici globals
 *   before the preset touched anything. We just surface them here to replace
 *   the getters the preset installed on top.
 *
 *   Do NOT use Object.defineProperty with writable:false — jest itself needs
 *   to be able to override fetch in individual tests via jest.spyOn.
 *
 * Load order:
 *   1. jest.polyfill.js          — global polyfills before preset
 *   2. jest-expo preset          — @react-native/jest-preset component stubs
 *   3. THIS FILE (Layer 3)       — behavioral overrides
 *   4. each test file (Layer 4)  — domain-specific mocks
 */

import React from 'react';

// ─── Freeze fetch globals — prevent expo winter lazy getter from firing ───────
//
// The jest-expo preset installs lazy getters on global for fetch/Request/
// Response/Headers/FormData via installGlobal.ts.  Those getters chain into
// FetchResponse.ts which does `class FetchResponse extends Response` — if
// Response is undefined at that point the suite crashes before test #1 runs.
//
// Reassigning with a plain value (from our polyfill) replaces the getter
// descriptor with a data descriptor, so the getter can never fire.
// This affects only pdfService.test.ts and useHomeData.test.ts because those
// are the suites whose import graph triggers the lazy getter first.
;
(function freezeFetchGlobals() {
  // These were set by jest.polyfill.js (Layer 1) before the preset ran.
  // We surface them here after the preset to stomp its lazy getters.
  const g = global as any;
  if (typeof g.Response !== 'undefined') {
    // Plain assignment → replaces getter with value descriptor.
    const _Response  = g.Response;
    const _Request   = g.Request;
    const _Headers   = g.Headers;
    const _fetch     = g.fetch;
    const _FormData  = g.FormData;

    try { Object.defineProperty(g, 'Response',  { value: _Response,  writable: true, configurable: true }); } catch (_) { g.Response  = _Response; }
    try { Object.defineProperty(g, 'Request',   { value: _Request,   writable: true, configurable: true }); } catch (_) { g.Request   = _Request; }
    try { Object.defineProperty(g, 'Headers',   { value: _Headers,   writable: true, configurable: true }); } catch (_) { g.Headers   = _Headers; }
    try { Object.defineProperty(g, 'fetch',     { value: _fetch,     writable: true, configurable: true }); } catch (_) { g.fetch     = _fetch; }
    try { Object.defineProperty(g, 'FormData',  { value: _FormData,  writable: true, configurable: true }); } catch (_) { g.FormData  = _FormData; }
  }
})();

// ─── expo-constants — force IS_EXPO_GO = false ──────────────────────────────
// jest-expo preset sets Constants.appOwnership = 'expo' via its resolver.
// We mutate the object here (post-preset) so every subsequent require() sees
// appOwnership = 'standalone', making IS_EXPO_GO = false in NotificationService.
try {
  const Constants = require('expo-constants');
  const target = Constants.default ?? Constants;
  target.appOwnership = 'standalone';
} catch (_) {
  // expo-constants not installed — ignore
}

// ─── expo-router — global stub ───────────────────────────────────────────────
jest.mock('expo-router', () => {
  return {
    // Direct call — no useEffect, no hook violation.
    // The callback is called synchronously so renderHook sees the hook's
    // initial data-load kick off immediately on mount.
    useFocusEffect: (cb: () => (() => void) | void) => {
      cb();
    },
    useNavigation: jest.fn(() => ({
      addListener: jest.fn(() => jest.fn()),
      dispatch:    jest.fn(),
      navigate:    jest.fn(),
      goBack:      jest.fn(),
    })),
    useRouter: jest.fn(() => ({
      replace: jest.fn(),
      push:    jest.fn(),
      back:    jest.fn(),
    })),
    useLocalSearchParams: jest.fn(() => ({})),
    Link: 'Link',
    Redirect: 'Redirect',
    Stack: { Screen: 'Stack.Screen' },
    Tabs:  { Screen: 'Tabs.Screen' },
  };
});

// ─── react-native-safe-area-context — global stub ───────────────────────────
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets:     jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  useSafeAreaFrame:      jest.fn(() => ({ x: 0, y: 0, width: 375, height: 812 })),
  SafeAreaProvider:      'SafeAreaProvider',
  SafeAreaView:          'SafeAreaView',
  SafeAreaConsumer:      'SafeAreaConsumer',
  SafeAreaInsetsContext: { Consumer: 'SafeAreaInsetsContext.Consumer' },
  initialWindowMetrics: {
    frame:  { x: 0, y: 0, width: 375, height: 812 },
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  },
}));

// ─── React Native — synthetic Platform mock ──────────────────────────────────
const PLATFORM = {
  OS:      'android' as const,
  select:  <T extends Record<string, unknown>>(spec: T): T[keyof T] =>
    (spec['android'] ?? spec['default'] ?? Object.values(spec)[0]) as T[keyof T],
  Version:   0,
  isTesting: true,
  isTV:      false,
};

jest.mock('react-native/Libraries/Utilities/Platform', () => PLATFORM);

// ─── React reconciler internal keys ─────────────────────────────────────────
//
// These are accessed on every object during React tree traversal.
// They must return undefined/falsy silently — they are NOT RN API calls.
//
// ⚠️  VERSIONING NOTE: last audited against React Native 0.83 / React 19.
// If tests start throwing "[jest.setup.ts] react-native — unstubbed access"
// for keys that look like React internals (e.g. __reactInternalMemoized*),
// add them here AND update the version note above.
const mockSafeFalsySymbols = new Set([
  Symbol.iterator,
  Symbol.toPrimitive,
  Symbol.toStringTag,
  Symbol.hasInstance,
  Symbol.isConcatSpreadable,
]);

const mockReactInternalKeys = new Set([
  '$$typeof', '_context', '_owner', '_store', '_self', '_source',
  '__esModule', 'default', 'displayName', 'propTypes', 'defaultProps',
  'contextTypes', 'childContextTypes', 'getDerivedStateFromProps',
  'getDerivedStateFromError', 'contextType', 'prototype',
  'render', 'name', 'length', 'caller', 'arguments', 'toString',
  'valueOf', 'toJSON', '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED',
  'unstable_batchedUpdates', '__reactFiber', '__reactProps',
  'then', 'catch', 'finally', // Promise-like checks
]);

jest.mock('react-native', () => {
  const rnStubs: Record<string, unknown> = {
    Platform:   PLATFORM,
    StyleSheet: { create: (s: object) => s, flatten: (s: object) => s, hairlineWidth: 1 },
    I18nManager: { isRTL: false, forceRTL: jest.fn(), allowRTL: jest.fn() },
    Dimensions:  { get: jest.fn(() => ({ width: 375, height: 812 })), addEventListener: jest.fn(), removeEventListener: jest.fn() },
    Animated: {
      Value: jest.fn(() => ({ setValue: jest.fn(), interpolate: jest.fn(() => ({})) })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      View: 'Animated.View',
      Text: 'Animated.Text',
      Image: 'Animated.Image',
      createAnimatedComponent: jest.fn((c: unknown) => c),
      event: jest.fn(),
      add: jest.fn(),
    },
    NativeModules: {},
    NativeEventEmitter: jest.fn(() => ({ addListener: jest.fn(), removeAllListeners: jest.fn() })),
    AppState: { addEventListener: jest.fn(), removeEventListener: jest.fn(), currentState: 'active' },
    Linking:  { openURL: jest.fn(), canOpenURL: jest.fn(), getInitialURL: jest.fn(), addEventListener: jest.fn() },
    Keyboard: { addListener: jest.fn(), removeAllListeners: jest.fn(), dismiss: jest.fn() },
    Alert:    { alert: jest.fn() },
    Share:    { share: jest.fn() },
    Vibration: { vibrate: jest.fn(), cancel: jest.fn() },
    PixelRatio: { get: jest.fn(() => 2), getFontScale: jest.fn(() => 1), getPixelSizeForLayoutSize: jest.fn((n: number) => n * 2), roundToNearestPixel: jest.fn((n: number) => n) },
    AccessibilityInfo: { isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)), addEventListener: jest.fn(), removeEventListener: jest.fn(), announceForAccessibility: jest.fn() },
    Appearance: { getColorScheme: jest.fn(() => 'light'), addChangeListener: jest.fn() },
    InteractionManager: { runAfterInteractions: jest.fn((cb: () => void) => { cb(); return { cancel: jest.fn() }; }) },
    // useColorScheme: accessed by expo-router's import chain (utils.ts → useNavigation →
    // Screen → Navigator → exports → index). Must return a valid colour scheme string.
    useColorScheme: jest.fn(() => 'light'),
    // LogBox: accessed by expo's Expo.fx.tsx at module load time.
    // expo-sqlite and expo-crypto both pull in expo which calls LogBox.ignoreLogs().
    // Without this stub the strict Proxy throws for schema.test.ts, pdfService.test.ts
    // and useHomeData.test.ts.
    LogBox: {
      ignoreLogs:    jest.fn(),
      ignoreAllLogs: jest.fn(),
      install:       jest.fn(),
      uninstall:     jest.fn(),
    },
    // AppRegistry: accessed by expo's Expo.fx.tsx:39 (AppRegistry.registerComponent)
    // at module load time. expo-sqlite, expo-crypto, and any module that imports
    // through expo trigger this access. Without the stub the strict Proxy throws for
    // schema.test.ts, pdfService.test.ts, and useHomeData.test.ts.
    AppRegistry: {
      registerComponent: jest.fn(),
      runApplication:    jest.fn(),
      setWrapperComponentProvider: jest.fn(),
    },
    View:           'View',
    Text:           'Text',
    Image:          'Image',
    ScrollView:     'ScrollView',
    FlatList:       'FlatList',
    SectionList:    'SectionList',
    TouchableOpacity:     'TouchableOpacity',
    TouchableHighlight:   'TouchableHighlight',
    TouchableWithoutFeedback: 'TouchableWithoutFeedback',
    Pressable:      'Pressable',
    TextInput:      'TextInput',
    Modal:          'Modal',
    ActivityIndicator: 'ActivityIndicator',
    Switch:         'Switch',
    SafeAreaView:   'SafeAreaView',
    KeyboardAvoidingView: 'KeyboardAvoidingView',
    StatusBar:      { setBarStyle: jest.fn(), setBackgroundColor: jest.fn(), currentHeight: 24 },
    useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
  };

  return new Proxy(rnStubs, {
    get(target, prop) {
      if (typeof prop === 'string' && prop in target) return target[prop];
      if (typeof prop === 'symbol' && mockSafeFalsySymbols.has(prop)) return undefined;
      if (typeof prop === 'string' && mockReactInternalKeys.has(prop))  return undefined;
      throw new Error(
        `[jest.setup.ts] react-native — unstubbed access: "${String(prop)}"\n` +
        `Add an explicit stub for this key in the rnStubs object in jest.setup.ts.\n` +
        `Do NOT restore the catch-all jest.fn() fallback.`
      );
    },
  });
});

// ─── Console suppression ──────────────────────────────────────────────────────
//
// Suppressed prefixes fall into two categories:
//
// 1. Framework noise — warnings from RN/Reanimated/AsyncStorage that are
//    irrelevant to test correctness and would obscure real failures.
//
// 2. Intentional error-path output — hooks/services that call console.warn()
//    or console.error() when they catch an exception. These tests deliberately
//    trigger error paths to prove the code handles failures gracefully.
//    The console output is expected and correct; suppressing it keeps the
//    test run output clean without hiding any real problem.
const _consoleError = console.error.bind(console);
const _consoleWarn  = console.warn.bind(console);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    const suppressed = [
      // 1. Framework noise
      'Warning:',
      'AsyncStorage',
      'Reanimated',
      'act(',
      // 2. Intentional error-path output from hooks under test
      'useInspectionList load error',
      'useHomeData load error',
      'Error saving inspection',
      'Error updating agenda',
      // 3. Intentional error-path output from services under test
      '[CapReportService]',
    ];
    if (suppressed.some(s => msg.includes(s))) return;
    _consoleError(...args);
  });

  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    const suppressed = [
      // 1. Framework noise
      'Warning:',
      'Reanimated',
      // 2. Intentional error-path output from services under test
      '[PhotoService]',
      '[CapNotificationService]',
      '[NotificationService]',
      '[SafeInspect] Sync flush error',
      '[SettingsRepository]',
      '[criteriaData]',
    ];
    if (suppressed.some(s => msg.includes(s))) return;
    _consoleWarn(...args);
  });
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore?.();
  (console.warn  as jest.Mock).mockRestore?.();
});
