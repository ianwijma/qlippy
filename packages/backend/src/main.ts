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
import {clipboardSettings} from "./settings/clipboard.setting";
import {clipboardHistoryWindow} from "./windows/clipboard-history.window";
import {clipboardChangeHandler} from "./clipboard-events/clipboard-change-handler";
import {clipboardRestoreHandler} from "./clipboard-events/clipboard-restore-handler";
import {clipboardClearHandler} from "./clipboard-events/clipboard-clear-handler";
import {clipboardChangeListener} from "./clipboard-change-old/listener";
import {fileProtocol} from "./utils/fileProtocol";
import {siteProtocol} from "./utils/siteProtocol";

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

        if (startupArguments.reset) {
            await resetAllSettings();
        }

        // Setup Clipboard Processes
        await clipboardChangeListener.initialize();
        await clipboardSettings.initialize();

        // Background Processes
        await keyboardShortcuts.initialize();
        await fileProtocol.initialize();
        await siteProtocol.initialize();

        // Clipboard Processes
        await clipboardChangeHandler.initialize();
        await clipboardRestoreHandler.initialize();
        await clipboardClearHandler.initialize();

        // Windows
        await clipboardHistoryWindow.initialize();
        await aboutWindow.initialize();

        // Tray
        await defaultTray.initialize();
    }

    app.on('ready', onReady);
}
