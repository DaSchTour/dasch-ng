# Monorepo-Dokumentationsplan für dasch-ng

## Überblick

Dieser Plan beschreibt die Implementierung einer zentralen Dokumentationsseite für alle Libraries im dasch-ng Nx Monorepo, die als eigenständige App im Repository existieren und deployed werden kann.

## Analysierte Repository-Struktur

### Vorhandene Libraries (9 Libraries)

**Angular Libraries (mit Jest):**

- `libs/gravatar` - Gravatar Hash-Generierung
- `libs/ng/utils` - Angular Utilities (Pipes, Helpers)
- `libs/ng/mutation-observer` - Angular MutationObserver Wrapper
- `libs/ng/resize-observer` - Angular ResizeObserver Wrapper
- `libs/material/right-sheet` - Angular Material Right-Side Sheet
- `libs/validators` - Form Validators
- `libs/decorators` - TypeScript Decorators

**Vite Libraries (mit Vitest):**

- `libs/rxjs/operators` - Custom RxJS Operators
- `libs/sharp/operators` - Sharp Image Processing Operators

**Publishable Packages (laut nx.json):**

- gravatar, material-right-sheet, ng-utils, rxjs-operators, sharp-operators, prime-supplements

## Tool-Evaluierung

### Option 1: Storybook (Empfohlen für Komponentenbibliotheken)

#### Vorteile

