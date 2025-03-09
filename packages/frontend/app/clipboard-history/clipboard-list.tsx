import {
    ClipboardHistory,
    ClipboardItem,
} from "@qlippy/common/src/settings/clipboard.settings.types";
import {useEffect, useRef} from "react";
import {SearchableGroupedHistory} from "./page";

export type ClipboardListParams = {
    history: SearchableGroupedHistory,
    selectedIndex: number,
    onItemClicked: (index: number) => void,
    onItemDoubleClick: (index: number) => void,
}

export const ClipboardList = ({ history, selectedIndex, onItemClicked, onItemDoubleClick }: ClipboardListParams) => {
    const selectedRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const selectedEl = selectedRef.current;

        if (!selectedEl) return;

        selectedEl.scrollIntoView({block: 'nearest'});
    }, [selectedRef, selectedIndex]);

    return (
        <ul className='not-draggable flex flex-col gap-1 cursor-default'>
            {
                Object.keys(history).map((group, index  ) => {
                    const items = history[group] ?? [];

                    return (
                        <li
                            key={group}
                            className='flex flex-col gap-1 justify-center items-center'
                            style={{zIndex: index}}
                        >
                            <span
                                className='h-8 w-1/2 text-gray-500 flex justify-center rounded-xl items-center bg-white bg-opacity-70 sticky position-[webkit-sticky] top-0'
                            >
                                {group}
                            </span>

                            <ul className='w-full flex flex-col gap-1'>
                                {
                                    items.map(({item}, index) => {
                                        const {id} = item;
                                        const isSelected = selectedIndex === index;

                                        return (
                                            <li
                                                key={id}
                                                className={`h-8 text-gray-500 flex items-center pl-1 bg-opacity-70 ${isSelected ? 'bg-gray-200' : 'bg-white'}`}
                                                ref={isSelected ? selectedRef : null}
                                                onClick={() => onItemClicked(index)}
                                                onDoubleClick={() => onItemDoubleClick(index)}
                                            >
                                                <ClipboardListItem item={item}/>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </li>
                    )
                })
            }
        </ul>
    )
}

type ClipboardListItemParams = {
    item: ClipboardItem,
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