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
            if (type === 'text' && item.text.length > 1000) {
                return {
                    ...item,
                    text: await compressDecompressFn(item.text),
                }
            }

            if (type === 'html' && item.html.length > 1000) {
                return {
                    ...item,
                    html: await compressDecompressFn(item.html),
                }
            }

            if (type === 'image') {
                return {
                    ...item,
                    image: await compressDecompressFn(item.image),
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
