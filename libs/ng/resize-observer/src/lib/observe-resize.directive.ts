import { Directive, ElementRef, Output, inject } from '@angular/core';

import { ResizeObserverService } from './resize-observer.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[observeResize]',
  standalone: true,
})
export class ObserveResizeDirective {
  private readonly elementRef = inject(ElementRef);
  private readonly resizeObserver = inject(ResizeObserverService);

  @Output() public readonly entries = this.resizeObserver.observe(this.elementRef.nativeElement);
}
