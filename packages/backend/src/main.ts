import {app} from 'electron';
import started from 'electron-squirrel-startup';
import {defaultTray} from "./tray/defaultTray";
import {startupArguments} from "./utils/startupArguments";
import {isDev} from "./utils/isDev";
import './windows/dialog.window';
import {resetAllSettings} from "./utils/resetAllSettings";
import {aboutWindow} from "./windows/about.window";
import {keyboardSettings} from "./settings/keyboard.setting";
import {keyboardShortcuts} from "./utils/keyboard-shortcuts";
import {clipboardHistoryWindow} from "./windows/clipboard-history.window";
import {fileProtocol} from "./utils/fileProtocol";
import {clipboardHandleChange} from "./clipboard/handle-change";
import {clipboardHandleClear} from "./clipboard/handle-clear";
import {clipboardHandleRestore} from "./clipboard/handle-restore";
import {clipboardChangeEmitter} from "./clipboard/change-emitter";
import {clipboardSettings} from "./settings/clipboard.setting";
import {clipboardHandleOpen} from "./clipboard/handle-open";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

let isSingleInstance = app.requestSingleInstanceLock({isDev: isDev()});
if (!isSingleInstance) {
    console.log('Qlippy can only be opened once.')
    app.quit();
} else {
    const onBeforeQuit = () => {
        // @ts-expect-error - isQuiting is not officially defined.
        app.isQuiting = true;
    }

    app.on('before-quit', onBeforeQuit);

    const onReady = async () => {
        // Settings
        await keyboardSettings.initialize();
        await clipboardSettings.initialize();

        if (startupArguments.reset) {
            await resetAllSettings();
        }

        // Setup Clipboard Change Processes
        await clipboardChangeEmitter.initialize();
        await clipboardHandleChange.initialize();
        await clipboardHandleClear.initialize();
        await clipboardHandleRestore.initialize();
        await clipboardHandleOpen.initialize();

        // Background Processes
        await keyboardShortcuts.initialize();
        await fileProtocol.initialize();

        // Windows
        await clipboardHistoryWindow.initialize();
        await aboutWindow.initialize();

        // Tray
        await defaultTray.initialize();
    }

    app.on('ready', onReady);
}
