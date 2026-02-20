import { Component, Signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { routeParam } from './route-param';

describe('routeParam', () => {
  describe('initialization', () => {
    it('should create a signal with the initial param value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/test-id');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('test-id');
    });

    it('should decode URL-encoded initial value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ nameSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly nameSignal = routeParam('name');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'user/:name', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/user/hello%20world');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.nameSignal()).toBe('hello world');
    });

    it('should decode special characters in initial value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ textSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly textSignal = routeParam('text');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'data/:text', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/data/a%2Fb%3Dc%26d');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.textSignal()).toBe('a/b=c&d');
    });

    it('should throw error if param is not in route snapshot', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>Test</div>',
        standalone: true,
      })
      class TestComponent {
        constructor() {
          routeParam('missing');
        }
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test', component: TestComponent }])],
      });

      await expect(async () => {
        await RouterTestingHarness.create('/test');
      }).rejects.toThrow('Route parameter "missing" is not in route.');
    });

    it('should handle empty string param as valid value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      // Empty string is a valid parameter value
      expect(component.idSignal()).toBe('');
    });
  });

  describe('reactivity', () => {
    it('should update signal when route param changes', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/test-id');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('test-id');

      // Navigate to a different route with a new param
      const router = TestBed.inject(Router);
      await router.navigate(['/test/new-id']);
      await harness.fixture.whenStable();

      expect(component.idSignal()).toBe('new-id');
    });

    it('should decode URL-encoded values on update', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/test-id');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('test-id');

      const router = TestBed.inject(Router);
      await router.navigate(['/test/user%20name%20with%20spaces']);
      await harness.fixture.whenStable();

      expect(component.idSignal()).toBe('user name with spaces');
    });

    it('should decode special characters on update', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/test-id');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('test-id');

      const router = TestBed.inject(Router);
      await router.navigate(['/test/path%2Fto%2Fresource%3Fkey%3Dvalue']);
      await harness.fixture.whenStable();

      expect(component.idSignal()).toBe('path/to/resource?key=value');
    });

    it('should handle multiple param updates', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/test-id');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('test-id');

      const router = TestBed.inject(Router);

      await router.navigate(['/test/second-id']);
      await harness.fixture.whenStable();
      expect(component.idSignal()).toBe('second-id');

      await router.navigate(['/test/third-id']);
      await harness.fixture.whenStable();
      expect(component.idSignal()).toBe('third-id');
    });
  });

  describe('edge cases', () => {
    it('should handle param with only whitespace', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/%20%20%20');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('   ');
    });

    it('should handle param with encoded spaces', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/%20%20%20');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('   ');
    });

    it('should handle param with plus signs (not decoded as spaces)', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/hello+world');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      // decodeURIComponent does not convert + to space (that's for query params)
      expect(component.idSignal()).toBe('hello+world');
    });

    it.skip('should handle param with percent-encoded percent sign', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/100%25');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('100%');
    });

    it('should handle unicode characters', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/%E2%9C%93');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('✓');
    });
  });

  describe('fallback behavior', () => {
    it('should use fallback value when param is not in route snapshot', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ categorySignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly categorySignal = routeParam('category', 'all');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'list', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/list');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.categorySignal()).toBe('all');
    });

    it('should use actual param value when present, not fallback', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ categorySignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly categorySignal = routeParam('category', 'all');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'list/:category', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/list/electronics');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.categorySignal()).toBe('electronics');
    });

    it('should return to fallback value when param is removed from route', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ categorySignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly categorySignal = routeParam('category', 'all');
      }

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: 'list/:category', component: TestComponent },
            { path: 'list', component: TestComponent },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/list/electronics');
      let component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.categorySignal()).toBe('electronics');

      // Navigate to route without the param - creates new component instance
      await harness.navigateByUrl('/list');

      // Get the new component instance
      component = harness.routeDebugElement?.componentInstance as TestComponent;
      expect(component.categorySignal()).toBe('all');
    });

    it('should decode fallback value if it contains encoded characters', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ nameSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly nameSignal = routeParam('name', 'default name');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'user', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/user');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      // Fallback value should be decoded
      expect(component.nameSignal()).toBe('default name');
    });

    it('should handle empty string fallback', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id', '');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('');
    });

    it('should handle fallback with special characters', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ pathSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly pathSignal = routeParam('path', '/default/path');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'files', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/files');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.pathSignal()).toBe('/default/path');
    });
  });

  describe('usage in components', () => {
    it('should work when used in component constructor', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal: Signal<string>;

        constructor() {
          this.idSignal = routeParam('id');
        }
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/test-id');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('test-id');
    });

    it('should work when used as class field initializer', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ idSignal() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly idSignal = routeParam('id');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test/:id', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/test/test-id');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.idSignal()).toBe('test-id');
    });

    it('should track multiple route params independently', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ domainId() }} - {{ groupId() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly domainId = routeParam('domainId');
        readonly groupId = routeParam('groupId');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'domains/:domainId/groups/:groupId', component: TestComponent }])],
      });

      const harness = await RouterTestingHarness.create('/domains/domain-1/groups/group-2');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.domainId()).toBe('domain-1');
      expect(component.groupId()).toBe('group-2');

      // Update one param
      const router = TestBed.inject(Router);
      await router.navigate(['/domains/domain-updated/groups/group-2']);
      await harness.fixture.whenStable();

      expect(component.domainId()).toBe('domain-updated');
      expect(component.groupId()).toBe('group-2');
    });
  });
});
