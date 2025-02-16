import {eventHandler} from "../utils/eventHandler";
import {clipboardSettings} from "../settings/clipboard.setting";
import {clipboard, nativeImage} from "electron";
import {
    restoreClipboardHistoryEventName, RestoreClipboardHistoryEventData
} from "@qlippy/common/src/events/restoreClipboardHistory.event";

export const clipboardRestoreHandler = (() => {
    return {
        initialize: async () => {
            eventHandler.listen<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, async ({hash}) => {
                const settings = clipboardSettings.getSettings();
                const {clipboardHistory, clipboardItems} = settings;

                const [targetClipboardHistoryHash = undefined] = clipboardHistory.filter((itemHash) => itemHash === hash);
                if (targetClipboardHistoryHash && targetClipboardHistoryHash in clipboardItems) {
                    const clipboardItem = clipboardItems[targetClipboardHistoryHash];
                    const {type} = clipboardItem;
                    switch (type) {
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
                            const {value} = clipboardItem;
                            clipboard.writeText(value, 'clipboard');
                        }
                            break;
                        case 'image': {
                            const {value} = clipboardItem;
                            const imageNative = nativeImage.createFromDataURL(value);
                            clipboard.writeImage(imageNative, 'clipboard');
                        }
                            break;
                    }

                    // Remove from history
                    const index = clipboardHistory.indexOf(hash);
                    if (index) clipboardHistory.splice(index, 1);

                    // Add it to the front
                    clipboardHistory.unshift(hash);

                    await clipboardSettings.updateSettings({
                        ...settings,
                        clipboardHistory
                    })
                }
            });
        }
    }
})()