module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@providers': './src/providers',
          '@ui': './src/ui'
        }
      }]
    ]
  };
};
