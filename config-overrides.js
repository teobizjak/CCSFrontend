module.exports = function override(config, env) {
    // Your custom webpack configuration
    config.resolve.fallback = {
      "http": require.resolve("stream-http"),
      "crypto": require.resolve("crypto-browserify"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "url": require.resolve("url/"),
      
    };
    return config;
  }
  