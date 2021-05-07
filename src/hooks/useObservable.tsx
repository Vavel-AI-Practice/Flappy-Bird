import { useState, useEffect } from "react";
import { Observable } from "rxjs";

export const useObservable = <T extends any>(observable: Observable<T>, defaultValue: T): T => {
    const [state, setState] = useState<T>(defaultValue);

    useEffect(() => {
        const sub = observable.subscribe(setState);
        return () => sub.unsubscribe();
    }, [observable]);

    return state;
};