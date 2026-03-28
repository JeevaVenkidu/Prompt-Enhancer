# Contributing to Prompt Enhancer

First off, thank you for considering contributing to Prompt Enhancer! 🎉

Every contribution matters — whether it's fixing a typo, adding a new template, improving the UI, or squashing a bug.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## 📜 Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold respectful, inclusive, and constructive behavior.

---

## 🚀 Getting Started

### Prerequisites

- **Google Chrome** (or any Chromium-based browser)
- **Git**
- A text editor (VS Code recommended)

### Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Prompt-Enhancer.git
   cd Prompt-Enhancer
   ```

3. **Load the extension in Chrome**
   - Go to `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the project folder

4. **Make changes** — The extension auto-reloads for popup/options changes. For content script changes, click the 🔄 reload button on `chrome://extensions/`.

---

## 🛠️ How to Contribute

### 🐛 Fix a Bug

1. Check [existing issues](https://github.com/JeevaVenkidu/Prompt-Enhancer/issues)
2. If not reported, [create a new issue](#reporting-bugs)
3. Fork, fix, and submit a PR

### ✨ Add a Feature

1. Check if it's already been [suggested](https://github.com/JeevaVenkidu/Prompt-Enhancer/issues?q=is%3Aissue+label%3Aenhancement)
2. If not, [open a feature request](#suggesting-features)
3. Wait for approval before starting work
4. Fork, implement, and submit a PR

### 📋 Add a New Template

Templates live in `lib/templates.js`. To add one:

1. Add your template to the `templates` object:
   ```javascript
   myTemplate: {
     name: 'My Template',
     icon: '🎯',
     description: 'What this template does',
     prefix: 'You are a...',
     suffix: 'Please provide...',
   },
   ```

2. Test it via the popup and content script
3. Submit a PR

### 📝 Improve Documentation

- Fix typos, improve clarity, add examples
- No issue needed — just submit a PR

---

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes** with clear, descriptive commits
   ```bash
   git commit -m "feat: add marketing template"
   git commit -m "fix: enhance button position on Claude"
   git commit -m "docs: update installation instructions"
   ```

3. **Push to your fork**
   ```bash
   git push origin feat/my-feature
   ```

4. **Open a Pull Request** against `main`

5. **PR Requirements:**
   - [ ] Clear description of what changed and why
   - [ ] Tested on at least one supported platform (ChatGPT, Claude, or Gemini)
   - [ ] No console errors
   - [ ] Follows the [style guide](#style-guide)

---

## 🎨 Style Guide

### JavaScript

- **No frameworks** — Keep it vanilla JS
- **Use `const` and `let`** — Never `var`
- **Arrow functions** for callbacks
- **Meaningful variable names** — `enhanceButton` not `btn1`
- **JSDoc comments** for public functions
- **Use strict mode** in content scripts

### CSS

- **CSS Variables** for all colors and sizes
- **BEM-like naming** with `pe-` prefix for injected styles
- **Dark theme first** — Match the existing glassmorphism design
- **Smooth transitions** — Use `cubic-bezier(0.4, 0, 0.2, 1)`

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | CSS/formatting (no logic change) |
| `refactor:` | Code restructuring |
| `perf:` | Performance improvement |
| `test:` | Adding/updating tests |
| `chore:` | Maintenance tasks |

---

## 🐛 Reporting Bugs

[Open a bug report](https://github.com/JeevaVenkidu/Prompt-Enhancer/issues/new) with:

- **Title**: Brief description
- **Environment**: Chrome version, OS
- **Platform**: Which AI site (ChatGPT, Claude, Gemini)
- **Steps to reproduce**: Numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable

---

## 💡 Suggesting Features

[Open a feature request](https://github.com/JeevaVenkidu/Prompt-Enhancer/issues/new) with:

- **Title**: Brief feature name
- **Problem**: What problem does this solve?
- **Solution**: How should it work?
- **Alternatives**: Have you considered other approaches?
- **Use case**: Who benefits from this?

---

## 🎯 Good First Issues

Look for issues tagged with [`good first issue`](https://github.com/JeevaVenkidu/Prompt-Enhancer/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) — these are great for first-time contributors!

---

## ❓ Questions?

Open a [Discussion](https://github.com/JeevaVenkidu/Prompt-Enhancer/discussions) or create an issue with the `question` label.

---

Thank you for helping make Prompt Enhancer better! ✨
