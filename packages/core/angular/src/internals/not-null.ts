import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const isNotNull = <T>(source: Observable<T | null>): Observable<T> =>
    source.pipe(filter((item: T | null): item is T => item !== null));
