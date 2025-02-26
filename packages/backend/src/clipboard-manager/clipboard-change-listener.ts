import {clipboard} from "electron";
import fs from 'node:fs/promises'
import type {Stats} from 'node:fs'
import {createHash} from "node:crypto";
import EventEmitter from "node:events";
import {ClipboardData, ClipboardHash, ClipboardType} from "@qlippy/common/src/clipboard.types";
import {fileExists, writeFile} from "../utils/files";
import { join as pathJoin } from 'node:path'
import {sleep} from "../utils/sleep";
import {nanoid} from "nanoid";

const CLIPBOARD_CHECK_INTERVAL_MS = 250;

const CLIPBOARD_STORAGE_PATH = 'clipboard-files';

const HEX_COLOUR_SHORT_REGEX = /^#([0-9A-F]{3}){1,2}$/i;
const HEX_COLOUR_REGEX = /^#[0-9A-F]{6}$/i;
const HEX_COLOUR_TRANSPARENT_REGEX = /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i;

const getPathStats = async (path: string): Promise<Stats | false> => {
    return fs.stat(path).catch(() => false);
}

const getUrl = (url: string): URL | false => {
    try {
        return new URL(url);
    } catch (e) {
        return false;
    }
}

const sha1 = (input: any): string => {
    const hash = createHash('SHA1');
    hash.write(input);
    return hash.digest('hex');
}

