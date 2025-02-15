import {eventHandler} from "../utils/eventHandler";
import {clipboardHistorySettings} from "../settings/clipboard-history.setting";
import {confirmDialog} from "../windows/dialog.window";
import {
    clearClipboardHistoryEventName, ClearClipboardHistoryEventData
} from "@qlippy/common/src/events/clearClipboardHistory.event";

export const clipboardClearHandler = (() => {
    return {
        initialize: async () => {
            eventHandler.listen<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, async ({hashes}) => {
                const settings = clipboardHistorySettings.getSettings();
                const {clipboardHistory} = settings;

                if (hashes.length > 1) {
                    const {confirmed} = await confirmDialog.open({
                        title: 'Confirm',
                        message: `You're about to remove ${hashes.length} items, are you sure?`,
                    });

                    if (!confirmed) return; // Stop it
                }

                await clipboardHistorySettings.updateSettings({
                    ...settings,
                    clipboardHistory: clipboardHistory.filter(({hash}) => !hashes.includes(hash))
                })
            });
        }
    }
})()