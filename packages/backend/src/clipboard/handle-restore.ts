import {eventHandler} from "../utils/eventHandler";
import {
    restoreClipboardHistoryEventName, RestoreClipboardHistoryEventData
} from "@qlippy/common/src/events/restoreClipboardHistory.event";
import {clipboardManager} from "./manager";

const createClipboardHandleRestore = () => {
    return {
        initialize: async (): Promise<void> => {
            eventHandler.listen<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, async ({id}) => {
                const item = clipboardManager.getById(id);
                await clipboardManager.restore(item);
            });
        }
    }
}

export const clipboardHandleRestore = createClipboardHandleRestore()