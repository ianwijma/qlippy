'use client';

import {ClipboardQuery} from "./clipboard-query";
import {ClipboardList} from "./clipboard-list";
import {ClipboardDetails} from "./clipboard-details";
import {useCallback, useMemo, useState} from "react";
import {ClipboardType} from "@qlippy/common/src/clipboard.types";
import {useSettings} from "../../hooks/useSettings";
import {
    ClipboardHistory, ClipboardHistoryIdToItemHash,
    ClipboardItem,
    ClipboardHistoryId,
    ClipboardItems,
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

export type SearchableItem = {
    id: ClipboardHistoryId,
    type: ClipboardType,
    text: string,
}

export default function ClipboardHistoryPage() {
    const {close} = useWindowControls();
    const [query, setQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<'' | ClipboardType>('');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const {isLoading, settings} = useSettings<ClipboardSettings>('clipboard');

    const {items, historyIdToItemHash, history} = useMemo<{items: ClipboardItems, history: ClipboardHistory, historyIdToItemHash: ClipboardHistoryIdToItemHash}>(() => ({
        items: isLoading ? {} : settings.items,
        historyIdToItemHash: isLoading ? {} as ClipboardHistoryIdToItemHash : settings.historyIdToItemHash,
        history: isLoading ? [] as ClipboardHistory : settings.history,
    }), [isLoading, settings]);

    const selectedItem = useMemo<ClipboardItem>(() => {
        const id = history[selectedIndex];
        const hash = historyIdToItemHash[id];
        return items[hash];
    }, [selectedIndex, items, historyIdToItemHash, history]);

    const itemToHistoryIdMap = useMemo<{[key: ClipboardHistoryId]: ClipboardItem}>(() => {
        return history.reduce((acc, id) => {
            const hash = historyIdToItemHash[id];
            acc[id] = items[hash];
            return acc
        }, {})
    }, [items, historyIdToItemHash, history])

    const updateQuery = useCallback((query: string) => {
        setQuery(query);
        setSelectedIndex(0);
    }, [setQuery, setSelectedIndex]);

    const updateTypeFilter = useCallback((type: '' | ClipboardType) => {
        setTypeFilter(type);
        setSelectedIndex(0);
    }, [setTypeFilter, setSelectedIndex]);

    const searchQuery = useMemo(() => query.toLowerCase(), [query]);

    const searchableItems = useMemo<SearchableItem[]>(() => {
        return history.map((id: ClipboardHistoryId) => {
            const hash = historyIdToItemHash[id];
            const item = items[hash] ?? undefined;
            if (item) {
                const {type, value} = item;
                switch (type) {
                    case "text":
                    case "colour": {
                        return {
                            id,
                            type,
                            text: value.toLowerCase(),
                        }
                    }
                    case "html":
                    case "url":
                    case "path": {
                        const {metadata: { text }} = item
                        return {
                            id,
                            type,
                            text: text.toLowerCase(),
                        }
                    }
                    case "image": {
                        return {
                            id,
                            type,
                            text: `image`
                        }
                    }
                    default:
                        return undefined;
                }
            }
        }).filter(Boolean);
    }, [items, history]);

    const filteredHistory = useMemo<ClipboardHistoryId[]>(() => {
        const filtered = [];

        searchableItems.forEach(({ text, type, id }) => {
            const textMatch = text.includes(searchQuery);

            const typeSearch = typeFilter !== '';
            const typeMatch = typeSearch ? typeFilter === type : true;

            if (textMatch && typeMatch) {
                filtered.push(id);
            }
        })

        return [...new Set(filtered)];
    }, [searchableItems, searchQuery, typeFilter]);

    const selectNext = useCallback(() => {
        const newSelectedIndex = selectedIndex + 1;
        const hasNew = !!filteredHistory[newSelectedIndex];
        if (hasNew) {
            setSelectedIndex(newSelectedIndex);
        }
    }, [filteredHistory, selectedIndex, setSelectedIndex]);

    const selectPrevious = useCallback(() => {
        const newSelectedIndex = selectedIndex - 1;
        const hasNew = !!filteredHistory[newSelectedIndex];
        if (hasNew) {
            setSelectedIndex(newSelectedIndex);
        }
    }, [filteredHistory, selectedIndex, setSelectedIndex]);

    const restoreSelected = useCallback(() => {
        const id = filteredHistory[selectedIndex];

        if (id) {
            eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, { id });
        }

        close();
    }, [filteredHistory, selectedIndex]);

    const clearSelected = useCallback(() => {
        const id = filteredHistory[selectedIndex];

        if (id) {
            eventHandler.emit<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, {ids: [
                filteredHistory[selectedIndex]
            ]});
        }

        if (selectedIndex === filteredHistory.length - 1) setSelectedIndex(selectedIndex - 1);
    }, [filteredHistory, selectedIndex, setSelectedIndex]);

    const handleClose = useCallback(() => close(), [close])

    const handleHover = useCallback((id: ClipboardHistoryId) => {
        const index = filteredHistory.indexOf(id);

        if (index >= 0 && index < filteredHistory.length) {
            setSelectedIndex(index);
        } else {
            setSelectedIndex(0);
        }
    }, [setSelectedIndex, filteredHistory]);

    const handleClicked = useCallback((id: ClipboardHistoryId) => {
        if (id) {
            eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, {
                id
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
                        items={itemToHistoryIdMap}
                        history={filteredHistory}
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