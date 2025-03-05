import {ClipboardItems, ClipboardItemTypes} from "@qlippy/common/src/settings/clipboard.settings.types";
import {memo} from "react";
import {HtmlFrame} from "../../components/htmlFrame";

export type ClipboardDetailsParams = { item: ClipboardItems | undefined };
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

const getMetadataFromType = (item: ClipboardItems) => {
    const {type, dateTimeCreated, dateTimeUpdated} = item;

    const toDate = (dateMs: number): string => {
        const date = new Date(dateMs);

        return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
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
        'Copied first': toDate(dateTimeCreated),
        'Copied last': toDate(dateTimeUpdated),
    }

    switch (type) {
        case ClipboardItemTypes.text:
            return {
                'Type': 'text',
                "Total characters": item.length,
                ...baseData,
            };
        case ClipboardItemTypes.html:
            return {
                'Type': 'HTML',
                "Total characters": item.length,
                "Text": item.htmlText,
                "Text total characters": item.htmlTextLength,
                ...baseData,
            };
        case ClipboardItemTypes.url:
            return {
                'Type': 'URL',
                "URL Length": item.length,
                "URL username": item.username,
                "URL password": item.password,
                "URL protocol": item.protocol,
                "Url hostname": item.hostname,
                "Url path": item.pathname,
                "Url hash": item.hash,
                "Url query": item.searchParams,
                ...baseData,
            };
        case ClipboardItemTypes.path: {
            const defaultFirstData = {
                'Type': 'File path',
                "Path": item.path,
                "Path length": item.length,
                ...baseData,
            }

            const defaultRestData = {
                "User ID": item.userId,
                "Group ID": item.groupId,
                "Date created": toDate(item.createdMs),
                "Date last accessed": toDate(item.lastAccessedMs),
                "Date last modified": toDate(item.lastModifiedMs),
                "Date status changed": toDate(item.statusChangedMs),
                ...baseData,
            }

            if (item.isFile) {
                return {
                    ...defaultFirstData,
                    'Size': humanFileSize(item.size),
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
        case ClipboardItemTypes.colour:
            return {
                'Type': 'Colour',
                'Colour': item.colour,
                ...baseData,
            };
        case ClipboardItemTypes.image:
            return {
                'Type': 'Image',
                'Image width': item.size.width,
                'Image height': item.size.height,
                ...baseData,
            };
        default:
            return {
                ...(item as Object),
                ...baseData,
            };
    }
}

type MetadataProps = { item: ClipboardItems };
const Metadata = ({ item }: MetadataProps) => {
    const metadata= getMetadataFromType(item);

    return (
        <ul className='text-gray-500 ml-2'>
            {Object.keys(metadata).map(key => {
                const value: string | any = metadata[key];

                return (
                    <li key={key} className="truncate">
                        {key}: {
                        typeof value === 'string' ? value : (
                            <ul className='ml-3'>
                                {Object.keys(value).map((subKey: string) => {
                                    const subValue = value[subKey];
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

type DetailsProps = { item: ClipboardItems };
const Details = ({ item }: DetailsProps) => {
    const { type } = item;

    switch (type) {
        case ClipboardItemTypes.text: {
            return (
                <div>
                    {item.text}
                </div>
            )
        }
        case ClipboardItemTypes.html: {
            return (
                <HtmlFrame>{item.html}</HtmlFrame>
            )
        }
        case ClipboardItemTypes.url: {
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
                <div>
                    Screenshotting site...
                </div>
            )
        }
        case ClipboardItemTypes.path: {
            return (
                <div>
                    {item.path}
                </div>
            )
        }
        case ClipboardItemTypes.colour: {
            return (
                <div style={{ backgroundColor: item.colour }} className='w-full h-full'></div>
            )
        }
        case ClipboardItemTypes.image: {
            const {imageFilePath} = item;
            if (imageFilePath) {
                return (
                    <img
                        src={`app://${item.imageFilePath}`}
                        alt='Clipboard image'
                        className='w-full h-full object-contain'
                    />
                )
            }

            return (
                <div>
                    Saving image...
                </div>
            )
        }
        default: {
            return (
                <div>
                    No preview available for {type}
                </div>
            )
        }
    }

}