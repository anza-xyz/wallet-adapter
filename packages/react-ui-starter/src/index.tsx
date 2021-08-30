import React from 'react';
import ReactDOM from 'react-dom';
import { SnackbarProvider } from 'notistack';
import Wallet from './Wallet';
import './index.css';

ReactDOM.render(
    <React.StrictMode>
        <SnackbarProvider>
            <Wallet />
        </SnackbarProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
