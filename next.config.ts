import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Define globals that WebTorrent expects
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.DefinePlugin({
          'global': 'globalThis',
        })
      );

      // Exclude native modules from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
      };
      
      // Ignore node-datachannel native binding on client
      config.externals = config.externals || [];
      config.externals.push({
        'node-datachannel': 'commonjs node-datachannel',
      });

      // Suppress common WebTorrent warnings
      config.ignoreWarnings = [
        /Critical dependency: the request of a dependency is an expression/,
        /Critical dependency: require function is used in a way/,
      ];
    }
    
    return config;
  },
};

export default nextConfig;
