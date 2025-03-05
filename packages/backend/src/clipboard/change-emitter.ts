import EventEmitter from "node:events";
import {clipboard, NativeImage} from 'electron'
import {sleep} from "../utils/sleep";
import {sha1} from "../utils/crypto";

const CLIPBOARD_CHECK_INTERVAL_MS = 250;

type ClipboardChangeTypes = 'image' | 'html' | 'text';

export type ClipboardChangeData = {
    image: NativeImage;
    imageHash: string;
    isImageEmpty: boolean;
    html: string;
    htmlHash: string;
    isHtmlEmpty: boolean;
    text: string;
    textHash: string;
    isTextEmpty: boolean;
}

const getClipboardImage = () => {
    const image: NativeImage = clipboard.readImage('clipboard');
    const isImageEmpty: boolean = image.isEmpty();
    const imageHash: undefined | string = isImageEmpty ? undefined : sha1(image.getBitmap());
    return { image, isImageEmpty, imageHash }
}

const getClipboardHtml = () => {
    const html: string = clipboard.readHTML('clipboard');
    const isHtmlEmpty: boolean = html.trim() === '';
    const htmlHash: undefined | string = isHtmlEmpty ? undefined : sha1(html);
    return { html, isHtmlEmpty, htmlHash }
}

const getClipboardText = () => {
    const text: string = clipboard.readText('clipboard');
    const isTextEmpty: boolean = text.trim() === '';
    const textHash: undefined | string = isTextEmpty ? undefined : sha1(text);
    return { text, isTextEmpty, textHash }
}

const createClipboardChangeEmitter = () => {
    const eventEmitter = new EventEmitter();
    const emit = (data: ClipboardChangeData) => eventEmitter.emit('change', data);

    const {imageHash: initialImageHash} = getClipboardImage();
    const {htmlHash: initialHtmlHash} = getClipboardHtml();
    const {textHash: initialTextHash} = getClipboardText();

    const hashMap = new Map<ClipboardChangeTypes, string>();

    hashMap.set('image', initialImageHash);
    hashMap.set('html', initialHtmlHash);
    hashMap.set('text', initialTextHash);

    const scanClipboard = async () => {
        const {isImageEmpty, imageHash, image} = getClipboardImage();
        const {isHtmlEmpty, htmlHash, html} = getClipboardHtml();
        const {isTextEmpty, textHash, text} = getClipboardText();

        const hasImageChanged = isImageEmpty && imageHash !== hashMap.get('image');
        const hasHtmlChanged = isHtmlEmpty && htmlHash !== hashMap.get('html');
        const hasTextChanged = isTextEmpty && textHash !== hashMap.get('text');

        if (hasImageChanged || hasHtmlChanged || hasTextChanged) {
            emit({
                image, imageHash, isImageEmpty,
                html, htmlHash, isHtmlEmpty,
                text, textHash, isTextEmpty,
            })
        }
    };

    let listening = false;

    // Async, so it does not block the main thread and freezes the whole application... LOL
    (async () => {
        if (!listening) {
            listening = true;

            while (listening) {
                await scanClipboard();

                await sleep(CLIPBOARD_CHECK_INTERVAL_MS);
            }
        }
    })().catch(console.error); // Pleasing TS

    return {
        onChange: (callback: (data: ClipboardChangeData) => void) => eventEmitter.on('change', callback)
    }
}

export const clipboardChangeEmitter = createClipboardChangeEmitter();