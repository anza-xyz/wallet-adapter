/**
 * @jest-environment jsdom
 */

'use strict';

import {
    type Adapter,
    BaseWalletAdapter,
    WalletError,
    type WalletName,
    WalletNotReadyError,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import React, { createRef, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { useWallet, type WalletContextState } from '../useWallet.js';
import { WalletProviderBase, type WalletProviderBaseProps } from '../WalletProviderBase.js';

type TestRefType = {
    getWalletContextState(): WalletContextState;
};

const TestComponent = forwardRef(function TestComponentImpl(_props, ref) {
    const wallet = useWallet();
    useImperativeHandle(
        ref,
        () => ({
            getWalletContextState() {
                return wallet;
            },
        }),
        [wallet]
    );
    return null;
});

describe('WalletProviderBase', () => {
    let ref: React.RefObject<TestRefType>;
    let root: ReturnType<typeof createRoot>;
    let container: HTMLElement;
    let fooWalletAdapter: MockWalletAdapter;
    let barWalletAdapter: MockWalletAdapter;
    let bazWalletAdapter: MockWalletAdapter;
    let adapters: Adapter[];
    let isUnloading: React.MutableRefObject<boolean>;

    function renderTest(
        props: Omit<
            WalletProviderBaseProps,
            'children' | 'wallets' | 'isUnloadingRef' | 'onConnectError' | 'onSelectWallet'
        >
    ) {
        act(() => {
            root.render(
                <WalletProviderBase
                    wallets={adapters}
                    isUnloadingRef={isUnloading}
                    onConnectError={jest.fn()}
                    onSelectWallet={jest.fn()}
                    {...props}
                >
                    <TestComponent ref={ref} />
                </WalletProviderBase>
            );
        });
    }

    abstract class MockWalletAdapter extends BaseWalletAdapter {
        connectionPromise: null | Promise<void> = null;
        disconnectionPromise: null | Promise<void> = null;
        connectedValue = false;
        get connected() {
            return this.connectedValue;
        }
        readyStateValue: WalletReadyState = WalletReadyState.Installed;
        get readyState() {
            return this.readyStateValue;
        }
        connecting = false;
        connect = jest.fn(async () => {
            this.connecting = true;
            if (this.connectionPromise) {
                await this.connectionPromise;
            }
            this.connecting = false;
            this.connectedValue = true;
            act(() => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.emit('connect', this.publicKey!);
            });
        });
        disconnect = jest.fn(async () => {
            this.connecting = false;
            if (this.disconnectionPromise) {
                await this.disconnectionPromise;
            }
            this.connectedValue = false;
            act(() => {
                this.emit('disconnect');
            });
        });
        sendTransaction = jest.fn();
        supportedTransactionVersions = null;
    }
    class FooWalletAdapter extends MockWalletAdapter {
        name = 'FooWallet' as WalletName<'FooWallet'>;
        url = 'https://foowallet.com';
        icon = 'foo.png';
        publicKey = new PublicKey('Foo11111111111111111111111111111111111111111');
    }
    class BarWalletAdapter extends MockWalletAdapter {
        name = 'BarWallet' as WalletName<'BarWallet'>;
        url = 'https://barwallet.com';
        icon = 'bar.png';
        publicKey = new PublicKey('Bar11111111111111111111111111111111111111111');
    }
    class BazWalletAdapter extends MockWalletAdapter {
        name = 'BazWallet' as WalletName<'BazWallet'>;
        url = 'https://bazwallet.com';
        icon = 'baz.png';
        publicKey = new PublicKey('Baz11111111111111111111111111111111111111111');
    }

    beforeEach(() => {
        jest.resetAllMocks();
        container = document.createElement('div');
        document.body.appendChild(container);
        isUnloading = { current: false };
        root = createRoot(container);
        ref = createRef();
        fooWalletAdapter = new FooWalletAdapter();
        barWalletAdapter = new BarWalletAdapter();
        bazWalletAdapter = new BazWalletAdapter();
        adapters = [fooWalletAdapter, barWalletAdapter, bazWalletAdapter];
    });
    afterEach(() => {
        if (root) {
            root.unmount();
        }
    });
    describe('given a selected wallet', () => {
        beforeEach(async () => {
            fooWalletAdapter.readyStateValue = WalletReadyState.NotDetected;
            renderTest({ adapter: fooWalletAdapter });
            expect(ref.current?.getWalletContextState().wallet?.readyState).toBe(WalletReadyState.NotDetected);
        });
        describe('that then becomes ready', () => {
            beforeEach(() => {
                act(() => {
                    fooWalletAdapter.readyStateValue = WalletReadyState.Installed;
                    fooWalletAdapter.emit('readyStateChange', WalletReadyState.Installed);
                });
            });
            it('sets `ready` to true', () => {
                expect(ref.current?.getWalletContextState().wallet?.readyState).toBe(WalletReadyState.Installed);
            });
        });
        describe('when the wallet disconnects of its own accord', () => {
            beforeEach(() => {
                act(() => {
                    fooWalletAdapter.disconnect();
                });
            });
            it('clears out the state', () => {
                expect(ref.current?.getWalletContextState()).toMatchObject({
                    connected: false,
                    connecting: false,
                    publicKey: null,
                });
            });
        });
        describe('when the wallet disconnects as a consequence of the window unloading', () => {
            beforeEach(() => {
                act(() => {
                    isUnloading.current = true;
                    fooWalletAdapter.disconnect();
                });
            });
            it('should not clear out the state', () => {
                expect(ref.current?.getWalletContextState().wallet?.adapter).toBe(fooWalletAdapter);
                expect(ref.current?.getWalletContextState().publicKey).not.toBeNull();
            });
        });
    });
    describe('given the presence of an unsupported wallet', () => {
        beforeEach(() => {
            bazWalletAdapter.readyStateValue = WalletReadyState.Unsupported;
            renderTest({ adapter: fooWalletAdapter });
        });
        it('filters out the unsupported wallet', () => {
            const adapters = ref.current?.getWalletContextState().wallets.map(({ adapter }) => adapter);
            expect(adapters).not.toContain(bazWalletAdapter);
        });
    });
    describe('when auto connect is disabled', () => {
        beforeEach(() => {
            renderTest({ onAutoConnectRequest: undefined, adapter: fooWalletAdapter });
        });
        it('`autoConnect` is `false` on state', () => {
            expect(ref.current?.getWalletContextState().autoConnect).toBe(false);
        });
    });
    describe('and auto connect is enabled', () => {
        let onAutoConnectRequest: jest.Mock;
        beforeEach(() => {
            onAutoConnectRequest = jest.fn();
            fooWalletAdapter.readyStateValue = WalletReadyState.NotDetected;
            renderTest({ adapter: fooWalletAdapter, onAutoConnectRequest });
        });
        it('`autoConnect` is `true` on state', () => {
            expect(ref.current?.getWalletContextState().autoConnect).toBe(true);
        });
        describe('before the adapter is ready', () => {
            it('does not call `connect` on the adapter', () => {
                expect(fooWalletAdapter.connect).not.toHaveBeenCalled();
            });
            describe('once the adapter becomes ready', () => {
                beforeEach(async () => {
                    await act(async () => {
                        fooWalletAdapter.readyStateValue = WalletReadyState.Installed;
                        fooWalletAdapter.emit('readyStateChange', WalletReadyState.Installed);
                        await Promise.resolve(); // Flush all promises in effects after calling `select()`.
                    });
                });
                it('calls `onAutoConnectRequest`', () => {
                    expect(onAutoConnectRequest).toHaveBeenCalledTimes(1);
                });
                describe('when switching to another adapter', () => {
                    beforeEach(async () => {
                        jest.clearAllMocks();
                        renderTest({ adapter: barWalletAdapter, onAutoConnectRequest });
                    });
                    it('calls `onAutoConnectRequest` despite having called it once before on the old adapter', () => {
                        expect(onAutoConnectRequest).toHaveBeenCalledTimes(1);
                    });
                });
                describe('once the adapter connects', () => {
                    beforeEach(async () => {
                        await act(async () => {
                            await fooWalletAdapter.connect();
                        });
                    });
                    describe('then disconnects', () => {
                        beforeEach(async () => {
                            jest.clearAllMocks();
                            await act(async () => {
                                await fooWalletAdapter.disconnect();
                            });
                        });
                        it('does not make a second attempt to auto connect', () => {
                            expect(onAutoConnectRequest).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
    describe('custom error handler', () => {
        const errorToEmit = new WalletError();
        let onError: jest.Mock;
        beforeEach(async () => {
            onError = jest.fn();
            renderTest({ adapter: fooWalletAdapter, onError });
        });
        it('gets called in response to adapter errors', () => {
            act(() => {
                fooWalletAdapter.emit('error', errorToEmit);
            });
            expect(onError).toBeCalledWith(errorToEmit, fooWalletAdapter);
        });
        it('does not get called if the window is unloading', () => {
            const errorToEmit = new WalletError();
            act(() => {
                isUnloading.current = true;
                fooWalletAdapter.emit('error', errorToEmit);
            });
            expect(onError).not.toBeCalled();
        });
        describe('when a wallet is connected', () => {
            beforeEach(async () => {
                await act(() => {
                    ref.current?.getWalletContextState().connect();
                });
                expect(ref.current?.getWalletContextState()).toMatchObject({
                    connected: true,
                });
            });
            describe('then the `onError` function changes', () => {
                beforeEach(async () => {
                    const differentOnError = jest.fn(); /* Some function, different from the one above */
                    renderTest({ adapter: fooWalletAdapter, onError: differentOnError });
                });
                it('does not cause state to be cleared when it changes', () => {
                    // Regression test for https://github.com/solana-labs/wallet-adapter/issues/636
                    expect(ref.current?.getWalletContextState()).toMatchObject({
                        connected: true,
                    });
                });
            });
        });
    });
    describe('connect()', () => {
        describe('given an adapter that is not ready', () => {
            beforeEach(async () => {
                window.open = jest.fn();
                fooWalletAdapter.readyStateValue = WalletReadyState.NotDetected;
                renderTest({ adapter: fooWalletAdapter });
                expect(ref.current?.getWalletContextState().wallet?.readyState).toBe(WalletReadyState.NotDetected);
                act(() => {
                    expect(ref.current?.getWalletContextState().connect()).rejects.toThrow();
                });
            });
            it("opens the wallet's URL in a new window", () => {
                expect(window.open).toBeCalledWith('https://foowallet.com', '_blank');
            });
            it('throws a `WalletNotReady` error', () => {
                act(() => {
                    expect(ref.current?.getWalletContextState().connect()).rejects.toThrow(new WalletNotReadyError());
                });
            });
        });
        describe('given an adapter that is ready', () => {
            let commitConnection: () => void;
            beforeEach(async () => {
                renderTest({ adapter: fooWalletAdapter });
                fooWalletAdapter.connectionPromise = new Promise<void>((resolve) => {
                    commitConnection = resolve;
                });
                await act(() => {
                    ref.current?.getWalletContextState().connect();
                });
            });
            it('calls connect on the adapter', () => {
                expect(fooWalletAdapter.connect).toHaveBeenCalled();
            });
            it('updates state tracking variables appropriately', () => {
                expect(ref.current?.getWalletContextState()).toMatchObject({
                    connected: false,
                    connecting: true,
                });
            });
            describe('once connected', () => {
                beforeEach(async () => {
                    await act(() => {
                        commitConnection();
                    });
                });
                it('updates state tracking variables appropriately', () => {
                    expect(ref.current?.getWalletContextState()).toMatchObject({
                        connected: true,
                        connecting: false,
                    });
                });
            });
        });
    });
    describe('disconnect()', () => {
        describe('when there is already an adapter supplied', () => {
            let commitDisconnection: () => void;
            beforeEach(async () => {
                window.open = jest.fn();
                renderTest({ adapter: fooWalletAdapter });
                await act(() => {
                    ref.current?.getWalletContextState().connect();
                });
                fooWalletAdapter.disconnectionPromise = new Promise<void>((resolve) => {
                    commitDisconnection = resolve;
                });
                await act(() => {
                    ref.current?.getWalletContextState().disconnect();
                });
            });
            it('updates state tracking variables appropriately', () => {
                expect(ref.current?.getWalletContextState()).toMatchObject({
                    connected: true,
                });
            });
            describe('once disconnected', () => {
                beforeEach(async () => {
                    await act(() => {
                        commitDisconnection();
                    });
                });
                it('clears out the state', () => {
                    expect(ref.current?.getWalletContextState()).toMatchObject({
                        connected: false,
                        connecting: false,
                        publicKey: null,
                    });
                });
            });
        });
    });
    describe('when there is no adapter supplied', () => {
        beforeEach(() => {
            renderTest({ adapter: null });
        });
        describe('and one becomes supplied', () => {
            beforeEach(() => {
                renderTest({ adapter: fooWalletAdapter });
            });
            it('sets the state tracking variables', () => {
                expect(ref.current?.getWalletContextState()).toMatchObject({
                    wallet: { adapter: fooWalletAdapter, readyState: fooWalletAdapter.readyState },
                    connected: false,
                    connecting: false,
                    publicKey: null,
                });
            });
        });
    });
    describe('when there is already an adapter supplied', () => {
        let commitFooWalletDisconnection: () => void;
        beforeEach(async () => {
            fooWalletAdapter.disconnectionPromise = new Promise<void>((resolve) => {
                commitFooWalletDisconnection = resolve;
            });
            renderTest({ adapter: fooWalletAdapter });
        });
        describe('when you null out the adapter', () => {
            beforeEach(() => {
                renderTest({ adapter: null });
            });
            it('clears out the state', () => {
                expect(ref.current?.getWalletContextState()).toMatchObject({
                    wallet: null,
                    connected: false,
                    connecting: false,
                    publicKey: null,
                });
            });
        });
        describe('and a different adapter becomes supplied', () => {
            beforeEach(async () => {
                renderTest({ adapter: barWalletAdapter });
            });
            it('the adapter of the new wallet should be set in state', () => {
                expect(ref.current?.getWalletContextState().wallet?.adapter).toBe(barWalletAdapter);
            });
            /**
             * Regression test: a race condition in the wallet name setter could result in the
             * wallet reverting back to an old value, depending on the cadence of the previous
             * wallets' disconnect operation.
             */
            describe('then a different one becomes supplied before the first one has disconnected', () => {
                beforeEach(async () => {
                    renderTest({ adapter: bazWalletAdapter });
                    act(() => {
                        commitFooWalletDisconnection();
                    });
                });
                it('the wallet you selected last should be set in state', () => {
                    expect(ref.current?.getWalletContextState().wallet?.adapter).toBe(bazWalletAdapter);
                });
            });
        });
    });
});
