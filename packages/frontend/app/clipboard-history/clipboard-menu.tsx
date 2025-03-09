import {ClipboardItem} from "@qlippy/common/src/settings/clipboard.settings.types";
import {memo, useEffect, useMemo, useState} from "react";
import {HtmlFrame} from "../../components/htmlFrame";

const baseKeyCombos = {
    '': 'Shows this menu',
    'Delete': 'Deletes the item',
}

export type ClipboardMenuParams = {
    show: boolean,
    item: ClipboardItem | undefined,
};
export const ClipboardMenu = memo(({show, item}: ClipboardMenuParams) => {
    const keyCombos = useMemo(() => ({
        ...baseKeyCombos,
    }), [item]);

    return (
        <div
            className='absolute w-screen h-screen bg-opacity-50 bg-black z-[9999] flex items-center justify-center transition-opacity'
            style={{ opacity: show ? 100 : 0 }}
        >

            <div className='bg-opacity-80 bg-white w-1/2 h-1/2 text-gray-500 pl-2 pt-3'>
                <ul className=''>
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