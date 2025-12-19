import { Directive, ElementRef, inject, Output } from '@angular/core';

import { MutationObserverService } from './mutation-observer.service';
import { outputFromObservable } from '@angular/core/rxjs-interop';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[observeMutation]',
  standalone: true,
})
export class ObserveMutationDirective {
  private readonly elementRef = inject(ElementRef);
  private readonly mutationObserverService = inject(MutationObserverService);

  public readonly records = outputFromObservable(this.mutationObserverService.observe(this.elementRef.nativeElement));
}