// Singleton instance that listens to clipboard changes.
export const clipboardChangeListener = (() => {
    const eventEmitter = new EventEmitter();
    const emit = (data: ClipboardData) => eventEmitter.emit<ClipboardData>('change', data)

    let isScanningClipboard: boolean = false;

    const clipboardHashMap = new Map<ClipboardType, ClipboardHash>();
    const updateHash = (name: ClipboardType, hash: ClipboardHash): void => {
        clipboardHashMap.set(name, hash);
    };
    const isHashDifferent = (name: ClipboardType, hash: ClipboardHash): boolean => {
        return clipboardHashMap.get(name) !== hash;
    }

    const scanClipboard = async () => {
        // First we're getting the image, because HTML can contain the HTML version of an image.
        const image = clipboard.readImage('clipboard');
        if (!image.isEmpty()) {
            image.getScaleFactors()

            const imageBitmap = image.getBitmap();
            const imageHash = sha1(imageBitmap);

            if (isHashDifferent('image', imageHash)) {
                updateHash('image', imageHash);

                const filePath = pathJoin(CLIPBOARD_STORAGE_PATH, `${imageHash}.png`);
                let fileStoragePath = await fileExists(filePath);
                if (!fileStoragePath) {
                    const imageJpeg = image.toPNG();
                    fileStoragePath = await writeFile(filePath, imageJpeg);
                }

                emit({
                    id: nanoid(),
                    type: 'image',
                    value: fileStoragePath,
                    hash: imageHash,
                    metadata: {
                        aspectRadio: image.getAspectRatio(),
                        size: image.getSize(),
                    }
                })
            }

            return; // Is handle
        }

        // We're getting the text, for colour checking, as some colours are copied from an IDE, which involves HTML, we need to first check for colours.
        const text = clipboard.readText('clipboard');

        const colourText = text.trim();
        const isShortHex = HEX_COLOUR_SHORT_REGEX.test(colourText);
        const isHex = HEX_COLOUR_REGEX.test(colourText);
        const isTransparentHex = HEX_COLOUR_TRANSPARENT_REGEX.test(colourText);
        if (isHex || isShortHex || isTransparentHex) {
            const colourTextHash = sha1(colourText);
            if (isHashDifferent('text', colourTextHash)) {
                updateHash('text', colourTextHash);

                emit({
                    id: nanoid(),
                    type: 'colour',
                    value: colourText,
                    hash: colourTextHash,
                    metadata: {
                        text,
                        isHex,
                        isShortHex,
                        isTransparentHex
                    }
                })
            }

            return; // Is Handled
        }

        // We're getting the HTML, as HTML also contains the text in the HTML.
        const html = clipboard.readHTML('clipboard');
        if (html.trim() !== '') {
            const htmlHash = sha1(html);
            if (isHashDifferent('html', htmlHash)) {
                updateHash('html', htmlHash);

                // Getting the text extracted from the HTML;
                const htmlText = clipboard.readText('clipboard');

                emit({
                    id: nanoid(),
                    type: 'html',
                    value: html,
                    hash: htmlHash,
                    metadata: {
                        length: html.length,
                        text: htmlText,
                        textLength: htmlText.length
                    }
                })
            }

            return; // Is handle
        }

        // Text check we're checking if it contains a local path.
        const path = text.trim();
        const pathStats = path !== '' && await getPathStats(path);
        if (pathStats) {
            pathStats.atime
            const pathHash = sha1(path); // TODO: maybe change this to a sha1 from a file?
            if (isHashDifferent('path', pathHash)) {
                updateHash('path', pathHash)

                emit({
                    id: nanoid(),
                    type: 'path',
                    value: path,
                    hash: pathHash,
                    metadata: {
                        text,
                        length: path.length,
                        isBlockDevice: pathStats.isBlockDevice(),
                        isCharacterDevice: pathStats.isCharacterDevice(),
                        isDirectory: pathStats.isDirectory(),
                        isFile: pathStats.isFile(),
                        isFIFO: pathStats.isFIFO(),
                        isSocket: pathStats.isSocket(),
                        isSymbolicLink: pathStats.isSymbolicLink(),
                        deviceId: pathStats.rdev, // rdev
                        deviceFileId: pathStats.dev, // dev
                        inode: pathStats.ino, // ino
                        mode: pathStats.mode,
                        amountOfHardlinks: pathStats.nlink, //nlink
                        userId: pathStats.uid,
                        groupId: pathStats.gid,
                        size: pathStats.size,
                        blockSizeIO: pathStats.blksize, // blksize
                        blockSize: pathStats.blocks, // blocks
                        lastAccessedMs: pathStats.atimeMs, // atimeMs
                        lastModifiedMs: pathStats.mtimeMs, // mtimeMs
                        statusChangedMs: pathStats.ctimeMs, // ctimeMs
                        createdMs: pathStats.birthtimeMs, // birthtimeMs
                    }
                })
            }

            return; // Is handle
        }

        // Text check we're checking if it contains a valid URL.
        const possibleUrl = text.trim();
        const url = possibleUrl !== '' && getUrl(possibleUrl);
        if (url) {
            const urlString = url.toString();
            const urlStringHash = sha1(urlString);
            if (isHashDifferent('url', urlStringHash)) {
                updateHash('url', urlStringHash);

                emit({
                    id: nanoid(),
                    type: 'url',
                    value: urlString,
                    hash: urlStringHash,
                    metadata: {
                        text,
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
                        searchParams: url.search ? JSON.parse('{"' + decodeURI(url.search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}') : {},
                        username: url.username,
                    }
                })
            }

            return; // Is handle
        }


        // Text check we're checking if is not empty.
        if (text.trim() !== '') {
            const textHash = sha1(text);
            if (isHashDifferent('text', textHash)) {
                updateHash('text', textHash);

                emit({
                    id: nanoid(),
                    type: 'text',
                    value: text,
                    hash: textHash,
                    metadata: {
                        length: text.length
                    }
                })
            }

            return; // Is handle
        }

        console.log('[clipboard-change-listener] Unknown clipboard change.')
    };

    return {
        initialize: async () => {
            if (!isScanningClipboard) {
                isScanningClipboard = true;

                // So it does not block the main thread... LOL
                (async () => {
                    while (isScanningClipboard) {
                        await scanClipboard();

                        await sleep(CLIPBOARD_CHECK_INTERVAL_MS);
                    }
                })().catch(console.error);
            }
        },
        onChange: (callback: (data: ClipboardData) => void) => eventEmitter.on('change', callback)
    }
})()