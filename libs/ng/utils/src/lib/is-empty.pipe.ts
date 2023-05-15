import { Pipe, PipeTransform } from '@angular/core';
import { isEmpty } from '@fxts/core';

@Pipe({
  name: 'isEmpty',
  standalone: true,
})
export class IsEmptyPipe implements PipeTransform {
  public transform(value: unknown): boolean {
    return isEmpty(value);
  }
}
