import type {Configuration} from 'webpack';

import {rules} from './webpack.rules';
import {plugins} from './webpack.plugins';

export const preloadConfig: Configuration = {
    entry: './src/preload.ts',
    // Put your normal webpack config below here
    module: {
        rules,
    },
    plugins,
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    },
};
