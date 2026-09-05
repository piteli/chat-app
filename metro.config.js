// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind compiles `global.css` (Tailwind v4) into the style objects the
// gluestack-ui primitives consume through their `className` props.
module.exports = withNativewind(config, { inlineRem: 16 });
