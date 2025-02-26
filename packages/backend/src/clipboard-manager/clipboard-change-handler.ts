import {clipboardSettings} from "../settings/clipboard.setting";
import {ClipboardChangeEventEmitter} from "./clipboard-change-event-emitter";

const CLIPBOARD_AMOUNT_LIMIT = 100;

export const clipboardChangeHandler = (() => {
    const emitter = new ClipboardChangeEventEmitter();

    return {
        initialize: async () => {
            emitter.on('*', async (newItem) => {
                const settings = clipboardSettings.getSettings();
                const {history, idToHashMap, items} = settings;
                const [firstHistoryItemId = undefined] = history;

                if (newItem.id !== firstHistoryItemId) {
                    console.time('Add to clipboard');

                    // Add the item's id to the beginning of the history
                    history.unshift(newItem.id);

                    // Add item to has idToHashMap
                    idToHashMap[newItem.id] = newItem.hash;

                    // Add the item to the clipboard itself
                    items[newItem.hash] = newItem

                    // Check if we're over our hard limit;
                    while (history.length > CLIPBOARD_AMOUNT_LIMIT) {
                        const removedId = history.pop();
                        const removeHash = idToHashMap[removedId];
                        delete items[removedId];
                        delete idToHashMap[removeHash];
                    }

                    console.timeLog('Add to clipboard', 'cleaned');

                    await clipboardSettings.updateSettings({
                        ...settings,
                        history: history,
                        items: items
                    });

                    console.timeEnd('Add to clipboard');
                }
            });
        }
    }
})();