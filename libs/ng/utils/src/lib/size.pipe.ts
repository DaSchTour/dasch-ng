import { Pipe, PipeTransform } from '@angular/core';
import { size } from '@fxts/core';

@Pipe({
  name: 'size',
  standalone: true,
})
export class SizePipe implements PipeTransform {
  transform<T>(value: Iterable<T> | null | undefined): number {
    return value ? size(value) : -1;
  }
}
