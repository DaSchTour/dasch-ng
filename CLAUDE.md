# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is an Nx monorepo containing Angular libraries and utilities. The repository uses independent versioning for publishable packages with automated releases to npm.

**Documentation Site:** [dasch.ng](https://dasch.ng) - VitePress documentation with TypeDoc API reference

## Common Commands

### Build

```bash
# Build all projects
nx run-many -t build

# Build a specific project
nx build <project-name>

# Example: build the gravatar library
nx build gravatar
```

### Test

The repository uses **Vitest** as the primary test framework:

- **Vitest**: Official test framework for Angular 21+ and preferred for all new tests
  - Used by Angular libraries (route-signals and newer libraries)
  - Used by non-Angular libraries (rxjs-operators, sharp-operators)
- **Jest**: Legacy test framework, still used by some older Angular libraries via 3rd party tools
  - Some older libraries still use Jest (gravatar, json-viewer, ng-utils, validators, decorators, material-right-sheet)
  - New tests should use Vitest instead of Jest

```bash
# Run all tests
nx run-many -t test

# Run tests for a specific project
nx test <project-name>

# Run tests with coverage
nx test <project-name> --coverage

# Update snapshots
nx test <project-name> --updateSnapshot
# Or for projects with update configuration:
nx test <project-name>:update

# Run a single test file
nx test <project-name> --testFile=<file-name>
```

### Lint

```bash
# Lint all projects
nx run-many -t lint

# Lint a specific project
nx lint <project-name>

# Lint with auto-fix
nx lint <project-name> --fix
```

### Format

```bash
# Format all files (respects .prettierignore)
nx format:write

# Format specific files
nx format:write --files=path/to/file.ts
```

### Release

```bash
# Preview version bump and changelog
nx release --dry-run

# Create release (runs build, version, tag, and publish)
nx release

# Skip publish step
nx release --skip-publish
```

### Documentation

```bash
# Start documentation dev server
bun run docs:dev

# Build documentation for production
bun run docs:build

# Preview production build
bun run docs:preview

# Generate TypeDoc API documentation
nx run docs:typedoc
```

The documentation site (dasch.ng) is built with VitePress and TypeDoc, located in `apps/docs/`.

## Architecture

### Monorepo Structure

The repository follows an Nx workspace pattern with libraries organized by domain:

```
libs/
├── decorators/          # TypeScript decorators
├── gravatar/            # Gravatar hash generation (Angular)
├── material/
│   └── right-sheet/     # Angular Material right-side sheet component
├── ng/
│   ├── json-viewer/        # JSON viewer component (Angular)
│   ├── mutation-observer/  # Angular MutationObserver wrapper
│   ├── resize-observer/    # Angular ResizeObserver wrapper
│   ├── route-signals/      # Route state as signals (Angular)
│   └── utils/              # Angular utilities (pipes, helpers)
├── rxjs/
│   └── operators/       # Custom RxJS operators (Vite-based)
├── sharp/
│   └── operators/       # Sharp image processing operators (Vite-based)
└── validators/          # Form validators
```

### Library Types

**Angular Libraries** (using `@nx/angular:package`):

- Built with ng-packagr
- Use Vitest for testing (Angular 21+ official framework)
  - Newer libraries: route-signals
  - Older libraries may still use Jest: gravatar, json-viewer, ng-utils, material-right-sheet, validators, decorators
- Have `ng-package.json` configuration
- Examples: route-signals, gravatar, json-viewer, ng-utils, material-right-sheet, validators, decorators

**Vite Libraries** (using `@nx/vite:build`):

- Built with Vite
- Use Jest or Vitest for testing
- Standalone TypeScript/JavaScript utilities
- Examples: rxjs-operators, sharp-operators

### Testing Setup

- **Vitest**: Official test framework for Angular 21+ (configured in `vitest.workspace.ts`)
  - Modern Angular libraries use Vitest with `@analogjs/vite-plugin-angular`
  - Each library has `vitest.config.ts` and `src/test-setup.ts`
- **Jest**: Legacy test framework for older Angular libraries
  - Shared Jest configuration in `jest.preset.js`
  - Each older library has its own `jest.config.ts`
- Angular component tests may use `@ngneat/spectator` for cleaner test setup

### Release Process

The repository uses Nx Release with independent versioning:

- Each library maintains its own version
- Releases are tagged as `{projectName}/{version}`
- Conventional commits determine version bumps
- GitHub releases are created automatically
- Published packages: gravatar, material-right-sheet, ng-utils, rxjs-operators, sharp-operators, prime-supplements

### Package Manager

Uses **bun** as the package manager (configured in `nx.json`).

## Development Patterns

### Project Configuration

Each library has a `project.json` that defines:

- Build executor (Angular package or Vite)
- Test executor and configuration
- Lint settings
- Publish configuration (for publishable libraries)

### TypeScript Configuration

Libraries follow this tsconfig pattern:

- `tsconfig.json`: Base configuration
- `tsconfig.lib.json`: Library build configuration
- `tsconfig.spec.json`: Test configuration
- `tsconfig.lib.prod.json`: Production build (Angular libraries only)

### Angular Conventions

- **Component Prefixes**: Use library-specific prefixes that describe the library's purpose, not generic repository prefixes
  - ✅ Preferred: Library-specific prefixes (e.g., `json` for json-viewer, `gravatar` for gravatar library)
  - ⚠️ Avoid: Generic repository prefixes (e.g., `dasch-ng`) - only use for generic/shared libraries
  - Examples:
    - `json-viewer` library → prefix: `json` → selector: `<json-viewer>`
    - `gravatar` library → prefix: `gravatar` → selector: `<gravatar-avatar>`
    - Material extensions → prefix: `mat` → selector: `<mat-right-sheet>`
- Style: SCSS
- Type separator: `.` (e.g., `auth.guard.ts`)
- Standalone components preference is disabled (`@angular-eslint/prefer-standalone: off`)

### Nx Module Boundaries

The ESLint configuration enforces buildable library dependencies:

- Libraries can only depend on buildable libraries
- Prevents circular dependencies
- Ensures clean module boundaries

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

## Best Practices for Claude Code

### Pre-Commit Checklist

**IMPORTANT**: Before committing any code changes, ALWAYS run the following commands:

```bash
# 1. Run lint with auto-fix on all projects
bunx nx run-many -t lint --fix

# 2. Format all files
bunx nx format:write

# 3. Then commit your changes
git add .
git commit -m "your commit message"
git push
```

**Why this is critical**:

- The CI pipeline will fail if code is not properly linted and formatted
- Running these commands locally catches issues before they reach CI
- Ensures code quality and consistency across the repository

### CI Test Configuration

When working with Karma-based tests (Angular projects):

- Use the `:ci` configuration for CI environments
- CI configuration automatically uses headless Chrome
- Example: `nx test material-right-sheet:ci`
- The GitHub Actions workflow uses `nx affected -t lint test:ci build`

### Testing Strategy

- **Local development**: Use `nx test <project-name>` (opens browser)
- **CI/headless**: Use `nx test <project-name>:ci` (headless Chrome)
- Always verify tests pass locally before pushing

#### Angular Router Testing Best Practices

**CRITICAL**: When testing Angular components that use Router or ActivatedRoute:

- ❌ **DO NOT mock ActivatedRoute** - Mocking Angular's router leads to brittle tests that don't reflect real behavior
- ✅ **DO use RouterTestingHarness** - Use Angular's official testing utilities instead:
  - Import `provideRouter` from `@angular/router`
  - Import `RouterTestingHarness` from `@angular/router/testing`
  - Configure real routes in `TestBed.configureTestingModule` using `provideRouter`
  - Use `RouterTestingHarness.create()` to navigate to routes
  - Test components in their natural routing context

**Example:**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

describe('MyComponent', () => {
  it('should read route parameter', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'user/:id', component: MyComponent }
        ])
      ]
    });

    const harness = await RouterTestingHarness.create('/user/123');
    const component = harness.routeNativeElement!.querySelector('my-component');
    // Test component behavior with real routing
  });
});
```

**References:**
- [Angular Router Testing Documentation](https://angular.dev/guide/routing/testing)
- [Write better tests without Router mocks/stubs](https://blog.angular.dev/write-better-tests-without-router-mocks-stubs-bf5fc95c1c57)

#### Test Configuration Guidelines

**IMPORTANT**: Do NOT modify test configurations without explicit user request or when fixing specific errors:

- Angular 21+ has integrated support for both Jest and Vitest
- Test configurations (`jest.config.ts`, `vitest.config.ts`, `project.json` test targets) are already correctly set up
- Angular's testing infrastructure handles configuration automatically
- Only modify test configuration when:
  1. The user explicitly requests a configuration change
  2. You are fixing a specific test configuration error
  3. You are adding a new library and need to set up testing for the first time

**When writing or updating tests:**
- Focus on test content and logic, not configuration
- Use existing test setup patterns in the library
- Keep test files in the `src/lib/` directory alongside the code they test
- Follow the naming convention: `*.spec.ts`

### Documentation Requirements

**CRITICAL**: When creating new libraries or adding new functionality, you MUST update the documentation:

#### For New Libraries

When creating a new library, you must:

1. **Create a library documentation page** in `apps/docs/libraries/<library-name>.md`
   - Follow the structure of existing library docs (e.g., `rxjs-operators.md`, `json-viewer.md`)
   - Include: Installation, Features, Basic Usage, API Reference, Examples, Credits/License
   - Add code examples with proper syntax highlighting
   - Include links to the TypeDoc API reference

2. **Update VitePress navigation** in `apps/docs/.vitepress/config.mts`
   - Add the library to the appropriate sidebar section (`/libraries/` and `/api/`)
   - Place it alphabetically within its category (Angular Libraries or TypeScript Libraries)
   - Ensure both the user guide link and API reference link are added

3. **Generate TypeDoc documentation**
   - Run `nx run docs:typedoc` to generate API documentation
   - Verify that TypeDoc files are created in `apps/docs/api/@dasch-ng/<library-name>/`

4. **Update this CLAUDE.md file**
   - Add the library to the monorepo structure diagram if it's a new category
   - Update the library types section with examples if applicable
   - Update any relevant testing information (Jest vs Vitest)

#### For New Features/Functions

When adding new functionality to existing libraries:

1. **Update the library documentation page**
   - Add examples for the new feature
   - Update the API tables with new parameters/options
   - Add use case examples if applicable

2. **Regenerate TypeDoc**
   - Run `nx run docs:typedoc` to update API documentation
   - Verify the new features appear in the generated docs

3. **Update README files**
   - Keep the library's `README.md` in sync with the documentation site
   - README should have basic usage; full docs go on the site

#### Documentation Standards

- Use TypeScript code blocks with proper syntax highlighting
- Include realistic, runnable examples
- Document all public APIs with JSDoc comments in code
- Use clear, concise language
- Include "Why" and "When to use" sections for features
- Cross-reference related features and libraries
- Always include links to API reference and source code

#### Verification Checklist

Before committing documentation changes:

- [ ] Library appears in VitePress navigation
- [ ] Documentation page follows established patterns
- [ ] All code examples are tested and valid
- [ ] TypeDoc API documentation is generated and linked
- [ ] Cross-references are correct and not broken
- [ ] Documentation builds without errors (`bun run docs:build`)
- [ ] Preview documentation locally (`bun run docs:dev`) to verify
