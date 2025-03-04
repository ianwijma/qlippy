// TODO: Migrate functionality to clipboard manager

import EventEmitter from "node:events";
import {
    clipboardChangeListener,
} from "./listener";
import {
    ClipboardItems,
    HtmlClipboardItem,
    ImageClipboardItem,
    PathClipboardItem,
    TextClipboardItem,
    UrlClipboardItem
} from "@qlippy/common/src/settings/clipboard.settings.types";

interface ClipboardChangeEvents {
    'image': (data: ImageClipboardItem) => void,
    'html': (data: HtmlClipboardItem) => void,
    'path': (data: PathClipboardItem) => void,
    'url': (data: UrlClipboardItem) => void,
    'colour': (data: UrlClipboardItem) => void,
    'text': (data: TextClipboardItem) => void,

    // The * is triggers AFTER any specific event.
    '*': (data: ClipboardItems) => void,
}

export class ClipboardChangeEventEmitter extends EventEmitter  {
    on = <K extends keyof ClipboardChangeEvents>(event: K, listener: ClipboardChangeEvents[K]): this => super.on(event, listener);

    constructor() {
        super();

        clipboardChangeListener.onChange((data) => {
            const {type} = data;

            super.emit(type, data);

            super.emit('*', data);
        });
    }

}