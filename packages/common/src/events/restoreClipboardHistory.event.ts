import {ClipboardHistoryId} from "../settings/clipboard.settings.types";

export const restoreClipboardHistoryEventName = 'restoreClipboardHistory';

export type RestoreClipboardHistoryEventData = {
    id: ClipboardHistoryId;
};