import { Injectable } from '@angular/core';
import { filterNil } from '@dasch-ng/rxjs-operators';
import { Observable, Subject, finalize, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MutationObserverService {
  private readonly records = new Subject<Array<MutationRecord>>();
  private readonly observer: MutationObserver = new MutationObserver((record) => this.records.next(record));

  public observe(element: HTMLElement, options?: MutationObserverInit): Observable<MutationRecord> {
    const subject = new Subject<MutationRecord>();
    this.observer.observe(element, options);
    this.records
      .pipe(
        map((records) => records.find((entry) => entry.target === element)),
        filterNil(),
      )
      .subscribe(subject);
    return subject;
  }

  /**
   * TODO implement once unobserve is in the spec
   * @param element
   */
  public unobserve(element: HTMLElement) {
    // return this.observer.unobserve(element);
  }
}
