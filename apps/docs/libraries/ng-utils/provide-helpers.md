# Dependency Injection Helpers

Type-safe provider functions for Angular dependency injection. These helpers ensure compile-time type safety when configuring Angular providers.

[← Back to NG Utils overview](/libraries/ng-utils)

## Installation

```bash
npm install @dasch-ng/utils
```

or with bun:

```bash
bun add @dasch-ng/utils
```

## Why Type-Safe Providers?

Angular's dependency injection system is powerful but can be error-prone when creating providers manually. These helper functions provide:

### Compile-Time Type Safety

Catch type mismatches at compile time instead of runtime:

```typescript
const API_URL = new InjectionToken<string>('API_URL');

// ✅ Type-safe: compiler ensures value is a string
provideValue(API_URL, 'https://api.example.com');

// ❌ Type error: number is not assignable to string
// provideValue(API_URL, 123);
```

### Better IDE Support

Get autocomplete and inline documentation:

```typescript
// IDE shows parameter types and suggestions
provideFactory(MY_SERVICE, (http: HttpClient) => new MyService(http), { deps: [HttpClient] });
```

### Cleaner Code

Reduce boilerplate and improve readability:

```typescript
// Before: verbose and error-prone
{
  provide: LOGGER,
  useClass: ConsoleLogger,
  deps: []
}

// After: concise and type-safe
provideClass(LOGGER, ConsoleLogger)
```

### Prevent Common Mistakes

- Missing dependencies in factory functions
- Type mismatches between token and value
- Incorrect multi-provider configuration
- Wrong provider type for the use case

## Provider Functions

### provideValue

Creates a type-safe value provider for dependency injection.

**Signature:**

```typescript
function provideValue<T>(provide: InjectionToken<T> | Type<T>, useValue: T, multi?: boolean): ValueProvider;
```

**Use Cases:**

- Configuration values (API URLs, feature flags)
- Constants
- Pre-computed values

**Examples:**

```typescript
import { InjectionToken } from '@angular/core';
import { provideValue } from '@dasch-ng/utils';

// Configuration token
const API_URL = new InjectionToken<string>('API_URL');

// Single value provider
provideValue(API_URL, 'https://api.example.com');

// Multi-provider (allows multiple values for same token)
const FEATURE_FLAGS = new InjectionToken<string>('FEATURE_FLAGS');
provideValue(FEATURE_FLAGS, 'dark-mode', true);
provideValue(FEATURE_FLAGS, 'beta-features', true);
```

**With Classes:**

```typescript
class Config {
  apiUrl = 'https://api.example.com';
}

const config = new Config();
provideValue(Config, config);
```

---

### provideFactory

Creates a type-safe factory provider for dependency injection.

**Signature:**

```typescript
function provideFactory<T, U extends Array<any> = []>(
  provide: InjectionToken<T> | Type<T>,
  useFactory: (...args: U) => T,
  options?: { deps?: U; multi?: boolean },
): FactoryProvider;
```

**Use Cases:**

- Dynamic value creation
- Services that require initialization logic
- Complex object construction
- Conditional provider logic

**Examples:**

```typescript
import { InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { provideFactory } from '@dasch-ng/utils';

interface ApiService {
  get(url: string): Observable<any>;
}

const API_SERVICE = new InjectionToken<ApiService>('API_SERVICE');

// Factory with dependencies
provideFactory(
  API_SERVICE,
  (http: HttpClient) => ({
    get: (url: string) => http.get(url),
  }),
  { deps: [HttpClient] },
);

// Factory without dependencies
const TIMESTAMP = new InjectionToken<number>('TIMESTAMP');
provideFactory(TIMESTAMP, () => Date.now());

// Multi-provider factory
const PLUGINS = new InjectionToken<Plugin>('PLUGINS');
provideFactory(PLUGINS, () => new AnalyticsPlugin(), { multi: true });
```

**Environment-Based Configuration:**

