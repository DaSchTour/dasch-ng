import { Component, Signal } from '@angular/core';
import { ActivatedRouteSnapshot, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { routeData } from './route-data';

describe('routeData', () => {
  describe('initialization', () => {
    it('should create a signal with the initial route data value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ title() }} - {{ role() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly title = routeData<string>('title');
        readonly role = routeData<string>('role');
      }

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            {
              path: 'admin',
              component: TestComponent,
              data: { title: 'Test Title', role: 'admin' },
            },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/admin');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.title()).toBe('Test Title');
      expect(component.role()).toBe('admin');
    });

    it('should handle string data', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ role() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly role = routeData<string>('role');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'admin', component: TestComponent, data: { role: 'admin' } }])],
      });

      const harness = await RouterTestingHarness.create('/admin');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.role()).toBe('admin');
    });

    it('should handle numeric data', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ count() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly count = routeData<number>('count');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'stats', component: TestComponent, data: { count: 42 } }])],
      });

      const harness = await RouterTestingHarness.create('/stats');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.count()).toBe(42);
    });

    it('should handle boolean data', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ isPublic() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly isPublic = routeData<boolean>('isPublic');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'page', component: TestComponent, data: { isPublic: true } }])],
      });

      const harness = await RouterTestingHarness.create('/page');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.isPublic()).toBe(true);
    });

    it('should handle object data', async () => {
      const breadcrumb = { label: 'Home', path: '/' };

      @Component({
        selector: 'test-component',
        template: '<div>{{ breadcrumb().label }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly breadcrumb = routeData<typeof breadcrumb>('breadcrumb');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'home', component: TestComponent, data: { breadcrumb } }])],
      });

      const harness = await RouterTestingHarness.create('/home');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.breadcrumb()).toEqual(breadcrumb);
    });

    it('should handle array data', async () => {
      const tags = ['angular', 'typescript', 'testing'];

      @Component({
        selector: 'test-component',
        template: '<div>{{ tags().length }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly tags = routeData<string[]>('tags');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'article', component: TestComponent, data: { tags } }])],
      });

      const harness = await RouterTestingHarness.create('/article');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.tags()).toEqual(tags);
    });

    it('should throw error when data is null', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>Test</div>',
        standalone: true,
      })
      class TestComponent {
        constructor() {
          routeData<string | null>('value');
        }
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test', component: TestComponent, data: { value: null } }])],
      });

      // null is treated as "not present" (same as undefined)
      await expect(async () => {
        await RouterTestingHarness.create('/test');
      }).rejects.toThrow('Route data property "value" is not in route.');
    });

    it('should throw error with descriptive message if route data is not present', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>Test</div>',
        standalone: true,
      })
      class TestComponent {
        constructor() {
          routeData('missing');
        }
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test', component: TestComponent, data: {} }])],
      });

      await expect(async () => {
        await RouterTestingHarness.create('/test');
      }).rejects.toThrow('Route data property "missing" is not in route.');
    });

    it('should throw error if route data is undefined', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>Test</div>',
        standalone: true,
      })
      class TestComponent {
        constructor() {
          routeData('key');
        }
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test', component: TestComponent, data: { key: undefined } }])],
      });

      await expect(async () => {
        await RouterTestingHarness.create('/test');
      }).rejects.toThrow('Route data property "key" is not in route.');
    });

    it('should handle zero as valid value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ count() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly count = routeData<number>('count');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test', component: TestComponent, data: { count: 0 } }])],
      });

      const harness = await RouterTestingHarness.create('/test');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.count()).toBe(0);
    });

    it('should handle empty string as valid value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ message() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly message = routeData<string>('message');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test', component: TestComponent, data: { message: '' } }])],
      });

      const harness = await RouterTestingHarness.create('/test');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.message()).toBe('');
    });

    it('should handle false as valid value', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ enabled() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly enabled = routeData<boolean>('enabled');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'test', component: TestComponent, data: { enabled: false } }])],
      });

      const harness = await RouterTestingHarness.create('/test');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.enabled()).toBe(false);
    });
  });

  describe('reactivity', () => {
    it('should update signal when route data changes', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ title() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly title = routeData<string>('title');
      }

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: 'page1', component: TestComponent, data: { title: 'Test Title' } },
            { path: 'page2', component: TestComponent, data: { title: 'New Title' } },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/page1');
      let component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.title()).toBe('Test Title');

      const router = TestBed.inject(Router);
      await router.navigate(['/page2']);
      await harness.fixture.whenStable();

      // Get the new component instance after navigation
      component = harness.routeDebugElement?.componentInstance as TestComponent;
      expect(component.title()).toBe('New Title');
    });

    it('should handle multiple data updates', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ title() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly title = routeData<string>('title');
      }

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: 'page1', component: TestComponent, data: { title: 'Test Title' } },
            { path: 'page2', component: TestComponent, data: { title: 'Second Title' } },
            { path: 'page3', component: TestComponent, data: { title: 'Third Title' } },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/page1');
      let component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.title()).toBe('Test Title');

      const router = TestBed.inject(Router);

      await router.navigate(['/page2']);
      await harness.fixture.whenStable();
      component = harness.routeDebugElement?.componentInstance as TestComponent;
      expect(component.title()).toBe('Second Title');

      await router.navigate(['/page3']);
      await harness.fixture.whenStable();
      component = harness.routeDebugElement?.componentInstance as TestComponent;
      expect(component.title()).toBe('Third Title');
    });

    it('should handle object data updates', async () => {
      const initialBreadcrumb = { label: 'Home', path: '/' };
      const updatedBreadcrumb = { label: 'Dashboard', path: '/dashboard' };

      @Component({
        selector: 'test-component',
        template: '<div>{{ breadcrumb().label }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly breadcrumb = routeData<typeof initialBreadcrumb>('breadcrumb');
      }

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: 'home', component: TestComponent, data: { breadcrumb: initialBreadcrumb } },
            { path: 'dashboard', component: TestComponent, data: { breadcrumb: updatedBreadcrumb } },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/home');
      let component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.breadcrumb()).toEqual(initialBreadcrumb);

      const router = TestBed.inject(Router);
      await router.navigate(['/dashboard']);
      await harness.fixture.whenStable();

      component = harness.routeDebugElement?.componentInstance as TestComponent;
      expect(component.breadcrumb()).toEqual(updatedBreadcrumb);
    });

    it('should handle array data updates', async () => {
      const initialTags = ['angular', 'typescript'];
      const updatedTags = ['angular', 'typescript', 'testing'];

      @Component({
        selector: 'test-component',
        template: '<div>{{ tags().length }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly tags = routeData<string[]>('tags');
      }

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: 'article1', component: TestComponent, data: { tags: initialTags } },
            { path: 'article2', component: TestComponent, data: { tags: updatedTags } },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/article1');
      let component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.tags()).toEqual(initialTags);

      const router = TestBed.inject(Router);
      await router.navigate(['/article2']);
      await harness.fixture.whenStable();

      component = harness.routeDebugElement?.componentInstance as TestComponent;
      expect(component.tags()).toEqual(updatedTags);
    });

    it('should update signal with resolver when component instance is reused', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      @Component({
        selector: 'test-component',
        template: '<div>{{ user().name }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly user = routeData<User>('user');
      }

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            {
              path: 'user/:id',
              component: TestComponent,
              runGuardsAndResolvers: 'paramsChange',
              resolve: {
                user: (route: ActivatedRouteSnapshot) => {
                  const id = route.paramMap.get('id') ?? '0';
                  return {
                    id: parseInt(id, 10),
                    name: `User ${id}`,
                    email: `user${id}@example.com`,
                  };
                },
              },
            },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/user/1');
      const component1 = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component1.user()).toEqual({
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
      });

      const router = TestBed.inject(Router);
      await router.navigate(['/user/2']);
      await harness.fixture.whenStable();

      const component2 = harness.routeDebugElement?.componentInstance as TestComponent;

      // Verify component instance is reused
      expect(component1).toBe(component2);

      // Verify data has updated despite component reuse
      expect(component2.user()).toEqual({
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
      });
    });
  });

  describe('type safety', () => {
    it('should support generic type parameter for type-safe access', async () => {
      interface UserRole {
        name: string;
        permissions: string[];
      }

      const role: UserRole = {
        name: 'admin',
        permissions: ['read', 'write', 'delete'],
      };

      @Component({
        selector: 'test-component',
        template: '<div>{{ userRole().name }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly userRole = routeData<UserRole>('userRole');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'admin', component: TestComponent, data: { userRole: role } }])],
      });

      const harness = await RouterTestingHarness.create('/admin');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.userRole()).toEqual(role);
      expect(component.userRole().name).toBe('admin');
      expect(component.userRole().permissions).toEqual(['read', 'write', 'delete']);
    });

    it('should support union types', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ status() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly status = routeData<'active' | 'inactive' | 'pending'>('status');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'page', component: TestComponent, data: { status: 'active' } }])],
      });

      const harness = await RouterTestingHarness.create('/page');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.status()).toBe('active');
    });
  });

  describe('usage in components', () => {
    it('should work when used in component constructor', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ title() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly title: Signal<string>;

        constructor() {
          this.title = routeData<string>('title');
        }
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'admin', component: TestComponent, data: { title: 'Test Title' } }])],
      });

      const harness = await RouterTestingHarness.create('/admin');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.title()).toBe('Test Title');
    });

    it('should work when used as class field initializer', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ title() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly title = routeData<string>('title');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'admin', component: TestComponent, data: { title: 'Test Title' } }])],
      });

      const harness = await RouterTestingHarness.create('/admin');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.title()).toBe('Test Title');
    });

    it('should track multiple route data properties independently', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ title() }} - {{ role() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly title = routeData<string>('title');
        readonly role = routeData<string>('role');
        readonly permissions = routeData<string[]>('permissions');
      }

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            {
              path: 'admin',
              component: TestComponent,
              data: { title: 'Admin Dashboard', role: 'admin', permissions: ['read', 'write'] },
            },
            {
              path: 'user',
              component: TestComponent,
              data: { title: 'User Dashboard', role: 'admin', permissions: ['read', 'write'] },
            },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/admin');
      let component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.title()).toBe('Admin Dashboard');
      expect(component.role()).toBe('admin');
      expect(component.permissions()).toEqual(['read', 'write']);

      const router = TestBed.inject(Router);
      await router.navigate(['/user']);
      await harness.fixture.whenStable();

      component = harness.routeDebugElement?.componentInstance as TestComponent;
      expect(component.title()).toBe('User Dashboard');
      expect(component.role()).toBe('admin');
      expect(component.permissions()).toEqual(['read', 'write']);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle breadcrumb data', async () => {
      interface Breadcrumb {
        label: string;
        path: string;
        icon?: string;
      }

      const breadcrumb: Breadcrumb = {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
      };

      @Component({
        selector: 'test-component',
        template: '<div>{{ breadcrumb().label }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly breadcrumb = routeData<Breadcrumb>('breadcrumb');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'dashboard', component: TestComponent, data: { breadcrumb } }])],
      });

      const harness = await RouterTestingHarness.create('/dashboard');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.breadcrumb()).toEqual(breadcrumb);
      expect(component.breadcrumb().label).toBe('Dashboard');
      expect(component.breadcrumb().path).toBe('/dashboard');
      expect(component.breadcrumb().icon).toBe('dashboard');
    });

    it('should handle animation state data', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ animation() }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly animation = routeData<string>('animation');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'page', component: TestComponent, data: { animation: 'slideIn' } }])],
      });

      const harness = await RouterTestingHarness.create('/page');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.animation()).toBe('slideIn');
    });

    it('should handle permission data for route guards', async () => {
      @Component({
        selector: 'test-component',
        template: '<div>{{ requiredPermissions().length }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly requiredPermissions = routeData<string[]>('requiredPermissions');
      }

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            {
              path: 'admin',
              component: TestComponent,
              data: { requiredPermissions: ['admin', 'edit'] },
            },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/admin');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.requiredPermissions()).toEqual(['admin', 'edit']);
    });

    it('should handle resolver data', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      @Component({
        selector: 'test-component',
        template: '<div>{{ user().name }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly user = routeData<User>('user');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'profile', component: TestComponent, data: { user } }])],
      });

      const harness = await RouterTestingHarness.create('/profile');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.user()).toEqual(user);
      expect(component.user().name).toBe('John Doe');
    });

    it('should handle metadata for SEO', async () => {
      interface PageMeta {
        title: string;
        description: string;
        keywords: string[];
      }

      const meta: PageMeta = {
        title: 'Angular Testing Guide',
        description: 'Learn how to test Angular applications',
        keywords: ['angular', 'testing', 'jest'],
      };

      @Component({
        selector: 'test-component',
        template: '<div>{{ meta().title }}</div>',
        standalone: true,
      })
      class TestComponent {
        readonly meta = routeData<PageMeta>('meta');
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: 'guide', component: TestComponent, data: { meta } }])],
      });

      const harness = await RouterTestingHarness.create('/guide');
      const component = harness.routeDebugElement?.componentInstance as TestComponent;

      expect(component.meta()).toEqual(meta);
      expect(component.meta().title).toBe('Angular Testing Guide');
      expect(component.meta().keywords).toContain('angular');
    });
  });
});
