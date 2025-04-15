import {BaseSettings} from "../settings.types";

export type ClipboardItemHash = string;
export type ClipboardId = string;
export type ClipboardItemTypes = 'image' | 'html' | 'path' | 'url' | 'colour' | 'text'

export type ClipboardBaseItem = {
    // The items ID
    id: ClipboardId,

    // The items unique hash
    hash: ClipboardItemHash;

    // Created and updated fields
    dateTimeCopied: number;

    // If the item is pinned or not;
    pinned: boolean;
}

export type ClipboardImageBase = {
    imageFilePath?: string;
}

export type ImageClipboardItem = ClipboardBaseItem & ClipboardImageBase & {
    type: 'image';
    aspectRatio: number;
    width: number;
    height: number;
    size?: number;
}

export type HtmlClipboardItem = ClipboardBaseItem & {
    type: 'html';
    html: string;
    length: number;
    htmlText: string;
    htmlTextLength: number;
}

export type PathClipboardItem = ClipboardBaseItem & {
    type: 'path';
    path: string;
    length: number;
    isBlockDevice: boolean;
    isCharacterDevice: boolean;
    isDirectory: boolean;
    isFile: boolean;
    isFIFO: boolean;
    isSocket: boolean;
    isSymbolicLink: boolean;
    deviceId: number; // rdev
    deviceFileId: number; // dev
    inode: number; // ino
    mode: number;
    amountOfHardlinks: number; //nlink
    userId: number;
    groupId: number;
    size: number;
    blockSizeIO: number; // blksize
    blockSize: number; // blocks
    lastAccessedMs: number; // atimeMs
    lastModifiedMs: number; // mtimeMs
    statusChangedMs: number; // ctimeMs
    createdMs: number; // birthtimeMs
}

export type UrlClipboardItem = ClipboardBaseItem & ClipboardImageBase & {
    type: 'url';
    url: string;
    length: number;
    host: string;
    hostname: string;
    href: string;
    origin: string;
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    searchParams: Record<string, string>;
    username: string;
    screenshotStart?: number;
    screenshotEnd?: number;
    screenshotWidth?: number;
    screenshotHeight: number;
    size?: number;
}

export type ColourClipboardItem = ClipboardBaseItem & {
    type: 'colour';
    colour: string;
    colourText: string;
    isHex: boolean;
    isShortHex: boolean;
    isTransparentHex: boolean;
}

export type TextClipboardItem = ClipboardBaseItem & {
    type: 'text';
    text: string;
    length: number;
}

export type ClipboardItem = ImageClipboardItem
    | HtmlClipboardItem
    | PathClipboardItem
    | UrlClipboardItem
    | ColourClipboardItem
    | TextClipboardItem;

export type ClipboardHistory = ClipboardItem[];

export type ClipboardSettings = BaseSettings & {
    history: ClipboardHistory;
};
