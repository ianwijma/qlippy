import {useSettings} from "../../hooks/useSettings";
import {
    ClipboardItem,
    ClipboardItemHash,
    ClipboardSettings
} from "@qlippy/common/src/settings/clipboard.settings.types";
import {useMemo} from "react";

type SearchableItem = {
    hash: ClipboardItemHash,
    searchableText: string,
}

export const ClipboardList = () => {
    const {isLoading, settings} = useSettings<ClipboardSettings>('clipboard');
    const {clipboardItems = {}} = settings ?? {}

    const searchableItems = useMemo<SearchableItem[]>(() => {
        if (isLoading) return [];

        const {clipboardHistory, clipboardItems} = settings;

        return clipboardHistory.map((hash: ClipboardItemHash) => {
            const item = clipboardItems[hash] ?? undefined;
            if (item) {
                const {type, value} = item;
                switch (type) {
                    case "text":
                    case "colour":
                        return {
                            hash,
                            searchableText: value.toLowerCase(),
                        }
                    case "html":
                    case "url":
                    case "path":
                        const {metadata: { text }} = item
                        return {
                            hash,
                            searchableText: text.toLowerCase(),
                        }
                    case "image":
                        return {
                            hash,
                            searchableText: `image`
                        }
                }
            }
        })
    }, [settings])

    return (
        <div className="h-[-webkit-fill-available] overflow-y-auto">
            <ul>
                {searchableItems.map(({hash}) => (
                    <li key={hash} className='h-8'>
                        <ClipboardListItem item={clipboardItems[hash]} />
                    </li>
                ))}
            </ul>
        </div>
    )
}

type ClipboardListItemType = {
    item: undefined | ClipboardItem
}

const ClipboardListItem = ({item}: ClipboardListItemType) => {
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