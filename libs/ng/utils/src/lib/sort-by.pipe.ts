import { Pipe, PipeTransform } from '@angular/core';
import { sortBy } from '@fxts/core';

@Pipe({
  name: 'sortBy',
  standalone: true,
})
export class SortByPipe implements PipeTransform {
  public transform<T>(
    value: Iterable<T> | null | undefined,
    prop?: keyof T | null
  ) {
    if (prop && value) {
      return sortBy((v) => `${v[prop]}`.toLowerCase(), value);
    } else {
      return value;
    }
  }
}
