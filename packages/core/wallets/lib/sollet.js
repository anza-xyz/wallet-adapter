var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { SolletWalletAdapter } from '@solana/wallet-adapter-sollet';
import { WalletName } from './types';
export const getSolletWallet = (_a = {}) => {
    var { provider } = _a, config = __rest(_a, ["provider"]);
    return ({
        name: WalletName.Sollet,
        url: 'https://www.sollet.io',
        icon: 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUzMCIgd2lkdGg9IjUzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtLTEtMWg1MzJ2NTMyaC01MzJ6IiBmaWxsPSJub25lIi8+PGcgZmlsbD0iIzAwZmZhMyI+PHBhdGggZD0ibTg4Ljg4OTM1IDM3Mi45ODIwMWMzLjE5My0zLjE5IDcuNTIyLTQuOTgyIDEyLjAzNS00Ljk4Mmg0MTYuNDYxYzcuNTg2IDAgMTEuMzg0IDkuMTc0IDYuMDE3IDE0LjUzNmwtODIuMjkxIDgyLjIyNmMtMy4xOTMgMy4xOTEtNy41MjIgNC45ODMtMTIuMDM2IDQuOTgzaC00MTYuNDYwMWMtNy41ODY2IDAtMTEuMzg0NS05LjE3NC02LjAxNzgtMTQuNTM3bDgyLjI5MTktODIuMjI2eiIvPjxwYXRoIGQ9Im04OC44ODkzNSA2NS45ODI1YzMuMTkzLTMuMTkwNCA3LjUyMi00Ljk4MjUgMTIuMDM1LTQuOTgyNWg0MTYuNDYxYzcuNTg2IDAgMTEuMzg0IDkuMTczOSA2LjAxNyAxNC41MzYzbC04Mi4yOTEgODIuMjI2N2MtMy4xOTMgMy4xOS03LjUyMiA0Ljk4Mi0xMi4wMzYgNC45ODJoLTQxNi40NjAxYy03LjU4NjYgMC0xMS4zODQ1LTkuMTc0LTYuMDE3OC0xNC41MzZsODIuMjkxOS04Mi4yMjY1eiIvPjxwYXRoIGQ9Im00NDEuMTExMzUgMjE5LjEwOTVjLTMuMTkzLTMuMTktNy41MjItNC45ODItMTIuMDM2LTQuOTgyaC00MTYuNDYwMWMtNy41ODY2IDAtMTEuMzg0NSA5LjE3My02LjAxNzggMTQuNTM2bDgyLjI5MTkgODIuMjI2YzMuMTkzIDMuMTkgNy41MjIgNC45ODMgMTIuMDM1IDQuOTgzaDQxNi40NjFjNy41ODYgMCAxMS4zODQtOS4xNzQgNi4wMTctMTQuNTM3eiIvPjwvZz48L3N2Zz4=',
        adapter: () => new SolletWalletAdapter(Object.assign({ provider: 'https://www.sollet.io' }, config)),
    });
};
//# sourceMappingURL=sollet.js.map