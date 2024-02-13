import { fileURLToPath } from 'node:url';

export default {

  resolve: {
    alias: [
        {
          find: '@',
          replacement: fileURLToPath(new URL('./src', import.meta.url))
        },
      ],
  },
};