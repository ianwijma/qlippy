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
                    <li key={hash}>
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
                <div className="truncate">
                    {value}
                </div>
            )
        case "html":
            const {text} = metadata
            return (
                <div className="truncate">
                    {text}
                </div>
            )
        case "url":
            return (
                <div className='truncate'>
                    {value}
                </div>
            )
        case "path":
            return (
                <div className='truncate'>
                    {value}
                </div>
            )
        case "image":
            return (
                <div className='truncate'>
                    Image: <img className='h-9' src={`app://${value}`} alt='Clipboard image content'/>
                </div>
            )
        default:
            return (
                <div className="truncate">
                    {value}
                </div>
            )
    }
}