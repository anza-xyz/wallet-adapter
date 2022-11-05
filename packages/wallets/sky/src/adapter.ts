import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Connection, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface SkyWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface SkyWallet extends EventEmitter<SkyWalletEvents> {
    isSkyWallet?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signAndSendTransaction(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface SkyWalletWindow extends Window {
    skySolana?: SkyWallet;
}

declare const window: SkyWalletWindow;

export interface SkyWalletAdapterConfig {}

export const SkyWalletName = 'SKY Wallet' as WalletName<'SKY Wallet'>;

export class SkyWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = SkyWalletName;
    url = 'https://getsky.app';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDY2IDY2IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiPjxkZWZzPjxpbWFnZSAgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBpZD0iaW1nMSIgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFFQUFBQUJBQ0FZQUFBQ3FhWEhlQUFBQUFYTlNSMElCMmNrc2Z3QUFFWGhKUkVGVWVKekZXd2x3RlZVVy9ZRUVRaEx5MTdCbGcwaEVrYzJFZ0d5akFoWUtLb2lvaUN3aUlpaWlvcWdnaTRBb0lBNmhCQUVabGtFREptSGZ3aFlNUzFCUjJVVUUwUUZucG5TbVpzWlNTNjJwS2JsenprdS84TkxwL2dSSndxODYxZjI3KzNmM3ZlOHU1OTczdnNkVGhaOTkrL1pGQXgwT0hEZ3c4cU9QUGxyd3lTZWZGSHo2NmFkSGdYOGRQbnhZamg0OVdvcGp4NDc5RXpnQ2JENSsvUGc4NEZFZ0M2aFZsZTlZcVorZE8zZDZkdTNhbGZEKysrL2ZzM2Z2M29VUS9PakJnd2QvZ09BWERoMDZKT0ZBaFJ3NWNrUXJReUQ0aFJNblRuei8yV2VmSFFMZUJPNEVBamgzdGNVcy95a29LUEJzMjdZdEZRcDR1YWlvNkFRRXZ3REJCU1A5dTZHVlFvVkFFUUxoTDV3OGVmSVFNQTVvaU85WFcyeVBaOU9tVFJHYk4yOU9nL0J6Q3dzTC93dkJCYU45UllLSFV3Z3RBNExMNTU5Ly9pdndHcEFFUkZ3VjRkZXRXeGNMQlV5RThQL1p2MzkvbFFudXBBaGFCYXhBVHAwNjlSMHdHcWhkYllMbjUrZEhyRm16cHQzR2pSdFB3OWZsNDQ4L3JoYkIzU3dDRmtCRkhBTmFBbFVyZkY1ZUhoVXdDV2IvWTNGeGNZVkgvWU1QUHBCbHk1YkpDeSs4SUE4OTlKRGNmZmZkMHFWTEY3bnBwcHNVdU4rN2QyOFpPSENnakI4L1hsYXNXQ0hJR2hXNk4rTUUzZUtMTDc3NEhuaXF5b1IvNzczM1FsREFTcGg4aFY0T0FWR21UWnNtUFh2MmxFYU5Hb25mNzVkQUlGQUtyOWNyb1ZCSWdmczhGZ3dHMVhWRWNuS3kzSFhYWFRKanhnelp2WHYzSlo5SGE0QUNMZ0NMQUc5bEM1K0lrVis5ZmZ2MnNOR2RGckZod3dZWk9YS2t0R3paVWhJU0VrcUZwWEJPd2pvcGhlZjBiK3JWcXlkdDJyU1IwYU5IQ3l3dnJOVXhOc0FOZmp0OSt2UnlLQ0ZRV2NMSDVPYm03dURJaC9OM3BEOTU4c2tuSlRVMVZiMDRFUjhmcjdZVXp1ZnpsUkdZNTdRRmNGOGY1M1dFcVJSOXY3UzBOSG51dWVlRTd1ZjJIdVFTbGhKeW9JU29LeFUrRHNJWFVIaTNrYWM3dlBIR0c1S1NrbEw2b3RxTTlVZzdtWHNnakFYbzY4cmR6L3JldEdsVG1UOS92dXVBV0VvUUtDRVhpUDVkd3E5Y3VaSUtXQWF6Y3pWNzBGd1Z1TFNnNWN5WUx3MFREalpzS0w0R0RjU1BXQkJNVEpRQTRNWDNFUHc4bEp5RS9mbzRobk5KU2VMRHRYNUFYWWZyZVYwd0tWR2Q4OWF2TDBIZWcxdTQxL0RISGhOeUR6Y2x3QUpvQ2JOL3o4aEhBSThqMTdzR3ZLMWJ0MHFuVHAxS0JlY0lxWDBDTHhob25Dcis2NitUbEU0ZHBYblBPNlJ0djN1bDNmMzlKS1B2UFdxLzdYMzNTdWE5ZlNXVCt4WXk4SjNYWk4zSDYvcXFiVnNnczE5ZkJWNlRpZDhuZGV3Z2dmU21Fb1RpdW5YdkpxRGZyakVCQ3JnQTNBOWxYSllDTWhEeGZ5VEJjYnJ4amgwN1ZHRFNKc3l0TWxtTXRpOGxXZnh0V3N2OVk1Nld4ZSt0a2kzSUJqdDNGOHB1Y0liM0t3Rzh6MVlJUEdMeVpBbEF3ZjU2Q1dvZzNONFZOWVdjT1hQbTMxQkNzNG9LVDc4L3pEVG1OdkkzM25oanFYOXFmdzQwYkNEZTY1cEpuMUZQeU5xdFcxVHFBbE5VV2FHeUFSSW1LTFprTUhoRjRKbzBDWVNDMHFGREIxZExJRm1DRW9xZ2hQQ01FY0xYQUo3bFE1ejhuZy90MkxGamFkRFNaay8vam9Qd1kxK2ZoZEd1T3NIdFNzaUJpeVpsdFZWeGh1L1RyVnMzeHd4aHhRTzZ3eU9BZSswQTRhL0Y2SDlEUVoyaVBWbWNFaGhwU2xrQW96VlFCNlB3L096WDFhaFh0ZUFtQ3ZjVVNhdmJlMGdBQTZEZmFjU0lFWTdaZ1JVbHJPQVVGSkRrSmp5UnpkRnpNaU9tT2pPWGN4c0h2NDlxMUVENlAvZXM4cy9xRkY0QjZia0pncXlmbWNZYUdMN2JnZ1VMeXIwL2F3ZkxDbDZHSXB4SEg0SHY3MDZqejVGbDBDdERYUERBNkdCQWtycDBrbUp3Zlpwa2RRcFBiakp4YnJZa0lCQUdrQkpORHNINndpa29NaUJDQVY4Q0RaMFVNSk9qNzBRMVNXMDFPZEYrejlHdjBhaWh2RFJuam16WnN1V1Mva29heSt1dUZBekNaSjEveXN1VnhQYnR3QTNxbGZJUXpTSkp3Y2VPSGV0b0JTQklUSXZqbklMZjF6UmpwOEJIZXF0OVRDc2lLaTVPNWVOdGhZVmhoZWM5VitPbFIwMmZKbzlPbmlURHJ4QkR4bytUTGdNZWxIcXRXNVVRSzd5UG5UTHpYZFBUMHgwNWpCVUxqdGdWMEd2dDJyV09QeGcyYkZnWm5xNGZGZ0hjK2Rod1Y5L25xQmZDZFI1QWZJaEt2MFpxZ2h4RkltZlh4T2h3V3dPcGk5dElqS0RlVitjU1NyWVhyd3VWWEFjLzV6WVdqTkVMcGhpdytiMm15MllkTVdiTUdNZU1ZSkdqVEZNQkt3b0tDc3FaLzU0OWUrVDY2Njh2SXp3ZldpY21Sang0NmFlbnZ5TDhuYU9QYnQ4dTB4Y3VFQjk4MUVlQ0ZNQUw4ajcra3EyWDk3T1lZenlEcTNWT3cydGN4NjM1Rzc4bHNGbEhhQXNOR09jWXQreHBrVzVBWGdBRlpHdmhvNEZUOUN1N3R1YkF2ODJINkJ0SDE2a2pIdERRYWZQbktkOTJVc0FPa0pMdVF4K1dJSmloejRvYjloR3ozN2VVVGhzQzJhOXpPdWEwSmVpdVM1WXNjUXVHbnlJcjFLUUNya1B1LzlYSi9HKysrZWFMMVp0aEJiVnExeFlQbU4rckM5NXlKVDFiUVpmYjN0TUhETEZoR2VzeDcyY1h3aHhGOHpwdDNsb0Jaay9CTkhtN0FuaU9UUlVYTi9nQkNraW1BZ2JULzUwcVBVWlQrNGdRVWJWcWlRZStPM0hPSDEwendDNEV4MzVQajVaZ2s4WXFVSm5sY1VVNlF1WjFadkMxbDhqNnV6MEk2dnV4RzJWbnRSWW5ZUGVvaHljbkoyYzV6WmpzeVFSN2VQYVgwemVPam80V0QzejZFVVJrRmtaT0NxQmljdGF2azRZZDJvc1hwV3dJRmhNQ1kvTnlkQmpBRUJUOTdCaFJ5YXdlY2N4TFFlRmFJWHpudmpvSGFKKzNDOHYzTTRYVlFUQmtaUVk5YVBuNStlWGtZelpBTEpqcFdiNTgrWDZhTVVmY3hJUUpFeHlEREtFVUVCY3JIVkNxTWsyNnBVQXFaMEZPanZ3QmFTc1ZqQzI1WFpZa0kzY250MnNuamRwbVN1cE43U1VGNEQ2UHB3Qkp1SWI4bnRjMnVMR04rSzVObDJCYWs1SitnR0ZCZGtzeDM4K3VsRm16WnBXVGowcEF1YnpKczNEaHdxL3BBdHNSdFUwTUdqVEkxUUxJQkNQZ0JyNldMV1RWaHZVcTVibUJXV0l2V0ZudXBvM3lMb3FYZC9Bc2J0OWRwN2NYOXkrZVd5Y3IxcXlSSmJtNU12UHRSVEpzd2t2U3VsZFBWZjRHazVOVmhqQ3R3VzRCZGpkanE4NHVINE0rNHQ1aER5TDlqeXRYcmhRcXdjU3R0OTVhSnFDWVprY0YxSXlNRkErK0QzeCtyTklveStlcUF0TXgyOTl6VjZ5UXJINTlKUUNyOElFVDJHT0YyVkExQjYxUG56N2w1S1BiNDc3ZmVkaDJYcnAwcVNBV2xFRldWcGFqQmVpSHhzVEdpZ2V1VUFkbDhPNERKWE1FZGorcmJEQjRuVGg1VWg2Wk9FRVNZSDBoVUhGdm1CaWdsZEsrZmZ0eThpSHpLVXZ3VEpreVJlQUdLbCthMEIwZmU0b3lGUkVaRlNXZStMcHl3NTI5NUlzdnY1U3paODlXQzg2ZlB5K3ZMbjViUWkxYXFGTFlMUWJvV0VGWjdQSng4b1V1NnBrOGViTHFzQzVldkxnTStDTTdjZEg3ZWh1SGVxQUdsWkFRa3B1SERKTHozM3lqWHZCTEtLT3FjZTdjT1hucXRWZkZEODdQYkdGeUJmdWdzWU5sbDQ5WmJ2MzY5ZUtaT25XcUxGcTBTQjB3a1pHUlVZNVkyQ2MwVkU4QVNtQkFKRFhPNm5ldjdFQTg0Q3hOVmJzRTczOEloT2EyaDRkSUlEV2xITGt5MzcwZHNvNWR2bmZlZWFmRUFwQWlma0lxRkJDaU1tQVFkTHFaMlJIUzU2aUVtbVNIZnAvVVIvcDZjZlpzMlZxNFM0b1BIRkRGVWlGSUVmdDFsNHRMQlVmMktSYkNuK3UxYVMwK3krK2RCbzN6am5iNTFpRExiTnUyN1Z2UHZIbnp6dkVBbzZLSi92Mzd1L0p1T3pmbmZ0MjZkYVUyYW9TSTJCaFZKNUFBOVIvempMenkxbnhabXBjbmVlQWFhMUVXczJHNmh0aFNndFZiTmdONkMrRForWnRMamhYQm1oaW93cVZaOWlDN3dmMDRkK0JtQVd5VDJlVWpSMEVXT09wQlFOaEhYMkJlTk1GWldwTzZta0hHY2RiR2VtZ3Nza01kSUJLSThJSXZnT0Y1OEhJZW1LbW5jV29aUkZpNHVKK2k0Q0dhcEVwMHE1WXlQbnVPS3F6Y09rNVUwTVRzYlBFMkxxSGNUa1NJbWM0dUgyZXM0VW9iU1lXWDhlYmt5eWFZR3UxcDBPd0k2YmtBblh2MVBLRFptVkhYWUJzREYvSHhPQnVvc0pSNEhtZFh5ZWVWdWpoUGhzZGpNYmdIcjRuSDkwaXlUWlRkRWFnbW41ZzZSYm1Fa3dMSVlwZmw1MG13eFEwbHo3QVJJZTdud1FMdDhsbHJrV2F5R0JwQ2Y3RDNBa2h1ekZFMml4Y3RyT2JpNWtQMXBLZVRVa3lYNFRrV1d3VGRSNWV2NXYzcXNPd0dHRmZXdS9RZE9IaWJZQVh4VUFCckRYUFF1TjhBeDV5S0lhNDVRajF3dXlxSGdWOC8vUEREY2hYaExiZmNVcTd3c1BOdiszUjJ5S3I4N01VTGp5ZFl6Y3R3bFIrdk1mdVBOWkJoSXVFZWI2NzRzM3Q3SENZZHpNeFF4Wlc5R0hJcWg2MUZGVDlBQWFvY3JnT2NjZW9Ic29pdzl3THNOYjA5OTVwVDR2WmVnbm1kM2FMY3Jxc0pDNGhERFVBemQ3T0FIUWlFM3RZdDFWeWgrWDY4TjBtZTA1d2hoRDl5L1BqeFNOMFZXc1Z1cTkwTnFCUTJGKzFLY0dwZ3FIMUw4MzZUTjFpV0V3eFpOWDFwSzh5NnhtcHhCYlQvMHFMNEd6NUQ5UVpEMGhuVjVPNGk5OTVqL3VaTjRnYzE5aHZsTWRFQ1ROR3BQVzZ0UTV4djlnVDdyRjY5V3B6Y1lQRGd3ZVVzb0F6VnBBQ3M3Vkd1Qm1HcVhsUnJiSUlFRUpXNXo2MGZ4MzBrSzV3eFRrMVZXeStDbXlwekFmTTZubGZBOXhpY1MrOXhtNm9XM1ZwdjdEdGtMMXNxUHM0V0c2YlA3YWhSb3h6Tm40c3dvWVNPcGdKcUFuOTFXb3RERXBORTRXeWNnQ1BJR1puQU5kZElzKzdkNUo0blI4blFsOGJMTUJRcWJGMC9iTzBQUlNuTDc5d2ZObWtpam8rVFIzRHNVZXp6ZXA1bnU3dmsydkdsN1crZW16QTNXL1pnQk4yRVYvNlA5Mk81SEtCaURjdmphaEtudFFNMGZ5amc1SkVqWlR2amFscU1OM1NhR0JrNmRHZ1p2MVQ3TU9rWWpDSWJuMFg3OTZrMHhkbWFpb0E5Z29vZ25PRGEvTmZCZGROdStZT3lRdE05MlFOd21oaWgrVU1KTHp2TkRMVkFpZmdQcCs0d3lRYjl5UXlDdGJIZnFsZFBLZHE3dDlxbnhUUm9zU05mbnF3V1M1aWQ1OHpNVE5WRGNHcUdRdmh6MktZNktZQ3JRaGFRRlRwWndmVHAweTkyaEtBQUZqL1B2RHBkamVqVkVKNit2eFNaSVJFY3djOWxORVphelFZenRMKy9ObjhJUHdOeG9QemtxTFlDNEZ1bldFRHF5TTRLSTdscWk5ZXZKNitFbVJlb1NqQmpyZCsrVFpyZDFsMkNLU2txZzJnZXdsYWUwOW9Hamo3d0ZZUlBjNWIrWWpDYzREWk5Sc1d3VEs1TkJTQUlqa1N3Y3VzS1Z3VlV6c2Z6MkMvTTZIMjN5alkrbzB6bjRnMHlXQ2ZmcHdJZy9DZ2cvT0pxS01EUG1TSnEyY21NdUhDS0VaWThQYjNyclZKUTZGNm9WS2JnYWxZWThXWWFxa3RPeXZxNUZpbDRjWmtPR3podTcwemhvWVNEUUd4WTRRMGxkQVIrZGdxSUJGOHFDYWJud1lNeit2U1dkWWpZYWdFVExLUXl3WHZ1Z0lKWklsUHd0RzVkeGQrc21YZzVyMkJNcWpEb3VTMm5aZDdIbG4vYWFGVWg0UzBGTUNDK3lBa0Z0M1Y0SkU1TjhUSWVWSFJzakRhN3ZZZTBlK0IrYVUvMHYzTHdYczN2N0NXTk9uV1VXRkRoZUZoZFBGT2ROVnVsQTE3bnpwMWRSNTZtenkxaXduQ1V2cGYzdjRKVnExWlJDV3RZS1RveFJFMlM3dWpaVTZKUjd0WkM3Yy9VV012dlUxc2lDbG1qZHBESC9GSXI0TGZPbDJ5anpPdlV2dDg2VjNLZXEwL3FjbGFaWklzelNKYXBteDJwQVFNR2lOT0tGZ01YRU12ZXhpQmVsdXltSmZpQS9VeU5ia3BnZG1CbnVZSFZuZFZ0YXI5QlNjMjFSZWF4MG1yUnZNNmxBV3ZXOTJTbU0yZk9ETHRxblgzRDR1TGlBZ2hmTWIrL2hCS0t3eW1CWUhUbVlvckV4TVF5ZlFTemQyanVtK1d5S2FUOWV2TTZya2QrL1BISHhhbHl0UWwvQVVYUVJsaEh6QlVKYnlnaERTaWdFdHhpZ3RZNlhFZmw0bWFJRDA2bGRMajFBZmJxVXYrbWVmUG1Tcm1NTzVmNmt3YXNnc0xuUS9qNmxTSzhvWVJHd0JiR2hFdjRuUUpiVmVQR2pWTnJEUFQvQm9KRzJxTFF1cGxpbnpvbitEOEJMbnljTkdtU3Fnc3U5VHdxNWtCSkZ6b1hDRldxOFBwakJjWnMxQXkvc0Q2bzZOOWFhTEt6Wjg5VzNWbitYYVpyMTY1cXNxSlZxMWJTdW5WcnRVOWh5VFJwNHFTeUZWR3lNZXBzZFA2MGMrZk9xWERGS3BHOTlHT2x5QjdBMzBpS0x1ZEY3U05tVG5MOG5udnd0MlIrRVBvcjFDU2RnZXI3QzUzRkdHY0RQNUtwVmVkZjV5ZzRGUStCdjBjdE1nV0ZVVnkxQ1c1VEF0Y1gzZ0Rrd0MxK295SllobGFWSW1qcWRDY0kvRDg4YXpFWWFUcFE0Nm9JYjFORWhLV0lPY0EzREpRTVhGUkdSZU9FMjBnenNKSG1zdnlGeTUzRnZWOUROa2pIOW1xTDdmeXhyS0lQRzYzc05uTUZHcXRMS29TQzBIUXBGRGtGbGFOQlFrVTNZdjNCZVQrVzJSRHlsN3k4dkZOY3h3amNRVVZmYmZrdTYyTzEzRG52TUFSWUFod0F6a0VwUDNPMnhnU08vUVQ4QmVmM0FXOEREd0xwWE1kWWxlLzRmLzRNQmw2a1JRUjRBQUFBQUVsRlRrU3VRbUNDIi8+PC9kZWZzPjxzdHlsZT48L3N0eWxlPjx1c2UgIGhyZWY9IiNpbWcxIiB4PSIxIiB5PSIxIi8+PC9zdmc+';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: SkyWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: SkyWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.skySolana?.isSkyWallet) {
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
            const wallet = window.skySolana!;
            try {
                await wallet.connect();
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
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

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signers, ...sendOptions } = options;

                transaction = await this.prepareTransaction(transaction, connection, sendOptions);

                signers?.length && transaction.partialSign(...signers);

                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

                const { signature } = await wallet.signAndSendTransaction(transaction, sendOptions);
                return signature;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
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
