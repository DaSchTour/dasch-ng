import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { jsonValidator } from './json/json.validator';
import { floatValidator, integerValidator } from './number/integer-float.validator';
import { notBlankValidator } from './not-blank/not-blank.validator';
import { uniqueValidator, UniqueValidatorDirective } from './unique/unique.validator';

const check = (validator: (c: FormControl) => unknown, value: unknown) => validator(new FormControl(value));

describe('jsonValidator', () => {
  it('passes valid JSON and empty values', () => {
    expect(check(jsonValidator, '{"a":[1,2]}')).toBeNull();
    expect(check(jsonValidator, '42')).toBeNull();
    expect(check(jsonValidator, '')).toBeNull();
    expect(check(jsonValidator, '  ')).toBeNull();
    expect(check(jsonValidator, null)).toBeNull();
  });

  it('reports the parser message for invalid JSON', () => {
    const result = check(jsonValidator, '{a:1}') as { invalidJson: { message: string } };
    expect(result.invalidJson.message).toEqual(expect.any(String));
    expect(result.invalidJson.message.length).toBeGreaterThan(0);
  });
});

describe('integerValidator', () => {
  it.each([0, 42, -7, '12', ' 3 ', null, ''])('passes %j', (value) => {
    expect(check(integerValidator, value)).toBeNull();
  });

  it.each([1.5, '1.5', 'abc', '12px', Number.NaN])('fails %j', (value) => {
    expect(check(integerValidator, value)).toEqual({ invalidInteger: true });
  });
});

describe('floatValidator', () => {
  it.each([0, 1.5, '-2.25', '1e3', null, ''])('passes %j', (value) => {
    expect(check(floatValidator, value)).toBeNull();
  });

  it.each(['abc', '1,5', Number.POSITIVE_INFINITY, Number.NaN])('fails %j', (value) => {
    expect(check(floatValidator, value)).toEqual({ invalidFloat: true });
  });
});

describe('notBlankValidator', () => {
  it('fails empty and whitespace-only strings', () => {
    expect(check(notBlankValidator, '')).toEqual({ blank: true });
    expect(check(notBlankValidator, ' \t\n')).toEqual({ blank: true });
  });

  it('passes text and non-string values', () => {
    expect(check(notBlankValidator, ' a ')).toBeNull();
    expect(check(notBlankValidator, null)).toBeNull();
    expect(check(notBlankValidator, 0)).toBeNull();
  });
});

describe('uniqueValidator', () => {
  it('fails values already in the list', () => {
    expect(check(uniqueValidator(['Alpha', 'Beta']), 'Alpha')).toEqual({ notUnique: true });
    expect(check(uniqueValidator([1, 2]), 2)).toEqual({ notUnique: true });
  });

  it('compares case-sensitively by default', () => {
    expect(check(uniqueValidator(['Alpha']), 'alpha')).toBeNull();
    expect(check(uniqueValidator(['Alpha'], { caseInsensitive: true }), 'ALPHA')).toEqual({ notUnique: true });
  });

  it('passes empty values', () => {
    expect(check(uniqueValidator(['']), '')).toBeNull();
    expect(check(uniqueValidator([null]), null)).toBeNull();
  });
});

describe('UniqueValidatorDirective', () => {
  @Component({
    imports: [FormsModule, UniqueValidatorDirective],
    template: `<input name="n" [(ngModel)]="name" [validateUnique]="existing()" caseInsensitive />`,
  })
  class HostComponent {
    name = 'beta';
    readonly existing = signal(['Alpha']);
  }

  it('re-validates when the list changes', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const model = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);

    expect(model.valid).toBe(true);

    fixture.componentInstance.existing.set(['Alpha', 'BETA']);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(model.errors).toEqual({ notUnique: true });
  });
});
