import {ClipboardItemHash} from "../settings/clipboard.settings.types";

export const restoreClipboardHistoryEventName = 'restoreClipboardHistory';

export type RestoreClipboardHistoryEventData = {
    hash: ClipboardItemHash;
};