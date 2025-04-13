import {
    ClipboardId,
    ClipboardItem,
} from '@qlippy/common/src/settings/clipboard.settings.types'
import {clipboardSettings} from "../settings/clipboard.setting";
import {readFile, removeFile} from "../utils/files";
import {clipboard, nativeImage} from "electron";

const CLIPBOARD_AMOUNT_LIMIT = 10_000;

const createClipboardManager = () => {
    const removeItemFromHistory = async ({item, history}: {item: ClipboardItem, history: ClipboardItem[]}): Promise<ClipboardItem[]> => {
        // Check if there are any files we need to remove.
        const {type} = item;
        if (type === 'image' || type === 'url') {
            const {imageFilePath} = item;

            if (imageFilePath) {
                await removeFile(imageFilePath);
            }
        }

        return history.filter(({ id }) => id !== item.id);
    }

    const getIndex = (item: ClipboardItem): number => {
        const settings = clipboardSettings.getSettings();
        const {history} = settings;

        return history.findIndex(({ id }) => id === item.id);
    }

    return {
        add: async (newItem: ClipboardItem): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;
            const [firstItem = undefined] = history;

            let updatedHistory = history;
            if (firstItem === undefined || firstItem.hash !== newItem.hash) {
                updatedHistory.unshift(newItem);

                // Check if we're over our hard limit;
                while (history.length > CLIPBOARD_AMOUNT_LIMIT) {
                    const itemToRemove = history.pop();

                    updatedHistory = await removeItemFromHistory({ item: itemToRemove, history });
                }
            }

            // Update the history.
            await clipboardSettings.updateSettings({
                ...settings,
                history: updatedHistory,
            });
        },
        update: async (itemToUpdate: ClipboardItem): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            // Removed the item from history.
            const updatedHistory = history.filter((item) => item.id !== itemToUpdate.id);

            // Update the history
            await clipboardSettings.updateSettings({
                ...settings,
                history: [
                    itemToUpdate,
                    ...updatedHistory,
                ],
            });
        },
        removeMultiple: async (itemsToRemove: ClipboardItem[]): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            let updatedHistory = history;
            for (const item of itemsToRemove) {
                updatedHistory = await removeItemFromHistory({ item, history: updatedHistory })
            }

            // Update the history.
            await clipboardSettings.updateSettings({
                ...settings,
                history: updatedHistory,
            });
        },
        removeAll: async (): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            let updatedHistory = history;
            for (const item of history) {
                updatedHistory = await removeItemFromHistory({ item, history: updatedHistory })
            }

            // Update the history.
            await clipboardSettings.updateSettings({
                ...settings,
                history: updatedHistory,
            });
        },
        restore: async (itemToRestore: ClipboardItem): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            const index = getIndex(itemToRestore);
            if (index !== -1) {
                let updatedHistory = history;

                // Updated the date
                itemToRestore.dateTimeCopied = Date.now();

                // Move the item to the top of the history.
                updatedHistory.splice(index, 1);
                updatedHistory.unshift(itemToRestore);

                // Update the history.
                await clipboardSettings.updateSettings({
                    ...settings,
                    history: updatedHistory,
                });

                // Then submit the change.
                const {type} = itemToRestore;
                switch (type) {
                    case 'image': {
                        const {imageFilePath} = itemToRestore;
                        if (imageFilePath) {
                            const imageBuffer = await readFile(imageFilePath);
                            const image = nativeImage.createFromBuffer(imageBuffer);
                            clipboard.writeImage(image, 'clipboard');
                        }
                        break;
                    }
                    case 'url': {
                        const {url} = itemToRestore;
                        clipboard.writeText(url, 'clipboard');
                        break;
                    }
                    case 'path': {
                        const {path} = itemToRestore;
                        clipboard.writeText(path, 'clipboard');
                        break;
                    }
                    case 'colour': {
                        const {colourText} = itemToRestore;
                        clipboard.writeText(colourText, 'clipboard');
                        break;
                    }
                    case 'html': {
                        const {html, htmlText} = itemToRestore;
                        clipboard.write({
                            html,
                            text: htmlText,
                        }, 'clipboard');
                        break;
                    }
                    case 'text': {
                        const {text} = itemToRestore;
                        clipboard.writeText(text, 'clipboard');
                        break;
                    }
                }
            }
        },
        getById: (id: ClipboardId): undefined | ClipboardItem => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            return history.find((item) => item.id === id);
        },
    }
}

export const clipboardManager = createClipboardManager();