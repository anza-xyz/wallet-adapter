import React, { RefObject, useEffect } from 'react';

/**
 * Hook for handling closing when clicking outside of an element
 */
export function useOnClickOutside<T extends HTMLElement>(
    ref: RefObject<T>,
    handler: (event: MouseEvent | TouchEvent) => void
): void {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            const node = ref.current;

            // Do nothing if clicking ref's element or descendent elements
            if (!node || node.contains(event.target as Node)) return;

            handler(event);
        };

        document.addEventListener(`mousedown`, listener);
        document.addEventListener(`touchstart`, listener);

        return () => {
            document.removeEventListener(`mousedown`, listener);
            document.removeEventListener(`touchstart`, listener);
        };

        // Reload only if ref or handler changes
    }, [ref, handler]);
}
