import { OperatorFunction, map } from 'rxjs';
import {
  AvailableFormatInfo,
  AvifOptions,
  FormatEnum,
  GifOptions,
  HeifOptions,
  JpegOptions,
  OutputOptions,
  PngOptions,
  Sharp,
  TiffOptions,
  WebpOptions,
} from 'sharp';

export function format(
  f: keyof FormatEnum | AvailableFormatInfo,
  options?: OutputOptions | JpegOptions | PngOptions | WebpOptions | AvifOptions | HeifOptions | GifOptions | TiffOptions,
): OperatorFunction<Sharp, Sharp> {
  return map((sharp) => sharp.toFormat(f, options));
}
