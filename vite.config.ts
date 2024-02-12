import { fileURLToPath } from 'node:url';
import path from 'path';

console.log("HAAAAAAAaaaaaaaaaaaaaaaa", path.resolve(__dirname, 'src/'))

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