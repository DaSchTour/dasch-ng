import { InjectionToken } from '@angular/core';
import { provideClass, provideExisting, provideFactory, provideType, provideValue } from './provide-helpers';

describe('Provide Helpers', () => {
  describe('provideValue', () => {
    it('should create a value provider', () => {
      const token = new InjectionToken<string>('TEST');
      const provider = provideValue(token, 'test value');

      expect(provider.provide).toBe(token);
      expect(provider.useValue).toBe('test value');
    });

    it('should include multi flag when provided', () => {
      const token = new InjectionToken<string>('TEST');
      const provider = provideValue(token, 'test value', true);

      expect(provider).toEqual({
        provide: token,
        useValue: 'test value',
        multi: true,
      });
    });

    it('should include multi flag when false', () => {
      const token = new InjectionToken<string>('TEST');
      const provider = provideValue(token, 'test value', false);

      expect(provider.provide).toBe(token);
      expect(provider.useValue).toBe('test value');
      expect(provider.multi).toBe(false);
    });

    it('should work with class tokens', () => {
      class TestClass {}
      const instance = new TestClass();
      const provider = provideValue(TestClass, instance);

      expect(provider.provide).toBe(TestClass);
      expect(provider.useValue).toBe(instance);
    });
  });

  describe('provideFactory', () => {
    it('should create a factory provider', () => {
      const token = new InjectionToken<string>('TEST');
      const factory = () => 'test value';
      const provider = provideFactory(token, factory);

      expect(provider.provide).toBe(token);
      expect(provider.useFactory).toBe(factory);
    });

    it('should include deps when provided', () => {
      const token = new InjectionToken<string>('TEST');
      const depToken = new InjectionToken<number>('DEP');
      const factory = (dep: number) => `value: ${dep}`;
      const provider = provideFactory(token, factory, { deps: [depToken] });

      expect(provider).toEqual({
        provide: token,
        useFactory: factory,
        deps: [depToken],
        multi: undefined,
      });
    });

    it('should include multi flag when provided', () => {
      const token = new InjectionToken<string>('TEST');
      const factory = () => 'test value';
      const provider = provideFactory(token, factory, { multi: true });

      expect(provider.provide).toBe(token);
      expect(provider.useFactory).toBe(factory);
      expect(provider.multi).toBe(true);
    });

    it('should include both deps and multi when provided', () => {
      const token = new InjectionToken<string>('TEST');
      const depToken = new InjectionToken<number>('DEP');
      const factory = (dep: number) => `value: ${dep}`;
      const provider = provideFactory(token, factory, { deps: [depToken], multi: true });

      expect(provider).toEqual({
        provide: token,
        useFactory: factory,
        deps: [depToken],
        multi: true,
      });
    });

    it('should work without options', () => {
      const token = new InjectionToken<string>('TEST');
      const factory = () => 'test value';
      const provider = provideFactory(token, factory, {});

      expect(provider.provide).toBe(token);
      expect(provider.useFactory).toBe(factory);
    });
  });

  describe('provideClass', () => {
    it('should create a class provider', () => {
      interface TestInterface {
        test(): string;
      }
      const token = new InjectionToken<TestInterface>('TEST');
      class TestClass implements TestInterface {
        test() {
          return 'test';
        }
      }

      const provider = provideClass(token, TestClass);

      expect(provider.provide).toBe(token);
      expect(provider.useClass).toBe(TestClass);
      expect(provider.deps).toEqual([]);
    });

    it('should include deps when provided', () => {
      class DependencyClass {}
      interface TestInterface {
        test(): string;
      }
      const token = new InjectionToken<TestInterface>('TEST');
      class TestClass implements TestInterface {
        constructor(private dep: DependencyClass) {}
        test() {
          return 'test';
        }
      }

      const provider = provideClass(token, TestClass, [DependencyClass]);

      expect(provider).toEqual({
        provide: token,
        useClass: TestClass,
        deps: [DependencyClass],
        multi: undefined,
      });
    });

    it('should include multi flag when provided', () => {
      interface TestInterface {
        test(): string;
      }
      const token = new InjectionToken<TestInterface>('TEST');
      class TestClass implements TestInterface {
        test() {
          return 'test';
        }
      }

      const provider = provideClass(token, TestClass, [], true);

      expect(provider).toEqual({
        provide: token,
        useClass: TestClass,
        deps: [],
        multi: true,
      });
    });

    it('should work with class tokens', () => {
      class BaseClass {
        test() {
          return 'base';
        }
      }
      class ExtendedClass extends BaseClass {
        test() {
          return 'extended';
        }
      }

      const provider = provideClass(BaseClass, ExtendedClass);

      expect(provider.provide).toBe(BaseClass);
      expect(provider.useClass).toBe(ExtendedClass);
      expect(provider.deps).toEqual([]);
    });
  });

  describe('provideExisting', () => {
    it('should create an existing provider', () => {
      interface TestInterface {
        test(): string;
      }
      const token1 = new InjectionToken<TestInterface>('TEST1');
      const token2 = new InjectionToken<TestInterface>('TEST2');

      const provider = provideExisting(token1, token2);

      expect(provider.provide).toBe(token1);
      expect(provider.useExisting).toBe(token2);
    });

    it('should include multi flag when provided', () => {
      interface TestInterface {
        test(): string;
      }
      const token1 = new InjectionToken<TestInterface>('TEST1');
      const token2 = new InjectionToken<TestInterface>('TEST2');

      const provider = provideExisting(token1, token2, true);

      expect(provider).toEqual({
        provide: token1,
        useExisting: token2,
        multi: true,
      });
    });

    it('should work with class tokens', () => {
      class ServiceClass {
        test() {
          return 'test';
        }
      }
      interface ServiceInterface {
        test(): string;
      }
      const token = new InjectionToken<ServiceInterface>('SERVICE');

      const provider = provideExisting(token, ServiceClass);

      expect(provider.provide).toBe(token);
      expect(provider.useExisting).toBe(ServiceClass);
    });

    it('should create alias between two class tokens', () => {
      class BaseClass {
        test() {
          return 'base';
        }
      }
      class AliasClass extends BaseClass {}

      const provider = provideExisting(AliasClass, BaseClass);

      expect(provider.provide).toBe(AliasClass);
      expect(provider.useExisting).toBe(BaseClass);
    });
  });

  describe('provideType', () => {
    it('should create a constructor provider', () => {
      class TestClass {
        test() {
          return 'test';
        }
      }

      const provider = provideType(TestClass);

      expect(provider.provide).toBe(TestClass);
    });

    it('should include deps when provided', () => {
      class DependencyClass {}
      class TestClass {
        constructor(private dep: DependencyClass) {}
        test() {
          return 'test';
        }
      }

      const provider = provideType(TestClass, { deps: [DependencyClass] });

      expect(provider).toEqual({
        provide: TestClass,
        deps: [DependencyClass],
        multi: undefined,
      });
    });

    it('should include multi flag when provided', () => {
      class TestClass {
        test() {
          return 'test';
        }
      }

      const provider = provideType(TestClass, { multi: true });

      expect(provider.provide).toBe(TestClass);
      expect(provider.multi).toBe(true);
    });

    it('should include both deps and multi when provided', () => {
      class DependencyClass {}
      class TestClass {
        constructor(private dep: DependencyClass) {}
        test() {
          return 'test';
        }
      }

      const provider = provideType(TestClass, { deps: [DependencyClass], multi: true });

      expect(provider).toEqual({
        provide: TestClass,
        deps: [DependencyClass],
        multi: true,
      });
    });
  });
});
