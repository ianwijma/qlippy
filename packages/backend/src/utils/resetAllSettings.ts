import {confirmDialog} from "../windows/dialog.window";
import {keyboardSettings} from "../settings/keyboard.setting";
import {clipboardSettings} from "../settings/clipboard.setting";

export const resetAllSettings = async () => {
    const {confirmed} = await confirmDialog.open({
        title: 'Reset all settings',
        message: 'Are you sure you want to reset all settings?',
    })

    if (confirmed) {
        await keyboardSettings.resetSettings();
        await clipboardSettings.resetSettings();
    }
}