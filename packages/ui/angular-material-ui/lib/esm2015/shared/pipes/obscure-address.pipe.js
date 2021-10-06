import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class ObscureAddressPipe {
    transform(value) {
        if (value === null) {
            return '';
        }
        return value
            .split('')
            .reduce((state, curr, index) => state + (index <= 3 || index >= 39 ? curr : '*'))
            .split('*')
            .filter((segment) => segment)
            .join('***');
    }
}
ObscureAddressPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: ObscureAddressPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
ObscureAddressPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: ObscureAddressPipe, name: "obscureAddress" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: ObscureAddressPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'obscureAddress',
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzY3VyZS1hZGRyZXNzLnBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2hhcmVkL3BpcGVzL29ic2N1cmUtYWRkcmVzcy5waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDOztBQUtwRCxNQUFNLE9BQU8sa0JBQWtCO0lBQzNCLFNBQVMsQ0FBQyxLQUFvQjtRQUMxQixJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDaEIsT0FBTyxFQUFFLENBQUM7U0FDYjtRQUVELE9BQU8sS0FBSzthQUNQLEtBQUssQ0FBQyxFQUFFLENBQUM7YUFDVCxNQUFNLENBQUMsQ0FBQyxLQUFhLEVBQUUsSUFBWSxFQUFFLEtBQWEsRUFBRSxFQUFFLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3hHLEtBQUssQ0FBQyxHQUFHLENBQUM7YUFDVixNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQzthQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckIsQ0FBQzs7K0dBWlEsa0JBQWtCOzZHQUFsQixrQkFBa0I7MkZBQWxCLGtCQUFrQjtrQkFIOUIsSUFBSTttQkFBQztvQkFDRixJQUFJLEVBQUUsZ0JBQWdCO2lCQUN6QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQFBpcGUoe1xuICAgIG5hbWU6ICdvYnNjdXJlQWRkcmVzcycsXG59KVxuZXhwb3J0IGNsYXNzIE9ic2N1cmVBZGRyZXNzUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nIHwgbnVsbCk6IHN0cmluZyB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgICAgICAuc3BsaXQoJycpXG4gICAgICAgICAgICAucmVkdWNlKChzdGF0ZTogc3RyaW5nLCBjdXJyOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpID0+IHN0YXRlICsgKGluZGV4IDw9IDMgfHwgaW5kZXggPj0gMzkgPyBjdXJyIDogJyonKSlcbiAgICAgICAgICAgIC5zcGxpdCgnKicpXG4gICAgICAgICAgICAuZmlsdGVyKChzZWdtZW50KSA9PiBzZWdtZW50KVxuICAgICAgICAgICAgLmpvaW4oJyoqKicpO1xuICAgIH1cbn1cbiJdfQ==