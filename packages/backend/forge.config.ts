import type {ForgeConfig} from '@electron-forge/shared-types';
import {MakerSquirrel} from '@electron-forge/maker-squirrel';
import {MakerDeb} from '@electron-forge/maker-deb';
import MakerRpm from "@electron-forge/maker-rpm";
import {AutoUnpackNativesPlugin} from '@electron-forge/plugin-auto-unpack-natives';
import {WebpackPlugin} from '@electron-forge/plugin-webpack';
import {FusesPlugin} from '@electron-forge/plugin-fuses';
import {FuseV1Options, FuseVersion} from '@electron/fuses';

import {mainConfig} from './webpack.main.config';
import {preloadConfig} from './webpack.preload.config';
import MakerDMG from "@electron-forge/maker-dmg";

const NAME = 'Qlippy';
const DESCRIPTION = 'Qlip That!';
const AUTHOR = 'Ian Wijma';

const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
    },
    rebuildConfig: {},
    makers: [
        new MakerDeb({
            options: {
                name: NAME,
                description: DESCRIPTION,
                maintainer: AUTHOR,
            }
        }),
        new MakerRpm({
            options: {
                name: NAME,
                description: DESCRIPTION,
            }
        }),
        new MakerSquirrel({
            name: NAME,
            description: DESCRIPTION,
            authors: AUTHOR,
            certificateFile: 'todo',
            certificatePassword: 'TODO'
        }),
        new MakerDMG({
            name: NAME,
        })
    ],
    plugins: [
        new AutoUnpackNativesPlugin({}),
        new WebpackPlugin({
            mainConfig,
            renderer: {
                config: preloadConfig,
                entryPoints: [
                    {
                        // html: "./index.html",
                        // js: "./src/renderer.ts",
                        name: '../main',
                        preload: {
                            js: './src/preload.ts',
                        },
                    }
                ],
            },
        }),
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};

export default config;
