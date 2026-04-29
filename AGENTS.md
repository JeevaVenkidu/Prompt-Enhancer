# AGENTS.md — Agentic Coding Guidelines for Prompt Enhancer

This file provides coding standards and development instructions for agents working on the Prompt Enhancer Chrome Extension codebase.

## Project Overview

- **Type**: Chrome Extension (Manifest V3)
- **Language**: Vanilla JavaScript (ES6+)
- **Framework**: None (lightweight, no dependencies)
- **Storage**: Chrome Storage API (`chrome.storage.sync` and `chrome.storage.local`)

## Installation & Development

### Loading the Extension in Chrome

1. Navigate to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `prompt-enhancer` folder

### Testing Changes

Since this is a vanilla Chrome Extension with no build system:

1. Make your code changes
2. Go to `chrome://extensions/`
3. Click the **reload icon** on the extension card
4. Refresh the target AI platform page (ChatGPT, Claude, etc.) to test

### No Test Suite

This repository has **no automated tests**. Test manually by:

1. Loading the extension in Chrome
2. Visiting each supported platform: ChatGPT, Claude, Gemini, Grok, DeepSeek, Perplexity
3. Testing all templates (General, Coding, Writing, Analysis, Creative, Learning, Academic, Business)
4. Testing all enhancement levels (Light, Medium, Aggressive)
5. Testing offline and online modes (with and without API key)

---

## Code Style Guidelines

### General Principles

- **Vanilla JavaScript only** — Do not add frameworks, libraries, or npm packages
- **Manifest V3** — Use service worker (not persistent background page)
- **ES6+ features** — Use const/let, arrow functions, template literals, destructuring
- No TypeScript — This project uses plain JavaScript

### File Organization

```
lib/           Core enhancement engine (shared across all contexts)
  - enhancer.js    Main enhancement algorithm
  - templates.js   Pre-built templates
content/       Content script (injected into AI platform pages)
  - content.js    Detects inputs, injects enhance button
popup/         Extension popup UI
  - popup.html, popup.js, popup.css
options/       Settings page
  - options.html, options.js
background/   Service worker
  - service-worker.js
styles/        Injected CSS
  - content.css
```

### JavaScript Patterns

#### IIFE Pattern for Modules

Use Immediately Invoked Function Expressions to encapsulate module logic:

```javascript
// Good
const MyModule = (() => {
  // Private state
  const config = { key: 'value' };
  
  // Private function
  function processData(input) {
    return input.trim();
  }
  
  // Public API
  return {
    process: processData,
  };
})();

// Make globally available
if (typeof window !== 'undefined') {
  window.MyModule = MyModule;
}
```

#### Event Listeners

Use standard addEventListener pattern:

```javascript
// Good
element.addEventListener('click', (e) => {
  e.preventDefault();
  handleClick();
});

// Bad — avoid inline handlers
element.onclick = handleClick;
```

#### Async/Await with Error Handling

Always wrap async operations in try/catch:

```javascript
async function performAction() {
  try {
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    throw error; // or return fallback
  }
}
```

#### Chrome Storage API Wrapper

Use Promises for async storage operations:

```javascript
function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys, resolve);
  });
}

function setStorage(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, resolve);
  });
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `currentTemplate`, `isEnhancing` |
| Constants | UPPER_SNAKE_CASE | `MAX_HISTORY_SIZE = 50` |
| Functions | camelCase | `enhancePrompt()`, `detectCategory()` |
| Classes | PascalCase | (not used in this project) |
| CSS Classes | kebab-case | `enhance-btn`, `template-card` |
| IDs | camelCase | `template-grid`, `result-text` |
| File names | kebab-case | `service-worker.js`, `content-script.js` |

### JSDoc Comments

Document all public functions with JSDoc:

```javascript
/**
 * Main enhancement function
 * @param {string} prompt - The original user prompt
 * @param {object} options - Enhancement options (template, level, addRole, etc.)
 * @returns {string} Enhanced prompt
 */
function enhance(prompt, options = {}) {
  // ...
}
```

### Imports

#### Service Worker Import

Use `importScripts` for loading shared modules:

```javascript
importScripts('/lib/enhancer.js', '/lib/templates.js');
```

#### Content Scripts

Scripts are already loaded via manifest.json content_scripts array. Ensure dependent scripts load first via manifest order.

### Error Handling

- Use `try/catch` for all async operations
- Log errors to console with context: `console.error('[Module] Action failed:', error)`
- Show user-friendly errors in UI via toast notifications
- Throw descriptive Error objects: `throw new Error('Descriptive message')`

### Logging

- Use `console.log` for startup/injection messages
- Use `console.warn` for non-critical issues (e.g., API fallback)
- Use `console.error` for actual errors
- Prefix with module name: `'[Prompt Enhancer] Message'`

### Console Prefix Format

```javascript
console.log('[Prompt Enhancer] Detected platform:', platformName);
console.warn('[Prompt Enhancer] API failed, falling back to template');
console.error('[Prompt Enhancer] Enhancement failed:', error);
```

### DOM Manipulation

- Use `document.querySelector` and `document.querySelectorAll`
- Create elements with `document.createElement`
- Use template literals for innerHTML (avoid eval)
- Scope selectors to specific containers when possible

### Chrome Extension APIs

- Use `chrome.storage.sync` for user preferences (API key, default template)
- Use `chrome.storage.local` for history data
- Use `chrome.runtime.sendMessage` for cross-context communication
- Use `chrome.runtime.onMessage.addListener` for receiving messages

### Security Guidelines

- **Never log or expose API keys** — Store in chrome.storage.sync, never in code
- **Validate inputs** — Check for empty prompts before processing
- **Escape HTML** — Use textContent or proper escaping for user-generated content in innerHTML
- **Use CSP-compliant patterns** — No eval(), new Function(), or inline scripts

### Performance Considerations

- Lazy-load features when possible
- Use MutationObserver for dynamic content (content script)
- Limit history to 50 entries
- Debounce rapid UI updates

---

## Common Tasks

### Modifying Enhancement Logic

Edit `lib/enhancer.js`:

- `enhance(prompt, options)` — Main entry point
- `analyzePrompt(prompt)` — Detect what's missing
- Category configs in `CATEGORY_CONFIG` object

### Adding New Templates

Edit `lib/templates.js`:

- Add new key to `templates` object
- Include: name, icon, description, prefix, suffix

### Adding New Platforms

Edit `manifest.json` and `content/content.js`:

- Add domain to `content_scripts[].matches` array
- Add platform selectors to `PLATFORM_SELECTORS` object in content.js

### Testing API Providers

Edit `background/service-worker.js`:

- Add new provider case in `handleAPIEnhancement`
- Configure endpoint and model in respective function

---

## VS Code Settings

The project includes minimal VS Code settings in `.vscode/settings.json`:

```json
{
  "git.ignoreLimitWarning": true
}
```

No additional linters or formatters are configured. For this vanilla JS project, manual code review is sufficient.

---

## Useful Commands

- **Reload extension**: `chrome://extensions/` → click reload icon
- **View logs**: Right-click extension → "Inspect popup" / "Inspect views: Service Worker"
- **Clear storage**: Click extension → Settings → "Clear History"
- **Test API**: Extension → Settings → "Test Connection"

---

## Questions?

Refer to:
- Official docs: https://developer.chrome.com/docs/extensions/
- Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- Storage API: https://developer.chrome.com/docs/extensions/storage/