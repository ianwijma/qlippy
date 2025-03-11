import {eventHandler} from "../utils/eventHandler";
import {
    openClipboardHistoryEventName, OpenClipboardHistoryEventData
} from "@qlippy/common/src/events/openClipboardHistory.event";
import {clipboardManager} from "./manager";
import {shell} from 'electron'

const createClipboardHandleOpen = () => {
    return {
        initialize: async (): Promise<void> => {
            eventHandler.listen<OpenClipboardHistoryEventData>(openClipboardHistoryEventName, async ({id, action}) => {
                console.log('openClipboardHistoryEventName', {id, action});
                const item = clipboardManager.getById(id);
                if (item) {
                    const {type} = item;
                    switch (type) {
                        case "url": {
                            const {url, imageFilePath} = item;
                            if (action === 'url') {
                                await shell.openExternal(url);
                            } else if (action === 'file') {
                                await shell.openPath(imageFilePath);
                            }
                            break;
                        }
                        case "image": {
                            const {imageFilePath} = item;
                            if (action === 'file') {
                                await shell.openPath(imageFilePath);
                            }
                            break;
                        }
                        case "path": {
                            const {path} = item;
                            if (action === 'file') {
                                await shell.openPath(path);
                            }
                            break;
                        }
                    }
                }
            });
        }
    }
}

export const clipboardHandleOpen = createClipboardHandleOpen()