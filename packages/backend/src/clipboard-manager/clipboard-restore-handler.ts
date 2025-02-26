import {eventHandler} from "../utils/eventHandler";
import {clipboardSettings} from "../settings/clipboard.setting";
import {clipboard, nativeImage} from "electron";
import {
    restoreClipboardHistoryEventName, RestoreClipboardHistoryEventData
} from "@qlippy/common/src/events/restoreClipboardHistory.event";

export const clipboardRestoreHandler = (() => {
    return {
        initialize: async () => {
            eventHandler.listen<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, async ({id}) => {
                const settings = clipboardSettings.getSettings();
                const {history, historyIdToItemHash, items} = settings;

                const [targetId = undefined] = history.filter((itemId) => itemId === id);
                if (targetId) {
                    const targetHash = historyIdToItemHash[targetId];
                    if (targetHash in items) {
                        const clipboardItem = items[targetHash];

                        // Remove from history
                        const index = history.indexOf(id);
                        if (index) history.splice(index, 1);

                        await clipboardSettings.updateSettings({
                            ...settings,
                            history: history
                        });

                        const {type} = clipboardItem;
                        switch (type) {
                            case 'colour':
                            case 'url':
                            case 'path': {
                                const {metadata: { text }} = clipboardItem;
                                clipboard.writeText(text, 'clipboard');
                            }
                                break;
                            case 'text': {
                                const {value} = clipboardItem;
                                clipboard.writeText(value, 'clipboard');
                            }
                                break;
                            case 'html': {
                                const {value, metadata: { text }} = clipboardItem;
                                clipboard.write({
                                    text,
                                    html: value
                                }, 'clipboard');
                            }
                                break;
                            case 'image': {
                                const {value} = clipboardItem;
                                const imageNative = nativeImage.createFromDataURL(value);
                                clipboard.writeImage(imageNative, 'clipboard');
                            }
                                break;
                        }
                    }
                }
            });
        }
    }
})()