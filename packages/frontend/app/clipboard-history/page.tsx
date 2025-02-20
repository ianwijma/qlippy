'use client';

import {ClipboardQuery} from "./clipboard-query";
import {ClipboardList} from "./clipboard-list";
import {ClipboardDetails} from "./clipboard-details";
import {useCallback, useMemo, useState} from "react";
import {ClipboardHash, ClipboardType} from "@qlippy/common/src/clipboard.types";
import {useSettings} from "../../hooks/useSettings";
import {
    ClipboardHistory, ClipboardItem, ClipboardItemHash,
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
    hash: ClipboardItemHash,
    type: ClipboardType,
    text: string,
}

export default function ClipboardHistoryPage() {
    const {close} = useWindowControls();
    const [query, setQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<'' | ClipboardType>('');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const {isLoading, settings} = useSettings<ClipboardSettings>('clipboard');

    const {items, history} = useMemo<{items: ClipboardItems, history: ClipboardHistory}>(() => ({
        items: isLoading ? {} : settings.clipboardItems,
        history: isLoading ? [] as ClipboardHistory : settings.clipboardHistory,
    }), [isLoading, settings]);

    const selectedItem = useMemo<ClipboardItem>(() => items[history[selectedIndex]] ?? undefined, [selectedIndex, items, history]);

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
        return history.map((hash: ClipboardItemHash) => {
            const item = items[hash] ?? undefined;
            if (item) {
                const {type, value} = item;
                switch (type) {
                    case "text":
                    case "colour": {
                        return {
                            hash,
                            type,
                            text: value.toLowerCase(),
                        }
                    }
                    case "html":
                    case "url":
                    case "path": {
                        const {metadata: { text }} = item
                        return {
                            hash,
                            type,
                            text: text.toLowerCase(),
                        }
                    }
                    case "image": {
                        return {
                            hash,
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

    const filteredHistory = useMemo<ClipboardHash[]>(() => {
        const filtered = [];

        searchableItems.forEach(({ text, type, hash }) => {
            const textMatch = text.includes(searchQuery);

            const typeSearch = typeFilter !== '';
            const typeMatch = typeSearch ? typeFilter === type : true;

            if (textMatch && typeMatch) {
                filtered.push(hash);
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
        const hash = filteredHistory[selectedIndex];

        if (hash) {
            eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, {
                hash: filteredHistory[selectedIndex]
            });
        }

        close();
    }, [filteredHistory, selectedIndex]);

    const clearSelected = useCallback(() => {
        const hash = filteredHistory[selectedIndex];

        if (hash) {
            eventHandler.emit<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, {hashes: [
                filteredHistory[selectedIndex]
            ]});
        }

        if (selectedIndex === filteredHistory.length - 1) setSelectedIndex(selectedIndex - 1);
    }, [filteredHistory, selectedIndex, setSelectedIndex]);

    const handleClose = useCallback(() => close(), [close])

    return (
        <div className="bg-slate-500 h-screen p-2 draggable overflow-hidden">
            <div className="flex flex-col gap-1 h-full">
                <div className="bg-red-500 h-20 not-draggable">
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
                <div className="flex gap-1 h-[inherit]">
                    <div className="bg-green-500 w-2/5 not-draggable">
                        <ClipboardList items={items} history={filteredHistory} selectedIndex={selectedIndex} />
                    </div>
                    <div className="bg-pink-500 w-3/5 not-draggable">
                        <ClipboardDetails item={selectedItem} />
                    </div>
                </div>
            </div>
        </div>
    )
}