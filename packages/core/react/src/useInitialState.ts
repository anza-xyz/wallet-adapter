import { DependencyList, Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

/** @internal */
export function useInitialState<S>(
    factory: () => S,
    deps: DependencyList | undefined
): [S, Dispatch<SetStateAction<S>>] {
    const initialState = useMemo(factory, deps);
    const [state, setState] = useState(initialState);

    // When the deps change, reinitialize the state
    useEffect(() => setState(initialState), [initialState]);

    return [state, setState];
}
