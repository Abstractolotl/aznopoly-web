import {fileURLToPath} from 'node:url';
import PathEnv from "vite-plugin-patch-env";

export default {
    plugins: [PathEnv()],
    resolve: {
        alias: [
            {
                find: '@',
                replacement: fileURLToPath(new URL('./src', import.meta.url))
            },
        ],
    },
};