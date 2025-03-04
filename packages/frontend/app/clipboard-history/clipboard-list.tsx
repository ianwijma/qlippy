import {
    ClipboardHistory,
    ClipboardItems,
    ClipboardItemTypes,
} from "@qlippy/common/src/settings/clipboard.settings.types";
import {useEffect, useRef} from "react";

export type ClipboardListParams = {
    history: ClipboardHistory,
    selectedIndex: number,
    onItemHover: (index: number) => void,
    onItemClicked: (index: number) => void,
}

export const ClipboardList = ({ history, selectedIndex, onItemHover, onItemClicked }: ClipboardListParams) => {
    const selectedRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const selectedEl = selectedRef.current;

        if (!selectedEl) return;

        selectedEl.scrollIntoView({block: 'nearest'});
    }, [selectedRef, selectedIndex]);

    return (
        <ul className='not-draggable flex flex-col gap-1'>
            {history.map((item, index) => {
                const {id} = item;
                const isSelected = selectedIndex === index;

                return (
                    <li
                        key={id}
                        className={`h-8 text-gray-500 flex items-center pl-1 bg-opacity-70 ${isSelected ? 'bg-gray-200' : 'bg-white'}`}
                        ref={isSelected ? selectedRef : null}
                        onMouseEnter={() => onItemHover(index)}
                        onClick={() => onItemClicked(index)}
                    >
                        <ClipboardListItem item={item} />
                    </li>
                )
            })}
        </ul>
    )
}

type ClipboardListItemParams = {
    item: ClipboardItems,
}

const ClipboardListItem = ({item}: ClipboardListItemParams) => {
    const {type, value, metadata} = item;

    switch (type) {
        case ClipboardItemTypes.text:
            return (
                <div className="truncate" data-text>
                    {value}
                </div>
            )
        case ClipboardItemTypes.html:
            const {text} = metadata
            return (
                <div className="truncate" data-html>
                    {text}
                </div>
            )
        case ClipboardItemTypes.url:
            return (
                <div className='truncate' data-url>
                    {value}
                </div>
            )
        case ClipboardItemTypes.path:
            return (
                <div className='truncate' data-path>
                    {value}
                </div>
            )
        case ClipboardItemTypes.colour:
            return (
                <div className='truncate flex items-center gap-1' data-colour>
                    <span style={{ backgroundColor: value }} className="w-8 h-8" /> {value}
                </div>
            )
        case ClipboardItemTypes.image:
            return (
                <div className='truncate flex items-center gap-1 h-full' data-image>
                    <span>Image:</span> <img className='h-full max-w-[75%]' src={`app://${value}`} alt='Clipboard image content'/>
                </div>
            )
        default:
            return (
                <div className="truncate" data-default>
                    {value}
                </div>
            )
    }
}