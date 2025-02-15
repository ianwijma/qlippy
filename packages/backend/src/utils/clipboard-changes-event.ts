import EventEmitter from "node:events";
import {clipboard, NativeImage} from "electron";
import {createHash} from 'node:crypto';

const hash = (input: string): string => {
    const hash = createHash('SHA1');
    hash.write(input);
    return hash.digest('hex');
}

type ClipboardChangeEventTypes = 'text' | 'image' | 'html';
type ClipboardChangeBaseEvent = {
    type: ClipboardChangeEventTypes,
}

type ClipboardTextChangeEvent = ClipboardChangeBaseEvent & {
    type: 'text';
    text: string;
    textHash: string;
}

type ClipboardHtmlChangeEvent = ClipboardChangeBaseEvent & {
    type: 'html';
    text: string;
    textHash: string;
    html: string;
    htmlHash: string;
}

type ClipboardImageChangeEvent = ClipboardChangeBaseEvent & {
    type: 'image';
    image: NativeImage;
    imageHash: string;
}

type ClipboardChangeEvents = ClipboardTextChangeEvent | ClipboardHtmlChangeEvent | ClipboardImageChangeEvent;

const EMPTY_HASH = 'empty::hash'
const CLIPBOARD_CHECK_INTERVAL_MS = 250;

const createClipboardChanges = () => {
    const eventEmitter = new EventEmitter();

    const emitEvent = (event: ClipboardChangeEvents) => {
        eventEmitter.emit<ClipboardChangeEvents>('change', event);
    }

    let intervalId: NodeJS.Timeout | undefined;

    let htmlHash: string;
    let textHash: string;
    let imageHash: string;

    return {
        updateHash: ({text, html, image}: { text?: string, html?: string, image?: string }) => {
            htmlHash = !!html ? hash(html) : EMPTY_HASH;
            textHash = !!text ? hash(text) : EMPTY_HASH;
            imageHash = !!image ? hash(image) : EMPTY_HASH;
        },
        startListening: async () => {
            const htmlInitial = clipboard.readHTML('clipboard');
            const textInitial = clipboard.readText('clipboard');
            const imageInitial = clipboard.readImage('clipboard');

            htmlHash = hash(htmlInitial);
            textHash = hash(textInitial);
            imageHash = hash(imageInitial.toDataURL());

            if (!intervalId) {
                intervalId = setInterval(() => {
                    // First we check if we have an image.
                    const image = clipboard.readImage('clipboard');
                    if (!image.isEmpty()) {
                        const newImageHash = hash(image.toDataURL());
                        if (newImageHash !== imageHash) {
                            textHash = EMPTY_HASH;
                            htmlHash = EMPTY_HASH;
                            imageHash = newImageHash;
                            emitEvent({type: 'image', image, imageHash});
                        }

                        return; // Handled
                    }

                    // Then we check if we have HTML in our clipboard.
                    const html = clipboard.readHTML('clipboard');
                    if (html !== '') {
                        const newHtmlHash = hash(html);
                        if (newHtmlHash !== htmlHash) {
                            const htmlText = clipboard.readText('clipboard');
                            textHash = hash(htmlText);
                            htmlHash = newHtmlHash;
                            imageHash = EMPTY_HASH;
                            emitEvent({type: 'html', html, htmlHash, text: htmlText, textHash});
                        }

                        return; // Handled
                    }

                    // lastly we check if we have text in our clipboard.
                    const text = clipboard.readText('clipboard');
                    if (text !== '') {
                        const newTextHash = hash(text);
                        if (newTextHash !== textHash) {
                            textHash = newTextHash;
                            htmlHash = EMPTY_HASH;
                            imageHash = EMPTY_HASH;
                            emitEvent({type: 'text', text, textHash});
                        }

                        return; // Handled
                    }

                    // Else reset our current hashes.
                    textHash = EMPTY_HASH;
                    htmlHash = EMPTY_HASH;
                    imageHash = EMPTY_HASH;
                    console.log('Clearing Hash', {text, html, image: image.isEmpty()});
                }, CLIPBOARD_CHECK_INTERVAL_MS);
            }
        },
        stopListening: () => {
            if (intervalId) {
                clearInterval(intervalId);

                intervalId = undefined;
            }
        },
        onChange: (callback: (event: ClipboardChangeEvents) => Promise<void> | void) => {
            eventEmitter.on<ClipboardChangeEvents>('change', callback);
        }
    }
}

export const clipboardChanges = createClipboardChanges();