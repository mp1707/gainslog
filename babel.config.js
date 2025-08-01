module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@/app-providers': './src/app-providers',
            '@/features': './src/features',
            '@/shared': './src/shared',
            '@/theme': './src/theme',
            '@/types': './src/types',
            '@/lib': './src/lib',
            '@/stores': './src/stores',
            '@/utils': './src/utils',
            '@/providers': './src/providers',
            '@/hooks': './src/hooks',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};