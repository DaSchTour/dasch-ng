import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'symbolKeyFor',
  standalone: true,
})
export class SymbolKeyForPipe implements PipeTransform {
  transform(symbol: unknown): string {
    if (typeof symbol !== 'symbol') {
      return '';
    } else {
      return Symbol.keyFor(symbol) ?? '';
    }
  }
}
