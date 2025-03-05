import {eventHandler} from "../utils/eventHandler";
import {confirmDialog} from "../windows/dialog.window";
import {
    clearClipboardHistoryEventName, ClearClipboardHistoryEventData
} from "@qlippy/common/src/events/clearClipboardHistory.event";
import {clipboardManager} from "./manager";

const createClipboardHandleClear = () => {
    return {
        initialize: async (): Promise<void> => {
            eventHandler.listen<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, async ({ids}) => {
                if (ids.length > 1) {
                    const {confirmed} = await confirmDialog.open({
                        title: 'Confirm',
                        message: `You're about to remove ${ids.length} items, are you sure?`,
                    });

                    if (!confirmed) return; // Stop it
                }

                const items = ids.map((id) => clipboardManager.getById(id));

                await clipboardManager.removeMultiple(items);
            });
        }
    }
}

export const clipboardHandleClear = createClipboardHandleClear()