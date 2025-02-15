import {ClipboardHistoryItems} from "@qlippy/common/src/settings/clipboard-history.settings.types";
import {clipboardHistorySettings} from "../settings/clipboard-history.setting";
import {eventHandler} from "./eventHandler";
import {clipboardChanges} from "./clipboard-changes-event";
import {
    restoreClipboardHistoryEventName, RestoreClipboardHistoryEventData
} from "@qlippy/common/src/events/restoreClipboardHistory.event";
import {
    clearClipboardHistoryEventName, ClearClipboardHistoryEventData
} from "@qlippy/common/src/events/clearClipboardHistory.event";
import {clipboard, nativeImage} from "electron";
import {confirmDialog} from "../windows/dialog.window";

const createClipboardManager = () => {
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

    const initializeClipboardRestore = async () => {
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
    }

    const initializeClipboardClearing = async () => {
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
    }

    const initializeClipboardChangeHandler = async () => {
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
    }

    return {
        initialize: async () => {
            await initializeClipboardChangeHandler();
            await initializeClipboardRestore();
            await initializeClipboardClearing();
        }
    }
};

export const clipboardManager = createClipboardManager();
