import {ClipboardId} from "../settings/clipboard.settings.types";

export const clearClipboardHistoryEventName = 'clearClipboardHistory';

export type ClearClipboardHistoryEventData = {
    ids: ClipboardId[];
};