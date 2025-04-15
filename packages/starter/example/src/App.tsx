import type { FC } from 'react';
import React from 'react';
import { ContextProvider } from './components/ContextProvider';
import { Tables } from './components/Tables';

export const App: FC = () => {
    return (
        <ContextProvider>
            <Tables />
        </ContextProvider>
    );
};
