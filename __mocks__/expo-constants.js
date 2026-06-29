// __mocks__/expo-constants.js
// Layer-2 global mock for expo-constants.
// Sets appOwnership to 'standalone' so IS_EXPO_GO evaluates to false
// in NotificationService, allowing the expo-notifications require() branch
// to execute and populate the module-level Notifications variable.

const Constants = {
  appOwnership: 'standalone',
  executionEnvironment: 'storeClient',
  expoConfig: {},
  manifest: {},
  manifest2: null,
  easConfig: null,
  systemFonts: [],
  platform: { ios: {}, android: {} },
};

module.exports = Constants;
module.exports.default = Constants;
