'use client';

import {ClipboardQuery} from "./clipboard-query";
import {ClipboardList} from "./clipboard-list";
import {ClipboardDetails} from "./clipboard-details";
import {useCallback, useMemo, useRef, useState} from "react";
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
import {
    RestoreImageClipboardHistoryEventData,
    restoreImageClipboardHistoryEventName
} from '@qlippy/common/src/events/restoreImageClipboardHistory.event'
import {useWindowControls} from "../../hooks/useWindowControls";
import {toHumanDateAgo} from '@qlippy/common/src/date'
import {ClipboardMenu} from "./clipboard-menu";
import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";

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
    const amountOfPinnedItems = useRef(0);
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [query, setQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<'' | ClipboardItemTypes>('');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const {isLoading, settings, updateSettings} = useSettings<ClipboardSettings>('clipboard');

    const updateQuery = useCallback((query: string) => {
        setQuery(query);
        setSelectedIndex(0);
    }, [setQuery, setSelectedIndex]);

    const updateTypeFilter = useCallback((type: '' | ClipboardItemTypes) => {
        setTypeFilter(type);
        setSelectedIndex(0);
    }, [setTypeFilter, setSelectedIndex]);

    const {history} = useMemo<{history: ClipboardHistory,}>(() => ({
        history: isLoading ? [] as ClipboardHistory : settings.history,
    }), [isLoading, settings]);

    const searchableHistory = useMemo<SearchableHistory[]>(() => {
        amountOfPinnedItems.current = 0;
        return history.map((item) => {
            const {id, type, dateTimeCopied, pinned} = item;

            if (pinned) {
                amountOfPinnedItems.current++;
            }

            const base = { id, type, item, group: pinned ? 'Pinned' : toHumanDateAgo(dateTimeCopied), };
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
        }, amountOfPinnedItems.current > 0 ? {'Pinned': []} : {});
    }, [filteredHistory]);

    const getSearchableHistoryByIndex= useCallback((index: number): SearchableHistory | undefined => {
        let currentIndex = 0;
        return Object.keys(filteredGroupedHistory).reduce((acc, group) => {
            const searchableHistories = filteredGroupedHistory[group];

            searchableHistories.forEach((searchableHistory) => {
                if (currentIndex === index) {
                    acc = searchableHistory;
                }

                currentIndex++;
            })

            return acc;
        }, undefined as SearchableHistory | undefined);
    }, [filteredGroupedHistory])

    const selectedItem = useMemo<ClipboardItem | undefined>(
        () => getSearchableHistoryByIndex(selectedIndex)?.item ?? undefined,
        [getSearchableHistoryByIndex, selectedIndex]
    )

    const selectNext = useCallback(() => {
        const newSelectedIndex = selectedIndex + 1;
        const hasNext = !!getSearchableHistoryByIndex(newSelectedIndex);
        if (hasNext) {
            setSelectedIndex(newSelectedIndex);
        }
    }, [getSearchableHistoryByIndex, selectedIndex, setSelectedIndex]);

    const selectPrevious = useCallback(() => {
        const newSelectedIndex = selectedIndex - 1;
        const hasPrevious = !!getSearchableHistoryByIndex(newSelectedIndex);
        if (hasPrevious) {
            setSelectedIndex(newSelectedIndex);
        }
    }, [getSearchableHistoryByIndex, selectedIndex, setSelectedIndex]);

    const restoreSelected = useCallback(() => {
        if (selectedItem) {
            eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, {
                id: selectedItem.id
            });
        }

        close();
    }, [selectedItem]);

    const restoreSelectedImage = useCallback(() => {
        if (selectedItem && 'imageFilePath' in selectedItem && !!selectedItem.imageFilePath) {
            eventHandler.emit<RestoreImageClipboardHistoryEventData>(restoreImageClipboardHistoryEventName, {
                id: selectedItem.id
            });
        }

        setSelectedIndex(0);
    }, [selectedItem, setSelectedIndex]);

    const clearSelected = useCallback(() => {
        if (selectedItem) {
            eventHandler.emit<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, {
                ids: [ selectedItem.id ]
            });
        }

        if (selectedIndex === filteredHistory.length - 1) setSelectedIndex(selectedIndex - 1);
    }, [selectedItem, setSelectedIndex]);

    const openSelected = useCallback((action: OpenClipboardHistoryAction) => {
        if (selectedItem) {
            eventHandler.emit<OpenClipboardHistoryEventData>(openClipboardHistoryEventName, {
                id: selectedItem.id,
                action
            });
        }

        if (selectedIndex === filteredHistory.length - 1) setSelectedIndex(selectedIndex - 1);
    }, [selectedItem, setSelectedIndex]);

    const pinSelected = useCallback(() => {
        const {history} = settings;

        updateSettings({
            ...settings,
            history: history.map((item) => {
                if (item.id === selectedItem.id) {
                    item.pinned = !item.pinned;
                }

                return item;
            })
        });

        setQuery('');
        setTypeFilter('');
        setSelectedIndex(0);
    }, [selectedItem, settings, updateSettings]);

    const handleClose = useCallback(() => close(), [close])

    const handleClick = useCallback((index: number) => {
        if (index >= 0 && index < filteredHistory.length) {
            setSelectedIndex(index);
        } else {
            setSelectedIndex(0);
        }
    }, [setSelectedIndex, filteredHistory]);

    const handleDoubleClicked = useCallback((index: number) => {
        const item = getSearchableHistoryByIndex(index);

        if (item) {
            eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, {
                id: item.id
            });
        }

        close();
    }, [setSelectedIndex, getSearchableHistoryByIndex]);

    const handleShowMenu = useCallback(() => setShowMenu(true), [setShowMenu]);
    const handleHideMenu = useCallback(() => setShowMenu(false), [setShowMenu]);

    return (
        <DefaultWindowContainer hideTitleBar title='Qlippy' className="draggable bg-opacity-70 bg-white rounded-xl select-none relative overflow-clip">
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
                        pinSelected={pinSelected}
                        restoreSelectedImage={restoreSelectedImage}
                        close={handleClose}
                        isMenuShown={showMenu}
                        showMenu={handleShowMenu}
                        hideMenu={handleHideMenu}
                    />
                </div>
                <div className="row-span-1 col-span-1 overflow-y-auto overflow-x-hidden rounded-bl-lg relative cursor-default not-draggable">
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
        </DefaultWindowContainer>
    )
}