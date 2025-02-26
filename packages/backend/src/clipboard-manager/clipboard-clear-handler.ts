import {eventHandler} from "../utils/eventHandler";
import {clipboardSettings} from "../settings/clipboard.setting";
import {confirmDialog} from "../windows/dialog.window";
import {
    clearClipboardHistoryEventName, ClearClipboardHistoryEventData
} from "@qlippy/common/src/events/clearClipboardHistory.event";

export const clipboardClearHandler = (() => {
    return {
        initialize: async () => {
            eventHandler.listen<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, async ({ids}) => {
                const settings = clipboardSettings.getSettings();
                const {history, idToHashMap, items} = settings;

                if (ids.length > 1) {
                    const {confirmed} = await confirmDialog.open({
                        title: 'Confirm',
                        message: `You're about to remove ${ids.length} items, are you sure?`,
                    });

                    if (!confirmed) return; // Stop it
                }

                // Cleanup the history and items;
                const {historyNew, itemsNew} = ids.reduce(({historyNew, itemsNew}, id) => {
                    // Remove from history
                    const index = historyNew.indexOf(id);
                    if (index) historyNew.splice(index, 1);

                    // Only remove if there are no hash reference anymore
                    const hash = idToHashMap[id];
                    if (!Object.values(idToHashMap).includes(hash)) {
                        delete itemsNew[hash];
                    }

                    // remove from clipboard
                    delete idToHashMap[id];

                    return {historyNew, itemsNew}
                }, { historyNew: history, itemsNew: items });

                await clipboardSettings.updateSettings({
                    ...settings,
                    history: historyNew,
                    items: itemsNew
                })
            });
        }
    }
})()