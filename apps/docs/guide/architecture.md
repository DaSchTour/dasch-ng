# Architecture

This document describes the architecture and organization of the dasch-ng monorepo.

## Monorepo Structure

The repository is organized as an Nx monorepo with the following structure:

```
dasch-ng/
├── apps/
│   └── docs/              # Documentation site (VitePress)
├── libs/
│   ├── decorators/        # TypeScript decorators
│   ├── gravatar/          # Gravatar hash generation
│   ├── material/
│   │   └── right-sheet/   # Angular Material right-side sheet
│   ├── ng/
│   │   ├── mutation-observer/  # MutationObserver wrapper
│   │   ├── resize-observer/    # ResizeObserver wrapper
│   │   └── utils/              # Angular utilities
│   ├── rxjs/
│   │   └── operators/     # Custom RxJS operators
│   ├── sharp/
│   │   └── operators/     # Sharp image processing operators
│   └── validators/        # Form validators
└── tools/                 # Build and development tools
```

## Library Types

### Angular Libraries

Built with `@nx/angular:package` (ng-packagr):

- **gravatar** - Gravatar hash generation for Angular
- **ng-utils** - Pipes, directives, and helper functions
- **material-right-sheet** - Angular Material component
- **mutation-observer** - Angular service wrapper for MutationObserver
- **resize-observer** - Angular service wrapper for ResizeObserver
- **validators** - Angular form validators

These libraries use:

- Jest for testing
- `ng-package.json` for build configuration
- SCSS for styles

### Vite Libraries

Built with `@nx/vite:build`:

- **decorators** - Pure TypeScript decorators
- **rxjs-operators** - RxJS operators (no Angular dependency)
- **sharp-operators** - Image processing operators

These libraries use:

- Vitest for testing
- Vite for building
- Standalone TypeScript/JavaScript

## Testing Strategy

The monorepo uses **both Jest and Vitest**:

- **Jest**: Used by Angular libraries
- **Vitest**: Used by non-Angular libraries (rxjs-operators, sharp-operators)

### Running Tests

```bash
# Run all tests
nx run-many -t test

# Run tests for a specific project
nx test rxjs-operators

# Run with coverage
nx test rxjs-operators --coverage
```

## Release Process

The repository uses **Nx Release** with independent versioning:

- Each library maintains its own semantic version
- Conventional commits determine version bumps
- Releases are tagged as `{projectName}/{version}`
- GitHub releases are created automatically
- Packages are published to npm

### Creating a Release

```bash
# Preview version bump and changelog
nx release --dry-run

# Create release (build, version, tag, publish)
nx release

# Skip publish step
nx release --skip-publish
```

## Build System

### Dependencies

Libraries follow strict dependency rules enforced by ESLint:

- Libraries can only depend on other buildable libraries
- Prevents circular dependencies
- Ensures clean module boundaries

### Build Order

Nx automatically determines the correct build order based on dependencies:

```bash
# Build all projects (respects dependency graph)
nx run-many -t build

# Build a specific project and its dependencies
nx build rxjs-operators
```

## TypeScript Configuration

Each library has a standard tsconfig pattern:

- `tsconfig.json` - Base configuration
- `tsconfig.lib.json` - Library build configuration
- `tsconfig.spec.json` - Test configuration
- `tsconfig.lib.prod.json` - Production build (Angular libraries only)

## Package Management

The monorepo uses **npm** as the package manager (configured in `nx.json`).

## Documentation

Documentation is built with:

- **VitePress** - Fast, Vite-powered static site generator
- **TypeDoc** - Automatic API documentation from TypeScript/JSDoc comments
- **Markdown** - Simple, maintainable content format

### Building Documentation

```bash
# Generate TypeDoc API docs
npx typedoc

# Serve documentation locally
npm run docs:dev

# Build for production
npm run docs:build
```

## CI/CD

The repository uses GitHub Actions for:

- Running tests on all PRs
- Linting and formatting checks
- Building all libraries
- Publishing releases
- Deploying documentation

See `.github/workflows/` for workflow definitions.

## Conventions

### Naming

- **Component prefix** (Angular): `dasch-ng` or `mat` (Material)
- **Package scope**: `@dasch-ng`
- **Type separator**: `.` (e.g., `auth.guard.ts`)

### Code Style

- **ESLint** for linting
- **Prettier** for formatting
- **Conventional Commits** for commit messages

### Angular Conventions

- Standalone components preference: disabled (configurable per project)
- SCSS for styles
- Jest for unit tests
- Spectator for cleaner component tests

## Development Workflow

1. Create feature branch
2. Make changes
3. Add tests
4. Add/update JSDoc comments
5. Lint and format: `nx run-many -t lint --fix && nx format:write`
6. Commit with conventional commit message
7. Create PR
8. CI validates changes
9. Merge to main
10. Release (manual or automated)

## Best Practices

### Documentation

- Add JSDoc comments to all public APIs
- Include `@param`, `@returns`, and `@example` tags
- Keep examples in JSDoc up to date
- Update markdown docs when adding features

### Testing

- Test all public APIs
- Use descriptive test names
- Aim for high coverage (>80%)
- Test edge cases and error scenarios

### Versioning

- Follow semantic versioning
- Use conventional commits
- Document breaking changes
- Provide migration guides for major versions
