import {clipboardSettings} from "../settings/clipboard.setting";
import {ClipboardChangeEventEmitter} from "./clipboard-change-event-emitter";
import {nanoid} from "nanoid";

const CLIPBOARD_AMOUNT_LIMIT = 1000;

export const clipboardChangeHandler = (() => {
    const emitter = new ClipboardChangeEventEmitter();

    return {
        initialize: async () => {
            emitter.on('*', async (newItem) => {
                const settings = clipboardSettings.getSettings();
                const {history, historyIdToItemHash, items} = settings;
                const [firstItemId = undefined] = history;
                const firstItemHash = historyIdToItemHash[firstItemId];

                if (newItem.hash !== firstItemHash) {
                    console.time('Add to clipboard');

                    const historyId = nanoid();

                    // Add the item's id to the beginning of the history
                    history.unshift(historyId);

                    // Add item to has idToHashMap
                    historyIdToItemHash[historyId] = newItem.hash;

                    // Add the item to the clipboard itself
                    if (newItem.hash in items) {
                        items[newItem.hash].dateTimeUpdated = Date.now();
                    } else {
                        items[newItem.hash] = newItem;
                    }


                    // Check if we're over our hard limit;
                    while (history.length > CLIPBOARD_AMOUNT_LIMIT) {
                        const removedId = history.pop();
                        const removeHash = historyIdToItemHash[removedId];

                        // Only remove if there are no hash reference anymore
                        if (!Object.values(historyIdToItemHash).includes(removeHash)) {
                            delete items[removeHash];
                        }

                        // remove from history
                        delete historyIdToItemHash[removedId];
                    }

                    console.timeLog('Add to clipboard', 'cleaned');

                    await clipboardSettings.updateSettings({
                        ...settings,
                        history: history,
                        historyIdToItemHash: historyIdToItemHash,
                        items: items
                    });

                    console.timeEnd('Add to clipboard');
                }
            });
        }
    }
})();