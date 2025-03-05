import {
    ClipboardId,
    ClipboardItems,
} from '@qlippy/common/src/settings/clipboard.settings.types'
import {clipboardSettings} from "../settings/clipboard.setting";
import {readFile, removeFile} from "../utils/files";
import {clipboard, nativeImage} from "electron";

const CLIPBOARD_AMOUNT_LIMIT = 1000;

const createClipboardManager = () => {
    const removeItemFromHistory = async ({item, history}: {item: ClipboardItems, history: ClipboardItems[]}): Promise<ClipboardItems[]> => {
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

    const getIndex = (item: ClipboardItems): number => {
        const settings = clipboardSettings.getSettings();
        const {history} = settings;

        return history.findIndex(({ id }) => id === item.id);
    }

    return {
        add: async (newItem: ClipboardItems): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;
            const [firstItem = undefined] = history;

            let updatedHistory = history;
            if (firstItem.hash !== newItem.hash) {
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
        update: async (itemToUpdate: ClipboardItems): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            const index = getIndex(itemToUpdate);
            if (index !== -1) {
                // Using splice and the index we get the items before and after the index.
                const before = history.splice(0, index);
                const after = history.splice(-index);

                // Update the history
                await clipboardSettings.updateSettings({
                    ...settings,
                    history: [
                        ...before,
                        itemToUpdate,
                        ...after,
                    ],
                });
            }
        },
        removeOne: async (itemToRemove: ClipboardItems): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            // Update the history.
            await clipboardSettings.updateSettings({
                ...settings,
                history: await removeItemFromHistory({ item: itemToRemove, history }),
            });
        },
        removeMultiple: async (itemsToRemove: ClipboardItems[]): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            let updatedHistory = history;
            for (const item of itemsToRemove) {
                updatedHistory = await removeItemFromHistory({ item, history })
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
                updatedHistory = await removeItemFromHistory({ item, history })
            }

            // Update the history.
            await clipboardSettings.updateSettings({
                ...settings,
                history: updatedHistory,
            });
        },
        restore: async (itemToRestore: ClipboardItems): Promise<void> => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            const index = getIndex(itemToRestore);
            if (index !== -1) {
                let updatedHistory = history;

                // Move the item to the top of the history.
                updatedHistory.splice(index, 1);
                updatedHistory.unshift(itemToRestore);

                const {type} = itemToRestore;
                switch (type) {
                    case 'image': {
                        const {imageFilePath} = itemToRestore;
                        const imageBuffer = await readFile(imageFilePath);
                        const image = nativeImage.createFromBuffer(imageBuffer);
                        clipboard.writeImage(image, 'clipboard');
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
                        const {colour} = itemToRestore;
                        clipboard.writeText(colour, 'clipboard');
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
        getById: (id: ClipboardId): undefined | ClipboardItems => {
            const settings = clipboardSettings.getSettings();
            const {history} = settings;

            const [foundItem = undefined] = history.filter((item) => item.id === id);

            return foundItem;
        },
    }
}

export const clipboardManager = createClipboardManager();