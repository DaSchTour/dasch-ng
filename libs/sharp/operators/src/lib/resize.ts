import { OperatorFunction, map } from 'rxjs';
import { ResizeOptions, Sharp } from 'sharp';

export function resize(options: ResizeOptions): OperatorFunction<Sharp, Sharp> {
  return map((sharp) => sharp.resize(options));
}