```typescript
const CONFIG = new InjectionToken<AppConfig>('CONFIG');

provideFactory(
  CONFIG,
  (env: Environment) => ({
    apiUrl: env.production ? 'https://api.prod.com' : 'https://api.dev.com',
    debug: !env.production,
  }),
  { deps: [ENVIRONMENT] },
);
```

---

### provideClass

Creates a type-safe class provider for dependency injection.

**Signature:**

```typescript
function provideClass<T>(provide: InjectionToken<T> | Type<T>, useClass: Type<T>, deps?: any[], multi?: boolean): StaticClassProvider;
```

**Use Cases:**

- Implementing interfaces with concrete classes
- Swapping implementations (e.g., mock vs real)
- Providing alternative implementations

**Examples:**

```typescript
import { Injectable, InjectionToken } from '@angular/core';
import { provideClass } from '@dasch-ng/utils';

// Define interface
interface Logger {
  log(message: string): void;
}

const LOGGER = new InjectionToken<Logger>('LOGGER');

// Implement interface
@Injectable()
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}

// Provide implementation
provideClass(LOGGER, ConsoleLogger);

// With dependencies
@Injectable()
class HttpLogger implements Logger {
  constructor(private http: HttpClient) {}

  log(message: string): void {
    this.http.post('/logs', { message }).subscribe();
  }
}

provideClass(LOGGER, HttpLogger, [HttpClient]);
```

**Testing Example:**

```typescript
// Production
provideClass(LOGGER, ConsoleLogger);

// Testing
provideClass(LOGGER, MockLogger);
```

**Multi-Provider:**

```typescript
const HTTP_INTERCEPTORS = new InjectionToken<HttpInterceptor>('HTTP_INTERCEPTORS');

provideClass(HTTP_INTERCEPTORS, AuthInterceptor, [], true);
provideClass(HTTP_INTERCEPTORS, LoggingInterceptor, [], true);
```

---

### provideExisting

Creates a type-safe existing provider (alias) for dependency injection.

**Signature:**

```typescript
function provideExisting<T>(provide: InjectionToken<T> | Type<T>, useExisting: InjectionToken<T> | Type<T>, multi?: boolean): ExistingProvider;
```

**Use Cases:**

- Creating aliases for existing tokens
- Multiple tokens pointing to same instance
- Backward compatibility when renaming services
- Providing same service under different tokens

**Examples:**

```typescript
import { Injectable, InjectionToken } from '@angular/core';
import { provideExisting } from '@dasch-ng/utils';

// Service with multiple aliases
@Injectable()
class LoggerService {
  log(msg: string) {
    console.log(msg);
  }
}

const LOGGER = new InjectionToken<LoggerService>('LOGGER');
const CONSOLE = new InjectionToken<LoggerService>('CONSOLE');

// Create aliases pointing to the same instance
const providers = [LoggerService, provideExisting(LOGGER, LoggerService), provideExisting(CONSOLE, LoggerService)];

// All three inject the same instance:
// inject(LoggerService) === inject(LOGGER) === inject(CONSOLE)
```

**Backward Compatibility:**

```typescript
// Old token (deprecated)
const OLD_SERVICE = new InjectionToken<MyService>('OLD_SERVICE');

// New token
const NEW_SERVICE = new InjectionToken<MyService>('NEW_SERVICE');

const providers = [
  provideClass(NEW_SERVICE, MyServiceImpl),
  // Keep old token working by aliasing to new one
  provideExisting(OLD_SERVICE, NEW_SERVICE),
];
```

**Interface Implementation:**

```typescript
interface Storage {
  get(key: string): string;
  set(key: string, value: string): void;
}

const STORAGE = new InjectionToken<Storage>('STORAGE');

@Injectable()
class LocalStorageService implements Storage {
  get(key: string) {
    return localStorage.getItem(key) ?? '';
  }
  set(key: string, value: string) {
    localStorage.setItem(key, value);
  }
}

const providers = [LocalStorageService, provideExisting(STORAGE, LocalStorageService)];
```

