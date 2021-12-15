import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import { SnackbarProvider } from 'notistack';
import React, { FC } from 'react';
import { Wallet } from './Wallet';

// Use require instead of import, and order matters
require('./App.css');

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: deepPurple[700],
        },
    },
    components: {
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    justifyContent: 'flex-start',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
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
    },
});

const App: FC = () => {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <SnackbarProvider>
                    <Wallet />
                </SnackbarProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default App;
