import {BaseSettings} from "../settings.types";
import {ClipboardData, ClipboardHash, ClipboardType} from "../clipboard.types";

export type ClipboardHistoryItemHash = ClipboardHash;
export type ClipboardHistoryItemTypes = ClipboardType;
export type ClipboardHistoryItem = ClipboardData;

export type ClipboardHistorySettings = BaseSettings & {
    clipboardHistory: ClipboardData[];
};