---

### provideType

Creates a type-safe constructor provider for dependency injection.

**Signature:**

```typescript
function provideType<T>(provide: Type<T>, options?: { deps?: any[]; multi?: boolean }): ConstructorProvider;
```

**Use Cases:**

- Explicit dependency declaration
- Custom injection scenarios
- When you need control over constructor injection
- Equivalent to providing a class directly but with explicit configuration

**Examples:**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { provideType } from '@dasch-ng/utils';

@Injectable()
class UserService {
  constructor(private http: HttpClient) {}
}

// Explicit dependency declaration
provideType(UserService, { deps: [HttpClient] });

// Equivalent to just providing the class:
// UserService
```

**Multi-Provider:**

```typescript
@Injectable()
class FeatureModule {
  constructor(private loader: ModuleLoader) {}
}

provideType(FeatureModule, {
  deps: [ModuleLoader],
  multi: true,
});
```

**Custom Injection:**

```typescript
class CustomService {
  constructor(
    private http: HttpClient,
    private config: AppConfig,
  ) {}
}

// Explicit dependency order
provideType(CustomService, {
  deps: [HttpClient, APP_CONFIG],
});
```

## Common Patterns

### Environment Configuration

```typescript
interface AppConfig {
  apiUrl: string;
  debug: boolean;
}

const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

// Development
provideValue(APP_CONFIG, {
  apiUrl: 'http://localhost:3000',
  debug: true,
});

// Production
provideValue(APP_CONFIG, {
  apiUrl: 'https://api.production.com',
  debug: false,
});
```

### Service Abstraction

```typescript
// Define abstraction
interface DataService {
  getData(): Observable<Data>;
}

const DATA_SERVICE = new InjectionToken<DataService>('DATA_SERVICE');

// Provide different implementations
provideClass(DATA_SERVICE, HttpDataService); // Production
provideClass(DATA_SERVICE, MockDataService); // Testing
provideClass(DATA_SERVICE, CacheDataService); // With caching
```

### Plugin System

```typescript
interface Plugin {
  name: string;
  init(): void;
}

const PLUGINS = new InjectionToken<Plugin[]>('PLUGINS');

// Register multiple plugins
const providers = [
  provideValue(PLUGINS, { name: 'analytics', init() {} }, true),
  provideValue(PLUGINS, { name: 'logger', init() {} }, true),
  provideFactory(PLUGINS, () => new CustomPlugin(), { multi: true }),
];

// Inject all plugins
class AppInitializer {
  constructor(@Inject(PLUGINS) private plugins: Plugin[]) {
    plugins.forEach((p) => p.init());
  }
}
```

### Testing Utilities

```typescript
// Production providers
export const PROD_PROVIDERS = [provideClass(AUTH_SERVICE, FirebaseAuthService), provideClass(DATA_SERVICE, HttpDataService)];

// Test providers
export const TEST_PROVIDERS = [provideClass(AUTH_SERVICE, MockAuthService), provideValue(DATA_SERVICE, mockDataService)];
```

## Migration Guide

### From Plain Providers

**Before:**

```typescript
const providers = [
  {
    provide: API_URL,
    useValue: 'https://api.example.com',
  },
  {
    provide: LOGGER,
    useClass: ConsoleLogger,
    deps: [],
  },
  {
    provide: DATA_SERVICE,
    useFactory: (http: HttpClient) => new DataService(http),
    deps: [HttpClient],
  },
];
```

**After:**

```typescript
const providers = [
  provideValue(API_URL, 'https://api.example.com'),
  provideClass(LOGGER, ConsoleLogger),
  provideFactory(DATA_SERVICE, (http: HttpClient) => new DataService(http), { deps: [HttpClient] }),
];
```

## API Reference

Complete TypeDoc API documentation: [dasch.ng/api/@dasch-ng/utils](https://dasch.ng/api/@dasch-ng/utils/README)

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/utils/src/lib/provide-helpers.ts).
