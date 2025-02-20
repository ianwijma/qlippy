import {
    ClipboardHistory,
    ClipboardItem,
    ClipboardItems,
} from "@qlippy/common/src/settings/clipboard.settings.types";

export type ClipboardListParams = {
    items: ClipboardItems,
    history: ClipboardHistory,
    selectedIndex: number
}

export const ClipboardList = ({ items, history, selectedIndex }: ClipboardListParams) => {
    return (
        <div className="h-[-webkit-fill-available] overflow-y-auto">
            <ul>
                {history.map((hash, index) => (
                    <li key={hash} className={`h-8 ${selectedIndex === index ? 'bg-red-500' : ''}`} >
                        <ClipboardListItem item={items[hash]} />
                    </li>
                ))}
            </ul>
        </div>
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