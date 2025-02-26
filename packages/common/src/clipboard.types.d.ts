export type ClipboardType = 'image' | 'html' | 'path' | 'url' | 'colour' | 'text';
export type ClipboardHash = string;
export type ClipboardBaseData = {
    value: string;
    hash: ClipboardHash;
}

export type ImageClipboardData = ClipboardBaseData & {
    type: 'image';
    metadata: {
        aspectRadio: number;
        size: {
            width: number;
            height: number;
        };
    }
}

export type HtmlClipboardData = ClipboardBaseData & {
    type: 'html';
    metadata: {
        length: number;
        text: string;
        textLength: number;
    }
}

export type PathClipboardData = ClipboardBaseData & {
    type: 'path';
    metadata: {
        length: number;
        text: string; // The original text
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
}

export type UrlClipboardData = ClipboardBaseData & {
    type: 'url';
    metadata: {
        length: number;
        text: string; // The original text
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
}

export type ColourClipboardData = ClipboardBaseData & {
    type: 'colour';
    metadata: {
        text: string;
        isHex: boolean;
        isShortHex: boolean;
        isTransparentHex: boolean;
    }
}

export type TextClipboardData = ClipboardBaseData & {
    type: 'text';
    metadata: {
        length: number;
    }
}

export type ClipboardData = ImageClipboardData
    | HtmlClipboardData
    | PathClipboardData
    | UrlClipboardData
    | ColourClipboardData
    | TextClipboardData;