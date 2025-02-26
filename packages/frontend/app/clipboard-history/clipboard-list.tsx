import {
    ClipboardHistory,
    ClipboardItem,
    ClipboardItemId,
    ClipboardItems,
} from "@qlippy/common/src/settings/clipboard.settings.types";
import {useEffect, useRef} from "react";

export type ClipboardListParams = {
    items: ClipboardItems,
    history: ClipboardHistory,
    selectedIndex: number,
    onItemHover: (id: ClipboardItemId) => void,
    onItemClicked: (id: ClipboardItemId) => void,
}

export const ClipboardList = ({ items, history, selectedIndex, onItemHover, onItemClicked }: ClipboardListParams) => {
    const selectedRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const selectedEl = selectedRef.current;

        if (!selectedEl) return;

        selectedEl.scrollIntoView({block: 'nearest'});
    }, [selectedRef, selectedIndex]);

    return (
        <ul>
            {history.map((id, index) => {
                const isSelected = selectedIndex === index;

                return (
                    <li
                        key={id}
                        className={`h-8 ${isSelected ? 'bg-red-500' : ''}`}
                        ref={isSelected ? selectedRef : null}
                        onMouseEnter={() => onItemHover(id)}
                        onClick={() => onItemClicked(id)}
                    >
                        <ClipboardListItem item={items[id]} />
                    </li>
                )
            })}
        </ul>
    )
}

type ClipboardListItemParams = {
    item: ClipboardItem,
}

const ClipboardListItem = ({item}: ClipboardListItemParams) => {
    const {type, value, metadata} = item;

    switch (type) {
        case "text":
            return (
                <div className="truncate" data-text>
                    {value}
                </div>
            )
        case "html":
            const {text} = metadata
            return (
                <div className="truncate" data-html>
                    {text}
                </div>
            )
        case "url":
            return (
                <div className='truncate' data-url>
                    {value}
                </div>
            )
        case "path":
            return (
                <div className='truncate' data-path>
                    {value}
                </div>
            )
        case "colour":
            return (
                <div className='truncate flex items-center gap-1' data-colour>
                    <span style={{ backgroundColor: value }} className="w-8 h-8" /> {value}
                </div>
            )
        case "image":
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