import {ClipboardItem, ClipboardItems} from "@qlippy/common/src/settings/clipboard.settings.types";
import {memo} from "react";

export type ClipboardDetailsParams = { item: ClipboardItem | undefined };
export const ClipboardDetails = memo(({item}: ClipboardDetailsParams) => {
    if (!item) return '';

    return (
        <div className='h-full overflow-y-auto'>
            <div className='h-3/5'>
                <Details item={item} />
            </div>
            <div className=''>
                <Metadata item={item} />
            </div>
        </div>
    )
})

const getMetadataFromType = (item: ClipboardItem) => {
    const {type, metadata} = item;

    switch (type) {
        case "text":
            return {};
        case "html":
            return {};
        case "url":
            return {};
        case "path":
            return {};
        case "colour":
            return {};
        case "image":
            return {};
        default:
            return {};
    }
}

type MetadataProps = { item: ClipboardItem };
const Metadata = ({ item }: MetadataProps) => {
    const metadata= getMetadataFromType(item);

    return (
        <ul>
            {Object.keys(metadata).map(key => {
                const value: string | any = metadata[key];

                return (
                    <li key={key} className="truncate">
                        {key}: {JSON.stringify(value)}
                    </li>
                )
            })}
        </ul>
    )
}



type DetailsProps = { item: ClipboardItem };
const Details = ({ item }: DetailsProps) => {
    const {type} = item;

    switch (type) {
        case "text": {
            return (
                <div>
                    Data
                </div>
            )
        }
        case "html": {
            return (
                <div>
                    Data
                </div>
            )
        }
        case "url": {
            return (
                <div>
                    Data
                </div>
            )
        }
        case "path": {
            return (
                <div>
                    Data
                </div>
            )
        }
        case "colour": {
            return (
                <div>
                    Data
                </div>
            )
        }
        case "image": {
            return (
                <div>
                    Data
                </div>
            )
        }
        default: {
            return (
                <div>
                    Data
                </div>
            )
        }
    }

}