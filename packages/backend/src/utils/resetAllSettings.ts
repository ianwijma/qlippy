import {confirmDialog} from "../windows/dialog.window";
import {keyboardSettings} from "../settings/keyboard.setting";
import {clipboardHistorySettings} from "../settings/clipboard-history.setting";

export const resetAllSettings = async () => {
    const {confirmed} = await confirmDialog.open({
        title: 'Reset all settings',
        message: 'Are you sure you want to reset all settings?',
    })

    if (confirmed) {
        await keyboardSettings.resetSettings();
        await clipboardHistorySettings.resetSettings();
    }
}