import {ClipboardHistoryItemHashId} from "../settings/clipboard-history.settings.types";

export const restoreClipboardHistoryEventName = 'restoreClipboardHistory';

export type RestoreClipboardHistoryEventData = {
    clipboardHistoryItemHashId: ClipboardHistoryItemHashId;
};