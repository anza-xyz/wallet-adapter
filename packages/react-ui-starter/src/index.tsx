import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { SnackbarProvider } from 'notistack';
import Wallet from './Wallet';
import './index.css';

ReactDOM.render(
    <StrictMode>
        <SnackbarProvider>
            <Wallet />
        </SnackbarProvider>
    </StrictMode>,
    document.getElementById('root')
);
