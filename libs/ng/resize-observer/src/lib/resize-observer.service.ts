import { Injectable } from '@angular/core';
import { filterNil } from '@dasch-ng/rxjs-operators';
import { Observable, Subject, finalize, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResizeObserverService {
  private readonly entries = new Subject<Array<ResizeObserverEntry>>();
  private readonly observer: ResizeObserver = new ResizeObserver((entries) =>
    this.entries.next(entries)
  );

  public observe(
    element: HTMLElement,
    options?: ResizeObserverOptions
  ): Observable<ResizeObserverEntry> {
    const subject = new Subject<ResizeObserverEntry>();
    this.observer.observe(element, options);
    this.entries
      .pipe(
        map((entries) => entries.find((entry) => entry.target === element)),
        filterNil()
      )
      .subscribe(subject);
    return subject.pipe(finalize(() => this.observer.unobserve(element)));
  }

  public unobserve(element: HTMLElement) {
    return this.observer.unobserve(element);
  }
}
