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
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface NekoWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface NekoWallet extends EventEmitter<NekoWalletEvents> {
    isNeko?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface NekoWalletWindow extends Window {
    neko?: NekoWallet;
}

declare const window: NekoWalletWindow;

export interface NekoWalletAdapterConfig {}

export const NekoWalletName = 'Neko' as WalletName<'Neko'>;

export class NekoWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = NekoWalletName;
    url = 'https://nekowallet.com';
    icon =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyNDRweCIgaGVpZ2h0PSIyNjBweCIgdmlld0JveD0iMCAwIDI0NCAyNjAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0NCAyNjAiIHhtbDpzcGFjZT0icHJlc2VydmUiPiAgPGltYWdlIGlkPSJpbWFnZTAiIHdpZHRoPSIyNDQiIGhlaWdodD0iMjYwIiB4PSIwIiB5PSIwIgogICAgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFQUUFBQUVFQ0FNQUFBQW9GT2xoQUFBQUJHZEJUVUVBQUxHUEMveGhCUUFBQUNCalNGSk4KQUFCNkpnQUFnSVFBQVBvQUFBQ0E2QUFBZFRBQUFPcGdBQUE2bUFBQUYzQ2N1bEU4QUFBQjQxQk1WRVVBQUFEL2Z5RC9jQ0QvZ0NyLwpmeXIvZ0VEL2dBRC9iU1QvY0JEM2JCajViUnI0YlJuNGJScjViaHI0YmhuNWJCbjRiaG40YlJyNmJodjNiQmo0YlJyM2NCajRiUm41CmJoci9jUno0Ynh2NWJocjNhQmovY3huNWJocjFhaHYzYkJyL2JSdjNiUnIyYkJ2M2JSdjRiQnI0YmhydmNDRDRiUm40YlJyM2NCajQKYmhmM2JSdjRieG4zYkJyM2JCbjRiQm41YlJyNWJScjRiQm4vZGgzNGJocjZhaHY0YXhuL2RTRDNiaHIzYlJqL2JCMzNhQmowYWh2MwpiUnIvYnhINGJCbjRiUnYvYnhENGJSbjZhaFg0YlJyMWJCbjRiUnI2YmhqNGJScjRiUm40YkJuNGJCcjNiUmo0YmhuNGJCcjRiUnI0CmJodjRiUnY5MnNiN3Y1cjVkaWo2bW1INnJYNzh5S245MGJqOHY1djd0b3o1aUVYKzQ5VCs3T1ArOXZILy8vLzVrVlA1ZGluN28zRDcKdG8zNnBIRDVpRWI1ZnpiKzdlTDdyWC81ZnpmLzl2SCs3ZVA3djV2KzdlSC8vLzcrNU5UN3BIRCs0OVA4dG8zOTJzWDZtMkw1ZnpqLwo5dkQ1Z0RqN3JYNzZwSEg4eUtqKzdPSC8vdjc4djVuNGRpbi85ZkQ4djVyNmlFYjd0b3Y5NDlQOHRveis1TlA5MExmNmtWUDRkeW42CmtWVDZtbUQ0ZGlqOTBiZis3T0Q3dFl2KzlmRDdtbUQ4dnBuOHRZdjgwYmo2bzNEOTVOVDZtbUw3bzNIKzl2RDZpRVg4ckgvNm0ySDcKcllEOTI4WDdtbUg4ckg3N3JIN1dKTE5MQUFBQVQzUlNUbE1BQUFBQUFBQUFBQkJBbjkvdno1QlFiOTlmUWQ0Z3YzOEJqODRnQVlBeApnQUh1a0dIUHpoQncvaUZQWUkrZ29JK2VyNzRCenpCd0FZQmdBU0V3N3hDUWp4QytNTEJRcjErdTNyK3VYNC9Pd0xqT0dBQUFBQUZpClMwZEVYM1BSVVMwQUFBQUpjRWhaY3dBQUN4TUFBQXNUQVFDYW5CZ0FBQUFIZEVsTlJRZm1CaHdHRkNaaGFHR2lBQUFPMTBsRVFWUjQKMnUyZCsyTVVWeFhIbDFacU5vWGF0QW1VaDRhdEJiYUNiVVNMSWxTMFZTeDlPTTAweXo2U3pTNGh6UVBMMGhwVEVaWUVBelZxMGFxawppbS8rVkdkMlp2WTVNK2Q3WnM2ZG05MzAreVBNenIyZm5Edm5mdStkZSsra1Vnd05wWWVmM0dQczJUdWM1dnhLb1hhbG43SXFaT3dkCi9vcXlJcDYyN3U5cTVCbmR2RGJ5c3lQTkNvMnFxZERZUHFOZCszVWpwNTQ3MEZHaGc0Y1VNSThZblJyV3pIeDR1S3RDbytMVVE5M00KdW1QOTJGZDdLalE2SkZ6R0FhTlhPdFBaNDEvenFkQzRiQmxqUGtVWSt6UkNIeG54cVZCR050VFArMEZyRFBXWHZ1NWJJZGxRditCYgp4b2cyYU45QUc4WlJ5VEtPR2Y0NnJvazVJTkJHVnJKOXB3T2c5MGpuUzB5N1h4d0pnSmJzdFlLZ3BmTWxLSi91eW9YK2htQXBKNEtnCnRZUjY5NHRCMWNtZUVDeG1QS2dVNDZRRzZNUGZES3lPWk10N0tiQVVRNEhqSlJRY2FNTjRXYkNjZmNIRkpPOVFRZ0p0VENRRG5iaEQKMmZWc1NHVWtPK3FSa0hLU0R2V1JzTXFNQ2haa2hDblpVQWY1RWtkWnVZTEdRcUgzSmdvZEdtaEpTNVlPaFRhU25Eb0tEN1NrSlNPZwpFM1FvZ1FiVWc1YXpaQ2ZDb1JNMG80RUcxSU9XczJUakJIUmlvUTd6SmRKLy8rZVRLeXBjWWI3RWtad2wreFpWVkVKbWxBNjBvQ1hiClI1YVZ6SHd3SFdqamxGaGhJMlJaaVRnVTN4blFMc2xaTXJxc1JNem90NzlEMXlNalZkZ3h1cXdrUWszNEVrZGlsdXdWQkZwOXFJOEEKVDVtY0pVc0RoYWszbzFDZ2pheFVpNk1NbWFNUnhRNEZDclNjSlJ1SG9CVTdGTXFBZXRDbmhjb2pEWmtqcFdhVUdtazBKV1hKYUVPbQpQdFNBTDNFMElWUWdiY2pjVUtzem80QUJkU1ZseWNDR3BkS013b0VXczJSb2Vlb2NDaDVvS1VzR0dUSkhxaHpLZDlFblRNeVNRWVpNCmFhZ3hYK0pDeXlRV3pKQ3BERFhtUzF4b21iODdac2hjcVRDam5FQkxXYkp4RHJRS004b0p0SlFsQXcyWkszbUhBaHBRVHpLV0REVmsKanNUTktHeEFYVTJJbElwM0YwcENqZnNTUnpLV2pQZUhsamFqREYvaVNNYVNNUXNWTnFQY1FCdVpKd1JLWlJneVY1SU9oUjFvR1V2RwpNV1NPSkIwS3c0QjYwQktQRjhlUWlZZWE1VXRjYUluU1dZWk1PdFFzWCtKQ1MxaXljVDYwOGIwelFqckFMMXZFa3ZFTTJUYVFoQ1hqCkdiSnRvQWtCYUhiNjFDMEpTOFpQSlpvbFljbDBNN0FsWU1uNGhreTNCQ3daMzVEcGxvQWxpMkRJZEVQSHQyUVJESmx1NlBpV2JGdzMKQXg4NnZpWHJPME1tWWNuNnpwQkpXTEsrTTJTV0pkc1Zrem5kZDRiTWNpZnB4Mkl4NzljTkVFblovZC9mSFJsNXFBL2J0cU9EWjZOUwpuK3ZEcHUxcDlPeVhJekUvc3lkKzJmcjA2dkVvRDNaL1BzNHRaZmZ6cWZ1ZDJhWitic2N4V3pwNW1NVThITC9FN2FCaERuV0VtZGZ0CnFXRzhoUTlFMjNaMEVzMW1BOFJzWlRPc3YzNWFkMFZscVk4anc0LytteDhpcU5PMEl4M3JZKy9wcjh4WmFrNTRhT0NZZ2RPckJxYXoKYXRkd2VESWJyQ1RtS1hzODdMRWU2K3VCVmJBeVowT2dCL0NCZG5RdzJLTU1raXZwMG5oUUF4K0xmMjlWZXJkZGs1T1Q3QnNFdnVBaQo5bSthb041ci9XUXFkeWxmc1A0cFh5emxwcm4xdEg4OFU1NnRkR3UyYkJaSzFjdE04SDMrR1p4NmExVUJOZWRWK29yWldkbkMvQlJjCngycHhoaWhtcHZnK2h6dDczTStpa0xZRWhWNXdrV2Q5L2krL0FNWFk5N2U5V3B5L2pGTm5maEFsaTRITVp1UGlwYUJxMDlqTGVReTUKZ1gxbEdhWWU3dzAxbmNYQWV0aXRlOG9NL3YrclMrRlJMc0xFYnJUUlJ1NXp3T1pMNUkvQVdsaVJYUDU1NkJVZmhEemFTM2lVUFYxRApnMzF5Tnp2UUlMUkpNbHM1S0lqNnNnbVYwYVhhRWwxNVd6M2RGaDFvRUhxT1pnNmtmcC8rcGI4K3dKcjQrU2U0Z1FhaEY0enJ3RlY1CnZ3SSs1RGR0VHg5QmFid3JnZjlRQ3JwZy9BSzZ6cWRGWWo4TUVQWmdkeVp3WktRQkZUNVh4U3A1dGFmbmlzVU14anJ6STRZWnc2R24KME1mU2xHV3VWRllBaEk0MU9OQjdhS1RrQWw3M2FzZk5meG1YMmNwbUFNTnJqek9IVjBqQkpieU9IYUZlalo3RG1rSjZydXpyVFdocwoyUlJRN3RVOG81SnR3NjdKcUgxVmh6NEdqUDA0SzQxQjBOVElxRU9sMXExalA5Q09nTWM2NDAzOWc5UDdNaFZyYWJGNTUxOEozUkZvCjRNMkZvK0NpUUdub1p2dVdhZHkyUHFZSDdPZGQ2QmZJSzlWQTMzQnYvR3U1VzVaSWl0SGRyS2t4Y2VpYnJFRFhrSXZvVUx1akRuUngKc3pqMExVNmdiODFEbDVHaGR2MEp1dVJWSExyZUNNc2tOcHk4dlFaZHRrNWkvTGdCamI3VmtJZHU5S3RZNnE3bHNLZWdWcVV3TXZaRApEVy9TRUlldTVlemIzc0d1clU0V29BdnpGRWJqb2Y2SlB1aDVBMDVqOWFsSnpPMlI3YnV4MndGZXVpOFBiZmRadjhHdXJSc0c1dXZyCnBCYzlqNDZ3bEVCWE5xeTdMbUdYV3BuK2hoRDBhNHc4aGtNWDBlazlDeHA4VWl0M0RRUHJzOGptYldjeWZJY2RERDEvandIOUNYYnAKQ2pyay9pM0pZV1V5ZkRFUkRyMkpRLzhPdk5TQy9qMXlYZTBQTlBUcmpNMW1NSFQxVXh3YXpHT1YreUQwSDJrT0szMlBLNEEyd0dIVApCa2hTYWZoMHhNWFFhY3l3SnhLQVdYNCtORGlCc29HUHNERG8rcDhRa0FuR3Zpc0dOSlpvYldpd3g4S2dNV2JqZ2dyb0JXTVpoa1puCkVoRm9rTms0eWxoUXhJQTJzTWxOV2VqUC9neUNqQ3FDeHV5SlpQT3Uvd1ZlMnpIS09QSUFocmF1eGV3Skk1RVZER00xK0g5cm4vMFYKV3RmaEtLc0lHck1uRzR3M0d5Vmo3VUhBUXpPYnorRXJlQlJDWS9hRVlVNHNlMkxGY25xdWFKYmIvN0g4b0xqRlhxdWxDaHF6Snd3YgphdW1xTi8rMU1MM1owSUovazZibkJoVkFOeWJ4SVh1eXdaenpYbHdpbjl5RlMrWXRiZENRUGJHaE9XKy9MSm56d2R6VFczbTc3ZC9YCkJnM1pFOFlrUXB0bThwZXFuZVJUMC9hS1NqZk4xVzVRSUNxZ1AyOWNqZGdUR3hyUFpKMHFtNlpaeU9kTmM2YmMrUjgxTXJHcGdIWmUKUENQMnhJYVdlNUhsaW55a0ZVSWo5bVFEdlpDam14cWhFWHZTZ0VaSDFLRG8xcTBFdXRDNEdyRW5EV2p3dFE0cXVuVXJnWGJmTVFEUAphZ1BhK0pza2MyMk9CbEVJRFhUQURyUm9LZ01DclFUNmpuTTVZRThjYU9QdmNzeElvSlZBdXhZWnNDY3V0T0JUalFSYUpUUmdUMXhvCnVRUU9wRzdGMEhUOFBHandkUzJ0MnhDSUNtalArOUt1b3dtOXhscUFGcWhiMkZ5Q0N1aDU5M3JhbmpTaFJaWkpWaDZDVTBZcW9XbDcKMG9LVzZLeHJINElnS3FCejNnL0kvcmNOV3NDQ2I2QWdLcUNiUzExSWU5SlJ6YmpVTUxOYWFITHBRR2M5NDFIanpHcWgvOEdzNkQragpJOVBUSllxaFd3YUJTc25kMFltOFJlbmhKb05aQ1hTcjQ2RHNTVStUWEgwUWlYbUY4WHBET1RSbHRIeWV3emwrc0djNVRWczk5TC80CjBNWXljMDY0Y3BQMVNrY1ZkT3NYbEQzeHo3Z3M3QUw3cFk1cWFNcWVCSFV6eTNtc2tjL2VZMGM1QVdnaVppRjk2MmFlR29PVWk2eVUKblJ3MFlVL0NEY1Z5cnZUQUxQdjhyRHlUTC9KZXprYUhIaGg5QWIxVDlBWDBUaEVIdXN5Ui95Mm10MHI1d2t6WlRzbmw4b3haS0FWYgppNm5wcldMZTlMbXo5YlBpcFdxTTVLMW16VW1sZDB1NEJWRXRtajJqcnFDNStlb1ZreHFoelJUSmZUbEpRM2VOQWFhMi9DRjhOeFJOClhTbGpoU3plNUkydVZFTjNOTnRxTVNoczlkNVdXbVVOT0ZhaWhGc1I5R0xiejZvaG8rcTczV1h3QjlUTXNiUkM2TmFPc09WUWlxNkYKUU9qcFZKMWlOM0pGME0zOFJCeEYxR20rbzg0V1hadkhJUlJDdTMvN1pXSytxSlpydi8rL295SGJvcmROcTRkMkZsVVpWYXF4dHI5awp2TXlkTWVuUVI1d21yZ2JhZVMxUEw0dGJiMk8rSG9mWmF1SzZsejQ3TTkvQWlSYXQweXBXWXpLenFOVkFnOHl0MThtWEJaYWQ0TlJLCm9HMFBpaXo1Ykw2V21Md2VuNWxCclFUYVlwbEdydk5NNkNUeldNRWdJVWMyS1lPZVJnNmZxN1JNYUl5K3FsUHZZU0NLbGo1ank0WGMKcFVBaXF4QWFvZzlFVUFhZFJ6ZmdPYzFSY3UwY3R1aEVCZlFjMXJnOUV5cld1RzFCRFZ6SnV5elFXemttZEZWMHZUZlV3QlZBZnc1dQp0SFJNS0hjUEJ5WG8wRDE1NkRzb1J0MitLWG9xMXl6WUlKQlFLNENHYy9GZFRxRHo2UDVFSU5TcXBvc1EyVE1JYU9xdTVkQW1VYWNUCnVFYm9oZ2xGNDFlYmZoZHRRZlF5STUzUVZjYWk1enJlbmE5dloyaTdIY0k3TFcvQnA4QUFxVXdqdEIwUmVDUHhDcU52STl1M1J1Z1YKVGllOWdoOGtRT2R2amRDMzhUTjhHanZNWUdneWYrdUR0bDlqNFp1bmJ6TE9uQ1QzTkdpRXJuTDJiakJPVDNET2R0dWUwTFlKeFk5Ngo1a0NUT3puMFFkc21GRDhqbW5IS0ViM0ZWQiswYlVMeFRUb3NhQ3A5NjRObUhRMWdQNlk0OUYwQ1JCOTBUaDAwdFExUEUvVHN6SU9GCkhRTnRMM0RjeWkyNDdtSEFvV2ZOZk1tQzdicWhLdWh0a3NnS3ZqZGtRTi9vUTJqN0tUYUxwYTNxZEljdlZ0UlBVNmU3SkovSUxQcTgKVFcvZkVUZFpuUE9zdHE4ajQ1d0RYR0Y2YjJvamkxNUhwbWlVUlUyZDZJTmVOeml2c1FabFBGM2xwTy83REdqS2hlcWNPV0VkVWNXWgpJeVBQOGRFN1I3Ynpaa1B0UncrZTkxN25YTHFOb1J0dmF0SDJYVitBMzNEb09hVUtsZTBoMWtDVVdnNTlFb0RYbGpxaDdjRVFuSjVLCnFDSFRja3JWOWYrZzBJMnp1RkZIdlhnZHUwN1BLVlVsZENHQ1l4ZUZUeVBUZEVwVkNWeFBWWEdIZ0ZJZkNIUC9rSHBPcVNxQjM4dW8KZUoyTDFMbEZEWkZuaHFxQy9oVHRYSnhFdXlhNHZBZzZzbDhKdElGNkovZWxxdURKaXRoaEowcWcwYzl3ZVBNNllnMGNYQkdyQkJvOAp2TDQ1Q0p5VU9aZ0xYdnVzQmhvOWtNZDd2eWl6YWhBOW1Vc1JOTnkrUFo4c1FWMkRqMGhRQXcxMzFldmV2ZU5UdzZlUktZTkd1K3BXCkZ4T1grdUYvY1JCRjBPZ1hoZG9tTHVOUlgrT2M4WklWL3c2SHN4a09iZDl0bmN4YWpQWEFuN0MyVzJiRW9aMk5hR2dxVzIrZnVmeGYKMUgwTjJNbVpUUjJGUCtXSlFqc2JhbEVyMmpua1g0VzlYRWVZdVNmYm5NSS9kc2lDaGwxV1Y1RDRKM094RCtZeWpKZkZ2NHptUXFQdAp1MmVTbW9jZDVjaW03RS94RDVqeW9OR1BvL204anBpRGQ4dWJqNkljZ21GL1YxNzRFNDhlTkdoRmZWZTZMYytSaDE5WXhQZWlIUU5oCkplOFUvajA0SGpUYVZRZk4yRzQrS3BvQnAyQ1VaL0tQTnFNZmRETEIrUHkwSGkzMEtNNnhMcmFzUnpxVk9nYTM3OEZRcHZIOWFielQKR2doTk5LRHhiNWdPZ3R4dnlqTStlRGdBdXVBdzc2aFFlNEZPcFM3b3JrcHltdkNZVTJNN0pvRm5tb0ZPcFU3cnJreEN5cDVPdFdtSAo1TEkzMnBsVHg1N1VYWjhrZFBGUUIzVHEzQTU0ckROZHpEdWgzOHFlUy9Yb2pPNUtxV1kra2ZKUmVxQmJlQ2FkOHRYWUFHZXppK2RTCkFSb2JXR3QyYWlnVnJOTUQyY1F6cDFPaEdvTm5qL3BIYnh4S1VYcmxUZDJWbE5XYmFSTFppZmJBTlBKWG44S1FiUTJkZVN1VHplcXUKY1R4bHM1bUp0NGRnWkVmbnpyeHo2bWNXZWovcTRzVzMzbms3c0pOSy9SOXZRRFNYcURYRjdRQUFBQ1YwUlZoMFpHRjBaVHBqY21WaApkR1VBTWpBeU1pMHdOaTB5T0ZRd05Eb3lNRG96T0Nzd01qb3dNSmVEK2JFQUFBQWxkRVZZZEdSaGRHVTZiVzlrYVdaNUFESXdNakl0Ck1EWXRNamhVTURRNk1qQTZNemdyTURJNk1ERG0za0VOQUFBQUFFbEZUa1N1UW1DQyIgLz4KPC9zdmc+Cg==';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: NekoWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: NekoWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.neko?.isNeko) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
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

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.neko!;

            if (!wallet.isConnected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect', publicKey);
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
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return ((await wallet.signTransaction(transaction)) as T) || transaction;
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
                return ((await wallet.signAllTransactions(transactions)) as T[]) || transactions;
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
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signature } = await wallet.signMessage(message);
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
