export type FileType = 'video' | 'image' | 'audio' | 'document' | 'spreadsheet' | 'archive';

/** File name extensions per {@link FileType}, matched case-insensitively at the end of the name. */
export const FILE_TYPE_PATTERNS: Readonly<Record<FileType, RegExp>> = {
  video: /\.(mov|mpe?g|avi|m4v|mp4|wmv|flv|3gp|webm|mkv|ogv|mxf)$/i,
  image: /\.(gif|jpe?g|tiff?|webp|png|heic|heif|avif|bmp|svg)$/i,
  audio: /\.(mp3|wav|m4a|oga|ogg|aac|flac|aiff?)$/i,
  document: /\.(docx?|odt|rtf|txt|md|pdf)$/i,
  spreadsheet: /\.(xlsx?|ods|csv|tsv)$/i,
  archive: /\.(zip|rar|7z|gz|tgz|bz2?|xz|tar)$/i,
};

/**
 * Classifies a file by the extension of its name (or a `File`), e.g. to pick an icon.
 * Returns `null` for unknown extensions. The extension says nothing about the content;
 * do not use it as a security check.
 *
 * @example
 * ```typescript
 * fileTypeOf('Interview_Take3.MOV'); // 'video'
 * fileTypeOf(input.files[0]);        // 'image'
 * fileTypeOf('notes');               // null
 * ```
 */
export function fileTypeOf(file: string | { name: string } | null | undefined): FileType | null {
  const name = typeof file === 'string' ? file : file?.name;
  if (!name) {
    return null;
  }
  for (const [type, pattern] of Object.entries(FILE_TYPE_PATTERNS) as Array<[FileType, RegExp]>) {
    if (pattern.test(name)) {
      return type;
    }
  }
  return null;
}
