import {BaseSettings} from "../settings.types";

export type ClipboardHistoryItemHashId = string; // Items main hash
export type ClipboardHistoryItemTypes = 'text' | 'html' | 'image'
export type BaseClipboardHistoryItem = {
    type: ClipboardHistoryItemTypes;
    id: ClipboardHistoryItemHashId;
}

export type ClipboardHistoryItemText = BaseClipboardHistoryItem & {
    type: 'text';
    text: string;
    textHash: string;
}
export type ClipboardHistoryItemHtml = BaseClipboardHistoryItem & {
    type: 'html';
    html: string;
    htmlHash: string;
    text: string;
    textHash: string;
}
export type ClipboardHistoryItemImage = BaseClipboardHistoryItem & {
    type: 'image';
    image: string;
    imageHash: string;
}

export type ClipboardHistoryItems = ClipboardHistoryItemText | ClipboardHistoryItemHtml | ClipboardHistoryItemImage

export type ClipboardHistorySettings = BaseSettings & {
    clipboardHistory: ClipboardHistoryItems[];
};