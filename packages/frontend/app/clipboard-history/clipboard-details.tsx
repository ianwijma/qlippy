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
    const {type, metadata, value} = item;

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

    switch (type) {
        case "text":
            return {
                'Type': 'text',
                "Total characters": metadata.length
            };
        case "html":
            return {
                'Type': 'HTML',
                "Total characters": metadata.length,
                "Text": metadata.text,
                "Text total characters": metadata.textLength,
            };
        case "url":
            return {
                'Type': 'URL',
                "URL Length": metadata.length,
                "URL username": metadata.username,
                "URL password": metadata.password,
                "URL protocol": metadata.protocol,
                "Url hostname": metadata.hostname,
                "Url path": metadata.pathname,
                "Url hash": metadata.hash,
                "Url query": metadata.searchParams,
            };
        case "path": {
            const defaultFirstData = {
                'Type': 'File path',
                "Path": value,
                "Path length": metadata.length,
            }

            const defaultRestData = {
                "User ID": metadata.userId,
                "Group ID": metadata.groupId,
                "Date created": toDate(metadata.createdMs),
                "Date last accessed": toDate(metadata.lastAccessedMs),
                "Date last modified": toDate(metadata.lastModifiedMs),
                "Date status changed": toDate(metadata.statusChangedMs),
            }

            if (metadata.isFile) {
                return {
                    ...defaultFirstData,
                    'Size': humanFileSize(metadata.size),
                    ...defaultRestData,
                }
            }

            return {
                ...defaultFirstData,
                ...defaultRestData,
            };
        }
        case "colour":
            return {
                'Type': 'Colour',
            };
        case "image":
            return {
                'Type': 'Image',
                'Image width': metadata.size.width,
                'Image height': metadata.size.height,
            };
        default:
            return metadata;
    }
}

type MetadataProps = { item: ClipboardItem };
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
                                            {key}: {subValue}
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
    const {type, value} = item;

    switch (type) {
        case "text": {
            return (
                <div>
                    {value}
                </div>
            )
        }
        case "html": {
            return (
                <HtmlFrame>{value}</HtmlFrame>
            )
        }
        case "url": {
            return (
                <iframe src={value} frameBorder={0} className='w-full h-full pointer-events-none' />
            )
        }
        case "path": {
            return (
                <div>
                    {value}
                </div>
            )
        }
        case "colour": {
            return (
                <div style={{ backgroundColor: value }} className='w-full h-full'></div>
            )
        }
        case "image": {
            return (
                <img src={`app://${value}`} alt='Clipboard image' className='w-full h-full object-contain' />
            )
        }
        default: {
            return (
                <div>
                    {value}
                </div>
            )
        }
    }

}