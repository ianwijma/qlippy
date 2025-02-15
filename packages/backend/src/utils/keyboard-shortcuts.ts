import {keyboardSettings} from "../settings/keyboard.setting";
import {settingsUpdatedEventName, SettingsUpdatedEventData} from '@qlippy/common/src/events/settingsUpdated.event'
import {KeyboardAction, KeyboardSettings} from "@qlippy/common/src/settings/keyboard.settings.types";
import {globalShortcut} from 'electron'
import {eventHandler} from "./eventHandler";
import {clipboardHistoryWindow} from "../windows/clipboard-history.window";

export type KeyboardShortcuts = {
    initialize: () => Promise<void>,
}

const createKeyboardShortcuts = (): KeyboardShortcuts => {
    const handleWindow = async (id: string) => {
        switch (id) {
            case 'clipboard-history':
                await clipboardHistoryWindow.toggle();
                break;
        }
    }

    const handleTrigger = async (action: KeyboardAction) => {
        const {target, targetId} = action;

        switch (target) {
            case "window":
                await handleWindow(targetId);
                break;
            default:
                console.error(`Unknown target ${target}`);
        }
    }

    const updateSettings = (settings: KeyboardSettings) => {
        const {shortcuts} = settings;

        globalShortcut.unregisterAll();

        Object.keys(shortcuts).forEach(accelerator => {
            const action = shortcuts[accelerator];

            if (globalShortcut.isRegistered(accelerator)) {
                console.log(`[keyboard-shortcut] accelerator "${accelerator}" already registered`, {action})
            } else {
                const success = globalShortcut.register(accelerator, () => {
                    console.log(`[keyboard-shortcut] Trigger accelerator "${accelerator}"`, {action});
                    handleTrigger(action);
                });

                // log success
                if (success) {
                    console.log(`[keyboard-shortcut] Successfully registered accelerator "${accelerator}"`, {action})
                } else {
                    console.log(`[keyboard-shortcut] Unable to register accelerator "${accelerator}"`, {action})
                }
            }
        });
    }

    return {
        initialize: async () => {
            // Handle updated settings
            eventHandler.listen<SettingsUpdatedEventData<KeyboardSettings>>(
                settingsUpdatedEventName,
                ({
                     settingName,
                     updatedSettings
                 }) => {
                    if (settingName === 'keyboard') {
                        updateSettings(updatedSettings);
                    }
                })

            // Initialize settings
            const settings = keyboardSettings.getSettings();
            updateSettings(settings);
        }
    };
}

export const keyboardShortcuts: KeyboardShortcuts = createKeyboardShortcuts();