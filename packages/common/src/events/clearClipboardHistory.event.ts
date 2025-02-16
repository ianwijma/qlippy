import {ClipboardItemHash} from "../settings/clipboard.settings.types";

export const clearClipboardHistoryEventName = 'clearClipboardHistory';

export type ClearClipboardHistoryEventData = {
    hashes: ClipboardItemHash[];
};