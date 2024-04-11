import { Pipe, PipeTransform } from '@angular/core';
import { isNil, isNull, isUndefined } from '@fxts/core';

@Pipe({
  name: 'isUndefined',
  standalone: true,
})
export class IsUndefinedPipe implements PipeTransform {
  public transform<T>(value: T): ReturnType<typeof isUndefined<T>> {
    return isUndefined<T>(value);
  }
}
