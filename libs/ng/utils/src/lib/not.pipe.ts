import { Pipe, PipeTransform } from '@angular/core';
import { not } from '@fxts/core';

@Pipe({
  name: 'not',
  standalone: true,
})
export class NotPipe implements PipeTransform {
  transform(value: unknown): boolean {
    return not(value);
  }
}
