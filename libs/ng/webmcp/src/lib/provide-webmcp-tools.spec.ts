import { EnvironmentInjector, PLATFORM_ID, createEnvironmentInjector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideWebMcpTools } from './provide-webmcp-tools';
import { toolError, toolResult } from './tool-result';
import { WebMcpTool } from './webmcp.types';

const tool = (name: string): WebMcpTool => ({
  name,
  description: `Tool ${name}`,
  execute: async () => toolResult({ ok: true }),
});

const remove = (target: object) => delete (target as Record<string, unknown>)['modelContext'];

describe('provideWebMcpTools', () => {
  let registerTool: ReturnType<typeof vi.fn>;
  let signals: Record<string, AbortSignal>;

  beforeEach(() => {
    signals = {};
    registerTool = vi.fn((t: WebMcpTool, o?: { signal?: AbortSignal }) => {
      signals[t.name] = o!.signal!;
      return Promise.resolve();
    });
    Object.defineProperty(document, 'modelContext', {
      value: { registerTool },
      configurable: true,
    });
  });

  afterEach(() => {
    remove(document);
    remove(navigator);
    TestBed.resetTestingModule();
  });

  function setup(...providers: ReturnType<typeof provideWebMcpTools>[]) {
    TestBed.configureTestingModule({ providers });
    return TestBed.inject(EnvironmentInjector);
  }

  it('registers tools with an abort signal', () => {
    setup(provideWebMcpTools(() => [tool('a'), tool('b')]));
    expect(registerTool).toHaveBeenCalledTimes(2);
    expect(registerTool.mock.calls[0][0].name).toBe('a');
    expect(signals['a'].aborted).toBe(false);
  });

  it('runs the factory in an injection context', () => {
    let injected: unknown;
    setup(
      provideWebMcpTools(() => {
        injected = inject(PLATFORM_ID);
        return [];
      }),
    );
    expect(injected).toBeDefined();
  });

  it('supports several providers', () => {
    setup(
      provideWebMcpTools(() => [tool('a')]),
      provideWebMcpTools(() => [tool('b')]),
    );
    expect(registerTool).toHaveBeenCalledTimes(2);
  });

  it('aborts the signal on destroy and frees the names', () => {
    const parent = setup();
    const child = createEnvironmentInjector([provideWebMcpTools(() => [tool('a')])], parent);
    child.destroy();
    expect(signals['a'].aborted).toBe(true);
    createEnvironmentInjector([provideWebMcpTools(() => [tool('a')])], parent);
    expect(registerTool).toHaveBeenCalledTimes(2);
  });

  it('skips duplicate names with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    setup(
      provideWebMcpTools(() => [tool('a'), tool('a')]),
      provideWebMcpTools(() => [tool('a')]),
    );
    expect(registerTool).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('survives a rejected registration and allows a retry', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    registerTool.mockReturnValueOnce(Promise.reject(new Error('invalid')));
    const parent = setup(provideWebMcpTools(() => [tool('a')]));
    await Promise.resolve();
    await Promise.resolve();
    expect(warn).toHaveBeenCalledTimes(1);
    createEnvironmentInjector([provideWebMcpTools(() => [tool('a')])], parent);
    expect(registerTool).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('survives a synchronous throw from registerTool', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    registerTool.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    expect(() => setup(provideWebMcpTools(() => [tool('a')]))).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('falls back to navigator.modelContext', () => {
    remove(document);
    Object.defineProperty(navigator, 'modelContext', {
      value: { registerTool },
      configurable: true,
    });
    setup(provideWebMcpTools(() => [tool('a')]));
    expect(registerTool).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the API is missing', () => {
    remove(document);
    const factory = vi.fn(() => [tool('a')]);
    expect(() => setup(provideWebMcpTools(factory))).not.toThrow();
    expect(factory).not.toHaveBeenCalled();
  });

  it('does nothing on the server', () => {
    setup(
      { provide: PLATFORM_ID, useValue: 'server' } as never,
      provideWebMcpTools(() => [tool('a')]),
    );
    expect(registerTool).not.toHaveBeenCalled();
  });
});

describe('tool results', () => {
  it('toolResult returns the data unchanged', () => {
    const data = { a: 1 };
    expect(toolResult(data)).toBe(data);
  });

  it('toolError creates an Error with the message', () => {
    expect(toolError('nope')).toEqual(new Error('nope'));
  });
});
