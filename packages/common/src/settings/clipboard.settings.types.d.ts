import {BaseSettings} from "../settings.types";
import {ClipboardData, ClipboardHash, ClipboardType, ClipboardId} from "../clipboard.types";

export type ClipboardItemHash = ClipboardHash;
export type ClipboardItemTypes = ClipboardType;
export type ClipboardItem = ClipboardData;
export type ClipboardItemId = ClipboardId;

export type ClipboardHistory = ClipboardItemId[];
export type ClipboardIdToHashMap = {[key: ClipboardItemId]: ClipboardItemHash};
export type ClipboardItems = {[key: ClipboardItemHash]: ClipboardItem};

// TODO: Convert settings to a database, where you have a history table, and a table with items, index by hash, and ID. Where the hash needs to be unique for storage reasons.
export type ClipboardSettings = BaseSettings & {
    history: ClipboardHistory;
    idToHashMap: ClipboardIdToHashMap;
    items: ClipboardItems;
};
