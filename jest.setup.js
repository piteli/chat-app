/* eslint-env jest */

// AsyncStorage is a native module; redux-persist touches it as soon as the
// store module is imported, so it needs a JS stand-in under Jest.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// NOTE: the clock is deliberately NOT faked globally. Every date-dependent
// helper (`formatListTimestamp`, `buildConversationPreview`, ...) takes `now` as
// an explicit parameter, so tests pin time by passing it rather than by freezing
// `Date`. Freezing it globally would also deadlock `waitFor`, which measures its
// own timeout with `Date.now()`.
