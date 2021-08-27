import { createTheme, ThemeProvider } from '@material-ui/core';
import { deepPurple, pink } from '@material-ui/core/colors';
import 'antd/dist/antd.dark.less';
import { SnackbarProvider } from 'notistack';
import React, { FC } from 'react';
import './App.css';
import { Demo } from './Demo';

const theme = createTheme({
    palette: {
        type: 'dark',
        primary: {
            main: deepPurple[700],
        },
        secondary: {
            main: pink[700],
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
                <Demo />
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
