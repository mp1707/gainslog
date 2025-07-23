module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
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
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};