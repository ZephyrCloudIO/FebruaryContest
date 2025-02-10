import { defineConfig, RsbuildPlugin } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { withZephyr } from 'zephyr-rspack-plugin';

const pluginWithZephyr = (): RsbuildPlugin => {
  return {
    name: "zephyr-rsbuild-plugin",
    setup: (api) => {
      api.modifyRspackConfig(async (config, { mergeConfig }) => {
        const zephyrConfig = await withZephyr()(config);
        mergeConfig(zephyrConfig);
      });
    }
  };
};

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginWithZephyr()
  ],
  html: {
    title: 'React App',
  },
  tools: {
    rspack: {
      resolve: {
        fallback: {
          'fs': false,
          'path': false,
          'os': false,
        }
      }
    }
  },
  dev: {
    port: 3000,
    open: true,
  },
  output: {
    target: 'web',
    clean: true,
    distPath: {
      root: 'dist',
      js: 'static/js',
      css: 'static/css',
      assets: 'static/assets',
    },
  },
});