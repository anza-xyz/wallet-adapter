import { Duplex } from 'readable-stream';

type StreamData = number | string | Record<string, unknown> | unknown[];

interface StreamMessage {
    data: StreamData;
    [key: string]: unknown;
}

export interface PostMessageEvent {
    data?: StreamData;
    origin: string;
    source: typeof window;
}

interface WindowPostMessageStreamArgs {
    name: string;
    target: string;
    targetOrigin?: string;
    targetWindow?: Window;
}

function isValidStreamMessage(message: unknown): message is StreamMessage {
    return (
        isObject(message) &&
        Boolean(message.data) &&
        (typeof message.data === 'number' || typeof message.data === 'object' || typeof message.data === 'string')
    );
}

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

const getSource = Object.getOwnPropertyDescriptor(MessageEvent.prototype, 'source')?.get;

const getOrigin = Object.getOwnPropertyDescriptor(MessageEvent.prototype, 'origin')?.get;

export class WindowPostMessageStream extends Duplex {
    private _name: string;

    private _target: string;

    private _targetOrigin: string;

    private _targetWindow: Window;

    /**
     * Creates a stream for communicating with other streams across the same or
     * different `window` objects.
     *
     * @param args - Options bag.
     * @param args.name - The name of the stream. Used to differentiate between
     * multiple streams sharing the same window object.
     * @param args.target - The name of the stream to exchange messages with.
     * @param args.targetOrigin - The origin of the target. Defaults to
     * `location.origin`, '*' is permitted.
     * @param args.targetWindow - The window object of the target stream. Defaults
     * to `window`.
     */
    constructor({ name, target, targetOrigin = location.origin, targetWindow = window }: WindowPostMessageStreamArgs) {
        super({
            objectMode: true,
        });

        if (typeof window === 'undefined' || typeof window.postMessage !== 'function') {
            throw new Error(
                'window.postMessage is not a function. This class should only be instantiated in a Window.'
            );
        }

        this._name = name;
        this._target = target;
        this._targetOrigin = targetOrigin;
        this._targetWindow = targetWindow;
        this._onMessage = this._onMessage.bind(this);

        window.addEventListener('message', this._onMessage as any, false);
    }

    protected _onData(data: StreamData): void {
        try {
            this.push(data);
        } catch (err) {
            this.emit('error', err);
        }
    }

    _read(): void {
        return undefined;
    }

    _write(data: StreamData, _encoding: string | null, cb: () => void): void {
        this._postMessage(data);
        cb();
    }

    protected _postMessage(data: unknown): void {
        this._targetWindow.postMessage(
            {
                target: this._target,
                data,
            },
            this._targetOrigin
        );
    }

    private _onMessage(event: PostMessageEvent): void {
        const message = event.data;

        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        if (
            (this._targetOrigin !== '*' && getOrigin!.call(event) !== this._targetOrigin) ||
            getSource!.call(event) !== this._targetWindow ||
            !isValidStreamMessage(message) ||
            message.target !== this._name
        ) {
            return;
        }
        /* eslint-enable @typescript-eslint/no-non-null-assertion */

        this._onData(message.data);
    }

    _destroy(): void {
        window.removeEventListener('message', this._onMessage as any, false);
    }
}
