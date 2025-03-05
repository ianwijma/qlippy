import {BaseSettings} from "../settings.types";

export type ClipboardItemHash = string;
export type ClipboardId = string;
export enum ClipboardItemTypes {
    image = 'image',
    html = 'html',
    path = 'path',
    url = 'url',
    colour = 'colour',
    text = 'text',
}

export type ClipboardBaseItem = {
    // The items ID
    id: ClipboardId,

    // The items unique hash
    hash: ClipboardItemHash;

    // Created and updated fields
    dateTimeCreated: number;
    dateTimeUpdated: number;
}

export type ClipboardImageBase = {
    imageFilePath?: string;
}

export type ImageClipboardItem = ClipboardBaseItem & ClipboardImageBase & {
    type: ClipboardItemTypes.image;
    aspectRadio: number;
    size: {
        width: number;
        height: number;
    };
}

export type HtmlClipboardItem = ClipboardBaseItem & {
    type: ClipboardItemTypes.html;
    html: string;
    length: number;
    htmlText: string;
    htmlTextLength: number;
}

export type PathClipboardItem = ClipboardBaseItem & {
    type: ClipboardItemTypes.path;
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
    type: ClipboardItemTypes.url;
    url: string;
    length: number;
    hash: string;
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
}

export type ColourClipboardItem = ClipboardBaseItem & {
    type: ClipboardItemTypes.colour;
    colour: string;
    isHex: boolean;
    isShortHex: boolean;
    isTransparentHex: boolean;
}

export type TextClipboardItem = ClipboardBaseItem & {
    type: ClipboardItemTypes.text;
    text: string;
    length: number;
}

export type ClipboardItems = ImageClipboardItem
    | HtmlClipboardItem
    | PathClipboardItem
    | UrlClipboardItem
    | ColourClipboardItem
    | TextClipboardItem;

export type ClipboardHistory = ClipboardItems[];

export type ClipboardSettings = BaseSettings & {
    history: ClipboardHistory;
};
