import type { EventEmitter, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { Transaction } from '@solana/web3.js';
import { PublicKey , VersionedTransaction} from '@solana/web3.js';

const solChain = {t:1,i:0}

/**
 * Base58 ---------------------------
 */
const encoder = new TextEncoder();

function getTypeName(value: any): string {
  const type = typeof value;
  if (type !== "object") {
    return type;
  } else if (value === null) {
    return "null";
  } else {
    if(value?.constructor?.name)
    {
        return value?.constructor?.name
    }
     return "object";
  }
}

export function validateBinaryLike(source: unknown): Uint8Array {
  if (typeof source === "string") {
    return encoder.encode(source);
  } else if (source instanceof Uint8Array) {
    return source;
  } else if (source instanceof ArrayBuffer) {
    return new Uint8Array(source);
  }
  throw new TypeError(
    `The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${
      getTypeName(source)
    }.`,
  );
}


// deno-fmt-ignore
const mapBase58: Record<string, number> = {
  "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7, "9": 8, A: 9,
  B: 10, C: 11, D: 12, E: 13, F: 14, G: 15, H: 16, J: 17, K: 18, L: 19, M: 20,
  N: 21, P: 22, Q: 23, R: 24, S: 25, T: 26, U: 27, V: 28, W: 29, X: 30, Y: 31,
  Z: 32, a: 33, b: 34, c: 35, d: 36, e: 37, f: 38, g: 39, h: 40, i: 41, j: 42,
  k: 43, m: 44, n: 45, o: 46, p: 47, q: 48, r: 49, s: 50, t: 51, u: 52, v: 53,
  w: 54, x: 55, y: 56, z: 57
};

const base58alphabet =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".split("");

/**
 * Converts data into a base58-encoded string.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/draft-msporny-base58-03#section-3}
 *
 * @param data The data to encode.
 * @returns The base58-encoded string.
 *
 * @example
 * ```ts
 * import { encodeBase58 } from "https://deno.land/std@$STD_VERSION/encoding/base58.ts";
 *
 * encodeBase58("Hello World!"); // "2NEpo7TZRRrLZSi2U"
 * ```
 */
export function encodeBase58(data: ArrayBuffer | Uint8Array | string): string {
  const uint8tData = validateBinaryLike(data);

  let length = 0;
  let zeroes = 0;

  // Counting leading zeroes
  let index = 0;
  while (uint8tData[index] === 0) {
    zeroes++;
    index++;
  }

  const notZeroUint8Data = uint8tData.slice(index);

  const size = Math.round((uint8tData.length * 138) / 100 + 1);
  const b58Encoding: number[] = [];

  notZeroUint8Data.forEach((byte) => {
    let i = 0;
    let carry = byte;

    for (
      let reverseIterator = size - 1;
      (carry > 0 || i < length) && reverseIterator !== -1;
      reverseIterator--, i++
    ) {
      carry += (b58Encoding[reverseIterator] || 0) * 256;
      b58Encoding[reverseIterator] = Math.round(carry % 58);
      carry = Math.floor(carry / 58);
    }

    length = i;
  });

  const strResult: string[] = Array.from({
    length: b58Encoding.length + zeroes,
  });

  if (zeroes > 0) {
    strResult.fill("1", 0, zeroes);
  }

  b58Encoding.forEach((byteValue) =>
    strResult.push(base58alphabet[byteValue]!)
  );

  return strResult.join("");
}

/**
 * Decodes a base58-encoded string.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/draft-msporny-base58-03#section-4}
 *
 * @param b58 The base58-encoded string to decode.
 * @returns The decoded data.
 *
 * @example
 * ```ts
 * import { decodeBase58 } from "https://deno.land/std@$STD_VERSION/encoding/base58.ts";
 *
 * decodeBase58("2NEpo7TZRRrLZSi2U");
 * // Uint8Array(12) [ 72, 101, 108, 108, 111, 32,  87, 111, 114, 108, 100, 33 ]
 * ```
 */
export function decodeBase58(b58: string): Uint8Array {
  const splitInput = b58.trim().split("");

  let length = 0;
  let ones = 0;

  // Counting leading ones
  let index = 0;
  while (splitInput[index] === "1") {
    ones++;
    index++;
  }

  const notZeroData = splitInput.slice(index);

  const size = Math.round((b58.length * 733) / 1000 + 1);
  const output: number[] = [];

  notZeroData.forEach((char, idx) => {
    let carry = mapBase58[char];
    let i = 0;

    if (carry === undefined) {
      throw new Error(`Invalid base58 char at index ${idx} with value ${char}`);
    }

    for (
      let reverseIterator = size - 1;
      (carry > 0 || i < length) && reverseIterator !== -1;
      reverseIterator--, i++
    ) {
      carry += 58 * (output[reverseIterator] || 0);
      output[reverseIterator] = Math.round(carry % 256);
      carry = Math.floor(carry / 256);
    }

    length = i;
  });

  const validOutput = output.filter((item) => item !== undefined);

  if (ones > 0) {
    const onesResult = Array.from({ length: ones }).fill(0, 0, ones);

    return new Uint8Array([...onesResult, ...validOutput] as number[]);
  }

  return new Uint8Array(validOutput);
}

//-----------------------------------


/**
 * Main action class 
 */

class Tonspack{
    private uuid: any;
    private config: any;
    private baseurl: any;
    private actionUrl: any;
    private loopInterval: any;
    private loopTimeout: any;

    constructor(uuid?:any,config?:any)
    {
        if(uuid)
        {
            this.uuid = uuid
        }else{
            this.uuid = crypto.randomUUID();
        }

        if(config?.baseurl)
        {
            this.baseurl = config.baseurl
        }else{
            this.baseurl = "https://pack.tons.ink/api"
        }

        if(config?.actionUrl)
        {
            this.actionUrl = config.actionUrl
        }else{
            this.actionUrl = 'https://t.me/tonspack_bot/connect?startapp='
        }

        if(config?.loopInterval)
        {
            this.loopInterval = config.loopInterval
        }else{
            this.loopInterval = 500 //0.5
        }

        if(config?.loopTimeout)
        {
            this.loopTimeout = config.loopTimeout
        }else{
            this.loopTimeout = 120 //1min
        }
    }

    async loopCheck(pin : Window|null) {
        let flag = navigator.userAgent.match(
            /(iPhone|WebOS|Symbian|Windows Phone|Safari)/i
        );
        for(var i = 0 ; i < this.loopTimeout ; i++)
        {
            if(pin == null && !flag)
            {
                //Disable type check during using iPhone and Symbian ( bad browser core support )
                return false;
            }
            const ret = await this.check_request_action()
            if(ret.data)
            {
                return ret.data
            }
            await this.sleep(this.loopInterval)
        }
        return false;
    }

    async sleep (ms:number) {
        return new Promise((resolve) => {
        setTimeout(resolve, ms);
        });
    }
    async check_request_action(){
        try{
            return (await fetch(this.baseurl+'/result/'+this.uuid,{
                method: "GET",
                headers: {},
                redirect: 'follow'
            })).json()
        }catch(e)
        {
            console.error(e)
            return false;
        }
    }

    async connect(chian:any,redirect:string) {
        const site = window.location.origin
        
        const d =  {
                        t:0,
                        i:this.uuid, 
                        d:site, 
                        c:chian, 
                        r:redirect || null
                    }

        const pin = window.open(this.actionUrl+encodeBase58(Buffer.from(JSON.stringify(d))),"newwindow","height=800, width=400, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
        return await this.loopCheck(pin)
    }

    async sign(chian:any,sign:any,redirect:string,preconnect:any) {
        let d;
        d =  {
                        t:1,
                        i:this.uuid, 
                        d:sign, 
                        c:chian, 
                        r:redirect || null
                    }
        if(preconnect)
        {
            var hd = new Headers();
            hd.append("Content-Type", "application/json");
            var op = {
              method: 'POST',
              headers:hd,
              body: JSON.stringify({"data":encodeBase58(Buffer.from(JSON.stringify(d)))}),
              redirect: 'follow' as RequestRedirect
            };
            d = {
                i:await fetch(`${this.baseurl}/preconnect/${d.i}`, op),
                p:1
            }
        }
        const pin = window.open(this.actionUrl+encodeBase58(Buffer.from(JSON.stringify(d))),"newwindow","height=800, width=400, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
        return await this.loopCheck(pin)
    }

    async send(chian:any,txs:any,redirect:string,preconnect:any) {
        let d;
        d =  {
                        t:2,
                        i:this.uuid, 
                        d:txs, 
                        c:chian, 
                        r:redirect || null
                    }

        if(preconnect)
        {
            var hd = new Headers();
            hd.append("Content-Type", "application/json");
            var op = {
              method: 'POST',
              headers:hd,
              body: JSON.stringify({"data":encodeBase58(Buffer.from(JSON.stringify(d)))}),
              redirect: 'follow' as RequestRedirect
            };
            let i = await fetch(`${this.baseurl}/preconnect/${d.i}`, op);
            console.log("## Preupdate test :: ",i),
            d = {
                i:this.uuid,
                p:1
            }
        }
        const pin = window.open(this.actionUrl+encodeBase58(Buffer.from(JSON.stringify(d))),"newwindow","height=800, width=400, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
        return await this.loopCheck(pin)
    }
}

//----------------------------------

interface TonspackWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface TonspackWallet extends EventEmitter<TonspackWalletEvents> {
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface TonspackWindow extends Window {
    tonspackSolWallet?: TonspackWallet;
}

// declare const window: TonspackWindow;

export interface TonspackWalletAdapterConfig {}

export const TonspackWalletName = 'Tonspack' as WalletName<'Tonspack'>;

export class TonspackWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = TonspackWalletName;
    url = 'https://app.tonspack.com';
    icon ='data:image/png;base64,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';
    
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: any | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: TonspackWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        this._readyState = WalletReadyState.Installed;
        this.emit('readyStateChange', this._readyState);
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this._wallet?.isConnected;
    }

    get readyState() {
        return this._readyState;
    }

    async autoConnect(): Promise<void> {
        await this.connect();
    }

    async connect(): Promise<void> {
        try {
            // if (this.connected || this.connecting) return;
            // if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            const wallet = {
                address : "",
                disconnect:async function()
                {
                    console.log("🚧 Wallet disconnect ")
                },
                off:function(action:any,data:any){
                    console.log("🚧 Wallet.off ",action,data)
                },
                publicKey: Uint8Array,
                isConnected: false,
                signTransaction: async function(transaction: Transaction){},
                signAllTransactions: async function(transactions: Transaction[]){},
                signMessage: async function(message: Uint8Array) {},
                connect: async function(){},
                
            }
            const tonspack_wallet = new Tonspack();
            
            try {
                wallet.address = await tonspack_wallet.connect(solChain,"");
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
            }

            if (!wallet.address) {await this.disconnect();return ;};
            // if (!wallet.address) throw new WalletAccountError();


            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.address);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }
            this._publicKey = publicKey;
            this.emit('connect', publicKey);
            wallet.isConnected = true;
            this._wallet = wallet;
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }
    async disconnect(): Promise<void> {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            try {
                await wallet.disconnect();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }
        }

        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        try {
            try {
                const txs = [];
                    if(transaction.constructor.name == "VersionedTransaction")
                    {
                        //Versiontransaction
                        {
                            txs.push(
                                {
                                    t:1,
                                    d:encodeBase58(transaction.serialize())
                                }
                            )
                        }
                    }else{
                        txs.push(
                            {
                                t:0,
                                d:encodeBase58(transaction.serializeMessage())
                            }
                        )
                    }

                
                var s = await (new Tonspack()).send(solChain,txs,"",true)
                if(typeof(s)!="object")
                {
                    s = JSON.parse(s)
                }
                let newTx;
                for(let i = 0 ; i<s.length ; i++)
                {
                    if(s[i].t == 1)
                    {
                        //version transaction
                        newTx = VersionedTransaction.deserialize( Buffer.from(s[i].d,'base64'))
                    }else{
                        newTx = Transaction.from( Buffer.from(s[i].d,'base64'))
                        
                    }
                }
                return newTx as T;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const txs = [];
                for(let i = 0 ; i<transactions.length ; i++)
                {
                    if('message' in transactions[i])
                    {
                        //Versiontransaction
                        {
                            txs.push(
                                {
                                    t:1,
                                    d:encodeBase58(transactions[i].serialize())
                                }
                            )
                        }
                    }else{
                        txs.push(
                            {
                                t:0,
                                d:encodeBase58(transactions[i].serializeMessage())
                            }
                        )
                    }

                }
                var s = await (new Tonspack()).send(solChain,txs,"",true)
                if(typeof(s)!="object")
                {
                    s = JSON.parse(s)
                }
                const newTxs = []
                for(let i = 0 ; i<s.length ; i++)
                {
                    if(s[i].t == 1)
                    {
                        //version transaction
                        const newTx = VersionedTransaction.deserialize( Buffer.from(s[i].d,'base64'))
                        newTxs.push(
                            newTx
                        )
                    }else{
                        const newTx = Transaction.from( Buffer.from(s[i].d,'base64'))
                        newTxs.push(
                            newTx
                        )
                    }

                }

                return newTxs as T[];
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
            console.log("🚧 signMessage : ",message)
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const signature = await (new Tonspack()).sign(solChain,encodeBase58(message),"",true)
                return signature;
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
