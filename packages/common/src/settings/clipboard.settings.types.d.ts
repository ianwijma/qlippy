import {BaseSettings} from "../settings.types";
import {ClipboardData, ClipboardHash, ClipboardType} from "../clipboard.types";

export type ClipboardItemHash = ClipboardHash;
export type ClipboardItemTypes = ClipboardType;
export type ClipboardItem = ClipboardData;
export type ClipboardHistoryId = string;

export type ClipboardHistory = ClipboardHistoryId[];
export type ClipboardHistoryIdToItemHash = {[key: ClipboardHistoryId]: ClipboardItemHash};
export type ClipboardItems = {[key: ClipboardItemHash]: ClipboardItem};

// TODO: Convert settings to a database, where you have a history table, and a table with items, index by hash, and ID. Where the hash needs to be unique for storage reasons.
export type ClipboardSettings = BaseSettings & {
    history: ClipboardHistory;
    historyIdToItemHash: ClipboardHistoryIdToItemHash;
    items: ClipboardItems;
};
