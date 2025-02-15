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
import {clipboardHistorySettings} from "./settings/clipboard-history.setting";
import {clipboardChanges} from "./utils/clipboard-changes-event";
import {clipboardHistoryWindow} from "./windows/clipboard-history.window";

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
        await clipboardHistorySettings.initialize();

        if (startupArguments.reset) {
            await resetAllSettings();
        }

        // Windows
        await clipboardHistoryWindow.initialize();
        await aboutWindow.initialize();

        // Background Processes
        await keyboardShortcuts.initialize();
        await clipboardChanges.startListening();

        // Tray
        await defaultTray.initialize();
    }

    app.on('ready', onReady);
}
