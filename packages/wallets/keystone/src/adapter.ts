import {
    BaseMessageSignerWalletAdapter,
    WalletLoadError,
    WalletName,
    WalletNotConnectedError, WalletPublicKeyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import {PublicKey, Transaction} from '@solana/web3.js';
import type {DefaultKeyring} from '@keystonehq/sol-keyring'

export interface KeystoneWalletAdapterConfig {}
export const KeystoneWalletName = 'Keystone' as WalletName<'Keystone'>;

export class KeystoneWalletAdapter extends BaseMessageSignerWalletAdapter {

    name = KeystoneWalletName;
    url = 'https://keyst.one';
    icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAACXBIWXMAAA7EAAAOxAGVKw4bAAASmUlEQVR4nO1de3AU1Z7+umcyeWNCQgAxRZLiMSBCWOBidA1QJF4KZAUJqETELUDZvYoYoBS3pJDyURBTaCniCynRohCFSskrWe6KqYBEQGWBILkmbqKRS2JCEsIkM5OZ+e0fM5PM43SnZ6Z7ugfzVX01031ev3O+Pv34nXO6OcgPA4AsAOMBjAIwEsDtAFIBJAEYBCAOQIwrrh4Ar4AdWoADgA2AFYAZQBeAGwDaAbQAuAqgAUAtgMsAfnHFlQ2cDHnwADIALADwVwB3wyniAALHDQBVAMoBlAKoh/MgUQV6AEsAVACgASrCClcb6yVqIgt4AAUAqmWqxAD7Z7WrzYO6lPEB0AjghAYq/GflCZcGQvqw9JQEHsBqACYNVPLPTpNLi6B7s/vX/T8GwG4NVGyA3tzt0sZXO/SzzysgAcAxDVRmgGwec2nkqZmvhoKIwYC4kcBjLq0COmXzGDgtRxJ3I0CBV2vA6AEGxtUsITn4Kz8GwPdwuhMHEDnoAjAFwD88d7K69U7cYuImJiYiLS0NHCeHZ1aziINTOybcQhdA/VONbMzLy6PTp0+TzWYjh8NBTU1NtGXLFoqJiVHdNgXp9nj5dV49biH34/Lly3uFdTgc5IbD4aATJ06QwWBQ3UaFWA0B3/USDRgnCzMyMujmzZtMcd3cvHmz6nYqyCW+4vK4hUaFPv/8cy8x3SJ7bt+8eZNGjhypuq0KsQI+p+gsDRglC3Nzc/3EZQnscDho3759qturILPc4vIAijRgUMjkeZ7OnTtHUmG32+m+++5T3W6FWOTSFjycMwjUNihkrlixQrK4bpw7d450Op3qtivAcrfABgAdGjAoJA4aNIiuXr0asMBERCtWrFDdfgXY4dIWRg0YEzK3bt0alLhERPX19aTX61WvgwI0AsBDGjAkJI4aNYq6u7uZN1dSOWvWLNXroQAf4uGc2hrRKC4uRnR0dEh5TJ8+XSZrNIVRPJzzliMWs2fPxoMPPhhyPmlpaTJYozmM5OGclB6R0Ov1KCkpkSWvrq4uWfLRGG7Xw7niICKxcuVKTJo0SZa8Ll++LEs+GkMqAFyE+jcDATMpKYmam5u9fM0s9BdORGQ2myk1NVX1OinAi3pE6DKTTZs2YciQISAivzAiAsdxfmGsuBzH4ZNPPkFLS4titqqIQQDwB9Q/0gKi0Wgks9nsN1rk7rG+vmffME+2tbXR0KFDVa+TQvwDADo1YEhAPHz4sJ9grFOyFIHXrVunen0UZCcAWDRgiGTOmTMnYBGFeveVK1du5YF/cmkLuwYMkcSoqCiqrq5mnoL781Sx4sybN0/1OilMOzRghGSuWbOm3ztiqTh69Kjq9QkTVTdAElNSUqi1tVUWcS0WCxmNRtXrNCCwB9955x1ZxCUi2r59u+r1CRc5t8paxoQJE/DDDz8gKioq5Lyam5thNBrR1tYmGCc5ORljxowBz/Ooq6tDc3NzyOWqCdWPsv5YXl4e0lCgJ5988knBcrKzs+nIkSNktVp749tsNqqoqKDc3FzV2yFIqm6AKOfPny+buD/++KPg9JzCwkIv54kvbTYbFRUVqd4et5TA0dHRVFNTI4u4drudZsyYwSwnJyeHLBaLpDwWLlyoervcMgKvW7dOtt67f/9+Zhl6vZ7Onz8vOZ/GxkZKSEhQvW0iXuC0tDRqa2uT5a7ZZDIJTnJfvXq1l7fLE0L7X3nlFdXbJ+IFfv/99/ttaFYYyz25ZcsWZhnJycnU3NwsmFaobJPJRJmZmaq3UcQKnJ2dTT09PZIavb+whoYGio+PZ5bz1ltvSTpYPF2d7t8vv/xS9XaKWIG//vprP/+xWA9lieL+v3TpUmYZ48ePJ4vFIpqWRc+wCJmJqboBXly0aFG/grJEYAleWVlJHMcxyykrKxNNK/WxKwLmU6tuQC9jYmKorq5OsOdI7dHu59apU6cyy/F8thbqwUIi+8Z76qmnVG+3iBF448aNoj1GqAezxNi1axezDN9n60B6LMue5uZmSk5OVr3tNC/w8OHDqaOjg+RAe3s7DRs2jFnOhg0bZCnDExofvFDdAAJAu3fvlq3B169fzyxj2LBhsh1EnrBYLDRu3DjV21CzAk+dOpVsNpssjV1TU0PR0dHMcnbt2iVLGSxoeAKBugZwHEeVlZWyNLLD4aD58+czy5k2bZpsB5FQ2XPnzlVbTO0J/MgjjwR1g8PisWPHBA+ikydPylaOEKuqqtQWU1sCx8XFUUNDgyyNa7FYaPz48cxy5s6dq7i4bo4YMUJtQb2o6tdO1q9fj/T0dFny2rlzp+D6okWLFslShhSMHj06bGVJgWoCp6enY8OGDbLk1dLSgpdfflkwPCsrSzBMbtjt9rCVJQVh/ZqHJ15//XUkJCT0H7EfEBE2bdokOsfKZDIF9Z5Kcq1xkgq73Y6ffvop4HKURtivCzk5OWS3273uQH3vSH29TEI4f/58v2/J2bhxI/Oul7WPZYvUtOXl5apfcxkM80Wf56mqqkpUQJYLkRVut9tp5syZ/ZbpOXmA5eYUs8Mznlhai8VCU6ZMUVtM9QVetmwZU0RWw7Ia03P7iy++kFzuQw891DtbUkxg33BfstJarVZatmyZ2kKqL3BCQgI1NjYye4OQ4EICd3V1UUZGRkDlz5w5ky5evMgUTahcMdrtdjp16hTl5OSoLaIgw3qT9cILL2DEiBGCC7E9QT43OL7bJSUlqK+vD6j8b775BpMmTcLEiRNhNBphMBgCq4AHOjs7ceHCBdTV1QWdR7gQliMpMzOTTCaT6KmP1aNZcX/99ddIm9moJsNT0P79+0kuFBYWqt1okUTlC3G/4lcOnDp1SnAazgBVEFin0wX0il8x2Gw2mjZtmtoNFlFU/CZr+fLlmDJliix57dmzB2fPnpUlLy/wBnCc/F5bctgAssmebyBQdPlodHQ0fv75Z9xxxx0h59XZ2YmxY8fi2rVrMlgGABwSx6zCoAnPISohC1DikzvkgL27Cebm0zD9shddjYcBCu8HvRXtwQUFBbKICwCvvvqqjOICyf+yBbdN/C+AAziC/0pp97bnL/zjiKblAV18OuKz0hGftQTW1h/QcnIFrNf/V7Z69AdFe3BZWRnuv//+kPOpra3FXXfdBYvFIoNVgD4hA3cs+hngdLLkFwjI3oXmEw+ju/FIWMpTbLgwPj4eubm5suS1fv162cQFgJhhM8B5iMuhr4N6/ofAft/wQNLyujikzdoPQ8rkUKogGYoJnJ2djdjYWHAc1+uBcv/3pVjY8ePH8dVXX8lsHQdwHDjXr5sc57ntEsUnHidDWl4XhyH/ujssZxDFrsFjxozx2hYbVxVyU1qtVhQVFQmmS0pKQmFhIWbMmIHU1FS0traisrISn332Ga5fvy6YznytAuSwAzwPgPO4Rjkvtq5DDsSR8xrmMs/93/lLIaWNGjwJcXfMQ9dvch+83lCsBw8dOtRrmxj+5/7C3nvvPVRXVzPDHn74YdTV1eHtt9/G4sWLMWvWLBQUFODNN99EbW0tCgsLBcuz3fw/dFx6AyDX6dPnF+T6TwCIwBHB7Vrp2xd62tj0eYI2ygXFBI6KiuoVjiWgmOCA+DScxx9/HHv37sXgwYOZ4UlJSdizZw+ee+45wfzbvn8RnTXvOTdcvcypg7P1nT3UGUZwbhNHzh7LedyZhpA2KlH5qUSKCSz0BnVfYYUOgk2bNjFPsyNHjsS7774LnucF03IcB57nUVJSInKKd6D19N9w48pOEPU1vudp1+0O8qmBh1DUFyeYtA7lnSCKXYN///13AN6NTwLvcQa8r8MXLlzAhx9+yMx327ZtiIvz/ryx2FBjcXExOI4TePU/ofX03wAQEsf+h6sz+lxVPRTrfRwWPPkElrannX35kROKCXzp0iXmfl/BWeFFRUWw2fyP7pkzZ6KgoEA0rS84jkNxcTEAiIj8NECERON/OtOgz3lBHAeQt3Ce3gOOI8/ggNKa6g8w7JEXijk6dDodmpqakJKSElC6AwcO9Irom9/Zs2cxeXJwz48OhwPPP/883njjDYEYHFLuftspMue+G/Z2Zvmn6IsjtF8obfdvh9D0938LoAbBQQdgsxIZExGmT5+OcePGSU7T3d2NBQsWoL293S9s1apVWLVqVdD2cByH/Px8mEwmfPvtt+zyG49BF5OK6NRpfc/n7vQMQiDMcz8r3NZRg6b/WQCyKf+lF8UEBoCUlBTMmyf9UWDbtm04ePCg3/7k5GQcPHgQ8fHxIdnjFrmrq0tE5DLoYlJhSJ3mckzA3xftu48FAT+2teMKrpXPhqO7KaS6SIWiAl+/fh3PPPOMpMnjjY2NePTRR2G1Wv3CXnvtNeTl5cliE8dxyMvL61/k6BQYhvyl1zPVl4H3r9A4A8uv2dPxE66VzYa9+58y1EQaFBW4ra0NCxcu9HN6sPD000/j3LlzfvuNRiM+/vhj8Ly8T3T5+fno7u7GqVOnmOHdvztFjk79S9/plfNwbLi2IbbtwZ72y7hWPhv2bvlGxKRAUYEBIDExEfn5+aJxqqqqsHbtWmbYnj17MHbsWCVMQ15eHsxms6jIfPRgRA+Zzj4d97oe/fd7/va0V+NaWR7s5vCcln1NUWy4EHC6LOvr6wU/HulwOHDPPffgzJkzfmHz5s3DoUOHlDQPALBx40Zs3bpVIJTD4OlvYtC4Z4LKu6ftIv5Zng+HWZ13Tiveg00mE0aNGoXs7Gxm+KeffoodO3b47TcYDCgtLQ34MSsY5OXlwWKx4OTJk8zw7t/LwUcnI2aI8wulrDto3/8A0NN2wSXuHwpYLQ2KCwwANTU1WL16NXQ6nddQYGdnJxYuXIibN2/6pVm7di2WLl0a0lCjlHA3Z8+e3Y/IZeANyYgeMt2Zxj1sKDBcaL1+HtfK8+GwqPtFNR2ATRC/4Q8ZLS0tyMzM9HNSbN68GWVlZX7x4+LicODAgV6XZDBDjULhQnHdIlutVtGeDI5HzND7en3PHrkBruFC87UKNP39ATgsrYJlhwkOIEwfxho+fDj99ttvvVNgv/vuO8G34RQUFHhNlxWbUy1lhaBQOqHFZy+++KJoXaLT7qGheYcp43EzZT5BlPnvRBlP2GnEgguUOGYlgRNfzhpGWoAwftouJSWFVq5cSY899hjFxsYKxispKZG0ulBIUClpxQSWIjIA4vQJZEieSIbUqaSLZb94TWV2Ahr8OOXevXtFBQ11ZaLU1YUR8B7K/vgHD0Bzn742m82SPg3rBus6LDWtL4ioN/727dsVewYPE7p4ADfUtsIXV65cYe4nCUONQugvjBUeExODzZs3i1iqedwAgEqofyrx4oQJE2RbrBYqzGYz3Xbbbaq3SZCs5AFo7tPXly5dwvHjx9U2A4Bz+U1OTo7aZgSLFh7AVbWtYGHNmjXo7OxU2wwAQGZmptomBIurPIAGta1goaamBosXL2Z6ucINvV6114mFigYeQK3aVgihvLwc9957L86cOdN7I6QGr17V5ElOCmoBwAj1bwZEyXEcPfDAA2F5YyyL6enpqrdBkDQCgAFAhwaMkcTc3Fw6evQo2e32sIhbWVmpep2DZIdLWwBAuQYMCoiTJ0+mffv2UU9Pj6ICz5kzR/W6Bslyt7g8gCINGBQUR48eTR988AF1d3czn2ODfZ52OBz00UcfqV6/EFjk0hY8gCwNGBQSR4wYQcXFxXTjxo2ARBTaPnLkCBkMBtXrFQKz4LE0iQdQoQGjQubgwYPppZde6v3oZKDDhUREhw4dEhzKjBBWgLHubIkGDJON8fHx9Oyzz1JDQwNTVCGBS0tLI11ccmnpBz2Aag0YJyujoqLoiSeeoMuXL4sOF/b09FBxcXEkfIuwP1ZDZM1ZgQYMVIQ6nY4WLFhApaWl1NLSQna7nWw2G9XW1tKOHTvozjvvVN1Gmei/sMsDPIATGjBSccbGxlJUVJTqdsjME/C59nK+OwCMAfA9gDgMIJLQBWAKgH947tTBf0Zlq4sPhMeuAciENQD+mxXA+9C9bzfUP+UMUBp3M/Tz/O3d8GQMgGMaMH6A4jzm0sr3UitptV4CBkTWMo+5NAJCeKFODAZO11rkbpc2soAHsBqASQMV+7PT5NJCkVdgGfEneU7WKE+4NAgIvjdXUliAW9CtqWFWu9o8GK2CSsTD6e9cgltkFEqjrHC1sV5MQDGdPJ0cPJzLDYXO7WJhGQAWAPgrgLsBDBKINwBx3ABQBedsjFIA9XAtAUWfPu7/bvjq4hVf6rpgz8xZhTk8fg1wDjaPBzAKwEgAtwNIBZAEp/hxcN4BGtB3dN6KcACwAbACMMPpTrwBoB3OBQdX4Zy2XAvgMoBfXHH7g6CgvhH/H3k2yZY7G4i5AAAAAElFTkSuQmCC";

    private _keyring: DefaultKeyring | null;
    private _publicKey: PublicKey | null;
    private _connecting: boolean;
    private _readyState: WalletReadyState = WalletReadyState.Installed;

    constructor(config: KeystoneWalletAdapterConfig = {}) {
        super();
        this._keyring = null;
        this._publicKey = null;
        this._connecting = false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;
            let account: string;
            let keyring: DefaultKeyring;
            try {
                const { DefaultKeyring } = await import(
                    '@keystonehq/sol-keyring'
                    )
                keyring = DefaultKeyring.getEmptyKeyring()
                await keyring.readKeyring()
                account = keyring.getAccounts()[0].pubKey

            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            this._keyring = keyring;
            this._publicKey = publicKey;
            this.emit('connect', publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    get connecting(): boolean {
        return this._connecting;
    }

    async disconnect(): Promise<void> {
        if (this._keyring) {
            this._keyring = null;
            this._publicKey = null;
        }
        this.emit('disconnect');
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const keyring = this._keyring;
            const publicKey = this._publicKey?.toString();
            if (!keyring || !publicKey) throw new WalletNotConnectedError();
            try {
                return keyring.signTransaction(publicKey, transaction);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const keyring = this._keyring;
            const publicKey = this._publicKey?.toString();
            if (!keyring || !publicKey) throw new WalletNotConnectedError();

            try {
                return keyring.signMessage(publicKey,message);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        try {
            const keyring = this._keyring;
            const publicKey = this._publicKey?.toString();
            if (!keyring || !publicKey) throw new WalletNotConnectedError();
            const signedTransactions = [];
            try {
                for (const transaction of transactions) {
                    signedTransactions.push(await keyring.signTransaction(publicKey, transaction));
                }
                return signedTransactions;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }


}
