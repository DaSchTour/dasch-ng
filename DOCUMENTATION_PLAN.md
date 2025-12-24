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

### Option 1: VitePress + TypeDoc (✅ EMPFOHLEN)

Diese Kombination ist **ideal für Utility-Libraries, Pipes, Direktiven und Hilfsfunktionen**.

#### Vorteile

- ✅ Sehr schnell (Vite-basiert)
- ✅ Markdown-basiert, einfach zu pflegen
- ✅ Exzellentes SEO und Performance
- ✅ Versionierung möglich
- ✅ Funktioniert für alle Library-Typen (Angular & Non-Angular)
- ✅ **TypeDoc generiert automatisch Parameter-Dokumentation**
- ✅ **Perfekt für Funktionen, Decorators, Operators**
- ✅ Gut für Tutorials, Guides und API-Docs
- ✅ Code-Beispiele direkt in Markdown
- ✅ Syntax-Highlighting für TypeScript/Angular

#### Warum kein Storybook?

Storybook ist primär für UI-Komponenten gedacht. Da das Monorepo hauptsächlich **Hilfsfunktionen, Decorators, Pipes, Direktiven und Operators** enthält, ist eine klassische API-Dokumentation mit TypeDoc deutlich besser geeignet:

- Parameter-Typen werden automatisch dokumentiert
- JSDoc-Kommentare werden übernommen
- Beispiele können in Markdown-Code-Blöcken gezeigt werden
- Einfacher zu warten als interaktive Komponenten

#### Setup-Ansatz

- Als eigenständige App in `apps/docs` erstellen
- TypeDoc für automatische API-Dokumentation
- Markdown-Files pro Library mit Verwendungsbeispielen
- Code-Beispiele für Pipes, Direktiven und Funktionen

### Option 2: TypeDoc Standalone

#### Vorteile

- ✅ Automatische API-Dokumentation aus TypeScript
- ✅ Plugin für Monorepos: `@enio.ai/typedoc`

#### Nachteile

- ❌ Komplexe Konfiguration für Nx Monorepos
- ❌ Limitiert auf API-Dokumentation
- ❌ Keine Guide/Tutorial-Seiten ohne zusätzliches Tool

**Quellen:**

