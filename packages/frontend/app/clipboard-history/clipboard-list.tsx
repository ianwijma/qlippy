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
    const {type} = item;

    switch (type) {
        case 'text': {
            const {text} = item;
            return (
                <div className="truncate" data-text>
                    {text}
                </div>
            )
        }
        case 'html': {
            const {htmlText} = item;
            return (
                <div className="truncate" data-html>
                    {htmlText}
                </div>
            )
        }
        case 'url': {
            const {url} = item;
            return (
                <div className='truncate' data-url>
                    {url}
                </div>
            )
        }
        case 'path': {
            const {path} = item;
            return (
                <div className='truncate' data-path>
                    {path}
                </div>
            )
        }
        case 'colour': {
            const {colour, colourText} = item;
            return (
                <div className='truncate flex items-center gap-1' data-colour>
                    <span style={{ backgroundColor: colour }} className="w-8 h-8" /> {colourText}
                </div>
            )
        }
        case 'image': {
            const {imageFilePath} = item;
            return (
                <div className='truncate flex items-center gap-1 h-full' data-image>
                    <span>Image:</span>
                    {
                        imageFilePath
                            ? <img className='h-full max-w-[75%]' src={`app://${imageFilePath}`} alt='Clipboard image content'/>
                            : ''
                    }
                </div>
            )
        }
    }
}