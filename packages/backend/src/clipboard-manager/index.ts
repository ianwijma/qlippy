import type { ClipboardItems } from '@qlippy/common/src/settings/clipboard.settings.types'

export const ClipboardManager = (() => {
    return {
        add: async (item: ClipboardItems): Promise<void> => {

        },
        remove: async (item: ClipboardItems): Promise<void> => {},
        getAll: async (): Promise<ClipboardItems[]> => {},
    }
})()