'use client';

import {ClipboardQuery} from "./clipboard-query";
import {ClipboardList} from "./clipboard-list";
import {ClipboardDetails} from "./clipboard-details";
import {useCallback, useMemo, useState} from "react";
import {useSettings} from "../../hooks/useSettings";
import {
    ClipboardHistory,
    ClipboardId,
    ClipboardItem,
    ClipboardItemTypes,
    ClipboardSettings
} from "@qlippy/common/src/settings/clipboard.settings.types";
import {eventHandler} from "../../utils/eventHandler";
import {
    RestoreClipboardHistoryEventData,
    restoreClipboardHistoryEventName
} from '@qlippy/common/src/events/restoreClipboardHistory.event'
import {
    ClearClipboardHistoryEventData,
    clearClipboardHistoryEventName
} from '@qlippy/common/src/events/clearClipboardHistory.event'
import {useWindowControls} from "../../hooks/useWindowControls";

export type SearchableHistory = {
    id: ClipboardId,
    type: ClipboardItemTypes,
    text: string,
    item: ClipboardItem,
}

export default function ClipboardHistoryPage() {
    const {close} = useWindowControls();
    const [query, setQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<'' | ClipboardItemTypes>('');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const {isLoading, settings} = useSettings<ClipboardSettings>('clipboard');

    const {history} = useMemo<{history: ClipboardHistory,}>(() => ({
        history: isLoading ? [] as ClipboardHistory : settings.history,
    }), [isLoading, settings]);

    const searchableHistory = useMemo<SearchableHistory[]>(() => {
        return history.map((item) => {
            const {id, type} = item;

            const base = { id, type, item };
            switch (type) {
                case 'text': return {
                    ...base,
                    text: item.text.toString(),
                };
                case 'colour': return {
                    ...base,
                    text: item.colour.toLowerCase(),
                }
                case 'html': return {
                    ...base,
                    text: item.htmlText.toLowerCase(),
                }
                case 'url': return {
                    ...base,
                    text: item.url.toLowerCase(),
                }
                case 'path': {
                    return {
                        ...base,
                        text: item.path.toLowerCase(),
                    }
                }
                case 'image': return {
                    ...base,
                    text: `image`
                }
                default:
                    // Make TS happy
                    return undefined;
            }
        }).filter(Boolean);
    }, [history]);

    const updateQuery = useCallback((query: string) => {
        setQuery(query);
        setSelectedIndex(0);
    }, [setQuery, setSelectedIndex]);

    const updateTypeFilter = useCallback((type: '' | ClipboardItemTypes) => {
        setTypeFilter(type);
        setSelectedIndex(0);
    }, [setTypeFilter, setSelectedIndex]);

    const searchQuery = useMemo(() => query.toLowerCase(), [query]);

    const filteredHistory = useMemo<SearchableHistory[]>(() => {
        return searchableHistory.filter(({ text, type }) => {
            const textMatch = text.includes(searchQuery);

            const typeSearch = typeFilter !== '';
            const typeMatch = typeSearch ? typeFilter === type : true;

            return textMatch && typeMatch;
        });
    }, [searchableHistory, searchQuery, typeFilter]);

    const filteredItems = useMemo<ClipboardItem[]>(
        () => filteredHistory.map(({item}) => item),
        [filteredHistory]
    );

    const selectedItem = useMemo<ClipboardItem | undefined>(
        () => filteredItems[selectedIndex],
        [filteredItems, selectedIndex]
    )

    const selectNext = useCallback(() => {
        const newSelectedIndex = selectedIndex + 1;
        const hasNext = !!filteredHistory[newSelectedIndex];
        if (hasNext) {
            setSelectedIndex(newSelectedIndex);
        }
    }, [filteredHistory, selectedIndex, setSelectedIndex]);

    const selectPrevious = useCallback(() => {
        const newSelectedIndex = selectedIndex - 1;
        const hasPrevious = !!filteredHistory[newSelectedIndex];
        if (hasPrevious) {
            setSelectedIndex(newSelectedIndex);
        }
    }, [filteredHistory, selectedIndex, setSelectedIndex]);

    const restoreSelected = useCallback(() => {
        const searchable = filteredHistory[selectedIndex];

        if (searchable) {
            eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, {
                id: searchable.id
            });
        }

        close();
    }, [filteredHistory, selectedIndex]);

    const clearSelected = useCallback(() => {
        const searchable = filteredHistory[selectedIndex];

        if (searchable) {
            eventHandler.emit<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, {
                ids: [ searchable.id ]
            });
        }

        if (selectedIndex === filteredHistory.length - 1) setSelectedIndex(selectedIndex - 1);
    }, [filteredHistory, selectedIndex, setSelectedIndex]);

    const handleClose = useCallback(() => close(), [close])

    const handleHover = useCallback((index: number) => {
        if (index >= 0 && index < filteredHistory.length) {
            setSelectedIndex(index);
        } else {
            setSelectedIndex(0);
        }
    }, [setSelectedIndex, filteredHistory]);

    const handleClicked = useCallback((index: number) => {
        const item = filteredHistory[index];

        if (item) {
            eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, {
                id: item.id
            });
        }

        close();
    }, [setSelectedIndex, filteredHistory]);

    return (
        <div className="draggable bg-opacity-70 bg-white rounded-xl">
            <div className="h-screen w-screen max-w-full grid gap-2 p-2 grid-rows-[3rem_1fr] grid-cols-[2fr_3fr]">
                <div className="col-span-2 row-span-1">
                    <ClipboardQuery
                        query={query}
                        updateQuery={updateQuery}
                        typeFilter={typeFilter}
                        updateTypeFilter={updateTypeFilter}
                        selectNext={selectNext}
                        selectPrevious={selectPrevious}
                        confirmSelected={restoreSelected}
                        deleteSelected={clearSelected}
                        close={handleClose}
                    />
                </div>
                <div className="row-span-1 col-span-1 overflow-y-auto overflow-x-hidden rounded-bl-lg">
                    <ClipboardList
                        history={filteredItems}
                        selectedIndex={selectedIndex}
                        onItemHover={handleHover}
                        onItemClicked={handleClicked}/>
                </div>
                <div className="row-span-1 col-span-1 overflow-y-auto overflow-x-hidden">
                    <ClipboardDetails item={selectedItem}/>
                </div>
            </div>
        </div>
    )
}