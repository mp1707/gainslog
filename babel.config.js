module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@/app-providers": "./src/app-providers",
            "@/features": "./src/features",
            "@/shared": "./src/shared",
            "@/theme": "./src/theme",
            "@/types": "./src/types",
            "@/lib": "./src/lib",
            "@/store": "./src/store",
            "@/store-legacy": "./src/store-legacy",
            "@/utils": "./src/utils",
            "@/utils-legacy": "./src/utils-legacy",
            "@/providers": "./src/providers",
            "@/hooks": "./src/hooks",
            "@/hooks-legacy": "./src/hooks-legacy",
            "@/hooks-new": "./src/hooks-new",

            "@/theme": "./src/theme",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
