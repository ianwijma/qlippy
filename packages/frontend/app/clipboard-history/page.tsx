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
import {
    OpenClipboardHistoryAction,
    OpenClipboardHistoryEventData,
    openClipboardHistoryEventName
} from '@qlippy/common/src/events/openClipboardHistory.event'
import {useWindowControls} from "../../hooks/useWindowControls";
import {toHumanDateAgo} from '@qlippy/common/src/date'
import {ClipboardMenu} from "./clipboard-menu";

export type SearchableHistory = {
    id: ClipboardId,
    type: ClipboardItemTypes,
    text: string,
    item: ClipboardItem,
    group: string,
}

export type SearchableGroupedHistory = Record<string, SearchableHistory[]>;

export default function ClipboardHistoryPage() {
    const {close} = useWindowControls();
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [query, setQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<'' | ClipboardItemTypes>('');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const {isLoading, settings} = useSettings<ClipboardSettings>('clipboard');

    const {history} = useMemo<{history: ClipboardHistory,}>(() => ({
        history: isLoading ? [] as ClipboardHistory : settings.history,
    }), [isLoading, settings]);

    const searchableHistory = useMemo<SearchableHistory[]>(() => {
        return history.map((item) => {
            const {id, type, dateTimeCopied} = item;

            const base = { id, type, item, group: toHumanDateAgo(dateTimeCopied), };
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

    const filteredGroupedHistory = useMemo<SearchableGroupedHistory>(() => {
        return filteredHistory.reduce((acc, item) => {
            const {group} = item;
            if (group in acc === false) {
                acc[group] = []
            }

            acc[group].push(item);

            return acc;
        }, {});
    }, [filteredHistory])

    const selectedItem = useMemo<ClipboardItem | undefined>(
        () => filteredHistory[selectedIndex]?.item ?? undefined,
        [filteredHistory, selectedIndex]
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
        const selectedItem = filteredHistory[selectedIndex];

        if (selectedItem) {
            eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, {
                id: selectedItem.id
            });
        }

        close();
    }, [filteredHistory, selectedIndex]);

    const clearSelected = useCallback(() => {
        const selectedItem = filteredHistory[selectedIndex];

        if (selectedItem) {
            eventHandler.emit<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, {
                ids: [ selectedItem.id ]
            });
        }

        if (selectedIndex === filteredHistory.length - 1) setSelectedIndex(selectedIndex - 1);
    }, [filteredHistory, selectedIndex, setSelectedIndex]);

    const openSelected = useCallback((action: OpenClipboardHistoryAction) => {
        const selectedItem = filteredHistory[selectedIndex];

        if (selectedItem) {
            eventHandler.emit<OpenClipboardHistoryEventData>(openClipboardHistoryEventName, {
                id: selectedItem.id,
                action
            });
        }

        if (selectedIndex === filteredHistory.length - 1) setSelectedIndex(selectedIndex - 1);
    }, [filteredHistory, selectedIndex, setSelectedIndex]);

    const handleClose = useCallback(() => close(), [close])

    const handleClick = useCallback((index: number) => {
        if (index >= 0 && index < filteredHistory.length) {
            setSelectedIndex(index);
        } else {
            setSelectedIndex(0);
        }
    }, [setSelectedIndex, filteredHistory]);

    const handleDoubleClicked = useCallback((index: number) => {
        const item = filteredHistory[index];

        if (item) {
            eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, {
                id: item.id
            });
        }

        close();
    }, [setSelectedIndex, filteredHistory]);

    const handleShowMenu = useCallback(() => setShowMenu(true), [setShowMenu]);
    const handleHideMenu = useCallback(() => setShowMenu(false), [setShowMenu]);

    return (
        <div className="draggable bg-opacity-70 bg-white rounded-xl select-none relative overflow-clip">
            <ClipboardMenu show={showMenu} item={selectedItem} />
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
                        openSelected={openSelected}
                        close={handleClose}
                        isMenuShown={showMenu}
                        showMenu={handleShowMenu}
                        hideMenu={handleHideMenu}
                    />
                </div>
                <div className="row-span-1 col-span-1 overflow-y-auto overflow-x-hidden rounded-bl-lg relative">
                    <ClipboardList
                        history={filteredGroupedHistory}
                        selectedIndex={selectedIndex}
                        onItemClicked={handleClick}
                        onItemDoubleClick={handleDoubleClicked}/>
                </div>
                <div className="row-span-1 col-span-1 overflow-y-auto overflow-x-hidden">
                    <ClipboardDetails item={selectedItem}/>
                </div>
            </div>
        </div>
    )
}