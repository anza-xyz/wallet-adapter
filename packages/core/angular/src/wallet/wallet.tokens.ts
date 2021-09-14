import { InjectionToken } from '@angular/core';

import { WalletConfig } from './wallet.types';

export const WALLET_CONFIG = new InjectionToken<WalletConfig>('walletConfig');
