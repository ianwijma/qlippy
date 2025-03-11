import {ClipboardId} from "../settings/clipboard.settings.types";

export const openClipboardHistoryEventName = 'openClipboardHistory';

export type OpenClipboardHistoryAction = 'url' | 'file';

export type OpenClipboardHistoryEventData = {
    id: ClipboardId;
    action: OpenClipboardHistoryAction
};