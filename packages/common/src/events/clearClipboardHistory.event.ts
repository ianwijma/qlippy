import {ClipboardHistoryItemHashId} from "../settings/clipboard-history.settings.types";

export const clearClipboardHistoryEventName = 'clearClipboardHistory';

export type ClearClipboardHistoryEventData = {
    ids: ClipboardHistoryItemHashId[];
};