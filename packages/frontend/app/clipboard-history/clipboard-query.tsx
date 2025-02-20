import {KeyboardEventHandler, memo, useCallback, useEffect, useRef} from "react";

export type ClipboardQueryParams = {
    query: string;
    updateQuery: (query: string) => void;
    typeFilter: string;
    updateTypeFilter: (query: string) => void;
    selectNext: () => void,
    selectPrevious: () => void,
    confirmSelected: () => void,
    deleteSelected: () => void,
    close: () => void,
}

export const ClipboardQuery = memo(({
                                        query,
                                        updateQuery,
                                        typeFilter,
                                        updateTypeFilter,
                                        selectNext,
                                        selectPrevious,
                                        confirmSelected,
                                        deleteSelected,
                                        close
                                    }: ClipboardQueryParams) => {
    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
        switch (event.code) {
            case 'ArrowDown':
                event.preventDefault();
                selectNext();
                break;
            case 'ArrowUp':
                event.preventDefault();
                selectPrevious();
                break;
            case 'Enter':
                event.preventDefault();
                confirmSelected();
                break;
            case 'Escape':
                event.preventDefault();
                close();
                break;
            case 'Delete':
                event.preventDefault();
                deleteSelected();
                break;
        }
    }, [selectNext, selectPrevious, confirmSelected, close, deleteSelected]);

    return (
        <div className="h-full flex gap-1 justify-between items-center px-2">
            <input
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className='text-gray-500 w-4/5 h-12 px-2'
                placeholder='Type to filter through entries...'
            />
            <select
                className='text-gray-500 w-1/5 h-12'
                value={typeFilter}
                onChange={(e) => updateTypeFilter(e.target.value)}
            >
                <option value=''>All Types</option>
                <option value='image'>Images</option>
                <option value='html'>HTML</option>
                <option value='url'>URLs</option>
                <option value='path'>Files</option>
                <option value='colour'>Colours</option>
                <option value='text'>Text</option>
            </select>
        </div>
    )
})