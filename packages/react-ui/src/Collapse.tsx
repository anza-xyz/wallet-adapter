import React, { FC, useLayoutEffect, useRef } from 'react';

interface CollapseProps {
    expanded: boolean;
    id: string;
}

export const Collapse: FC<CollapseProps> = ({ children, expanded = false, id }) => {
    const ref = useRef() as React.MutableRefObject<HTMLDivElement>;
    const instant = useRef(true);
    const transition = 'height 250ms ease-out';

    const openCollapse = () => {
        const node = ref.current;
        requestAnimationFrame(() => {
            node.style.height = node.scrollHeight + 'px';
        });
    };

    const closeCollapse = () => {
        const node = ref.current;
        requestAnimationFrame(() => {
            node.style.height = node.offsetHeight + 'px';
            node.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                node.style.height = '0';
            });
        });
    };

    useLayoutEffect(() => {
        if (expanded) {
            openCollapse();
        } else {
            closeCollapse();
        }
    }, [expanded]);

    useLayoutEffect(() => {
        const node = ref.current;
        function handleComplete() {
            node.style.overflow = expanded ? 'initial' : 'hidden';
            if (expanded) {
                node.style.height = 'auto';
            }
        }
        function handleTransitionEnd(event: TransitionEvent) {
            if (event.target === node && event.propertyName === 'height') {
                handleComplete();
            }
        }
        if (instant.current) {
            handleComplete();
            instant.current = false;
        }
        node.addEventListener('transitionend', handleTransitionEnd);
        return () => {
            node.removeEventListener('transitionend', handleTransitionEnd);
        };
    }, [expanded]);

    return (
        <div
            children={children}
            className="wallet-adapter-collapse"
            id={id}
            ref={ref}
            role="region"
            style={{ height: 0, transition: instant.current ? undefined : transition }}
        />
    );
};
