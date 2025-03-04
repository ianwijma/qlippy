// TODO: Migrate functionality to clipboard manager

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
                const {history, historyIdToItemHash, items} = settings;

                if (ids.length > 1) {
                    const {confirmed} = await confirmDialog.open({
                        title: 'Confirm',
                        message: `You're about to remove ${ids.length} items, are you sure?`,
                    });

                    if (!confirmed) return; // Stop it
                }

                // Cleanup the history and items;
                const {historyNew, idToHashMapNew, itemsNew} = ids.reduce(({historyNew, idToHashMapNew, itemsNew}, id) => {
                    // Remove from history
                    const index = historyNew.indexOf(id);
                    if (index !== -1) historyNew.splice(index, 1);

                    // Grab the hash using the ID
                    const hash = idToHashMapNew[id];

                    // remove from id to hash map
                    delete idToHashMapNew[id];

                    // Only remove if there are no hash reference anymore
                    if (!Object.values(idToHashMapNew).includes(hash)) {
                        delete itemsNew[hash];
                    }

                    return {historyNew, idToHashMapNew, itemsNew}
                }, { historyNew: history, idToHashMapNew: historyIdToItemHash, itemsNew: items });

                await clipboardSettings.updateSettings({
                    ...settings,
                    history: historyNew,
                    historyIdToItemHash: idToHashMapNew,
                    items: itemsNew
                })
            });
        }
    }
})()