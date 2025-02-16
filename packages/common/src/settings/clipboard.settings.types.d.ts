import {BaseSettings} from "../settings.types";
import {ClipboardData, ClipboardHash, ClipboardType} from "../clipboard.types";

export type ClipboardItemHash = ClipboardHash;
export type ClipboardItemTypes = ClipboardType;
export type ClipboardItem = ClipboardData;

export type ClipboardHistory = ClipboardItemHash[];
export type ClipboardItems = {[key: ClipboardItemHash]: ClipboardItem};

export type ClipboardSettings = BaseSettings & {
    clipboardHistory: ClipboardHistory;
    clipboardItems: ClipboardItems;
};