- ✅ Native Nx-Integration über `@nx/storybook`
- ✅ Ausgezeichnet für Angular-Komponenten
- ✅ Kann mehrere Libraries in einer Instanz zusammenführen
- ✅ Interaktive Komponentenvorschau
- ✅ Hot-Reload während der Entwicklung
- ✅ MDX-Support für zusätzliche Dokumentation
- ✅ Beispielrepository verfügbar: [nx-shared-storybook](https://github.com/juristr/nx-shared-storybook)

#### Nachteile

- ❌ Primär für UI-Komponenten, weniger für reine Utility-Libraries
- ❌ Nicht ideal für Non-Angular Libraries (rxjs-operators, sharp-operators)

#### Nx-Integration

```bash
# Installation
nx add @nx/storybook

# Konfiguration für jede Library
nx g @nx/angular:storybook-configuration <library-name>

# Automatische Story-Generierung möglich
nx g @nx/angular:storybook-configuration <library-name> --generateStories
```

**Quellen:**

- [Nx Storybook Plugin Overview](https://nx.dev/docs/technologies/test-tools/storybook/introduction)
- [Set up Storybook for Angular Projects](https://nx.dev/storybook/overview-angular)
- [Nx Shared Storybook Example](https://github.com/juristr/nx-shared-storybook)

### Option 2: VitePress (Empfohlen für umfassende Dokumentation)

#### Vorteile

- ✅ Sehr schnell (Vite-basiert)
- ✅ Markdown-basiert, einfach zu pflegen
- ✅ Exzellentes SEO und Performance
- ✅ Versionierung möglich
- ✅ Funktioniert für alle Library-Typen (Angular & Non-Angular)
- ✅ TypeScript API-Dokumentation möglich
- ✅ Gut für Tutorials, Guides und API-Docs

#### Nachteile

- ❌ Keine native Nx-Integration (manuelle Setup erforderlich)
- ❌ Keine interaktive Komponentenvorschau

#### Setup-Ansatz

- Als eigenständige App in `apps/docs` erstellen
- Manuell TypeDoc/API Extractor einbinden
- Markdown-Files pro Library pflegen

### Option 3: Docusaurus (Alternative zu VitePress)

#### Vorteile

- ✅ React-basiert (ähnlich wie Angular Ökosystem)
- ✅ Sehr feature-reich (Versioning, i18n, Search)
- ✅ Große Community
- ✅ Plugin-Ökosystem

#### Nachteile

- ❌ Schwerer als VitePress
- ❌ Keine native Nx-Integration
- ❌ Längere Build-Zeiten

### Option 4: TypeDoc + Custom Site

#### Vorteile

- ✅ Automatische API-Dokumentation aus TypeScript
- ✅ Plugin für Monorepos: `@enio.ai/typedoc`

#### Nachteile

- ❌ Komplexe Konfiguration für Nx Monorepos
- ❌ Limitiert auf API-Dokumentation
- ❌ Keine Guide/Tutorial-Seiten

**Quellen:**

- [TypeDoc Nx Monorepo Issues](https://github.com/TypeStrong/typedoc/issues/2005)
- [@enio.ai/typedoc Nx Plugin](https://www.npmjs.com/package/@enio.ai/typedoc)

### Option 5: Compodoc (Angular-spezifisch)

#### Vorteile

- ✅ Speziell für Angular entwickelt
- ✅ Automatische Komponentendokumentation

#### Nachteile

- ❌ Schwierig, mehrere Libraries in einer Site zu vereinen
- ❌ Funktioniert nicht für Non-Angular Libraries
- ❌ Bekannte Probleme mit Nx Workspaces

**Quellen:**

- [Compodoc Nx Integration Guide](https://nx.dev/docs/technologies/test-tools/storybook/guides/angular-storybook-compodoc)
- [Compodoc Multiple Apps Issue](https://github.com/compodoc/compodoc/issues/719)

## Empfohlene Lösung: Hybrid-Ansatz

### Kombination: VitePress (Hauptdokumentation) + Storybook (Komponenten-Showcase)

Dieser Ansatz bietet das Beste aus beiden Welten:

#### 1. **VitePress für zentrale Dokumentation** (`apps/docs`)

**Inhalte:**

- Hauptseite mit Repository-Überblick
- Getting Started Guide
- Architektur-Dokumentation
- API-Dokumentation (generiert via TypeDoc)
- Tutorials und Best Practices
- Changelog und Migration Guides
- Links zu Storybook

**Struktur:**

```
apps/docs/
├── .vitepress/
│   ├── config.ts          # VitePress Konfiguration
│   └── theme/             # Custom Theme (optional)
├── guide/
│   ├── getting-started.md
│   └── architecture.md
├── libraries/
│   ├── gravatar.md
│   ├── ng-utils.md
│   ├── material-right-sheet.md
│   ├── rxjs-operators.md
│   ├── sharp-operators.md
│   ├── validators.md
│   ├── decorators.md
│   ├── mutation-observer.md
│   └── resize-observer.md
├── api/                   # Auto-generierte API Docs
└── index.md              # Hauptseite
```

#### 2. **Storybook für Angular-Komponenten** (`apps/storybook`)

**Inhalte:**

- Interaktive Beispiele für alle Angular-Komponenten
- Material Right Sheet Showcase
- Angular Utils (Pipes, etc.) mit Live-Beispielen
- Gravatar Komponente mit verschiedenen Konfigurationen

**Shared Storybook Setup:**

- Eine zentrale Storybook-Instanz
- Importiert Stories aus allen Angular Libraries
- Organisiert nach Library-Namen

## Detaillierter Implementierungsplan

### Phase 1: VitePress Setup (apps/docs)

#### Schritt 1.1: VitePress App erstellen

```bash
# Manuell als Vite-App erstellen
nx g @nx/vite:app docs --directory=apps/docs

# VitePress Dependencies installieren
npm install -D vitepress vue
```

#### Schritt 1.2: VitePress konfigurieren

- `.vitepress/config.ts` erstellen mit Navigation
- Sidebar-Struktur für alle Libraries
- Theme-Anpassungen (Farben, Logo)

#### Schritt 1.3: TypeDoc Integration

```bash
# TypeDoc installieren
npm install -D typedoc @enio.ai/typedoc

# Nx Target für TypeDoc-Generierung
nx g @enio.ai/typedoc:configuration
```

Konfiguration in `typedoc.json`:

```json
{
  "entryPointStrategy": "packages",
  "entryPoints": [
    "libs/gravatar",
    "libs/ng/utils",
    "libs/rxjs/operators"
    // ... alle Libraries
  ],
  "out": "apps/docs/api",
  "plugin": ["@knodes/typedoc-plugin-monorepo-readmes"]
}
```

#### Schritt 1.4: Markdown-Seiten erstellen

- Für jede Library eine dedizierte Seite
- Einheitliches Template:
  - Überblick
  - Installation
  - Verwendung
  - API-Referenz (Link zu TypeDoc)
  - Beispiele
  - Migration Guide (falls relevant)

#### Schritt 1.5: Nx Targets konfigurieren

`apps/docs/project.json`:

```json
{
  "targets": {
    "docs:generate": {
      "executor": "nx:run-commands",
      "options": {
        "commands": ["typedoc", "nx run docs:build"],
        "parallel": false
      }
    },
    "serve": {
      "executor": "@nx/vite:dev-server",
      "options": {
        "buildTarget": "docs:build"
      }
    },
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "vitepress build apps/docs"
      }
    },
    "preview": {
      "executor": "nx:run-commands",
      "options": {
        "command": "vitepress preview apps/docs"
      }
    }
  }
}
```

### Phase 2: Storybook Setup (Shared Instance)

#### Schritt 2.1: Storybook hinzufügen

```bash
# Nx Storybook Plugin installieren
nx add @nx/storybook

# Storybook für Angular Libraries konfigurieren
nx g @nx/angular:storybook-configuration gravatar --generateStories
nx g @nx/angular:storybook-configuration ng-utils --generateStories
nx g @nx/angular:storybook-configuration material-right-sheet --generateStories
nx g @nx/angular:storybook-configuration validators --generateStories
nx g @nx/angular:storybook-configuration decorators --generateStories
nx g @nx/angular:storybook-configuration mutation-observer --generateStories
nx g @nx/angular:storybook-configuration resize-observer --generateStories
```

#### Schritt 2.2: Shared Storybook erstellen (Optional)

Falls gewünscht, eine zentrale Storybook-App:

```bash
# Shared Storybook App
nx g @nx/angular:application storybook-host --standalone=false
```

Konfiguration in `.storybook/main.ts`:

```typescript
const config = {
  stories: ['../libs/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
};
```

#### Schritt 2.3: Stories organisieren

- Auto-generierte Stories überprüfen und verbessern
- MDX-Dateien für Library-Übersichten hinzufügen
- Controls und Actions konfigurieren

### Phase 3: Automatisierung und CI/CD

#### Schritt 3.1: Nx Targets für Dokumentation

Root-Level Target in `nx.json` oder `package.json`:

```json
{
  "scripts": {
    "docs:dev": "nx run docs:serve",
    "docs:build": "nx run docs:docs:generate",
    "docs:preview": "nx run docs:preview",
    "storybook:dev": "nx run storybook:storybook",
    "storybook:build": "nx run storybook:build-storybook"
  }
}
```

#### Schritt 3.2: GitHub Actions Workflow

`.github/workflows/docs.yml`:

```yaml
name: Documentation

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build VitePress docs
        run: npm run docs:build

      - name: Build Storybook
        run: npm run storybook:build

      - name: Upload artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: |
            apps/docs/.vitepress/dist
            dist/storybook
```

#### Schritt 3.3: Deployment

**Option A: GitHub Pages**

```yaml
deploy:
  needs: build-docs
  runs-on: ubuntu-latest
  permissions:
    pages: write
    id-token: write
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
  steps:
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

**Option B: Netlify/Vercel**

- Build Command: `npm run docs:build && npm run storybook:build`
- Publish Directory: `apps/docs/.vitepress/dist`

### Phase 4: Content-Erstellung

#### Schritt 4.1: README Migration

- Bestehende README.md Dateien in VitePress Markdown konvertieren
- Konsistente Struktur für alle Library-Seiten

#### Schritt 4.2: API-Dokumentation

- TypeDoc-Kommentare in Source-Code hinzufügen
- JSDoc für alle öffentlichen APIs
- Beispiele in Code-Kommentaren

#### Schritt 4.3: Tutorials erstellen

- Getting Started Guide
- Common Use Cases pro Library
- Integration Guides
- Migration Guides (bei Breaking Changes)

#### Schritt 4.4: Maintenance

- CONTRIBUTING.md für Dokumentations-Updates
- Automatische Changelog-Integration aus nx release
- Versioning-Strategy für Docs

## Projektstruktur (Finale Ansicht)

```
dasch-ng/
├── apps/
│   ├── docs/                       # VitePress Dokumentation
│   │   ├── .vitepress/
│   │   │   ├── config.ts
│   │   │   └── theme/
│   │   ├── guide/
│   │   ├── libraries/
│   │   ├── api/                    # Auto-generiert via TypeDoc
│   │   ├── index.md
│   │   └── project.json
│   └── storybook/                  # (Optional) Shared Storybook
│       └── project.json
├── libs/
│   ├── gravatar/
│   │   └── .storybook/            # Library-spezifische Stories
│   ├── ng/utils/
│   │   └── .storybook/
│   └── ...
├── typedoc.json                    # TypeDoc Konfiguration
└── nx.json
```

## Nx-Integration Score

| Tool       | Nx-Integration | Bewertung                                           |
| ---------- | -------------- | --------------------------------------------------- |
| Storybook  | ⭐⭐⭐⭐⭐     | Native Plugin, Generator verfügbar                  |
| VitePress  | ⭐⭐⭐         | Manuelles Setup, aber als Vite-App gut integrierbar |
| TypeDoc    | ⭐⭐⭐         | Plugin verfügbar (@enio.ai/typedoc)                 |
| Compodoc   | ⭐⭐           | Eingeschränkt, keine Multi-Library Support          |
| Docusaurus | ⭐⭐           | Manuelles Setup erforderlich                        |

## Zeitaufwand-Schätzung

- **Phase 1 (VitePress Setup):** 1-2 Tage
- **Phase 2 (Storybook Setup):** 1 Tag
- **Phase 3 (CI/CD):** 0.5 Tage
- **Phase 4 (Content):** 2-3 Tage (je nach Umfang)

**Gesamt:** 4.5 - 6.5 Tage

## Wartung und Updates

### Automatisierung

- TypeDoc läuft vor jedem Docs-Build
- Storybook Stories werden automatisch generiert bei neuen Komponenten
- Changelog wird aus Git-Tags generiert (bereits via nx release vorhanden)

### Developer Workflow

1. Code in Library schreiben
2. JSDoc/TypeDoc Kommentare hinzufügen
3. Storybook Stories erstellen (für UI-Komponenten)
4. Markdown-Seite in VitePress aktualisieren (optional)
5. Commit & Push
6. CI baut automatisch Dokumentation

## Weitere Empfehlungen

### MDX in VitePress

- Erlaubt Vue-Komponenten in Markdown
- Kann Live-Code-Beispiele einbetten

### Suche

- VitePress hat integrierte Suche
- Alternativ: Algolia DocSearch (kostenlos für Open Source)

### Analytics

- Google Analytics Integration
- Plausible Analytics (privacy-friendly)

### Versionierung

- VitePress unterstützt Multi-Version-Docs
- Nützlich wenn Libraries unterschiedliche Major Versions haben

## Beispiel-Repositories

- [Nx Shared Storybook](https://github.com/juristr/nx-shared-storybook) - Shared Storybook Setup
- [Nx Official Docs](https://github.com/nrwl/nx) - VitePress + TypeDoc Beispiel
- [Vue.js Docs](https://github.com/vuejs/docs) - VitePress Best Practice

## Quellen

### Storybook

- [Nx Storybook Plugin Overview](https://nx.dev/docs/technologies/test-tools/storybook/introduction)
- [Set up Storybook for Angular Projects](https://nx.dev/storybook/overview-angular)
- [Build your design system with Storybook + Nx](https://blog.nrwl.io/build-your-design-system-with-storybook-nx-e3bde4087ad8)
- [Nx Shared Storybook Example](https://github.com/juristr/nx-shared-storybook)

### TypeDoc

- [TypeDoc Nx Monorepo Issues](https://github.com/TypeStrong/typedoc/issues/2005)
- [@enio.ai/typedoc Nx Plugin](https://www.npmjs.com/package/@enio.ai/typedoc)

### Compodoc

- [Compodoc Nx Integration](https://nx.dev/docs/technologies/test-tools/storybook/guides/angular-storybook-compodoc)
- [Compodoc Multiple Apps Issue](https://github.com/compodoc/compodoc/issues/719)

### Nx General

- [Nx Official Documentation](https://nx.dev/)
- [Enterprise Angular Monorepo Patterns](https://nx.dev/blog/enterprise-angular-book)

## Nächste Schritte

1. **Entscheidung treffen:** VitePress, Storybook oder Hybrid-Ansatz?
2. **Prototyp erstellen:** Kleines Setup mit 1-2 Libraries testen
3. **Team-Review:** Feedback zur Struktur einholen
4. **Vollständige Implementierung:** Alle Libraries einbinden
5. **Deployment konfigurieren:** GitHub Pages, Netlify oder Vercel
6. **Continuous Improvement:** Regelmäßige Updates basierend auf Feedback

---

**Erstellt am:** 2025-12-24
**Für Repository:** dasch-ng (Nx Monorepo)
