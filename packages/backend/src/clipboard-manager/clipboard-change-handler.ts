import {clipboardHistorySettings} from "../settings/clipboard-history.setting";
import {ClipboardChangeEventEmitter} from "./clipboard-change-event-emitter";

export const clipboardChangeHandler = (() => {
    const emitter = new ClipboardChangeEventEmitter();

    return {
        initialize: async () => {
            emitter.on('*', async (newItem) => {
                const settings = clipboardHistorySettings.getSettings();
                const {clipboardHistory} = settings;
                const [currentClipboardHistoryItem = undefined] = clipboardHistory;

                if (newItem.hash !== currentClipboardHistoryItem?.hash) {
                    console.time('Add to clipboard');

                    const cleanedClipboardHistory = clipboardHistory.filter(({hash}, index) => {
                        return hash !== newItem.hash && index < 101
                    });

                    console.timeLog('Add to clipboard', 'cleaned');

                    await clipboardHistorySettings.updateSettings({
                        ...settings,
                        clipboardHistory: [
                            newItem,
                            ...cleanedClipboardHistory
                        ]
                    });

                    console.timeEnd('Add to clipboard');
                }
            });
        }
    }
})();