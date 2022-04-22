import {
    BaseWalletAdapter,
    EventEmitter,
    SendTransactionOptions,
    WalletDisconnectionError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import { connect, checkIsAvailable } from '@banana-wallet/adapter';
import type { BananaWalletAdapterConfig } from '@banana-wallet/adapter';

interface BananaWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface BananaWallet extends EventEmitter<BananaWalletEvents> {
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    sendTransaction(options: any): Promise<{ signature: TransactionSignature }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

export const BananaWalletName = 'Banana' as WalletName<'Banana'>;

export class BananaWalletAdapter extends BaseWalletAdapter {
    name = BananaWalletName;
    url = 'https://bananawallet.io';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDY0IDY0IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiPgoJPHRpdGxlPmJudyBsb2dvPC90aXRsZT4KCTxkZWZzPgoJCTxpbWFnZSAgd2lkdGg9IjU1IiBoZWlnaHQ9IjM1IiBpZD0iaW1nMSIgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFEY0FBQUFqQ0FZQUFBQXduSkxMQUFBQUFYTlNSMElCMmNrc2Z3QUFCSU5KUkVGVWVKemRsMjlzRTNVWXg5Y3RJc3VNZzQxTnFpYUNqRFdTSlFia2J4YWlzb2lEU2J1dFd3Y1lnWVZFM21DR0dFbndoVEZxMEJkR0UrTUxEVkZmTEh1anJqRUdNZGhreU5DMUhZT1dyV05PMlIrVE1lazZ0am02RmFhOW45K24vZDF5TzY3WFczdmJKVHpKNTAydjk5enp1ZWYzN3pJeTdvUFl2Mk10a1FQV2cxTHdpTkUxNlJiMUZVVmJqOWpYbkQ5c0xScDZ1V3p0eU1HS29yTkhENjBxTkxxdXRLTjdvQ0REMWJMeXpaWUxLNW1yeGN5KytlNVI5bFZ6Z2Y5TFo3N1o2TnJTRHNobGdVOEJJOXc5K1JHbk8vZFlzenMzMCtqYTBnNElMUWZuU0N6UVg4RE9kK1lGSVBhNDBYWHBFcEJhQjRaSnpuZDlCZnV4WTFuai9kSTE0aFVRSlRudjcvbFJweWYzaE5GMTZSSVF5Z0ZONG54ckRlUk5vV3UxUnRlVmRuUVBGSnA2K3MzV1AvdWVEUGRkTDJiWCtoNWpQL3Z5SmlDM3kramEwb3BJNTM3VFpLRHFxZkh1M1o2cExnZWI3dHpISmpvcm1kKzcvczVadDduZTZQcFNEb2hsZ2xMUUJRVEFpQ24vWGhaMDd4R0cyc28vTUxyR2xJS0xsWU8vUkNtcDNJamJ5b0p0ZTg2QUxLTnJuVmRBSUF2WXdOOWNTSkRLaFgxMUFxUkk3Zyt3eXVoNk5RY1hxd0pCZWNkRS9ybGNJOHFGUVkzUk5Xc0tQaFIzU1RwMkQ5Tlg5N0ZiM2tyRzVVanlwTkYxSncxYUZjSHpTbk5NeXVRVmh5Z215cjF0ZE8ycXdUdFdCZ2JVeE5BMVlkUmJLVWprWnNDclJ0ZWZNRkQwQTN3b0J0VEU0bk90VmlwRzNBU2xzOG53NVdvNjlLTGxpWWJha3Vwelg3eXdIVGVaK1FNV1c0cFlEbzZDRzhuRXd2NjZhTWh0azh1NVFFNHNZZVA3MjB5SGQxczJIOXhaL052SkEwOEwxODdZcG5Cak96Z05Hc0N6WEhaQjl3N2tYd0syZ0Nad041a1lEY2RiN1ZWUm1kZzBPREtiMUhYNnVXVWZIOS80ZmZNbjIxbnZUMWFsUk5QQUMwN3hPVkJJODBFbklTSWJQQU0rQkVQSnBNVFZjYnpETHU4WThRdFlNZnVBRzYwdm1RZGJLaTdSeFpESHhtNzdISUpLWWhLOUNONEJPOEZxa0VPcjJqeUVhQVY4Q0JRREIvaGFiWmxQc0tmSnBZZ3hNUGVMQUQ5a2cwYnhUeEFVYmw5UkZSU1pBYjNnVy9BZXFPZkNtMEFKc0hEV2dRMjg2d2ZBdThBSkJpT3lVMFpFNGVTaHNJQ0l4eXdwLzRMUHdZTnlPYUtCN3creFA5UE45SGFvL2ZONW95REt1enNLaGlQeFJTRUV3dnphZlBQTkdZcFVrNElZMWQyYThNaUZDeHZBc0x6VlkrM1Z0Q0tsWEpCZTBLRjQvRksxMGh3amV1WXMvUXB5UzhGblNqZUg4S1ltTVJTTUVxT1hLOXVrcFlTQW5VYWZhdUFQcThIbEJFbGlpMDJLUXpXMWJsM2R5OFlTZDRzWTBTUW1tWHRid0tCS3d0aVlIMnV2b3ZPY1FGL0F1bmZLVjBkU1NuTkxTai9Zb1VsTUpsaktiMVpMSGhkdHM5S1F3WHl3eDFiWVZMcEs5OUMzR00wcFdxbVRQSk91WHdBVzdWYjNDcFlBdHhaQnBjNk9laW9aVGcreERreGdzNTNvcUpGZ0o1SFlkWktoRjZReE4zMm5uUUlQcHlRbWs4d0hINEU3cVVqcUNCMnhMb0p0UVBOaFFZdGdGay9xQ2tyMndVV0NudGNGSEdDcGJsSUtra3RBR2ZnaEdQOWVXa2lwR2Y0eWJTQjd3YVFVSkRQQkd2QWErQlhjMVVtSThuakE2OEJDejFrMHFRU2lKbERJTy9vR2FBTCtZUHdBKzUvS1VLT0ZvUmM0d1Z1Z0hKaDFuVTg4L2djQ0ZVRmZZZFZ6M0FBQUFBQkpSVTVFcmtKZ2dnPT0iLz4KCQk8aW1hZ2UgIHdpZHRoPSI2MSIgaGVpZ2h0PSI0NyIgaWQ9ImltZzIiIGhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBRDBBQUFBdkNBWUFBQUJRZk1KNUFBQUFBWE5TUjBJQjJja3Nmd0FBQlhKSlJFRlVlSnpkbVhsb1hGVVVoN00xbHJSa3FVNGF0WkcyTm8xb1JVV3NwQVZMRzZzMW1HYWRyRnFGV05TQ0lxTEVRbEVzcUZYL2lUVUZhNVdLR3Y5UUs2MUpFeEJSZ3lZemt6RkxrNGFtSUJsYUljM0x2cGhNRzV0NS9zNTdkOExyeTF0bUp2TzhTUTU4Sk14eU9kOWR6cjMzVFVURU1veXlYV2t4d0FiaUFlOTByQTBJeG9GeWNCWjBsVCthNWpydzlJWjdlZWRsV2J4Y3ZqSGltVDJicWc0ZTJEQjUrUFgxNHR1dnJSZXJQMDBSdjJwWVU4RTdOOHZpaXhQckltcnJicTEzZGF3VjIzdVN4ZllMeVdKOWE5TE1LVWZDL2J4enN6UzZQYllUUVBSVDUwN3NnM1FjNzd3c0RZaStwNVN1ZFNkMlFUcUdkMTZXQmtRUCtZWFBneDliRXRzaEhjMDdMMHNEc20vT1NmZmF4RE91aEI1SXIrQ2RsNlVCMlkrVTBxZGRDUU9RWHMwN0w4c0Nvc1JabGZUTUQ0N0U1YnRQUTNUVnhkN1VLMWQ2TXNTQkN6dkVQdnh0Y20wVzZ4MHBSMDQ3MWtUeXpzK1M2Ty9adm5PME8ydlcyMWtxZWp2TEpBUm50dWhwemhUNm1yUHU0SjFmMkFPQ2QwTFdoYjgrdnpBeDRzNFhoZVpzNG4yd2ZFWWJjckdnamduZklEM1JadmN4NlZHd1BOWTJ4SWk5NEYrbHJKL0o5bUsvTlBFWldQcDdOc1RTZ1VkTFdKSnVLNXBWU0Y4RkQvRE9lVUhCcG5XRFF0S25saDV2TFZTT05QRU80SjE2YU1HbTlYNXdYVytVV1NGVFN6ZUNLTjc1aHhRUVNnR1hqVWFaR0hUbXFLVXZnbGplK1FjZGtJa0V4NHhHbUpnK1Y2b1dKcnJCMGp1TFEyZzdtREliNVlsVys2eUc5TTlMYm5wREpoNjBxZ1MxcEgxRHJ0enJHdElmTEtsQ0JwRm9jRlJ2WkcvY240dTBoSWtjM2g0QkIxdkhWSzJ2bVUxcll0aVZxN1dlSjhGdHZGMENDaWFjQzhZREVaN3FLTkVTSm1xWHhIcG13dmxneEd4S3orM05MWGxhMHZSYUlXOGYwMkFucnBmQVpBQ0ZTMzNCVU5NTDRuazc2UVk3YmQwTVRvS1pRSVd4TDRzRGpyMWF3dFFSTHk3YXFzMUcxdzQ2QXFuU3FtbXRKVXljQndtODNlWUZrbDRKTWtHdHFrSWJqdTZjOFB3enRwOFprTFZvUnBudHUydkJQdkFyOEdvZE1zeUVOVzVTU280RC9ZZjl4OTdJaUsydXpMaGx6RjJjaE1aV2dUZ0dqY0lLRUVYcmJRR1NrYXk5amF3aWZ3OHVnZGxRWklsUmQ0R1JzQWZZZEJNcTI1VzIrdGs5NlRVdjVOenQ2Vyt5LzRVR085bTZPdWVWajMyTjRCU29ZaFUxQ3p3RTBrQ3FWNzcxMkJnMGV1dllldytDSjhBcjRHdlc1cERYNUVwb0JoVXRuYTNKenhCNFRIZGFWMWR1amRxM2UzTmxSVmI2N1BGRDI3QzVsK3FlWnhYL1UxVWQ4OHBQTGFpRG5PQjNob1BKOVlKUjcvd0tyTmR1UUtQN1QwY0pUbHk2UmN2L2hPUjV3NFBJTjBlMnBiNWFzbVg0bDVNN1JhRXB6MGU5R0dDUEIxVmRGL3A5eW11ODFTNE9PbktNaEwyZ3luQWRVM1NlZVh4VGMwM211UCtMdUozNGNHQmZxRkRZSU5tSnRpSXBMd05aNGhwNEM2dzBMVEQ0VURUNFhOM0lLTGFCeWZaaU1ZaVJEeXRUa3F6ZGg2bHNKa3VNZ1hlRllCNFE0TU4zZ1FtdEJvZXg2ZU5DVGdmNS8yVlVxYVBIL2l6d0RUa05wN0dTZnZDVTZaVFdrSTRFUjRIZVBWUTY0bzIwNU5PK0tDVkduYkNRV1VEZnBUYW9MVnFybUZuaWtETTNVRkdSNWRySXFuUm92MTdnaTBtZ3hraGN5U0E2QWZkV3FTUEczQVVZblVLcFEyaFcwQnFrcVFsRUNieEc3MkVFYVcrVmpveFlvMUliUVVncUdRQWZndVNRWkZYaWllQVRWaFJDVGNoS3BrRUQyQzJFODI2TXhtNENCOEhmaTBEU0QyMUZmNEFLWU0yUDdJSzh4aDhHM3dyeWoxKzhaRWZBVCtBNWtHU0pySVo4TE1nRzM0RStvUFZZTmR6UUxrTFBwNnNGdVVpWjc3c1d5Y2V3a1Q4c3lCV1RPaUFjNjU3MjRDbEJYa3EvZ1k5QkhyaGRXQ3kvSnlNUklnNXNCZnNGdWVqUkEvUXVjRm1RRC9vMFVsUndyakttMld1RDRKSWdYK3FwNDc1a25WZ0U3cU1SRlJiTHZkY29XQ2ZRTExDQkxXQUhXdzUyVUFLS1FTRjRFandDN2dISmdsd3N1ZVg5SDRsMlJMdW1wdHBTQUFBQUFFbEZUa1N1UW1DQyIvPgoJCTxpbWFnZSAgd2lkdGg9IjYzIiBoZWlnaHQ9IjY0IiBpZD0iaW1nMyIgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFEOEFBQUJBQ0FZQUFBQ3RLNi9MQUFBQUFYTlNSMElCMmNrc2Z3QUFCdk5KUkVGVWVKemxtbXRzRkZVVXgwdVJSd1ZTdDAxSkVRSnF1eUFZU1FUNUFDckdWa0NFUG1paHRBVUpQa0pRaS9MQlI0Z2ZEQ0l4RXNHRUVQMWdBQTBvK0NoRmVWUkFSQ3AyQzMyWFZoRXBJTVhJc1BSSnU4TnJkL3lmdVRPdzNjNnI3VTV2dDU3a2wvTG96cHpmM0h2UHZYUHZob1gxd2NoT2NBNENvMEVrNEoxT3p3UkVCNEJNc0IrY1hwVG9QTFJrZG53Yzc3eHNENlcxMzgxT2REYmdwL1JDVXJ5MFp2Vkk3K2JjNkN6ZXVka2VMNlhFVDNwdGNkeUZiVnRIU1R1Mmo1VHlENHlROXJpaXZMbXV5RXpldWRrZXUvUHVqU3R3eFo0NVdSc2oxWnlMa2FwQmZxbWpFZktUZU9kbWUwQTRBaFNRdUNyL1k1bWpEdkxqZU9kbWUwQzRIL2hLbFNjT2xEc3UvaS9rS1NEOGtiLzh3WEtIRy9JUDg4NnJSd0xDYndHdktuK293dUdCL0ZUZWVmVklRSGdadUtISy8xUXBWL3RrM25uMVNFQjRDYmlteXY5Y0ZTVkJQZ2Z3VHMzK0NKUS9lbEtXL3dRTTRKMmI3UUhoSEhCVGxUOVdFeTN0Y3QzejUyNVhWTjlmNEVQNHc5b3pUdCtsVTQ5THdxa25wTnFxS1ZKQlVieDN2eXQyUlo3TDBZOTNmcllGeE1NaHZxdXBacTRrVm1YTHRGVmsraTY1NWtqbkM1OHVyaXVjTlpwM2pyWkZjM1hLcU9icTVHcXhLdXUydkFkY09aNHFDWVZKdDhEcklKeDNua0VQaUJKdmcydkFwOG9UalNYcFBralRBNmdCZlcrMUI4bjdRS1VpM0U2K3BTekRkNW5KMDBONEh3emtuVy9RUW1uMVZlQjZvRGpSV3I3UWQ5bVZyTGIrUDJBYTc1eURGaEIwZ0VLdFZsZUtudGZ0U2xIbGlRMmdiOHo3RUZ3S1BBYnlQbmRSTy9semZXTHNRMjR3eUE4VWJ0ZnRLeklsdHl0WjhwUDNnb1dBZC9yZEM4ak5BdlZHOGxmWm1QZVhKOTREb2J2b2dWZzQrRXlycXdkVyt3QnhZbXRJVjMySU9jRnBJM0dpdVdTK2xud2VHTXJib1V1aFRHOHJ3UTAvVWMwZTBGaWM1dFdRM3dPRzhmYm9Va0RxYm5EUVRKeit2ZjU0cXBaOExoakMyNk5Mb1ZIb05PWGxPYjc5TktleUpTVEhQS1Q2Z3kxbWhVNnU5R1VaM3N1RnlWcnlINFRrU3c2a0hnVVh6TVNKcHBKMHJTNVA1SVRjUEsrMCtxY0JyYTdiQXpEZXRWcWRIa2lJbVlmSjh0UEJ2MWJFMnpxdTdGU3VnSW04WFRvVkVCb0M4cXkydXM3OFRod0R3M243V0E3STlBTXJ4RHN2TUliaXJNdlAweEluTm9iVVd4MWtwb0t6Vm9xY3lOYnprc1o2WHQzUVdCUXl4UTR5bzBDQjFlNnVyT3IwdW53ZEdNL2J5VkpBSkFwOEM3eFdXNTI5d3Fib2Rma3ZRQVJ2TDlNUTJRN041K0NtVlhHVFZyOEpNbnA5bDRkRUxQaGFROXl3dTdkcXY3dXJGSU9Sdk4xMFE2bnFFOEZSamE1dXVweXRQNkZiNGFrM3ZORnJsN1JJUGdJOHAxUFZUY1diUzNYbmRlSTBHTXZic1VPSWJFZG1QTmdSTUkvN2k1dDJkNTNWbk5ycXEwQi8zcTYzUTVHbXc0YTFJbHV5YWdtYXRuaGJaUllkU1JtMWVoWGcvMFZFa2UzQURGYkc5UVpRWnpDTm1ZcDdJSTV4YmlST0ZYNFp0N0d1RkxHaDRFSHdNamdDbWd6a1RLVlY4UWI5YWMxL3V5cmFNRUYzVVViWTRjMHpCMTQ0a2o0TUZ5WWl3WEF3QnNRcDNDK3kxZFp3NWYrcFFBMEVBeFFHS1pJeDRBRXdHYVNCZDhCMzREeTRaU0JrT3JiOXhSdUwwODNFM2VBWjAzbDllY3FFTVRscEQ2M1AzZkRVOTdqd0Q3akJQcEVkQWYwdXN1cDdUbVE3cFJYZ043QWY3QlRaSW9TMmp6ZUQ3V0EzK0JYOEJWb3N5RmdXdmpQR00zME5KMHhibkxyN2FqRElVSHhSZ2pNaU84RzVaWEdpMDd0M1V5S2VhcnVrT3AyY2lXUzNydGxhc2RDbnMwR2gxZDFqVGNmazg3UEh6Vmc2YTV4N3pmSkpVdDB2NlowUjBmcTdUK3dvMjkwSEozZno1dElGZE9abUprMVVnMGNzTFdOZlRadXdkdU9iVTN5MWgrYklONkFiQlNQaFlJRTVYR293cnVqK1hBVFBDbGFQb25hdWUyeGQ4VGN6YmwrY3BnNjhEM3M5dktYeGRrYmZxakJZcTJzVnVDWGdMa3ZpRlBqbHVhREIvMEowbUUvVmxGWk9QU2xNdlk0T0Z1bk5yQlBTQk8zTHZTSjBkaThlSDRnUTJBbEdoNjVGQ1dBdXBmMXZlU1ZsaHpCZGw3cDJVOGw4bjhsS1RZOUx5a0xHdUxJYlBJQ1p5a1YwYjNLbEtGV2VXK25VazNaR08xc2JQRlZaOG1mb3MxZkxNK1FYRVZxazZKeW9XT1VzeUJhNnN5ZEhId2FibFBuUjlLYlVJK2dyWHBodjZZRlFxOGt5VkRCYnlnQiswcDlwQjdXcEpGM2VZS0JhUWkzYnllNnNCKzI5SHdjSlFqQ1dycmpJR0hCVXEvdjNNdHJBbDJDc0VNeGRHVnhzaXZKRTlZNTVlRUtOUXUvbEs0RTlYNlBHaFNlQ2ZIQzlGd2lyMUlOdEFsdTgyUHVHaGh1TUVOaFh0dHljcFp2QVBwQUNCdHNxSGZBQXFBaW1nc1BBMDRQQ05PUm81dGtGNW9OaEFxOGRWOXc0R2l3WFdERnNzVW1ZeG5NektBWHJ3WFNocS9PMkhZRmtIR0NCd0RiKy93Q3RRdmRtaG1zQyt6b29IUngrRE9hQkdLRTNmMFVNeVlVTGJGcWtBNEIxeXBpc0JIOExyRVpjVllhSktMQnBpVnBVRU5pQ3BBenNGVmc5ZVJGTUJrTzVkZXZ1QmhMdnJ3eU5DZUJKa0tTTVZlb2xhUUo3eTVvbXNIazVVdmw5M21uTDhSLzhBQVhqV0dpaGtnQUFBQUJKUlU1RXJrSmdnZz09Ii8+Cgk8L2RlZnM+Cgk8c3R5bGU+Cgk8L3N0eWxlPgoJPHVzZSBpZD0iTGF5ZXIgMSIgaHJlZj0iI2ltZzEiIHg9IjEiIHk9IjAiLz4KCTx1c2UgaWQ9IkxheWVyIDEgY29weSAyIiBocmVmPSIjaW1nMiIgeD0iMSIgeT0iMSIvPgoJPHVzZSBpZD0iTGF5ZXIgMSBjb3B5IiBocmVmPSIjaW1nMyIgeD0iMSIgeT0iMCIvPgo8L3N2Zz4=';

    private _connecting: boolean;
    private _wallet: BananaWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: BananaWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            const checkIsBananaAvailable = async () => {
                const isBananaWalletAvailable = await checkIsAvailable(config);
                if (isBananaWalletAvailable) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            };
            checkIsBananaAvailable();
        }
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return Boolean(this._wallet);
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            const wallet = await connect();
            const { publicKey } = wallet.publicData;
            this._publicKey = publicKey;
            this._wallet = wallet;
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
        options?: SendTransactionOptions
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();
            const { signature } = await wallet.sendTransaction({
                transaction,
                connection,
                options
            });
            return signature;
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
