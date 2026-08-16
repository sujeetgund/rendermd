# Contributing to rendermd

Thank you for your interest in contributing to **rendermd**! 

To maintain the project's high standards of **performance, zero-backend simplicity, lightweight bundle size, and visual craftsmanship**, we enforce strict development and architectural guidelines. Please review this document carefully before submitting issues or pull requests.

---

## 🎯 Core Architectural Principles

1. **Lightweight First**: The initial JavaScript bundle sent to the client should remain exceptionally small. Heavy features (such as Mermaid diagram parsers and syntax highlighters) **must remain lazy-loaded on demand**.
2. **Local-First & Zero Backend**: `rendermd` runs entirely in the browser. Do not introduce server APIs, remote database dependencies, or mandatory cloud authentication.
3. **Unified Design Token System**: Features, UI elements, and plugins must consume CSS custom properties (`--md-*`) derived from `DocumentPreset`. Do not hardcode arbitrary CSS colors into components that would break preset switching.
4. **Canonical HTML Architecture**: All export formats (PDF, Standalone HTML, PNG, SVG) must produce consistent visual output derived from the canonical styled HTML representation.

---

## ⚠️ Strict Dependency Policy

`rendermd` takes dependency bloat very seriously. We intentionally avoid pulling in heavy npm packages when clean TypeScript, CSS, or native browser Web APIs (e.g. `ClipboardItem`, `URL.createObjectURL`, `window.print`) can accomplish the task.

### 📋 Mandatory Rule for Pull Requests Modifying `package.json`:

If your PR adds or updates any library in `dependencies` or `devDependencies`, **you MUST include the following Dependency Justification Block in your Pull Request description**:

```markdown
### 📦 Dependency Addition Justification
- **Package Name**: `example-package`
- **Bundle Size Impact**: ~XX kB (minified + gzipped, e.g., via bundlephobia.com)
- **Why existing dependencies cannot be used**: [Explain why react-markdown, prism, katex, lucide, etc. are insufficient]
- **Why native Web / Node APIs cannot be used**: [Explain why vanilla TypeScript/CSS cannot solve this]
- **Tree-shaking & Lazy-loading strategy**: [How is this protected from increasing the initial bundle?]
```

> [!CAUTION]
> **PRs adding dependencies without this justification will be closed automatically.**

---

## 🛠️ Development Workflow

### 1. Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/sujeetgund/rendermd.git
cd rendermd

# 2. Install dependencies (use pnpm)
pnpm install

# 3. Start local development server
pnpm dev
```

Visit `http://localhost:3000` to preview changes in real time.

### 2. Branching Strategy

- `master` / `main`: Production-ready code.
- Feature branches: `feat/your-feature-name`
- Bugfix branches: `fix/issue-description`
- Chore / docs: `docs/update-guide` or `chore/task-name`

### 3. Pre-flight Verification

Before committing or opening a PR, ensure that:

```bash
# 1. TypeScript and Next.js production build passes with zero errors
pnpm build

# 2. ESLint checks pass
pnpm lint
```

---

## 💻 Code Style & Conventions

- **TypeScript**: Strict type-checking is enabled. Avoid `any` types; use well-defined interfaces located in `types/`.
- **Styling**: Use Tailwind CSS utility classes and CSS variables (`--md-*`). Follow shadcn/ui component design patterns.
- **Component Placement**:
  - `components/editor/`: Editor workspace and formatting controls.
  - `components/preview/`: Markdown preview, KaTeX wrappers, Mermaid blocks.
  - `components/presets/`: Preset selectors and custom theme modals.
  - `components/studio/`: Top navigation, drawers, split pane layout.
  - `lib/presets/`: Preset definitions, design tokens, and CSS generators.
  - `lib/export/`: Exporter adapters (HTML, PDF, Image, Clipboard).

---

## 📝 Pull Request Checklist

Before submitting your PR, verify the following checklist:

- [ ] The PR title follows [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add sequence diagram template`, `fix: prevent diagram canvas taint`).
- [ ] Added unit or visual verification steps in the PR description.
- [ ] Ran `pnpm build` and verified zero TypeScript or Next.js compilation errors.
- [ ] If `package.json` was modified, provided the mandatory **Dependency Addition Justification**.
- [ ] Kept code clean, modular, and adhering to the `--md-*` design token system.

Thank you for helping make **rendermd** the best Markdown studio on the web! 🚀
