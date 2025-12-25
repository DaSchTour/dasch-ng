import type { ConstructorProvider, ExistingProvider, FactoryProvider, InjectionToken, StaticClassProvider, Type, ValueProvider } from '@angular/core';

/**
 * Creates a type-safe value provider for Angular dependency injection.
 *
 * This helper ensures that the `useValue` matches the type of the injection token,
 * preventing common type mismatches that can occur with plain provider objects.
 *
 * @template T - The type of the value to provide
 * @param provide - The injection token or class to provide for
 * @param useValue - The value to inject (must match type T)
 * @param multi - Optional flag to enable multi-provider (allows multiple values for the same token)
 * @returns A type-safe ValueProvider object
 *
 * @example
 * ```typescript
 * import { InjectionToken } from '@angular/core';
 * import { provideValue } from '@dasch-ng/utils';
 *
 * const API_URL = new InjectionToken<string>('API_URL');
 *
 * // Type-safe: value must be a string
 * provideValue(API_URL, 'https://api.example.com');
 *
 * // Type error: number is not assignable to string
 * // provideValue(API_URL, 123);
 * ```
 *
 * @see {@link https://angular.dev/guide/di/dependency-injection-providers}
 */
export function provideValue<T>(provide: InjectionToken<T> | Type<T>, useValue: T, multi?: boolean): ValueProvider {
  return { provide, useValue, multi };
}

/**
 * Creates a type-safe factory provider for Angular dependency injection.
 *
 * This helper ensures that the factory function returns the correct type and that
 * dependencies are properly declared, providing better type safety than plain provider objects.
 *
 * @template T - The type that the factory function produces
 * @template U - Tuple type of the factory function parameters (inferred from deps)
 * @param provide - The injection token or class to provide for
 * @param useFactory - Factory function that creates the value (return type must match T)
 * @param options - Configuration object
 * @param options.deps - Optional array of dependencies to inject into the factory function
 * @param options.multi - Optional flag to enable multi-provider
 * @returns A type-safe FactoryProvider object
 *
 * @example
 * ```typescript
 * import { InjectionToken } from '@angular/core';
 * import { HttpClient } from '@angular/common/http';
 * import { provideFactory } from '@dasch-ng/utils';
 *
 * interface ApiService {
 *   get(url: string): Observable<any>;
 * }
 *
 * const API_SERVICE = new InjectionToken<ApiService>('API_SERVICE');
 *
 * // Type-safe: factory must return ApiService
 * provideFactory(
 *   API_SERVICE,
 *   (http: HttpClient) => ({
 *     get: (url: string) => http.get(url)
 *   }),
 *   { deps: [HttpClient] }
 * );
 * ```
 *
 * @see {@link https://angular.dev/guide/di/dependency-injection-providers}
 */
export function provideFactory<T, U extends Array<any> = []>(
  provide: InjectionToken<T> | Type<T>,
  useFactory: (...args: U) => T,
  { deps, multi }: { deps?: U; multi?: boolean } = {},
): FactoryProvider {
  return { provide, useFactory, deps, multi };
}

/**
 * Creates a type-safe class provider for Angular dependency injection.
 *
 * This helper ensures that the provided class is compatible with the injection token type,
 * preventing type mismatches at compile time rather than runtime.
 *
 * @template T - The type of the injection token
 * @param provide - The injection token or class to provide for
 * @param useClass - The class to instantiate (must be compatible with type T)
 * @param deps - Optional array of dependencies to inject into the class constructor
 * @param multi - Optional flag to enable multi-provider
 * @returns A type-safe StaticClassProvider object
 *
 * @example
 * ```typescript
 * import { Injectable, InjectionToken } from '@angular/core';
 * import { provideClass } from '@dasch-ng/utils';
 *
 * interface Logger {
 *   log(message: string): void;
 * }
 *
 * const LOGGER = new InjectionToken<Logger>('LOGGER');
 *
 * @Injectable()
 * class ConsoleLogger implements Logger {
 *   log(message: string): void {
 *     console.log(message);
 *   }
 * }
 *
 * // Type-safe: ConsoleLogger implements Logger
 * provideClass(LOGGER, ConsoleLogger);
 *
 * // With dependencies
 * provideClass(LOGGER, ConsoleLogger, [SomeDependency]);
 *
 * // Type error: String does not implement Logger
 * // provideClass(LOGGER, String);
 * ```
 *
 * @see {@link https://angular.dev/guide/di/dependency-injection-providers}
 */
export function provideClass<T>(provide: InjectionToken<T> | Type<T>, useClass: Type<T>, deps: any[] = [], multi?: boolean): StaticClassProvider {
  return { provide, useClass, deps, multi };
}

/**
 * Creates a type-safe existing provider (alias) for Angular dependency injection.
 *
 * This helper creates an alias to an existing token, ensuring type compatibility
 * between the original and alias tokens. Useful for providing the same instance
 * under multiple tokens or creating aliases for better API design.
 *
 * @template T - The type of the injection token
 * @param provide - The new injection token to create
 * @param useExisting - The existing token to alias (must be compatible with type T)
 * @param multi - Optional flag to enable multi-provider
 * @returns A type-safe ExistingProvider object
 *
 * @example
 * ```typescript
 * import { Injectable, InjectionToken } from '@angular/core';
 * import { provideExisting } from '@dasch-ng/utils';
 *
 * interface Logger {
 *   log(message: string): void;
 * }
 *
 * const LOGGER = new InjectionToken<Logger>('LOGGER');
 * const CONSOLE_LOGGER = new InjectionToken<Logger>('CONSOLE_LOGGER');
 *
 * @Injectable()
 * class ConsoleLogger implements Logger {
 *   log(message: string): void {
 *     console.log(message);
 *   }
 * }
 *
 * // Provide both the original and an alias pointing to the same instance
 * const providers = [
 *   ConsoleLogger,
 *   provideExisting(LOGGER, ConsoleLogger),
 *   provideExisting(CONSOLE_LOGGER, LOGGER)
 * ];
 * ```
 *
 * @see {@link https://angular.dev/guide/di/dependency-injection-providers}
 */
export function provideExisting<T>(provide: InjectionToken<T> | Type<T>, useExisting: InjectionToken<T> | Type<T>, multi?: boolean): ExistingProvider {
  return {
    provide,
    useExisting,
    multi,
  };
}

/**
 * Creates a type-safe constructor provider for Angular dependency injection.
 *
 * This is a simplified provider for cases where the token and implementation class
 * are the same. It's equivalent to providing a class directly but allows explicit
 * dependency configuration when needed.
 *
 * @template T - The class type to provide
 * @param provide - The class to provide (used as both token and implementation)
 * @param options - Configuration object
 * @param options.deps - Optional array of dependencies to inject into the class constructor
 * @param options.multi - Optional flag to enable multi-provider
 * @returns A type-safe ConstructorProvider object
 *
 * @example
 * ```typescript
 * import { Injectable } from '@angular/core';
 * import { HttpClient } from '@angular/common/http';
 * import { provideType } from '@dasch-ng/utils';
 *
 * @Injectable()
 * class UserService {
 *   constructor(private http: HttpClient) {}
 * }
 *
 * // Explicit dependency declaration (useful for custom injection scenarios)
 * provideType(UserService, { deps: [HttpClient] });
 *
 * // Equivalent to just providing the class directly:
 * // { provide: UserService }
 * ```
 *
 * @see {@link https://angular.dev/guide/di/dependency-injection-providers}
 */
export function provideType<T>(provide: Type<T>, { deps, multi }: { deps?: any[]; multi?: boolean } = {}): ConstructorProvider {
  return { provide, deps, multi };
}
