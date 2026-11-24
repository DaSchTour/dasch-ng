import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileSelectDirective } from './file-select.directive';

@Component({
  imports: [FileSelectDirective, ReactiveFormsModule],
  template: `
    <input id="single" type="file" fileSelect [formControl]="single" />
    <input id="multi" type="file" multiple fileSelect [formControl]="multi" />
  `,
})
class ReactiveHostComponent {
  single = new FormControl<File | null>(null);
  multi = new FormControl<File[]>([]);
}

@Component({
  imports: [FileSelectDirective, FormsModule],
  template: `<input type="file" fileSelect [(ngModel)]="value" />`,
})
class TemplateHostComponent {
  value: File | File[] | null = null;
}

function choose(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { value: Object.assign([...files], { item: (i: number) => files[i] }), configurable: true });
  input.dispatchEvent(new Event('change'));
}

describe('FileSelectDirective', () => {
  const a = new File(['a'], 'a.txt');
  const b = new File(['b'], 'b.txt');

  it('writes a single File or null (reactive forms)', () => {
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#single') as HTMLInputElement;
    choose(input, [a]);
    expect(fixture.componentInstance.single.value).toBe(a);
    choose(input, []);
    expect(fixture.componentInstance.single.value).toBeNull();
  });

  it('writes a File[] for a multiple input', () => {
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#multi') as HTMLInputElement;
    choose(input, [a, b]);
    expect(fixture.componentInstance.multi.value).toEqual([a, b]);
    choose(input, []);
    expect(fixture.componentInstance.multi.value).toEqual([]);
  });

  it('works with ngModel', async () => {
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    choose(input, [a]);
    expect(fixture.componentInstance.value).toBe(a);
  });

  it('resets the input on null and follows the disabled state', () => {
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#single') as HTMLInputElement;
    const setter = vi.spyOn(input, 'value', 'set');
    fixture.componentInstance.single.setValue(null);
    expect(setter).toHaveBeenCalledWith('');
    fixture.componentInstance.single.disable();
    expect(input.disabled).toBe(true);
    fixture.componentInstance.single.enable();
    expect(input.disabled).toBe(false);
  });

  it('marks the control as touched on blur', () => {
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('#single') as HTMLInputElement).dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.single.touched).toBe(true);
  });
});
