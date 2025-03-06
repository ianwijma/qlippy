import {confirmDialog} from "../windows/dialog.window";
import {keyboardSettings} from "../settings/keyboard.setting";
import {clipboardSettings} from "../settings/clipboard.setting";
import {clipboardManager} from "../clipboard/manager";

export const resetAllSettings = async () => {
    const {confirmed} = await confirmDialog.open({
        title: 'Reset all settings',
        message: 'Are you sure you want to reset all settings?',
    })

    if (confirmed) {
        await keyboardSettings.resetSettings();
        // TODO: Replace with a function that just removes all the settings & files.
        await clipboardManager.removeAll();
        await clipboardSettings.resetSettings();
    }
}