import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';

/**
 * Observes how much of an element is visible, as an RxJS stream.
 *
 * On the server there is no `IntersectionObserver`, so the streams complete without emitting.
 */
@Injectable({
  providedIn: 'root',
})
export class IntersectionObserverService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Emits an entry whenever the visibility of `element` changes. The browser reports the
   * current state right after subscribing, so the first entry is the initial state.
   * Each subscription uses its own observer (the options belong to the observer) and
   * disconnects it on unsubscribe.
   *
   * @param element Element to observe.
   * @param options `root`, `rootMargin` and `threshold`, as for the native `IntersectionObserver`.
   */
  public observe(element: Element, options?: IntersectionObserverInit): Observable<IntersectionObserverEntry> {
    if (!this.isBrowser) {
      return EMPTY;
    }
    return new Observable<IntersectionObserverEntry>((subscriber) => {
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => subscriber.next(entry)), options);
      observer.observe(element);
      return () => observer.disconnect();
    });
  }
}
