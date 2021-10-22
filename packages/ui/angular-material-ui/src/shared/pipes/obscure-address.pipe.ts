import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'obscureAddress',
})
export class ObscureAddressPipe implements PipeTransform {
    transform(value: string | null): string {
        if (value === null) {
            return '';
        }

        return value.slice(0, 4) + '..' + value.slice(-4);
    }
}
