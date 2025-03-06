import {NativeImage} from "electron";
import {
    ClipboardBaseItem,
    ClipboardItemHash,
    ColourClipboardItem,
    HtmlClipboardItem,
    ImageClipboardItem,
    PathClipboardItem,
    TextClipboardItem,
    UrlClipboardItem
} from "@qlippy/common/src/settings/clipboard.settings.types";
import {nanoid} from "nanoid";
import type {Stats} from "node:fs";

type GetBaseProps = {
    hash: ClipboardItemHash
}
const getBase = ({hash}: GetBaseProps): ClipboardBaseItem => ({
    id: nanoid(),
    hash,
    dateTimeCreated: Date.now(),
});

type ConverterType<Base extends Record<string, any>> = Base & {
    hash: string,
}

export const nativeImageToImageClipboardItem = ({image, hash}: ConverterType<{image: NativeImage}>): ImageClipboardItem => {
    const imageSize = image.getSize();
    return {
        type: 'image',
        imageFilePath: undefined,
        ...getBase({ hash }),
        aspectRatio: image.getAspectRatio(),
        size: {
            width: imageSize.width,
            height: imageSize.height
        },
    }
};

const HEX_COLOUR_SHORT_REGEX = /^#?([0-9A-F]{3}){1,2}$/i;
const HEX_COLOUR_REGEX = /^#?[0-9A-F]{6}$/i;
const HEX_COLOUR_TRANSPARENT_REGEX = /^#?[0-9A-F]{6}[0-9a-f]{0,2}$/i;

export const isTextAColour = (text: string) => {
    const colour = text.trim();
    const isShortHex = HEX_COLOUR_SHORT_REGEX.test(colour);
    const isHex = HEX_COLOUR_REGEX.test(colour);
    const isTransparentHex = HEX_COLOUR_TRANSPARENT_REGEX.test(colour);
    return isHex || isShortHex || isTransparentHex;
}

export const textToColourClipboardItem = ({text, hash}: ConverterType<{text: string}>): ColourClipboardItem => {
    let colour = text.trim();

    const isHex = HEX_COLOUR_REGEX.test(colour);
    const isShortHex = HEX_COLOUR_SHORT_REGEX.test(colour);
    const isTransparentHex = HEX_COLOUR_TRANSPARENT_REGEX.test(colour);


    if (!colour.startsWith('#') && (isHex || isShortHex || isTransparentHex)) {
        colour = `#${colour}`;
    }

    return {
        type: 'colour',
        colour,
        colourText: text,
        ...getBase({ hash }),
        isHex,
        isShortHex,
        isTransparentHex,
    }
}

export const htmlToHtmlClipboardItem = ({html, htmlText, hash}: ConverterType<{html: string, htmlText: string}>): HtmlClipboardItem => {
    return {
        type: 'html',
        html,
        ...getBase({ hash }),
        length: html.length,
        htmlText,
        htmlTextLength: htmlText.length,
    }
}

export const textToPathClipboardItem = ({ text, stats, hash }: ConverterType<{ text: string, stats: Stats }>): PathClipboardItem => {
    const path = text.trim();
    return {
        type: 'path',
        path,
        ...getBase({ hash }),
        length: path.length,
        isBlockDevice: stats.isBlockDevice(),
        isCharacterDevice: stats.isCharacterDevice(),
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        isFIFO: stats.isFIFO(),
        isSocket: stats.isSocket(),
        isSymbolicLink: stats.isSymbolicLink(),
        deviceId: stats.rdev, // rdev
        deviceFileId: stats.dev, // dev
        inode: stats.ino, // ino
        mode: stats.mode,
        amountOfHardlinks: stats.nlink, //nlink
        userId: stats.uid,
        groupId: stats.gid,
        size: stats.size,
        blockSizeIO: stats.blksize, // blksize
        blockSize: stats.blocks, // blocks
        lastAccessedMs: stats.atimeMs, // atimeMs
        lastModifiedMs: stats.mtimeMs, // mtimeMs
        statusChangedMs: stats.ctimeMs, // ctimeMs
        createdMs: stats.birthtimeMs, // birthtimeMs
    }
}

export const isTextAUrl = (text: string): URL | false => {
    const url = text.trim();
    try {
        return new URL(url)
    } catch (e) {
        return false;
    }
}

export const textToUrlClipboardItem = ({text, url, hash}: ConverterType<{text: string, url: URL}>): UrlClipboardItem => {
    const urlString = text.trim();
    return {
        type: 'url',
        url: urlString,
        imageFilePath: undefined,
        ...getBase({ hash }),
        length: urlString.length,
        hash: url.hash,
        host: url.host,
        hostname: url.hostname,
        href: url.href,
        origin: url.origin,
        password: url.password,
        pathname: url.pathname,
        port: url.port,
        protocol: url.protocol,
        search: url.search,
        searchParams: Object.fromEntries(url.searchParams.entries()),
        username: url.username,
    }
}

export const textToTextClipboardItem = ({text, hash}: ConverterType<{ text: string }>): TextClipboardItem => {
    return {
        type: 'text',
        text,
        ...getBase({ hash }),
        length: text.length,
    }
}