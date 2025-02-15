import {eventHandler} from "../utils/eventHandler";
import {clipboardHistorySettings} from "../settings/clipboard-history.setting";
import {clipboard, nativeImage} from "electron";
import {
    restoreClipboardHistoryEventName, RestoreClipboardHistoryEventData
} from "@qlippy/common/src/events/restoreClipboardHistory.event";

export const clipboardRestoreHandler = (() => {
    return {
        initialize: async () => {
            eventHandler.listen<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, async ({hash}) => {
                const settings = clipboardHistorySettings.getSettings();
                const {clipboardHistory} = settings;

                const [targetClipboardHistoryItem = undefined] = clipboardHistory.filter(({hash: itemHash}) => itemHash === hash);
                if (targetClipboardHistoryItem) {
                    const {type} = targetClipboardHistoryItem;
                    switch (type) {
                        case 'url':
                        case 'path': {
                            const {metadata: { text }} = targetClipboardHistoryItem;
                            clipboard.writeText(text, 'clipboard');
                        }
                        break;
                        case 'text': {
                            const {value} = targetClipboardHistoryItem;
                            clipboard.writeText(value, 'clipboard');
                        }
                            break;
                        case 'html': {
                            const {value} = targetClipboardHistoryItem;
                            clipboard.writeText(value, 'clipboard');
                        }
                            break;
                        case 'image': {
                            const {value} = targetClipboardHistoryItem;
                            const imageNative = nativeImage.createFromDataURL(value);
                            clipboard.writeImage(imageNative, 'clipboard');
                        }
                            break;
                    }

                    const filteredHistory = clipboardHistory.filter(({hash: itemHash}) => itemHash !== hash);
                    await clipboardHistorySettings.updateSettings({
                        ...settings,
                        clipboardHistory: [
                            targetClipboardHistoryItem,
                            ...filteredHistory
                        ]
                    })
                }
            });
        }
    }
})()