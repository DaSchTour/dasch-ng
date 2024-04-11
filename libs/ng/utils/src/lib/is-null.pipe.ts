import { Pipe, PipeTransform } from '@angular/core';
import { isNil, isNull } from '@fxts/core';

@Pipe({
  name: 'isNull',
  standalone: true,
})
export class IsNullPipe implements PipeTransform {
  public transform<T>(value: T): ReturnType<typeof isNull<T>> {
    return isNull<T>(value);
  }
}
