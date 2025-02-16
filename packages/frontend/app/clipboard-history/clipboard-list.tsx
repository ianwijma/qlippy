import {useSettings} from "../../hooks/useSettings";
import {ClipboardSettings} from "@qlippy/common/src/settings/clipboard.settings.types";
import {useMemo} from "react";

type SearchableItem = {

}

export const ClipboardList = () => {
    const {isLoading, settings} = useSettings<ClipboardSettings>('clipboard');

    const searchableItems = useMemo(() => {}, [])

    return (
        <div>
            List
        </div>
    )
}

const ClipboardListItem = ({item}: {item: ClipboardSettings | undefined}) => {

}