import { Pipe, PipeTransform } from '@angular/core';
import { isNil, nth } from '@fxts/core';

@Pipe({
  name: 'nth',
  standalone: true,
})
export class NthPipe implements PipeTransform {
  public transform<T>(array: Iterable<T> | null | undefined, n: number): T | null | undefined {
    if (isNil(array)) {
      return array;
    } else {
      return nth(n, array);
    }
  }
}
