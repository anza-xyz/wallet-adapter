import { createTheme, ThemeProvider } from '@material-ui/core';
import { deepPurple } from '@material-ui/core/colors';
import { SnackbarProvider } from 'notistack';
import React, { FC } from 'react';
import Wallet from './Wallet';

// Use require instead of import, and order matters
require('./App.css');

const theme = createTheme({
    palette: {
        type: 'dark',
        primary: {
            main: deepPurple[700],
        },
    },
    overrides: {
        MuiButtonBase: {
            root: {
                justifyContent: 'flex-start',
            },
        },
        MuiButton: {
            root: {
                textTransform: undefined,
                padding: '12px 16px',
            },
            startIcon: {
                marginRight: 8,
            },
            endIcon: {
                marginLeft: 8,
            },
        },
    },
});

const App: FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <SnackbarProvider>
                <Wallet />
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
