// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('cjs');

// Add mapping for Node standard library modules
config.resolver.extraNodeModules = {
  punycode: require.resolve('punycode'),
};

module.exports = config;
