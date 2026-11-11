import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KeyboardShortcuts } from './keyboard-shortcuts.service';
import { ShortcutPipe } from './shortcut.pipe';

function press(init: KeyboardEventInit, target: EventTarget = document.body): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

describe('KeyboardShortcuts', () => {
  let service: KeyboardShortcuts;

  beforeEach(() => {
    vi.stubGlobal('navigator', { platform: 'Linux x86_64' });
    service = TestBed.inject(KeyboardShortcuts);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('runs the action and prevents the default', () => {
    const action = vi.fn();
    service.register({ key: 'k', meta: true, action });
    const event = press({ key: 'k', ctrlKey: true });
    expect(action).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it('matches case-insensitively', () => {
    const action = vi.fn();
    service.register({ key: 'k', action });
    press({ key: 'K' });
    expect(action).toHaveBeenCalledOnce();
  });

  it('requires exact modifiers', () => {
    const action = vi.fn();
    service.register({ key: 'k', meta: true, action });
    press({ key: 'k' });
    press({ key: 'k', ctrlKey: true, shiftKey: true });
    press({ key: 'k', ctrlKey: true, altKey: true });
    press({ key: 'k', ctrlKey: true, metaKey: true });
    expect(action).not.toHaveBeenCalled();
  });

  it('maps meta to Cmd on macOS', () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel' });
    const action = vi.fn();
    service.register({ key: 'k', meta: true, action });
    press({ key: 'k', ctrlKey: true });
    expect(action).not.toHaveBeenCalled();
    press({ key: 'k', metaKey: true });
    expect(action).toHaveBeenCalledOnce();
  });

  it('matches letters via event.code when Alt changes event.key', () => {
    const action = vi.fn();
    service.register({ key: 'k', alt: true, action });
    press({ key: '˚', code: 'KeyK', altKey: true });
    expect(action).toHaveBeenCalledOnce();
  });

  it('stops after unregister and removes the document listener', () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const action = vi.fn();
    const unregister = service.register({ key: 'k', action });
    unregister();
    unregister();
    press({ key: 'k' });
    expect(action).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalledTimes(1);
    remove.mockRestore();
  });

  it('uses one document listener for all shortcuts', () => {
    const add = vi.spyOn(document, 'addEventListener');
    service.register({ key: 'a', action: vi.fn() });
    service.register({ key: 'b', action: vi.fn() });
    expect(add.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
    add.mockRestore();
  });

  describe('editable targets', () => {
    let input: HTMLInputElement;
    let editable: HTMLDivElement;

    beforeEach(() => {
      input = document.body.appendChild(document.createElement('input'));
      editable = document.body.appendChild(document.createElement('div'));
      editable.setAttribute('contenteditable', 'true');
      editable.appendChild(document.createElement('span'));
    });

    afterEach(() => {
      input.remove();
      editable.remove();
    });

    it('ignores events from inputs, textareas, selects and contenteditable', () => {
      const action = vi.fn();
      service.register({ key: 'k', action });
      const textarea = document.createElement('textarea');
      const select = document.createElement('select');
      document.body.append(textarea, select);
      [input, textarea, select, editable.firstElementChild as HTMLElement].forEach((target) => press({ key: 'k' }, target));
      textarea.remove();
      select.remove();
      expect(action).not.toHaveBeenCalled();
    });

    it('fires in inputs with allowInInputs', () => {
      const action = vi.fn();
      service.register({ key: 'k', allowInInputs: true, action });
      press({ key: 'k' }, input);
      expect(action).toHaveBeenCalledOnce();
    });

    it('treats contenteditable="false" as not editable', () => {
      editable.setAttribute('contenteditable', 'false');
      const action = vi.fn();
      service.register({ key: 'k', action });
      press({ key: 'k' }, editable);
      expect(action).toHaveBeenCalledOnce();
    });
  });

  it('lists registered shortcuts and updates on unregister', () => {
    const unregister = service.register({ key: 'k', meta: true, label: 'Search', action: vi.fn() });
    expect(service.shortcuts().map((s) => s.label)).toEqual(['Search']);
    unregister();
    expect(service.shortcuts()).toEqual([]);
  });

  it('cleans up automatically when registered in an injection context', () => {
    const action = vi.fn();
    // eslint-disable-next-line @angular-eslint/component-selector
    @Component({ selector: 'test-host', template: '' })
    class Host {
      constructor() {
        service.register({ key: 'k', action });
      }
    }
    const fixture = TestBed.createComponent(Host);
    press({ key: 'k' });
    expect(action).toHaveBeenCalledOnce();
    fixture.destroy();
    press({ key: 'k' });
    expect(action).toHaveBeenCalledOnce();
    expect(service.shortcuts()).toEqual([]);
  });
});

describe('KeyboardShortcuts on the server', () => {
  it('registers nothing', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const service = TestBed.inject(KeyboardShortcuts);
    const action = vi.fn();
    service.register({ key: 'k', action })();
    press({ key: 'k' });
    expect(action).not.toHaveBeenCalled();
    expect(service.shortcuts()).toEqual([]);
  });
});

describe('ShortcutPipe', () => {
  it('formats for the given platform', () => {
    expect(new ShortcutPipe().transform({ key: 'k', meta: true }, { platform: 'mac' })).toBe('⌘K');
  });
});
