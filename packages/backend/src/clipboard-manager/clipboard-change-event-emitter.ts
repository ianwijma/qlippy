import EventEmitter from "node:events";
import {
    clipboardChangeListener,
} from "./clipboard-change-listener";
import {
    ClipboardData,
    HtmlClipboardData,
    ImageClipboardData,
    PathClipboardData,
    TextClipboardData,
    UrlClipboardData
} from "@qlippy/common/src/clipboard.types";

interface ClipboardChangeEvents {
    'image': (data: ImageClipboardData) => void,
    'html': (data: HtmlClipboardData) => void,
    'path': (data: PathClipboardData) => void,
    'url': (data: UrlClipboardData) => void,
    'text': (data: TextClipboardData) => void,

    // The * is triggers AFTER any specific event.
    '*': (data: ClipboardData) => void,
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