import { InjectionToken, Injector, Optional } from '@angular/core';
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

    it('should accept class tokens and DI flag arrays as deps', () => {
      class Dependency {
        value = 42;
      }
      const token = new InjectionToken<string>('TEST');
      const optionalToken = new InjectionToken<string>('OPTIONAL');
      const factory = (dep: Dependency, optional: string | null) => `${dep.value} ${optional}`;
      const optionalDep = [new Optional(), optionalToken];
      const provider = provideFactory(token, factory, { deps: [Dependency, optionalDep] });

      expect(provider.deps).toEqual([Dependency, optionalDep]);
    });

    it('should reject class deps whose instance type does not match the factory parameter', () => {
      class Unrelated {
        name = 'unrelated';
      }
      const token = new InjectionToken<string>('TEST');
      const factory = (dep: number) => `value: ${dep}`;

      // @ts-expect-error Unrelated does not provide the number the factory expects
      const provider = provideFactory(token, factory, { deps: [Unrelated] });

      expect(provider.deps).toEqual([Unrelated]);
    });

    it('should reject more deps than the factory has parameters', () => {
      const token = new InjectionToken<string>('TEST');
      const depToken = new InjectionToken<number>('DEP');
      const factory = () => 'test value';

      // @ts-expect-error the factory takes no parameters
      const provider = provideFactory(token, factory, { deps: [depToken] });

      expect(provider.deps).toEqual([depToken]);
    });

    it('should resolve deps through the injector', () => {
      const token = new InjectionToken<string>('TEST');
      const depToken = new InjectionToken<number>('DEP');
      const injector = Injector.create({
        providers: [provideValue(depToken, 21), provideFactory(token, (dep: number) => `value: ${dep * 2}`, { deps: [depToken] })],
      });

      expect(injector.get(token)).toBe('value: 42');
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
        override test() {
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
