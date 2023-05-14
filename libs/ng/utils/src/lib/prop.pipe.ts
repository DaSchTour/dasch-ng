import { Pipe, PipeTransform } from '@angular/core';
import { prop } from '@fxts/core';

@Pipe({
  name: 'prop',
  standalone: true,
})
export class PropPipe implements PipeTransform {
  public transform<K extends string | number | symbol, V>(
    value: Record<K, V>,
    key: K
  ) {
    return prop(key, value);
  }
}
