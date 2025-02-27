import {createSettings} from "./createSettings";
import {KeyboardSettings} from "@qlippy/common/src/settings/keyboard.settings.types";
import {isMac} from "../utils/isMac";
import {isDev} from "../utils/isDev";

const DEFAULT_CLIPBOARD_KEYS = [
    'Control',
    isMac() ? 'Command' : 'Super',
    isDev() ? 'l' : 'h'
]

export const keyboardSettings = createSettings<KeyboardSettings>({
    name: 'keyboard',
    defaultSettings: {
        version: 1,
        shortcuts: {
            [DEFAULT_CLIPBOARD_KEYS.join('+')]: {
                target: 'window',
                targetId: 'clipboard-history'
            }
        }
    },
});