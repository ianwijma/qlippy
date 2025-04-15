import {ClipboardId} from "../settings/clipboard.settings.types";

export const restoreImageClipboardHistoryEventName = 'restoreImageClipboardHistory';

export type RestoreImageClipboardHistoryEventData = {
    id: ClipboardId;
};