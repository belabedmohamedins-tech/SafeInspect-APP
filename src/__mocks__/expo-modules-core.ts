// Mock for expo-modules-core — prevents Jest from loading native binaries
export const NativeModulesProxy = {};
export const EventEmitter = class {
  addListener() { return { remove: () => {} }; }
  removeAllListeners() {}
};
export const Platform = { OS: 'ios' };
export const UnavailabilityError = class extends Error {};
export const requireNativeModule = () => ({});
export const requireOptionalNativeModule = () => null;
export default {
  NativeModulesProxy,
  EventEmitter,
  Platform,
  UnavailabilityError,
  requireNativeModule,
  requireOptionalNativeModule,
};
