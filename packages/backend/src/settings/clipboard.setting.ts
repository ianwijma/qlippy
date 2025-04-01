import {createSettings, toMigrations} from "./createSettings";
import {ClipboardSettings} from "@qlippy/common/src/settings/clipboard.settings.types";

export const clipboardSettings = createSettings<ClipboardSettings>({
    name: 'clipboard',
    defaultSettings: {
        version: 2,
        history: [],
    },
    migrations: toMigrations([
        {
            fromVersion: 1,
            toVersion: 2,
            // @ts-ignore - migrateFunction expects to receive and return the complete settings.
            migrateFunction: (settings) => {
                const {history} = settings;

                return {
                    ...settings,
                    history: history.map((item) => ({
                        ...item,
                        pinned: false
                    }))
                }
            }
        }
    ])
});
