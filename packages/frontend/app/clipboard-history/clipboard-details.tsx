import {ClipboardItem} from "@qlippy/common/src/settings/clipboard.settings.types";
import {memo} from "react";
import {HtmlFrame} from "../../components/htmlFrame";

export type ClipboardDetailsParams = { item: ClipboardItem | undefined };
export const ClipboardDetails = memo(({item}: ClipboardDetailsParams) => {
    if (!item) return '';

    return (
        <div className='h-full not-draggable overflow-y-auto flex flex-col gap-2'>
            <div className='h-3/5 overflow-auto bg-opacity-70 bg-white'>
                <Details item={item} />
            </div>
            <div className='h-2/5 overflow-auto bg-opacity-70 bg-white rounded-br-lg'>
                <Metadata item={item} />
            </div>
        </div>
    )
})

const getMetadataFromType = (item: ClipboardItem) => {
    const {type, dateTimeCopied, pinned} = item;

    const toDate = (dateMs: number): string => {
        const date = new Date(dateMs);

        return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
    }

    const toDifference = (from: number, to: number): string | undefined => {
        if (from && to) {
            return `${to-from}ms`
        }

        return undefined;
    }

    function humanFileSize(bytes: number, useMetrics: boolean = false, rounding: number = 1) {
        const thresh = useMetrics ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = useMetrics
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10 ** rounding;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


        return bytes.toFixed(rounding) + ' ' + units[u];
    }

    const baseData = {
        'Copied': toDate(dateTimeCopied),
        'Pinned': pinned ? 'Yes' : 'No',
    }

    switch (type) {
        case 'text':
            return {
                'Type': 'text',
                "Total characters": String(item.length),
                ...baseData,
            };
        case 'html':
            return {
                'Type': 'HTML',
                "Total characters": String(item.length),
                "Text": item.htmlText,
                "Text total characters": String(item.htmlTextLength),
                ...baseData,
            };
        case 'url':
            return {
                'Type': 'URL',
                "URL Length": String(item.length),
                "URL username": item.username,
                "URL password": item.password,
                "URL protocol": item.protocol,
                "Url hostname": item.hostname,
                "Url path": item.pathname,
                "Url hash": item.hash,
                "Url query": item.searchParams,
                "Screenshot size": Number.isInteger(item.size) ? humanFileSize(item.size) : undefined,
                "Screenshot duration": toDifference(item.screenshotStart, item.screenshotEnd),
                'Screenshot width': Number.isInteger(item.screenshotWidth) ? String(item.screenshotWidth) : undefined,
                'Screenshot height': Number.isInteger(item.screenshotHeight) ? String(item.screenshotHeight) : undefined,
                ...baseData,
            };
        case 'path': {
            const defaultFirstData = {
                'Type': 'File path',
                "Path": item.path,
                "Path length": String(item.length),
                ...baseData,
            }

            const defaultRestData = {
                "User ID": String(item.userId),
                "Group ID": String(item.groupId),
                "Date created": toDate(item.createdMs),
                "Date last accessed": toDate(item.lastAccessedMs),
                "Date last modified": toDate(item.lastModifiedMs),
                "Date status changed": toDate(item.statusChangedMs),
                ...baseData,
            }

            if (item.isFile) {
                return {
                    ...defaultFirstData,
                    'Size': Number.isInteger(item.size) ? humanFileSize(item.size) : undefined,
                    ...defaultRestData,
                    ...baseData,
                }
            }

            return {
                ...defaultFirstData,
                ...defaultRestData,
                ...baseData,
            };
        }
        case 'colour':
            return {
                'Type': 'Colour',
                'Colour': String(item.colour),
                ...baseData,
            };
        case 'image':
            return {
                'Type': 'Image',
                'Image size': Number.isInteger(item.size) ? humanFileSize(item.size) : undefined,
                'Image width': String(item.width),
                'Image height': String(item.height),
                ...baseData,
            };
        default:
            return {
                ...(item as ClipboardItem),
                ...baseData,
            };
    }
}

type MetadataProps = { item: ClipboardItem };
const Metadata = ({ item }: MetadataProps) => {
    const metadata= getMetadataFromType(item);

    return (
        <ul className='text-gray-500 ml-2'>
            {Object.keys(metadata).map(key => {
                const value: string | any = metadata[key];

                if (!value || JSON.stringify(value) === '{}') return '';

                return (
                    <li key={key} className="truncate">
                        {key}: {
                        typeof value === 'string' ? value : value && (
                            <ul className='ml-3'>
                                {Object.keys(value).map((subKey: string) => {
                                    const subValue = value[subKey];

                                    if (!value) return '';

                                    return (
                                        <li key={subKey}>
                                            {subKey}: {subValue}
                                        </li>
                                    )
                                })}
                            </ul>
                        )
                    }
                    </li>
                )
            })}
        </ul>
    )
}

type DetailsProps = { item: ClipboardItem };
const Details = ({ item }: DetailsProps) => {
    const { type } = item;

    switch (type) {
        case 'text': {
            return (
                <div className='text-gray-500 pl-1'>
                    {item.text}
                </div>
            )
        }
        case 'html': {
            return (
                <HtmlFrame>{item.html}</HtmlFrame>
            )
        }
        case 'url': {
            const {imageFilePath} = item;
            if (imageFilePath) {
                return (
                    <div className='w-full h-full'>
                        <img
                            src={`app://${item.imageFilePath}`}
                            alt='Clipboard url screenshot'
                            className='w-full'
                        />
                    </div>
                )
            }

            return (
                <div className='text-gray-500 pl-1'>
                    Screenshotting the site...
                </div>
            )
        }
        case 'path': {
            return (
                <div className='text-gray-500 pl-1'>
                    {item.path}
                </div>
            )
        }
        case 'colour': {
            return (
                <div style={{ backgroundColor: item.colour }} className='w-full h-full'></div>
            )
        }
        case 'image': {
            const {imageFilePath} = item;
            if (imageFilePath) {
                return (
                    <div className='w-full h-full'>
                        <img
                            src={`app://${item.imageFilePath}`}
                            alt='Clipboard url screenshot'
                            className='w-full'
                        />
                    </div>
                )
            }

            return (
                <div className='text-gray-500 pl-1'>
                    Saving the image...
                </div>
            )
        }
        default: {
            return (
                <div className='text-gray-500 pl-1'>
                    No preview available for {type}
                </div>
            )
        }
    }

}