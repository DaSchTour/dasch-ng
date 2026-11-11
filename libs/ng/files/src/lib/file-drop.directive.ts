import { Directive, ElementRef, inject, input, output, signal } from '@angular/core';

/**
 * Turns an element into a drop zone for files. Sets `data-drag-over` while files are dragged
 * over it and emits the dropped files.
 *
 * `accept` uses the syntax of the `accept` attribute of file inputs: a comma separated list
 * of extensions (`.png`), MIME types (`image/png`) and wildcards (`image/*`). Files that do not
 * match are dropped from the emitted array. Style the zone with `[data-drag-over]`.
 *
 * @example
 * ```html
 * <div fileDrop accept="image/*,.pdf" (filesDropped)="upload($event)">Drop files here</div>
 * ```
 */
@Directive({
  selector: '[fileDrop]',
  exportAs: 'fileDrop',
  host: {
    '[attr.data-drag-over]': 'dragOver() ? "" : null',
    '(dragenter)': 'onDrag($event)',
    '(dragover)': 'onDrag($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
  },
})
export class FileDropDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Accepted file types, same syntax as the `accept` attribute. Empty accepts everything. */
  readonly accept = input<string>('');
  /** Emits the dropped files that match `accept`. Not emitted when none match. */
  readonly filesDropped = output<File[]>();

  private readonly _dragOver = signal(false);
  /** `true` while files are dragged over the element. */
  readonly dragOver = this._dragOver.asReadonly();

  protected onDrag(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) {
      return;
    }
    event.preventDefault(); // required, otherwise the browser refuses the drop
    this._dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    // Leaving into a child element is not leaving the zone.
    if (!this.element.contains(event.relatedTarget as Node | null)) {
      this._dragOver.set(false);
    }
  }

  protected onDrop(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) {
      return;
    }
    event.preventDefault();
    this._dragOver.set(false);
    const files = Array.from(event.dataTransfer.files).filter((file) => matchesAccept(file, this.accept()));
    if (files.length) {
      this.filesDropped.emit(files);
    }
  }
}

/** Checks a file against an `accept` attribute value. */
function matchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) {
    return true;
  }
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => (rule.startsWith('.') ? name.endsWith(rule) : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1)) : type === rule));
}
