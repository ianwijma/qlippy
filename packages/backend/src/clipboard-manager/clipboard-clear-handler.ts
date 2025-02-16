import {eventHandler} from "../utils/eventHandler";
import {clipboardSettings} from "../settings/clipboard.setting";
import {confirmDialog} from "../windows/dialog.window";
import {
    clearClipboardHistoryEventName, ClearClipboardHistoryEventData
} from "@qlippy/common/src/events/clearClipboardHistory.event";

export const clipboardClearHandler = (() => {
    return {
        initialize: async () => {
            eventHandler.listen<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, async ({hashes}) => {
                const settings = clipboardSettings.getSettings();
                const {clipboardHistory, clipboardItems} = settings;

                if (hashes.length > 1) {
                    const {confirmed} = await confirmDialog.open({
                        title: 'Confirm',
                        message: `You're about to remove ${hashes.length} items, are you sure?`,
                    });

                    if (!confirmed) return; // Stop it
                }

                // Cleanup the history and items;
                const {history, items} = hashes.reduce(({history, items}, hash) => {
                    // Remove from history
                    const index = history.indexOf(hash);
                    if (index) history.splice(index, 1);

                    // remove from clipboard
                    delete items[hash];

                    return {history, items}
                }, { history: clipboardHistory, items: clipboardItems });

                await clipboardSettings.updateSettings({
                    ...settings,
                    clipboardHistory: history,
                    clipboardItems: items
                })
            });
        }
    }
})()