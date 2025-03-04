import EventEmitter from "node:events";
import {NativeImage} from 'electron'
import {sleep} from "../utils/sleep";

const CLIPBOARD_CHECK_INTERVAL_MS = 250;

type ClipboardChangeTypes = 'image' | 'html' | 'text';
export type ClipboardChangeData = {
    image: NativeImage;
    html: string;
    text: string;
}

const createClipboardChangeEmitter = () => {
    const eventEmitter = new EventEmitter();
    const emit = (data: ClipboardChangeData) => eventEmitter.emit('change', data)

    const clipboardHashMap = new Map<ClipboardChangeTypes, string>();
    const updateHash = (name: ClipboardChangeTypes, hash: string): void => {
        clipboardHashMap.set(name, hash);
    };
    const isHashDifferent = (name: ClipboardChangeTypes, hash: string): boolean => {
        return clipboardHashMap.get(name) !== hash;
    }

    const scanClipboard = async () => {

    };

    // So it does not block the main thread... LOL
    (async () => {
        while (true) {
            await scanClipboard();

            await sleep(CLIPBOARD_CHECK_INTERVAL_MS);
        }
    })().catch(console.error);

    return {
        onChange: (callback: (data: ClipboardChangeData) => void) => eventEmitter.on('change', callback)
    }
}

export const clipboardChangeEmitter = createClipboardChangeEmitter();