# check-dep-compat

> 🔍 CLI tool to check `peerDependencies` compatibility, detect version mismatches, and suggest alternative packages.

## Features

- 🔎 **Scans all installed dependencies** for peer requirements.
- ❌ Highlights **major version conflicts** (e.g. Angular 18 required, 19 installed).
- ⚠️ Detects **minor version mismatches** (e.g. expected `^3.8.0`, you have `^3.7.2`).
- 📦 Suggests **alternative compatible packages** from the npm registry.
- 📁 Works with local `package.json` and `node_modules`

---

## Installation

Install globally:

```bash
npm install -g check-dep-compat
```

## Usage

```bash
npx check-dep-compat
```
