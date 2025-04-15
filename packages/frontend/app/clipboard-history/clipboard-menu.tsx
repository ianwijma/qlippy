import {ClipboardItem} from "@qlippy/common/src/settings/clipboard.settings.types";
import {Fragment, memo, useMemo} from "react";

const baseKeyCombos = {
    'Up': 'Highlight previous item',
    'Down': 'Highlight next item',
    'Enter': 'Restore highlighted item',
    'Escape': 'Close Qlippy',
    'Ctrl': 'Shows this menu',
    'Ctrl+Delete': 'Deletes the item',
    'Ctrl+Backspace': 'Clear search query',
}

const pinKeyCombos = {
    'Ctrl+P': 'Pin the item'
}

const unpinKeyCombos = {
    'Ctrl+P': 'Unpin the item'
}

const fileKeyCombos = {
    'Ctrl+F': 'Open the file externally',
}

const imageKeyCombos = {
    'Ctrl+I': 'Open the image externally',
}

const urlKeyCombos = {
    'Ctrl+U': 'Open the url in the default browser',
}

const urlImageKeyCombos = {
    'Ctrl+C': 'Copy the screenshot to clipboard',
    'Ctrl+I': 'Open the screenshot externally',
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
                const {imageFilePath} = item;

                const actualUrlImageKeyCombos = !!imageFilePath ? urlImageKeyCombos : {};

                return {
                    ...baseKeyCombos,
                    ...getPinKeyCombos(),
                    ...urlKeyCombos,
                    ...actualUrlImageKeyCombos
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
                <table className='w-full'>
                    <thead>
                    <tr>
                        <th className='w-1/3 text-left'>Key</th>
                        <th className='text-left'>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        Object.keys(keyCombos).map((key) => {
                            const description = keyCombos[key]
                            const keyArray = key.split('+');
                            return (
                                <tr key={key}>
                                    <td>
                                        {keyArray.map((keyItem, index) => (
                                            <Fragment key={keyItem}>
                                                {!!index && ' + '}
                                                {keyItem.toWellFormed()}
                                            </Fragment>
                                        ))}
                                    </td>
                                    <td>
                                        {description}
                                    </td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </table>
            </div>

        </div>
    )
})