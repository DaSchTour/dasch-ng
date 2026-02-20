import { Component, Signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { routeQueryParam } from './route-query-param';

describe('routeQueryParam', () => {
  describe('initialization', () => {
    it('should create a signal with the initial query param value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=search-term');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('search-term');
    });

    it('should decode URL-encoded initial value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=hello%20world');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('hello world');
    });

    it('should decode special characters in initial value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ filterSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly filterSignal = routeQueryParam('filter');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'list', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/list?filter=name%3Djohn%26age%3D30');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.filterSignal()).toBe('name=john&age=30');
    });

    it('should throw error with descriptive message if query param is not in route', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>Test</div>',
        standalone: true,
      })
      class TestComponent {
        constructor() {
          routeQueryParam('missing');
        }
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      await expect(async () => {
        await RouterTestingHarness.create('/search');
      }).rejects.toThrow('Query parameter "missing" is not in route.');
    });

    it('should handle empty string query param as valid value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      // Empty string is a valid query parameter value
      expect(component.searchSignal()).toBe('');
    });
  });

  describe('reactivity', () => {
    it('should update signal when query param changes', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=search-term');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('search-term');

      // Update the query param
      const router = TestBed.inject(Router);
      await router.navigate(['/search'], { queryParams: { q: 'new-search' } });
      await harness.fixture.whenStable();

      expect(component.searchSignal()).toBe('new-search');
    });

    it('should decode URL-encoded values on update', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=search-term');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('search-term');

      const router = TestBed.inject(Router);
      await router.navigate(['/search'], { queryParams: { q: 'search with spaces' } });
      await harness.fixture.whenStable();

      expect(component.searchSignal()).toBe('search with spaces');
    });

    it('should decode special characters on update', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=search-term');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('search-term');

      const router = TestBed.inject(Router);
      await router.navigate(['/search'], { queryParams: { q: 'key=value&other=data' } });
      await harness.fixture.whenStable();

      expect(component.searchSignal()).toBe('key=value&other=data');
    });

    it('should handle multiple query param updates', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=search-term');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('search-term');

      const router = TestBed.inject(Router);

      await router.navigate(['/search'], { queryParams: { q: 'second-search' } });
      await harness.fixture.whenStable();
      expect(component.searchSignal()).toBe('second-search');

      await router.navigate(['/search'], { queryParams: { q: 'third-search' } });
      await harness.fixture.whenStable();
      expect(component.searchSignal()).toBe('third-search');
    });
  });

  describe('edge cases', () => {
    it('should handle query param with only whitespace', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=%20%20%20');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('   ');
    });

    it('should handle query param with encoded spaces', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=%20%20%20');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('   ');
    });

    // TODO check how to handle this edge case
    it.skip('should handle query param with percent-encoded percent sign', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=100%25');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('100%');
    });

    it('should handle unicode characters', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=%E2%9C%93%20%F0%9F%8E%89');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('✓ 🎉');
    });

    it('should handle forward slashes in query params', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ pathSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly pathSignal = routeQueryParam('path');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'files', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/files?path=folder%2Fsubfolder%2Ffile.txt');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.pathSignal()).toBe('folder/subfolder/file.txt');
    });
  });

  describe('fallback behavior', () => {
    it('should use fallback value when query param is not in route snapshot', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ sortSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly sortSignal = routeQueryParam('sort', 'name');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'products', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/products');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.sortSignal()).toBe('name');
    });

    it('should use actual query param value when present, not fallback', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ sortSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly sortSignal = routeQueryParam('sort', 'name');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'products', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/products?sort=price');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.sortSignal()).toBe('price');
    });

    it('should return to fallback value when query param is removed from route', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ sortSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly sortSignal = routeQueryParam('sort', 'name');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'products', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/products?sort=price');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.sortSignal()).toBe('price');

      // Navigate to route without the query param
      const router = TestBed.inject(Router);
      await router.navigate(['/products']);
      await harness.fixture.whenStable();

      // Query param changes are reactive, same component instance is reused
      expect(component.sortSignal()).toBe('name');
    });

    it('should decode fallback value if it contains encoded characters', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ filterSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly filterSignal = routeQueryParam('filter', 'status=active');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'list', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/list');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      // Fallback value should be decoded
      expect(component.filterSignal()).toBe('status=active');
    });

    it('should handle empty string fallback', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchSignal = routeQueryParam('q', '');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchSignal()).toBe('');
    });

    it('should handle fallback with special characters', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ redirectSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly redirectSignal = routeQueryParam('redirect', '/home?tab=overview');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'login', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/login');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.redirectSignal()).toBe('/home?tab=overview');
    });

    it('should handle multiple query params with different fallback strategies', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ sort() }} - {{ order() }} - {{ filter() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly sort = routeQueryParam('sort', 'name');
        readonly order = routeQueryParam('order', 'asc');
        readonly filter = routeQueryParam('filter', 'all');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'list', component: TestComponent }])],
      });

      // Start with some query params
      const harness = await RouterTestingHarness.create('/list?sort=price&filter=active');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.sort()).toBe('price');
      expect(component.order()).toBe('asc'); // fallback
      expect(component.filter()).toBe('active');

      // Remove all query params
      const router = TestBed.inject(Router);
      await router.navigate(['/list']);
      await harness.fixture.whenStable();

      expect(component.sort()).toBe('name'); // fallback
      expect(component.order()).toBe('asc'); // fallback
      expect(component.filter()).toBe('all'); // fallback
    });
  });

  describe('usage in components', () => {
    it('should work when used in component constructor', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchQuery() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchQuery: Signal<string>;

        constructor() {
          this.searchQuery = routeQueryParam('q');
        }
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=search-term');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchQuery()).toBe('search-term');
    });

    it('should work when used as class field initializer', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchQuery() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchQuery = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=search-term');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchQuery()).toBe('search-term');
    });

    it('should track multiple query params independently', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchQuery() }} - {{ filter() }} - {{ sort() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchQuery = routeQueryParam('q');
        readonly filter = routeQueryParam('filter');
        readonly sort = routeQueryParam('sort');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=search-term&filter=active&sort=date');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchQuery()).toBe('search-term');
      expect(component.filter()).toBe('active');
      expect(component.sort()).toBe('date');

      // Update one query param
      const router = TestBed.inject(Router);
      await router.navigate(['/search'], { queryParams: { q: 'updated-search', filter: 'active', sort: 'date' } });
      await harness.fixture.whenStable();

      expect(component.searchQuery()).toBe('updated-search');
      expect(component.filter()).toBe('active');
      expect(component.sort()).toBe('date');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle search query with special characters', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ searchQuery() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly searchQuery = routeQueryParam('q');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'search', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/search?q=user%40example.com');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.searchQuery()).toBe('user@example.com');
    });

    it('should handle URL with encoded question marks', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ redirectUrl() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly redirectUrl = routeQueryParam('redirect');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'login', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/login?redirect=http%3A%2F%2Fexample.com%2Fpath%3Fkey%3Dvalue');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.redirectUrl()).toBe('http://example.com/path?key=value');
    });

    it('should handle filter expressions', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ filterExpr() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly filterExpr = routeQueryParam('filter');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'list', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/list?filter=status%3Dactive%26role%3Dadmin');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.filterExpr()).toBe('status=active&role=admin');
    });
  });
});
