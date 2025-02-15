import {createSettings} from "./createSettings";
import {
    ClipboardHistoryItems,
    ClipboardHistorySettings
} from "@qlippy/common/src/settings/clipboard-history.settings.types";
import {clipboardChanges} from "../utils/clipboard-changes-event";
import zlib from "node:zlib";
import {Buffer} from "node:buffer";
import {promisify} from 'node:util';
import {eventHandler} from "../utils/eventHandler";
import {
    restoreClipboardHistoryEventName, RestoreClipboardHistoryEventData
} from "@qlippy/common/src/events/restoreClipboardHistory.event";
import {
    clearClipboardHistoryEventName, ClearClipboardHistoryEventData
} from "@qlippy/common/src/events/clearClipboardHistory.event";
import {clipboard, nativeImage} from "electron";
import {confirmDialog} from "../windows/dialog.window";


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

const addClipboardHistoryItem = async (newItem: ClipboardHistoryItems) => {
    const settings = clipboardHistorySettings.getSettings();
    const {clipboardHistory} = settings;

    console.time('addClipboardHistoryItem');

    const cleanedClipboardHistory = clipboardHistory.filter(({id}, index) => {
        return id !== newItem.id && index < 101
    });

    console.timeLog('addClipboardHistoryItem', 'cleanedClipboardHistory');

    await clipboardHistorySettings.updateSettings({
        ...settings,
        clipboardHistory: [
            newItem,
            ...cleanedClipboardHistory
        ]
    });

    console.timeEnd('addClipboardHistoryItem');
}

clipboardChanges.onChange(async (event) => {
    const {type} = event;
    switch (type) {
        case 'text': {
            const {text, textHash} = event;
            const id = textHash;
            await addClipboardHistoryItem({type, id, textHash, text});
        }
            break;
        case 'html': {
            const {html, htmlHash, text, textHash} = event;
            const id = htmlHash;
            await addClipboardHistoryItem({type, id, htmlHash, textHash, html, text});
        }
            break;
        case 'image': {
            const {image, imageHash} = event;
            const id = imageHash;
            await addClipboardHistoryItem({type, id, imageHash, image: image.toDataURL()});
        }
            break;
        default: {
            console.log(`Unsupported event type ${type}`);
        }
    }
});

eventHandler.listen<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, async ({clipboardHistoryItemHashId}) => {
    const settings = clipboardHistorySettings.getSettings();
    const {clipboardHistory} = settings;

    const [targetClipboardHistoryItem = undefined] = clipboardHistory.filter(({id}) => id === clipboardHistoryItemHashId);
    if (targetClipboardHistoryItem) {
        const {type} = targetClipboardHistoryItem;
        switch (type) {
            case 'text': {
                const {text} = targetClipboardHistoryItem;
                clipboardChanges.updateHash({text});
                clipboard.writeText(text, 'clipboard');
            }
                break;
            case 'html': {
                const {html, text} = targetClipboardHistoryItem;
                clipboardChanges.updateHash({html, text});
                clipboard.writeText(text, 'clipboard');
            }
                break;
            case 'image': {
                const {image} = targetClipboardHistoryItem;
                clipboardChanges.updateHash({image});
                const imageNative = nativeImage.createFromDataURL(image);
                clipboard.writeImage(imageNative, 'clipboard');
            }
                break;
        }

        const filteredHistory = clipboardHistory.filter(({id}) => id !== clipboardHistoryItemHashId);
        await clipboardHistorySettings.updateSettings({
            ...settings,
            clipboardHistory: [
                targetClipboardHistoryItem,
                ...filteredHistory
            ]
        })
    }
});

eventHandler.listen<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, async ({ids}) => {
    const settings = clipboardHistorySettings.getSettings();
    const {clipboardHistory} = settings;

    if (ids.length > 1) {
        const {confirmed} = await confirmDialog.open({
            title: 'Confirm',
            message: `You're about to remove ${ids.length} items, are you sure?`,
        });

        if (!confirmed) return; // Stop it
    }

    await clipboardHistorySettings.updateSettings({
        ...settings,
        clipboardHistory: clipboardHistory.filter(({id}) => !ids.includes(id))
    })
});