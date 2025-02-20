import {ClipboardItem} from "@qlippy/common/src/settings/clipboard.settings.types";
import {memo} from "react";

export type ClipboardDetailsParams = { item: ClipboardItem | undefined };
export const ClipboardDetails = memo(({item}: ClipboardDetailsParams) => {
    console.log('item', {item});
    return (
        <div>
            Details
        </div>
    )
})