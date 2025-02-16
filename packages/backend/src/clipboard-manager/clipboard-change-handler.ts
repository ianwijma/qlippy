import {clipboardSettings} from "../settings/clipboard.setting";
import {ClipboardChangeEventEmitter} from "./clipboard-change-event-emitter";

const CLIPBOARD_AMOUNT_LIMIT = 100;

export const clipboardChangeHandler = (() => {
    const emitter = new ClipboardChangeEventEmitter();

    return {
        initialize: async () => {
            emitter.on('*', async (newItem) => {
                const settings = clipboardSettings.getSettings();
                const {clipboardHistory, clipboardItems} = settings;
                const [firstClipboardHistoryHash = undefined] = clipboardHistory;

                if (newItem.hash !== firstClipboardHistoryHash) {
                    console.time('Add to clipboard');

                    // Add the item's hash to the beginning of the history
                    clipboardHistory.unshift(newItem.hash);

                    // Add the item to the clipboard itself
                    clipboardItems[newItem.hash] = newItem

                    // Check if we're over our hard limit;
                    while (clipboardHistory.length > CLIPBOARD_AMOUNT_LIMIT) {
                        const removedHash = clipboardHistory.pop();
                        delete clipboardItems[removedHash];
                    }

                    console.timeLog('Add to clipboard', 'cleaned');

                    await clipboardSettings.updateSettings({
                        ...settings,
                        clipboardHistory,
                        clipboardItems
                    });

                    console.timeEnd('Add to clipboard');
                }
            });
        }
    }
})();