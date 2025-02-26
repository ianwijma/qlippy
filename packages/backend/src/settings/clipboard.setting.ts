import {createSettings} from "./createSettings";
import {ClipboardSettings} from "@qlippy/common/src/settings/clipboard.settings.types";

export const clipboardSettings = createSettings<ClipboardSettings>({
    name: 'clipboard',
    defaultSettings: {
        version: 1,
        history: [],
        idToHashMap: {},
        items: {},
    },
});
