import {createSettings} from "./createSettings";
import {ClipboardHistorySettings} from "@qlippy/common/src/settings/clipboard-history.settings.types";
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

const createSaveLoadFn = (name: 'compress' | 'decompress'): (data: ClipboardHistorySettings) => Promise<ClipboardHistorySettings> => {
    const compressDecompressFn = name === 'compress' ? compress : decompress;

    return async (settings) => {
        const {clipboardHistory} = settings;

        console.time(name);
        const compressedClipboardHistory = await Promise.all(clipboardHistory.map(async (item) => {
            const {type} = item;
            if (type === 'text' && item.metadata.length > 1000) {
                return {
                    ...item,
                    value: await compressDecompressFn(item.value),
                }
            }

            if (type === 'html' && item.metadata.length > 1000) {
                return {
                    ...item,
                    value: await compressDecompressFn(item.value),
                    metadata: {
                        ...item.metadata,
                        text: await compressDecompressFn(item.metadata.text),
                    }
                }
            }

            if (type === 'image') {
                return {
                    ...item,
                    value: await compressDecompressFn(item.value),
                }
            }

            return item;
        }));
        console.timeEnd(name);

        return {
            ...settings,
            clipboardHistory: compressedClipboardHistory
        };
    }
}


export const clipboardHistorySettings = createSettings<ClipboardHistorySettings>({
    name: 'clipboard',
    defaultSettings: {
        version: 1,
        clipboardHistory: []
    },
    preSaveFn: createSaveLoadFn('compress'),
    postLoadFn: createSaveLoadFn('decompress'),
});
