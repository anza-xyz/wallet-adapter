"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticleAdapter = exports.ParticleName = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
const web3_js_1 = require("@solana/web3.js");
exports.ParticleName = 'Particle';
class ParticleAdapter extends wallet_adapter_base_1.BaseMessageSignerWalletAdapter {
    constructor(config) {
        super();
        this.name = exports.ParticleName;
        this.url = 'https://particle.network';
        this.icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDE0MCAxNDAiPjxkZWZzPjxmaWx0ZXIgaWQ9ImEiIHg9IjAiIHk9IjAiIHdpZHRoPSIxNDAiIGhlaWdodD0iMTQwIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiPjxmZUltYWdlIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHdpZHRoPSIxNDAiIGhlaWdodD0iMTQwIiByZXN1bHQ9ImltYWdlIiB4bGluazpocmVmPSJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSGh0Ykc1ek9uaHNhVzVyUFNKb2RIUndPaTh2ZDNkM0xuY3pMbTl5Wnk4eE9UazVMM2hzYVc1cklpQjNhV1IwYUQwaU1UUXdJaUJvWldsbmFIUTlJakUwTUNJZ2RtbGxkMEp2ZUQwaU1DQXdJREUwTUNBeE5EQWlQZ29nSUR4a1pXWnpQZ29nSUNBZ1BITjBlV3hsUGdvZ0lDQWdJQ0F1WTJ4ekxURWdld29nSUNBZ0lDQWdJR1pwYkd3NklIVnliQ2dqYkdsdVpXRnlMV2R5WVdScFpXNTBLVHNLSUNBZ0lDQWdmUW9nSUNBZ1BDOXpkSGxzWlQ0S0lDQWdJRHhzYVc1bFlYSkhjbUZrYVdWdWRDQnBaRDBpYkdsdVpXRnlMV2R5WVdScFpXNTBJaUI0TVQwaU1UUXdJaUI1TVQwaU1UUXdJaUI0TWowaU1DSWdaM0poWkdsbGJuUlZibWwwY3owaWRYTmxjbE53WVdObFQyNVZjMlVpUGdvZ0lDQWdJQ0E4YzNSdmNDQnZabVp6WlhROUlqQWlJSE4wYjNBdFkyOXNiM0k5SWlObE1EUXdaRGNpTHo0S0lDQWdJQ0FnUEhOMGIzQWdiMlptYzJWMFBTSXhJaUJ6ZEc5d0xXTnZiRzl5UFNJak5qSXlOMlUySWk4K0NpQWdJQ0E4TDJ4cGJtVmhja2R5WVdScFpXNTBQZ29nSUR3dlpHVm1jejRLSUNBOGNtVmpkQ0JqYkdGemN6MGlZMnh6TFRFaUlIZHBaSFJvUFNJeE5EQWlJR2hsYVdkb2REMGlNVFF3SWk4K0Nqd3ZjM1puUGdvPSIvPjxmZUNvbXBvc2l0ZSByZXN1bHQ9ImNvbXBvc2l0ZSIgb3BlcmF0b3I9ImluIiBpbjI9IlNvdXJjZUdyYXBoaWMiLz48ZmVCbGVuZCByZXN1bHQ9ImJsZW5kIiBpbjI9IlNvdXJjZUdyYXBoaWMiLz48L2ZpbHRlcj48L2RlZnM+PHJlY3QgZGF0YS1uYW1lPSLlnIbop5Lnn6nlvaIgMSIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIxNDAiIHJ4PSI0MCIgcnk9IjQwIiBmaWx0ZXI9InVybCgjYSkiLz48cGF0aCBkYXRhLW5hbWU9IuakreWchiAzIOaLt+i0nSIgZD0iTTM0LjkxIDMwLjhhNi42MTQgNi42MTQgMCAxIDAgNi41NTMgNi42MTRBNi41ODQgNi41ODQgMCAwIDAgMzQuOTEgMzAuOHptMTMuNjE1LTcuODJhNi41NTIgNi41NTIgMCAwIDAtOC4yNzIgNC4yNTQgNi42MzkgNi42MzkgMCAwIDAgNC4yMTUgOC4zNDkgNi41NTIgNi41NTIgMCAwIDAgOC4yNzItNC4yNTQgNi42MzkgNi42MzkgMCAwIDAtNC4yMTUtOC4zNDl6bTE1LjMxMS0zLjI0OGE2LjUyNSA2LjUyNSAwIDAgMC05LjE3IDEuNDY4IDYuNjY2IDYuNjY2IDAgMCAwIDEuNDUyIDkuMjU1IDYuNTI1IDYuNTI1IDAgMCAwIDkuMTY5LTEuNDY2IDYuNjY2IDYuNjY2IDAgMCAwLTEuNDUxLTkuMjU3em0xNS41NTYgMS42ODdhNi41MjUgNi41MjUgMCAwIDAtOS4xNjktMS40NjYgNi42NjYgNi42NjYgMCAwIDAtMS40NTIgOS4yNTUgNi41MjUgNi41MjUgMCAwIDAgOS4xNjkgMS40NjYgNi42NjYgNi42NjYgMCAwIDAgMS40NTEtOS4yNTZ6bTE0LjI3OCA2LjQ1NWE2LjU1MiA2LjU1MiAwIDAgMC04LjI3LTQuMjU0IDYuNjM5IDYuNjM5IDAgMCAwLTQuMjE1IDguMzQ5IDYuNTUyIDYuNTUyIDAgMCAwIDguMjcyIDQuMjU0IDYuNjM5IDYuNjM5IDAgMCAwIDQuMjEzLTguMzQ5em0xMS42IDEwLjU5NGE2LjU2NCA2LjU2NCAwIDEgMC02LjU2NCA2LjYyNiA2LjYgNi42IDAgMCAwIDYuNTY2LTYuNjI2em03Ljc5MiAxMy42OTRhNi42MzkgNi42MzkgMCAwIDAtNC4yMTQtOC4zNDkgNi41NTIgNi41NTIgMCAwIDAtOC4yNzIgNC4yNTQgNi42MzkgNi42MzkgMCAwIDAgNC4yMTUgOC4zNDkgNi41NTEgNi41NTEgMCAwIDAgOC4yNzMtNC4yNTN6bTMuMjE4IDE1LjQ1NWE2LjY2NiA2LjY2NiAwIDAgMC0xLjQ1Mi05LjI1NSA2LjUyNSA2LjUyNSAwIDAgMC05LjE2OSAxLjQ2NiA2LjY2NiA2LjY2NiAwIDAgMCAxLjQ1MiA5LjI1NSA2LjUyNSA2LjUyNSAwIDAgMCA5LjE3MS0xLjQ2NnptLTEuNjcxIDE1LjdhNi42NjYgNi42NjYgMCAwIDAgMS40NTItOS4yNTUgNi41MjUgNi41MjUgMCAwIDAtOS4xNjktMS40NjYgNi42NjYgNi42NjYgMCAwIDAtMS40NTIgOS4yNTUgNi41MjUgNi41MjUgMCAwIDAgOS4xNzEgMS40Njh6bS02LjQgMTQuNDEyYTYuNjM4IDYuNjM4IDAgMCAwIDQuMjE0LTguMzQ5IDYuNTUxIDYuNTUxIDAgMCAwLTguMjcxLTQuMjU0IDYuNjM5IDYuNjM5IDAgMCAwLTQuMjE1IDguMzQ5IDYuNTUyIDYuNTUyIDAgMCAwIDguMjc4IDQuMjU2em0tMTAuNSAxMS43MTFhNi42MjYgNi42MjYgMCAxIDAtNi41NjQtNi42MjYgNi42IDYuNiAwIDAgMCA2LjU3NSA2LjYyOHptLTEzLjU2NyA3Ljg2NWE2LjU1MiA2LjU1MiAwIDAgMCA4LjI3Mi00LjI1NCA2LjYzOSA2LjYzOSAwIDAgMC00LjIxNS04LjM0OSA2LjU1MiA2LjU1MiAwIDAgMC04LjI3MiA0LjI1NCA2LjYzOSA2LjYzOSAwIDAgMCA0LjIyNSA4LjM1MXptLTE1LjMxMSAzLjI0OEE2LjUyNSA2LjUyNSAwIDAgMCA3OCAxMTkuMDg3YTYuNjY2IDYuNjY2IDAgMCAwLTEuNDUyLTkuMjU1IDYuNTI1IDYuNTI1IDAgMCAwLTkuMTY5IDEuNDY2IDYuNjY2IDYuNjY2IDAgMCAwIDEuNDYyIDkuMjU3em0tMTUuNTU2LTEuNjg2YTYuNTI1IDYuNTI1IDAgMCAwIDkuMTY5IDEuNDY1IDYuNjY2IDYuNjY2IDAgMCAwIDEuNDUyLTkuMjU1IDYuNTI1IDYuNTI1IDAgMCAwLTkuMTY5LTEuNDY2IDYuNjY3IDYuNjY3IDAgMCAwLTEuNDQxIDkuMjU4em0tMTQuMjc4LTYuNDU3YTYuNTUyIDYuNTUyIDAgMCAwIDguMjcyIDQuMjU1IDYuNjQgNi42NCAwIDAgMCA0LjIxNS04LjM1IDYuNTUyIDYuNTUyIDAgMCAwLTguMjcyLTQuMjU0IDYuNjM5IDYuNjM5IDAgMCAwLTQuMjA1IDguMzUxek0yNy40IDEwMS44MTlhNi41NjUgNi41NjUgMCAxIDAgNi41NjQtNi42MjYgNi42IDYuNiAwIDAgMC02LjU2NCA2LjYyNnptMTguNzgtNTYuNDY2YTMuOTY5IDMuOTY5IDAgMSAwIDMuOTMyIDMuOTY4IDMuOTUgMy45NSAwIDAgMC0zLjkzMi0zLjk2OHptOC40NTUtNS4wMjlhMy45MzEgMy45MzEgMCAwIDAtNC45NjMgMi41NTIgMy45ODMgMy45ODMgMCAwIDAgMi41MjkgNS4wMSAzLjkzMSAzLjkzMSAwIDAgMCA0Ljk2My0yLjU1MiAzLjk4NCAzLjk4NCAwIDAgMC0yLjUyOS01LjAxem05LjUzNy0yLjIzMmEzLjkxNSAzLjkxNSAwIDAgMC01LjUuODggNCA0IDAgMCAwIC44NzEgNS41NTMgMy45MTUgMy45MTUgMCAwIDAgNS41LS44OCA0IDQgMCAwIDAtLjg3MS01LjU1M3ptOS43NTMuODUyYTMuOTE1IDMuOTE1IDAgMCAwLTUuNS0uODggNCA0IDAgMCAwLS44NzEgNS41NTMgMy45MTUgMy45MTUgMCAwIDAgNS41Ljg4IDQgNCAwIDAgMCAuODcxLTUuNTUzem05LjAxNiAzLjg1NmEzLjkzMSAzLjkzMSAwIDAgMC00Ljk2My0yLjU1MyAzLjk4NCAzLjk4NCAwIDAgMC0yLjUyOSA1LjAxIDMuOTMxIDMuOTMxIDAgMCAwIDQuOTYzIDIuNTUzIDMuOTg0IDMuOTg0IDAgMCAwIDIuNTI5LTUuMDF6bTcuMzk1IDYuNDc2YTMuOTM5IDMuOTM5IDAgMSAwLTMuOTM2IDMuOTcyIDMuOTU3IDMuOTU3IDAgMCAwIDMuOTM1LTMuOTc2em01LjA1IDguNDY1YTMuOTgzIDMuOTgzIDAgMCAwLTIuNTI5LTUuMDEgMy45MzEgMy45MzEgMCAwIDAtNC45NjMgMi41NTIgMy45ODQgMy45ODQgMCAwIDAgMi41MjkgNS4wMSAzLjkzMSAzLjkzMSAwIDAgMCA0Ljk2Mi0yLjU1NnptMi4yMTQgOS42MjNhNCA0IDAgMCAwLS44NzEtNS41NTMgMy45MTUgMy45MTUgMCAwIDAtNS41Ljg4IDQgNCAwIDAgMCAuODcxIDUuNTUzIDMuOTE1IDMuOTE1IDAgMCAwIDUuNS0uODh6bS0uODQ0IDkuODQ1YTQgNCAwIDAgMCAuODcxLTUuNTUzIDMuOTE1IDMuOTE1IDAgMCAwLTUuNS0uODggNCA0IDAgMCAwLS44NzEgNS41NTMgMy45MTUgMy45MTUgMCAwIDAgNS40OTcuODh6bS0zLjgxNyA5LjFhMy45ODMgMy45ODMgMCAwIDAgMi41MjktNS4wMSAzLjkzMSAzLjkzMSAwIDAgMC00Ljk2OC0yLjU1MyAzLjk4MyAzLjk4MyAwIDAgMC0yLjUyOSA1LjAwOSAzLjkzMSAzLjkzMSAwIDAgMCA0Ljk2NSAyLjU1M3ptLTYuNDE5IDcuNDYzYTMuOTc2IDMuOTc2IDAgMSAwLTMuOTM4LTMuOTcyIDMuOTU3IDMuOTU3IDAgMCAwIDMuOTM4IDMuOTcyem0tOC4zODcgNS4xYTMuOTMxIDMuOTMxIDAgMCAwIDQuOTY3LTIuNTU1IDMuOTgzIDMuOTgzIDAgMCAwLTIuNTI5LTUuMDFBMy45MzEgMy45MzEgMCAwIDAgNzUuNiA5My44NmEzLjk4MyAzLjk4MyAwIDAgMCAyLjUzNCA1LjAxek02OC42IDEwMS4xYTMuOTE1IDMuOTE1IDAgMCAwIDUuNS0uODggNCA0IDAgMCAwLS44NzEtNS41NTMgMy45MTUgMy45MTUgMCAwIDAtNS41Ljg4IDQgNCAwIDAgMCAuODcxIDUuNTUzem0tOS43NTMtLjg1MmEzLjkxNiAzLjkxNiAwIDAgMCA1LjUuODggNCA0IDAgMCAwIC44NzEtNS41NTQgMy45MTUgMy45MTUgMCAwIDAtNS41LS44OCA0IDQgMCAwIDAtLjg3NSA1LjU1NnpNNDkuODI4IDk2LjRhMy45MzEgMy45MzEgMCAwIDAgNC45NjMgMi41NTMgMy45ODQgMy45ODQgMCAwIDAgMi41MjktNS4wMSAzLjkzMSAzLjkzMSAwIDAgMC00Ljk2My0yLjU1MyAzLjk4MyAzLjk4MyAwIDAgMC0yLjUyOSA1LjAxem0tNy4zOTUtNi40NzZhMy45MzkgMy45MzkgMCAxIDAgMy45MzktMy45NzYgMy45NTcgMy45NTcgMCAwIDAtMy45MzggMy45NzR6TTUzLjUxOSA1Ni4yYTIuMTE3IDIuMTE3IDAgMSAwIDIuMSAyLjExNyAyLjEwNyAyLjEwNyAwIDAgMC0yLjEtMi4xMTd6bTQuNjM5LTIuNzIzYTIuMSAyLjEgMCAwIDAtMi42NDcgMS4zNjEgMi4xMjUgMi4xMjUgMCAwIDAgMS4zNDkgMi42NzIgMi4xIDIuMSAwIDAgMCAyLjY0Ny0xLjM2MSAyLjEyNCAyLjEyNCAwIDAgMC0xLjM0OS0yLjY3MnptNS4yLTEuMjUyYTIuMDg4IDIuMDg4IDAgMCAwLTIuOTM0LjQ2OSAyLjEzMyAyLjEzMyAwIDAgMCAuNDY1IDIuOTYyIDIuMDg4IDIuMDg4IDAgMCAwIDIuOTM0LS40NjkgMi4xMzMgMi4xMzMgMCAwIDAtLjQ3LTIuOTYxem01LjMyNC40M2EyLjA4OCAyLjA4OCAwIDAgMC0yLjkzNC0uNDY5IDIuMTMzIDIuMTMzIDAgMCAwLS40NjUgMi45NjIgMi4wODggMi4wODggMCAwIDAgMi45MzQuNDY5IDIuMTMzIDIuMTMzIDAgMCAwIC40Ni0yLjk2MXptNC45MzIgMi4wN2EyLjEgMi4xIDAgMCAwLTIuNjQ3LTEuMzYxIDIuMTI0IDIuMTI0IDAgMCAwLTEuMzQ5IDIuNjcyQTIuMSAyLjEgMCAwIDAgNzIuMjYgNTcuNGEyLjEyNCAyLjEyNCAwIDAgMCAxLjM0OS0yLjY3NHptNC4wNTcgMy41MDdhMi4xIDIuMSAwIDEgMC0yLjEgMi4xMiAyLjExMSAyLjExMSAwIDAgMCAyLjA5NS0yLjEyem0yLjc4NSA0LjZhMi4xMjUgMi4xMjUgMCAwIDAtMS4zNTYtMi42NzEgMi4xIDIuMSAwIDAgMC0yLjY0NyAxLjM2MSAyLjEyNSAyLjEyNSAwIDAgMCAxLjM0NyAyLjY3MiAyLjEgMi4xIDAgMCAwIDIuNjUxLTEuMzYxem0xLjI0IDUuMjQ0YTIuMTMzIDIuMTMzIDAgMCAwLS40NjUtMi45NjIgMi4wODggMi4wODggMCAwIDAtMi45MzQuNDY5IDIuMTMzIDIuMTMzIDAgMCAwIC40NjUgMi45NjIgMi4wODggMi4wODggMCAwIDAgMi45MjktLjQ2OHptLS40MjYgNS4zNzRhMi4xMzMgMi4xMzMgMCAwIDAgLjQ2NS0yLjk2MiAyLjA4OCAyLjA4OCAwIDAgMC0yLjkzNS0uNDY4IDIuMTMzIDIuMTMzIDAgMCAwLS40NjUgMi45NjIgMi4wODggMi4wODggMCAwIDAgMi45MjkuNDY5em0tMi4wNSA0Ljk3OGEyLjEyNSAyLjEyNSAwIDAgMCAxLjM0OS0yLjY3MiAyLjEgMi4xIDAgMCAwLTIuNjUzLTEuMzU2IDIuMTI0IDIuMTI0IDAgMCAwLTEuMzQ5IDIuNjcyIDIuMSAyLjEgMCAwIDAgMi42NDcgMS4zNTd6bS0zLjQ4IDQuMDk1YTIuMTIgMi4xMiAwIDEgMC0yLjEtMi4xMiAyLjExMSAyLjExMSAwIDAgMCAyLjEgMi4xMnptLTQuNTU4IDIuODExYTIuMSAyLjEgMCAwIDAgMi42NDctMS4zNjFBMi4xMjUgMi4xMjUgMCAwIDAgNzIuNDggODEuM2EyLjEgMi4xIDAgMCAwLTIuNjQ3IDEuMzYxIDIuMTI1IDIuMTI1IDAgMCAwIDEuMzQ5IDIuNjczem0tNS4yIDEuMjUyYTIuMDg4IDIuMDg4IDAgMCAwIDIuOTM0LS40NjkgMi4xMzMgMi4xMzMgMCAwIDAtLjQ2NS0yLjk2MiAyLjA4OCAyLjA4OCAwIDAgMC0yLjkzNC40NjkgMi4xMzMgMi4xMzMgMCAwIDAgLjQ3IDIuOTYyem0tNS4zMjQtLjQzYTIuMDg4IDIuMDg4IDAgMCAwIDIuOTM0LjQ2OSAyLjEzMyAyLjEzMyAwIDAgMCAuNDY1LTIuOTYyIDIuMDg4IDIuMDg4IDAgMCAwLTIuOTM0LS40NjkgMi4xMzMgMi4xMzMgMCAwIDAtLjQ2IDIuOTYyem0tNC45MzItMi4wN2EyLjEgMi4xIDAgMCAwIDIuNjQ3IDEuMzYxIDIuMTI1IDIuMTI1IDAgMCAwIDEuMzQ5LTIuNjcyIDIuMSAyLjEgMCAwIDAtMi42NDctMS4zNjEgMi4xMjQgMi4xMjQgMCAwIDAtMS4zNDQgMi42NzJ6bS00LjA1Ny0zLjUwN2EyLjEgMi4xIDAgMSAwIDIuMS0yLjEyIDIuMTExIDIuMTExIDAgMCAwLTIuMDk1IDIuMTJ6IiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=';
        this._readyState = typeof window === 'undefined' ? wallet_adapter_base_1.WalletReadyState.Unsupported : wallet_adapter_base_1.WalletReadyState.Loadable;
        this._connecting = false;
        this._publicKey = null;
        this._wallet = null;
        this._config = config;
    }
    get publicKey() {
        return this._publicKey;
    }
    get connecting() {
        return this._connecting;
    }
    get connected() {
        return !!this._publicKey;
    }
    get readyState() {
        return this._readyState;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.connected || this.connecting)
                    return;
                if (this._readyState !== wallet_adapter_base_1.WalletReadyState.Loadable)
                    throw new wallet_adapter_base_1.WalletNotReadyError();
                this._connecting = true;
                let ParticleClass;
                let WalletClass;
                try {
                    const classes = yield Promise.all([
                        Promise.resolve().then(() => __importStar(require('@particle-network/auth'))),
                        Promise.resolve().then(() => __importStar(require('@particle-network/solana-wallet'))),
                    ]);
                    ParticleClass = classes[0].ParticleNetwork;
                    WalletClass = classes[1].SolanaWallet;
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletLoadError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                let wallet;
                try {
                    wallet = window.particle || new WalletClass(new ParticleClass(this._config).auth);
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletConfigError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                try {
                    yield wallet.connect();
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletConnectionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                const account = wallet.publicKey();
                if (!account)
                    throw new wallet_adapter_base_1.WalletAccountError();
                let publicKey;
                try {
                    publicKey = new web3_js_1.PublicKey(account.toBytes());
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletPublicKeyError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                this._wallet = wallet;
                this._publicKey = publicKey;
                this.emit('connect', publicKey);
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
            finally {
                this._connecting = false;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = this._wallet;
            if (wallet) {
                this._wallet = null;
                this._publicKey = null;
                try {
                    yield wallet.disconnect();
                }
                catch (error) {
                    this.emit('error', new wallet_adapter_base_1.WalletDisconnectionError(error === null || error === void 0 ? void 0 : error.message, error));
                }
            }
            this.emit('disconnect');
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = this._wallet;
                if (!wallet)
                    throw new wallet_adapter_base_1.WalletNotConnectedError();
                try {
                    return (yield wallet.signTransaction(transaction)) || transaction;
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
        });
    }
    signAllTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = this._wallet;
                if (!wallet)
                    throw new wallet_adapter_base_1.WalletNotConnectedError();
                try {
                    return (yield wallet.signAllTransactions(transactions)) || transactions;
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
        });
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = this._wallet;
                if (!wallet)
                    throw new wallet_adapter_base_1.WalletNotConnectedError();
                try {
                    return yield wallet.signMessage(message);
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletSignMessageError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
        });
    }
}
exports.ParticleAdapter = ParticleAdapter;
//# sourceMappingURL=adapter.js.map