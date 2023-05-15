import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from '@fxts/core';

@Pipe({
  name: 'isNil',
  standalone: true,
})
export class IsNilPipe implements PipeTransform {
  public transform<T>(value: T): ReturnType<typeof isNil<T>> {
    return isNil<T>(value);
  }
}
