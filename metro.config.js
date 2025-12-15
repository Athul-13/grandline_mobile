// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add source extensions to handle various module formats if needed
config.resolver.sourceExts.push('cjs', 'mjs');

module.exports = config;

