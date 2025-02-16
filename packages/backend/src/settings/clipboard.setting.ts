import {createSettings} from "./createSettings";
import {
    ClipboardItemHash,
    ClipboardSettings,
    ClipboardItems, ClipboardItem
} from "@qlippy/common/src/settings/clipboard.settings.types";
import zlib from "node:zlib";
import {Buffer} from "node:buffer";
import {promisify} from 'node:util';

const compressPromiseFn = promisify(zlib.deflate);
const decompressPromiseFn = promisify(zlib.inflate);

const compress = async (input: string) => {
    const buffer = Buffer.from(input);
    const compressed = await compressPromiseFn(buffer);
    return compressed.toString('base64');
}

const decompress = async (input: string) => {
    const buffer = Buffer.from(input, 'base64');
    const decompressed = await decompressPromiseFn(buffer);
    return decompressed.toString();
}

const createSaveLoadFn = (name: 'compress' | 'decompress'): (data: ClipboardSettings) => Promise<ClipboardSettings> => {
    const compressDecompressFn = name === 'compress' ? compress : decompress;

    return async (settings) => {
        const {clipboardItems} = settings;

        console.time(name);

        const compressedClipboardItems: ClipboardItems = {};
        await Promise.all(Object.keys(clipboardItems).map(async (hash: ClipboardItemHash) => {
            const item = clipboardItems[hash];
            const { type } = item;
            if (type === 'text' && item.metadata.length > 1000) {
                compressedClipboardItems[hash] = {
                    ...item,
                    value: await compressDecompressFn(item.value),
                };
            } else if (type === 'html' && item.metadata.length > 1000) {
                compressedClipboardItems[hash] = {
                    ...item,
                    value: await compressDecompressFn(item.value),
                    metadata: {
                        ...item.metadata,
                        text: await compressDecompressFn(item.metadata.text),
                    }
                }
            } else if (type === 'image') {
                compressedClipboardItems[hash] = {
                    ...item,
                    value: await compressDecompressFn(item.value),
                }
            } else {
                compressedClipboardItems[hash] = item;
            }
        }));
        console.timeEnd(name);

        return {
            ...settings,
            clipboardItems: compressedClipboardItems
        };
    }
}

export const clipboardSettings = createSettings<ClipboardSettings>({
    name: 'clipboard',
    defaultSettings: {
        version: 1,
        clipboardHistory: [],
        clipboardItems: {},
    },
    preSaveFn: createSaveLoadFn('compress'),
    postLoadFn: createSaveLoadFn('decompress'),
});
