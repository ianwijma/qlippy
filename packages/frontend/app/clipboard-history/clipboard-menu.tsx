import {ClipboardItem} from "@qlippy/common/src/settings/clipboard.settings.types";
import {memo, useMemo} from "react";

const baseKeyCombos = {
    '': 'Shows this menu',
    'Delete': 'Deletes the item',
    'Backspace': 'Clear search query',
}

const pinKeyCombos = {
    'p': 'Pin the item'
}

const unpinKeyCombos = {
    'p': 'Unpin the item'
}

const fileKeyCombos = {
    'f': 'Open the file externally',
}

const imageKeyCombos = {
    'i': 'Open the image externally',
}

const urlKeyCombos = {
    'u': 'Open the url in the default browser',
}

export type ClipboardMenuParams = {
    show: boolean,
    item: ClipboardItem | undefined,
};
export const ClipboardMenu = memo(({show, item}: ClipboardMenuParams) => {
    const keyCombos = useMemo(() => {
        if (!item) return baseKeyCombos;

        const getPinKeyCombos = () => item.pinned ? unpinKeyCombos : pinKeyCombos;

        const {type} = item;
        switch (type) {
            case 'image': {
                return {
                    ...baseKeyCombos,
                    ...getPinKeyCombos(),
                    ...imageKeyCombos,
                }
            }
            case 'path': {
                return {
                    ...baseKeyCombos,
                    ...getPinKeyCombos(),
                    ...fileKeyCombos,
                }
            }
            case 'url': {
                return {
                    ...baseKeyCombos,
                    ...getPinKeyCombos(),
                    ...urlKeyCombos,
                    ...imageKeyCombos,
                }
            }
            default: {
                return {
                    ...baseKeyCombos,
                    ...getPinKeyCombos(),
                };
            }
        }
    }, [item]);

    return (
        <div
            className='absolute w-screen h-screen bg-opacity-50 bg-black z-[9999] flex items-center justify-center transition-opacity'
            style={{ opacity: show ? 100 : 0, pointerEvents: show ? 'auto' : 'none' }}
        >

            <div className='bg-opacity-80 bg-white w-1/2 h-1/2 text-gray-500 pl-2 pt-3'>
                <ul>
                    {
                        Object.keys(keyCombos).map((key) => {
                            const description = keyCombos[key]
                            return (
                                <li key={key}>
                                    <kbd>ctrl</kbd> {key !== '' ? (<>+ <kbd>{key}</kbd></>) : ''}: {description}
                                </li>
                            )
                        })
                    }
                </ul>
            </div>

        </div>
    )
})