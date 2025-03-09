import {clipboardChangeEmitter} from "./change-emitter";
import {
    ClipboardItemHash,
    ClipboardItemTypes,
} from "@qlippy/common/src/settings/clipboard.settings.types";
import {
    htmlToHtmlClipboardItem,
    isTextAColour,
    isTextAUrl,
    nativeImageToImageClipboardItem,
    textToColourClipboardItem,
    textToPathClipboardItem,
    textToTextClipboardItem,
    textToUrlClipboardItem
} from "./item-converters";
import {clipboardManager} from "./manager";
import { join as pathJoin } from 'node:path'
import {fileExists, fileStats, UNSAFE_fileStats, writeFile} from "../utils/files";
import {screenshotUrl} from "../utils/screenshotSite";

const CLIPBOARD_STORAGE_PATH = 'clipboard-files';

const createClipboardHandleChange = () => {
    const clipboardHashMap = new Map<ClipboardItemTypes, ClipboardItemHash>();
    const updateHash = (name: ClipboardItemTypes, hash: ClipboardItemHash): void => {
        clipboardHashMap.set(name, hash);
    };
    const isHashDifferent = (name: ClipboardItemTypes, hash: ClipboardItemHash): boolean => {
        return clipboardHashMap.get(name) !== hash;
    }

    return {
        initialize: async (): Promise<void> => {
            clipboardChangeEmitter.onChange(async (data) => {
                const {image, imageHash, isImageEmpty} = data;

                // First we're getting the image, because HTML can contain the HTML version of an image.
                if (!isImageEmpty && isHashDifferent('image', imageHash)) {
                    updateHash('image', imageHash);

                    const item = nativeImageToImageClipboardItem({ image, hash: imageHash });
                    await clipboardManager.add(item);

                    // Save file & update the clipboard item.
                    const filePath = pathJoin(CLIPBOARD_STORAGE_PATH, `${item.id}.png`);
                    let fileStoragePath = await fileExists(filePath);
                    if (fileStoragePath === false) {
                        const imagePng = image.toPNG();
                        item.imageFilePath = await writeFile(filePath, imagePng);
                        await clipboardManager.update(item);

                        const imageStats = await fileStats(filePath);
                        if (imageStats !== false) {
                            item.size = imageStats.size;
                            await clipboardManager.update(item);
                        }
                    }

                    return; // is handled
                }

                const {text, textHash, isTextEmpty} = data;

                // We're getting the text, for colour checking, as some colours are copied from an IDE, which involves HTML, we need to first check for colours.
                if (!isTextEmpty && isTextAColour(text) && isHashDifferent('colour', textHash)) {
                    updateHash('colour', textHash);

                    const item = textToColourClipboardItem({ text, hash: textHash });
                    await clipboardManager.add(item);

                    return; // is handled
                }

                const { html, htmlHash, isHtmlEmpty } = data;

                // We're getting the HTML, as HTML also contains the text in the HTML.
                if (!isHtmlEmpty && !isTextEmpty && isHashDifferent('html', htmlHash)) {
                    updateHash('html', htmlHash);

                    const item = htmlToHtmlClipboardItem({ html, htmlText: text, hash: htmlHash });
                    await clipboardManager.add(item);

                    return; // is handled
                }

                // Text check we're checking if it contains a local path.
                const stats = await UNSAFE_fileStats(text.trim());
                if (!isTextEmpty && stats && isHashDifferent('path', textHash)) {
                    updateHash('path', textHash);

                    const item = textToPathClipboardItem({ text, stats, hash: textHash });
                    await clipboardManager.add(item);

                    return; // is handled
                }

                // Text check we're checking if it contains a valid URL.
                const url = isTextAUrl(text.trim());
                if (!isTextEmpty && url && isHashDifferent('url', textHash)) {
                    updateHash('url', textHash);

                    const item = textToUrlClipboardItem({ text, url, hash: textHash });
                    await clipboardManager.add(item);

                    // Screenshot the time and save it to the item
                    const filePath = pathJoin(CLIPBOARD_STORAGE_PATH, `${item.id}.png`);
                    let fileStoragePath = await fileExists(filePath);
                    if (fileStoragePath === false) {
                        const screenshotPng = await screenshotUrl.screenshot({ url, type: 'png' });
                        item.imageFilePath = await writeFile(filePath, screenshotPng);
                        await clipboardManager.update(item);
                    }

                    return; // is handled
                }

                // Text check we're checking if is not empty.
                if (!isTextEmpty && isHashDifferent('text', textHash)) {
                    updateHash('text', textHash);

                    const item = textToTextClipboardItem({ text, hash: textHash });
                    await clipboardManager.add(item);

                    return; // is handled
                }

                console.log('[clipboard-change-listener] Unknown clipboard change.')
            })
        }
    }
}

export const clipboardHandleChange = createClipboardHandleChange()