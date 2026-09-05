// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'coverage/*',
      // Vendored gluestack-ui primitives, emitted verbatim by `gluestack-ui add`.
      // They are the library's source, not ours: linting them only produces noise
      // that would be overwritten the next time a component is added or updated.
      'src/components/ui/**',
    ],
  },
]);
