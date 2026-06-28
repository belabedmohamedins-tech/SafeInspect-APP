// __mocks__/expo-constants.js
// Layer-2 mock — defaults to a development build (NOT Expo Go)
// so IS_EXPO_GO = false and all Notifications code paths execute.
module.exports = {
  default: {
    appOwnership: 'standalone', // 'expo' would silence all notification code
    expoConfig: { name: 'SafeInspect', slug: 'safeinspect' },
  },
  appOwnership: 'standalone',
};
