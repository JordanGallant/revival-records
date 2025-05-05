const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // This ensures the WASM modules are processed correctly
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  }
}

module.exports = nextConfig