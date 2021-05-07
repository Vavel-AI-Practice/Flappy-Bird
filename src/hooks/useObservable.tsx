import { useState, useEffect } from "react";
import { BehaviorSubject } from "rxjs";

export const useObservable = <T extends any>(observable: BehaviorSubject<T>): T => {
    const [state, setState] = useState<T>(observable.getValue());

    useEffect(() => {
        const sub = observable.subscribe(setState);
        return () => sub.unsubscribe();
    }, [observable]);

    return state;
};