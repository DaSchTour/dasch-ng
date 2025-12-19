# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is an Nx monorepo containing Angular libraries and utilities. The repository uses independent versioning for publishable packages with automated releases to npm.

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

The repository uses **both Jest and Vitest** depending on the project:
- **Jest**: Used by Angular libraries (gravatar, ng-utils, validators, decorators, material-right-sheet)
- **Vitest**: Used by non-Angular libraries (rxjs-operators, sharp-operators)

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

### Release
```bash
# Preview version bump and changelog
nx release --dry-run

# Create release (runs build, version, tag, and publish)
nx release

# Skip publish step
nx release --skip-publish
```

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
│   ├── mutation-observer/  # Angular MutationObserver wrapper
│   ├── resize-observer/    # Angular ResizeObserver wrapper
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
- Use Jest for testing
- Have `ng-package.json` configuration
- Examples: gravatar, ng-utils, material-right-sheet, validators, decorators

**Vite Libraries** (using `@nx/vite:build`):
- Built with Vite
- Use Jest or Vitest for testing
- Standalone TypeScript/JavaScript utilities
- Examples: rxjs-operators, sharp-operators

### Testing Setup

- **Vitest workspace**: Configured in `vitest.workspace.ts` for libraries using Vitest
- **Jest preset**: Shared Jest configuration in `jest.preset.js`
- Each library has its own test configuration (`jest.config.ts` or `vitest.config.ts`)
- Angular component tests use `@ngneat/spectator` for cleaner test setup

### Release Process

The repository uses Nx Release with independent versioning:
- Each library maintains its own version
- Releases are tagged as `{projectName}/{version}`
- Conventional commits determine version bumps
- GitHub releases are created automatically
- Published packages: gravatar, material-right-sheet, ng-utils, rxjs-operators, sharp-operators, prime-supplements

### Package Manager

Uses **npm** as the package manager (configured in `nx.json`).

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

- Component prefix for ng libraries: `dasch-ng`
- Component prefix for material libraries: `mat`
- Style: SCSS
- Type separator: `.` (e.g., `auth.guard.ts`)
- Standalone components preference is disabled (`@angular-eslint/prefer-standalone: off`)

### Nx Module Boundaries

The ESLint configuration enforces buildable library dependencies:
- Libraries can only depend on buildable libraries
- Prevents circular dependencies
- Ensures clean module boundaries