- [TypeDoc Nx Monorepo Issues](https://github.com/TypeStrong/typedoc/issues/2005)
- [@enio.ai/typedoc Nx Plugin](https://www.npmjs.com/package/@enio.ai/typedoc)

### Option 3: Compodoc (Angular-spezifisch)

#### Vorteile

- ✅ Speziell für Angular entwickelt
- ✅ Automatische Komponentendokumentation

#### Nachteile

- ❌ Schwierig, mehrere Libraries in einer Site zu vereinen
- ❌ Funktioniert nicht für Non-Angular Libraries
- ❌ Bekannte Probleme mit Nx Workspaces
- ❌ Nicht ideal für Utility-Funktionen

**Quellen:**

- [Compodoc Nx Integration](https://nx.dev/docs/technologies/test-tools/storybook/guides/angular-storybook-compodoc)
- [Compodoc Multiple Apps Issue](https://github.com/compodoc/compodoc/issues/719)

### Option 4: Storybook (Nicht empfohlen für diesen Use-Case)

#### Vorteile

- ✅ Native Nx-Integration über `@nx/storybook`
- ✅ Interaktive Komponentenvorschau

#### Nachteile

- ❌ **Primär für UI-Komponenten, nicht für Utility-Libraries**
- ❌ **Overhead für einfache Funktionen/Pipes/Direktiven**
- ❌ Nicht ideal für Non-Angular Libraries (rxjs-operators, sharp-operators)

**Quellen:**

- [Nx Storybook Plugin Overview](https://nx.dev/docs/technologies/test-tools/storybook/introduction)

## Empfohlene Lösung: VitePress + TypeDoc

### VitePress als zentrale Dokumentationsplattform mit integrierter TypeDoc API-Dokumentation

Diese Lösung ist **optimal für Utility-Libraries** mit Fokus auf:

- Hilfsfunktionen und Utilities
- TypeScript Decorators
- RxJS und Sharp Operators
- Angular Pipes und Direktiven
- Form Validators

#### **VitePress Dokumentation** (`apps/docs`)

**Inhalte:**

- Hauptseite mit Repository-Überblick
- Getting Started Guide pro Library
- Architektur-Dokumentation
- **API-Dokumentation (automatisch generiert via TypeDoc)**
- **Code-Beispiele für Pipes, Direktiven und Funktionen**
- Tutorials und Best Practices
- Changelog und Migration Guides

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
│   ├── gravatar.md        # Verwendungsbeispiele + Link zu API
│   ├── ng-utils.md        # Pipe/Direktiven-Beispiele
│   ├── material-right-sheet.md
│   ├── rxjs-operators.md  # Operator-Beispiele
│   ├── sharp-operators.md # Operator-Beispiele
│   ├── validators.md      # Validator-Beispiele
│   ├── decorators.md      # Decorator-Beispiele
│   ├── mutation-observer.md
│   └── resize-observer.md
├── api/                   # Auto-generierte TypeDoc API-Docs
│   ├── gravatar/
│   ├── ng-utils/
│   ├── rxjs-operators/
│   └── ...
└── index.md              # Hauptseite
```

**Beispiel für Library-Seite (z.B. `libraries/decorators.md`):**

````markdown
# Decorators

Sammlung von nützlichen TypeScript Decorators.

## Installation

\`\`\`bash
npm install @dasch-ng/decorators
\`\`\`

## @Debounce

Verzögert die Ausführung einer Methode.

### Verwendung

\`\`\`typescript
import { Debounce } from '@dasch-ng/decorators';

class SearchComponent {
@Debounce(300)
onSearch(query: string) {
// Wird erst nach 300ms Inaktivität ausgeführt
this.searchService.search(query);
}
}
\`\`\`

### API-Referenz

Siehe [Debounce API-Dokumentation](../api/decorators/functions/Debounce.html)

## @Memoize

Cached Rückgabewerte von Funktionen.

[... weitere Beispiele]
\`\`\`

## Detaillierter Implementierungsplan

### Phase 1: VitePress Setup (apps/docs)

#### Schritt 1.1: VitePress App erstellen

```bash
# Manuell als Vite-App erstellen
nx g @nx/vite:app docs --directory=apps/docs

# VitePress Dependencies installieren
npm install -D vitepress vue
```
````

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

### Phase 2: Automatisierung und CI/CD

#### Schritt 2.1: Nx Targets für Dokumentation

Root-Level Target in `nx.json` oder `package.json`:

```json
{
  "scripts": {
    "docs:dev": "nx run docs:serve",
    "docs:build": "nx run docs:docs:generate",
    "docs:preview": "nx run docs:preview"
  }
}
```

#### Schritt 2.2: GitHub Actions Workflow

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

      - name: Generate TypeDoc API docs
        run: npx typedoc

      - name: Build VitePress docs
        run: npm run docs:build

      - name: Upload artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: apps/docs/.vitepress/dist
```

#### Schritt 2.3: Deployment

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

- Build Command: `npx typedoc && npm run docs:build`
- Publish Directory: `apps/docs/.vitepress/dist`

### Phase 3: Content-Erstellung

#### Schritt 3.1: README Migration & Library-Seiten

- Bestehende README.md Dateien in VitePress Markdown konvertieren
- Konsistente Struktur für alle Library-Seiten
- **Code-Beispiele für Pipes:**

  ```markdown
  ## IsNullPipe

  \`\`\`html

  <div *ngIf="user$ | async | isNull">Kein User geladen</div>
  \`\`\`
  ```

- **Code-Beispiele für Direktiven:**

  ```markdown
  ## GravatarDirective

  \`\`\`html
  <img [gravatarEmail]="user.email" alt="Avatar">
  \`\`\`
  ```

#### Schritt 3.2: TypeDoc Integration & JSDoc-Kommentare

- **TypeDoc-Kommentare in Source-Code hinzufügen**
- **JSDoc für alle öffentlichen APIs mit Parameter-Beschreibungen:**
  ````typescript
  /**
   * Debounces a method call by the specified time.
   *
   * @param delay - The delay in milliseconds
   * @returns Method decorator
   *
   * @example
   * ```typescript
   * class Component {
   *   @Debounce(300)
   *   onSearch(query: string) {
   *     this.search(query);
   *   }
   * }
   * ```
   */
  export function Debounce(delay: number) { ... }
  ````
- Beispiele in JSDoc-Kommentaren (werden von TypeDoc übernommen)

#### Schritt 3.3: Tutorials & Guides erstellen

- Getting Started Guide pro Library
- Common Use Cases:
  - Wie verwendet man RxJS Operators?
  - Wie nutzt man Decorators?
  - Validator-Beispiele für Forms
- Integration Guides
- Migration Guides (bei Breaking Changes)

#### Schritt 3.4: Maintenance-Strategie

- CONTRIBUTING.md für Dokumentations-Updates
- Automatische Changelog-Integration aus nx release
- Versioning-Strategy für Docs
- **Regel: Bei jedem neuen Export JSDoc hinzufügen**

## Projektstruktur (Finale Ansicht)

```
dasch-ng/
├── apps/
│   └── docs/                       # VitePress Dokumentation
│       ├── .vitepress/
│       │   ├── config.ts          # Navigation & Sidebar
│       │   └── theme/             # Custom Theme (optional)
│       ├── guide/
│       │   ├── getting-started.md
│       │   └── architecture.md
│       ├── libraries/
│       │   ├── gravatar.md        # Mit Code-Beispielen
│       │   ├── ng-utils.md        # Pipe/Direktiven-Beispiele
│       │   ├── rxjs-operators.md  # Operator-Beispiele
│       │   ├── decorators.md      # Decorator-Beispiele
│       │   └── ...
│       ├── api/                    # Auto-generiert via TypeDoc
│       │   ├── gravatar/
│       │   ├── ng-utils/
│       │   ├── rxjs-operators/
│       │   └── ...
│       ├── index.md               # Hauptseite
│       └── project.json
├── libs/
│   ├── gravatar/
│   │   └── src/
│   │       └── *.ts               # Mit JSDoc-Kommentaren
│   ├── ng/utils/
│   │   └── src/
│   │       └── *.ts               # Mit JSDoc-Kommentaren
│   └── ...
├── typedoc.json                    # TypeDoc Konfiguration
└── nx.json
```

## Nx-Integration Score

| Tool                | Nx-Integration | Bewertung                                  | Für Utility-Libs |
| ------------------- | -------------- | ------------------------------------------ | ---------------- |
| VitePress + TypeDoc | ⭐⭐⭐⭐       | Gute Integration, TypeDoc Plugin verfügbar | ✅ Empfohlen     |
| TypeDoc Standalone  | ⭐⭐⭐         | Plugin verfügbar (@enio.ai/typedoc)        | ⚠️ Nur API       |
| Compodoc            | ⭐⭐           | Eingeschränkt, keine Multi-Library Support | ❌ Nicht ideal   |
| Storybook           | ⭐⭐⭐⭐⭐     | Native Plugin, aber für UI-Komponenten     | ❌ Overhead      |

## Zeitaufwand-Schätzung

- **Phase 1 (VitePress + TypeDoc Setup):** 1-2 Tage
- **Phase 2 (CI/CD):** 0.5 Tage
- **Phase 3 (Content & JSDoc):** 2-3 Tage (je nach Umfang)

**Gesamt:** 3.5 - 5.5 Tage

**Vereinfachung gegenüber Hybrid-Ansatz:** -1 Tag (kein Storybook Setup nötig)

## Wartung und Updates

### Automatisierung

- TypeDoc läuft automatisch vor jedem Docs-Build
- API-Dokumentation wird bei jedem Deployment aktualisiert
- Changelog wird aus Git-Tags generiert (bereits via nx release vorhanden)
- JSDoc-Beispiele werden direkt in API-Docs übernommen

### Developer Workflow

1. **Code in Library schreiben** (Funktion, Pipe, Direktive, Decorator, etc.)
2. **JSDoc-Kommentare mit @param, @returns, @example hinzufügen:**
   ````typescript
   /**
    * Validates email addresses.
    * @param control - The form control to validate
    * @returns Validation error or null
    * @example
    * ```typescript
    * this.form = new FormGroup({
    *   email: new FormControl('', [emailValidator])
    * });
    * ```
    */
   export function emailValidator(control: AbstractControl) { ... }
   ````
3. **Markdown-Seite in VitePress mit Verwendungsbeispielen aktualisieren** (optional, aber empfohlen)
4. **Commit & Push**
5. **CI generiert automatisch TypeDoc und baut VitePress**
6. **Dokumentation wird deployed**

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

## Beispiel-Repositories für VitePress + TypeDoc

- [Nx Official Docs](https://github.com/nrwl/nx) - VitePress Setup in Nx Monorepo
- [Vue.js Docs](https://github.com/vuejs/docs) - VitePress Best Practices
- [TypeDoc Examples](https://github.com/TypeStrong/typedoc) - TypeDoc mit Monorepo-Support
- [Vite Docs](https://github.com/vitejs/vite) - VitePress mit API-Dokumentation

## Quellen

### VitePress

- [VitePress Official Documentation](https://vitepress.dev/)
- [VitePress Guide](https://vitepress.dev/guide/what-is-vitepress)
- [VitePress Markdown Extensions](https://vitepress.dev/guide/markdown)

### TypeDoc

- [TypeDoc Official Documentation](https://typedoc.org/)
- [TypeDoc Nx Monorepo Issues](https://github.com/TypeStrong/typedoc/issues/2005)
- [@enio.ai/typedoc Nx Plugin](https://www.npmjs.com/package/@enio.ai/typedoc)
- [TypeDoc JSDoc @example Tag](https://typedoc.org/guides/tags/)

### Nx General

- [Nx Official Documentation](https://nx.dev/)
- [Enterprise Angular Monorepo Patterns](https://nx.dev/blog/enterprise-angular-book)
- [Nx Vite Plugin](https://nx.dev/nx-api/vite)

## Nächste Schritte

1. ✅ **Entscheidung getroffen:** VitePress + TypeDoc (optimal für Utility-Libraries)
2. **Prototyp erstellen:**
   - VitePress App in `apps/docs` anlegen
   - TypeDoc konfigurieren
   - 1-2 Libraries als Beispiel dokumentieren (z.B. decorators, rxjs-operators)
3. **JSDoc-Kommentare hinzufügen:**
   - Mit einer Library starten (z.B. decorators)
   - Alle Exports mit JSDoc versehen
   - @example Tags für Verwendungsbeispiele
4. **Vollständige Implementierung:**
   - Alle 9 Libraries einbinden
   - Markdown-Seiten mit Code-Beispielen erstellen
5. **CI/CD konfigurieren:** GitHub Actions für automatisches Deployment
6. **Deployment:** GitHub Pages, Netlify oder Vercel
7. **Continuous Improvement:** Regelmäßige Updates basierend auf Feedback

## Vorteile für dieses Monorepo

Diese Lösung ist besonders gut geeignet, weil:

- ✅ **Hauptsächlich Utility-Funktionen:** TypeDoc dokumentiert Parameter automatisch
- ✅ **Pipes & Direktiven:** Code-Beispiele in Markdown sind übersichtlicher als Storybook
- ✅ **Decorators:** JSDoc @example perfekt für Decorator-Verwendung
- ✅ **RxJS/Sharp Operators:** TypeDoc generiert Typ-Informationen automatisch
- ✅ **Validators:** Formular-Beispiele in Markdown sind verständlicher
- ✅ **Wartbarkeit:** JSDoc im Code ist näher an der Implementierung
- ✅ **Performance:** VitePress ist schneller als Storybook
- ✅ **SEO:** Bessere Auffindbarkeit durch statische HTML-Seiten

---

**Erstellt am:** 2025-12-24
**Für Repository:** dasch-ng (Nx Monorepo)
