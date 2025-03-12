import { mergeMap, OperatorFunction } from 'rxjs';
import { Sharp } from 'sharp';

export function toBuffer(): OperatorFunction<Sharp, Buffer> {
  return mergeMap((sharp) => sharp.toBuffer());
}
