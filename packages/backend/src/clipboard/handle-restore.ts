import {eventHandler} from "../utils/eventHandler";
import {
    restoreClipboardHistoryEventName, RestoreClipboardHistoryEventData
} from "@qlippy/common/src/events/restoreClipboardHistory.event";
import {
    restoreImageClipboardHistoryEventName, RestoreImageClipboardHistoryEventData
} from "@qlippy/common/src/events/restoreImageClipboardHistory.event";
import {clipboardManager} from "./manager";

const createClipboardHandleRestore = () => {
    return {
        initialize: async (): Promise<void> => {
            eventHandler.listen<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, async ({id}) => {
                const item = clipboardManager.getById(id);
                if (item) {
                    await clipboardManager.restore(item);
                }
            });

            eventHandler.listen<RestoreImageClipboardHistoryEventData>(restoreImageClipboardHistoryEventName, async ({id}) => {
                const item = clipboardManager.getById(id);
                if (item && 'imageFilePath' in item && !!item.imageFilePath) {
                    await clipboardManager.restoreImage(item.imageFilePath);
                }
            });
        }
    }
}

export const clipboardHandleRestore = createClipboardHandleRestore()