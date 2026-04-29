# Fix Plan: Prompt Enhancer Bugs

## Overview

Plan to fix all identified bugs in 3 phases, prioritized by severity.

---

## Files to Modify

| File | Changes |
|------|---------|
| `lib/enhancer.js` | 6 fixes |
| `background/service-worker.js` | 5 fixes |
| `content/content.js` | 3 fixes |
| `options/options.js` | 4 fixes |

---

## Phase 1: Critical (P0) — Security & Logic

### 1. XSS Fix — content/content.js

**Lines 217-223, 258-264, 297-303**

Replace innerHTML with textContent for user-controlled template data.

```javascript
// Before (lines 217-223)
item.innerHTML = `
  <span class="pe-dropdown-icon">${template.icon}</span>
  <span class="pe-dropdown-info">
    <span class="pe-dropdown-name">${template.name}</span>
    <span class="pe-dropdown-desc">${template.description}</span>
  </span>
`;

// After
const iconSpan = document.createElement('span');
iconSpan.className = 'pe-dropdown-icon';
iconSpan.textContent = template.icon;

const nameSpan = document.createElement('span');
nameSpan.className = 'pe-dropdown-name';
nameSpan.textContent = template.name;

const descSpan = document.createElement('span');
descSpan.className = 'pe-dropdown-desc';
descSpan.textContent = template.description;

const infoSpan = document.createElement('span');
infoSpan.className = 'pe-dropdown-info';
infoSpan.appendChild(nameSpan);
infoSpan.appendChild(descSpan);

item.appendChild(iconSpan);
item.appendChild(infoSpan);
```

Apply same pattern to:
- Level dropdown (lines 258-264)
- Mode dropdown (lines 297-303)

---

### 2. API Key Security — service-worker.js

**Line 106**

Use header instead of URL query param.

```javascript
// Before
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

// After
headers: { 
  'Content-Type': 'application/json',
  'X-goog-api-key': apiKey
}
```
Note: Remove `?key=` from URL. Gemini supports X-goog-api-key header.

---

### 3. Null Return — enhancer.js

**Line 55**

```javascript
// Before
if (!prompt || prompt.trim().length === 0) return prompt;

// After
if (!prompt || prompt.trim().length === 0) return '';
```

---

### 4. Input Validation — service-worker.js

**Line 55** (handleAPIEnhancement function)

```javascript
async function handleAPIEnhancement(message) {
  const { prompt, template, level, apiKey, apiProvider, action } = message;
  
  // Add validation
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Prompt is required and cannot be empty');
  }
  if (!level || !['light', 'medium', 'aggressive'].includes(level)) {
    level = 'medium'; // Default fallback
  }
  // ... rest
}
```

---

## Phase 2: High Priority (P1)

### 5. Period After Punctuation — enhancer.js

**Lines 131-133**

```javascript
// Before
if (!/[.!?]$/.test(enhanced.trim())) {
  enhanced = enhanced.trim() + '.';
}

// After
const trimmed = enhanced.trim();
if (!/[.!?])$"'}$]/.test(trimmed)) {
  enhanced = trimmed + '.';
} else {
  enhanced = trimmed;
}
```

---

### 6. Timeout on Fetch — service-worker.js

**Add to callGeminiAPI and callOpenAICompatibleAPI**

```javascript
async function callGeminiAPI(prompt, systemPrompt, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(url, { method: 'POST', signal: controller.signal, ... });
    clearTimeout(timeoutId);
    // ... process response
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('API request timed out (30s)');
    }
    throw error;
  }
}
```

---

### 7. Async Callback Anti-Pattern — options.js

**Lines 50-77** - Fix test-api handler

```javascript
$('#test-api').addEventListener('click', async () => {
  // Get storage data FIRST using Promise
  const storageData = await new Promise((resolve) => {
    chrome.storage.sync.get(['apiKey', 'apiProvider'], resolve);
  });
  
  const { apiKey, apiProvider } = storageData;
  
  if (!apiKey) {
    showToast('No API key saved. Please save one first.', 'error');
    return;
  }
  
  $('#test-api').textContent = 'Testing...';
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'ENHANCE_WITH_API',
      prompt: 'Say hello',
      template: 'general',
      level: 'light',
      apiKey,
      apiProvider: apiProvider || 'gemini',
    });

    if (response.error) throw new Error(response.error);
    showToast('API connection successful!', 'success');
  } catch (e) {
    showToast('API test failed: ' + e.message, 'error');
  } finally {
    $('#test-api').textContent = 'Test Connection';
  }
});
```

---

### 8. Toast Error Handling — options.js

**Lines 130-136**

```javascript
function showToast(msg, type) {
  const toast = $('#toast');
  if (!toast) return; // Guard
  try {
    toast.textContent = msg;
    toast.className = `toast toast-${type}`;
    requestAnimationFrame(() => toast.classList.add('toast-visible'));
    setTimeout(() => toast.classList.remove('toast-visible'), 3000);
  } catch (error) {
    console.error('[Prompt Enhancer] Toast failed:', error);
  }
}
```

---

## Phase 3: Medium (P2)

### 9. Category Mismatch — enhancer.js

**Add to CATEGORY_CONFIG**

```javascript
academic: {
  role: 'You are an academic researcher with expertise in scholarly writing, critical analysis, and evidence-based argumentation.',
  format: 'Please provide a rigorous, well-cited response...\n- Use formal academic language\n- Support claims with evidence',
  constraints: '- Acknowledge counterarguments\n- Suggest further research areas'
},
business: {
  role: 'You are a senior business strategist with extensive experience in market analysis and strategic planning.',
  format: 'Start with executive summary\n- Include market context\n- Data-driven recommendations',
  constraints: '- Consider ROI\n- Highlight risks and mitigation'
}
```

---

### 10. Non-JSON Error Handling — service-worker.js

**Lines 128-131**

```javascript
if (!response.ok) {
  let errorMsg = 'API request failed';
  try {
    const error = await response.json();
    errorMsg = error.error?.message || error.message || errorMsg;
  } catch {
    // Not JSON, try text
    try {
      const text = await response.text();
      errorMsg = `API error: ${text.substring(0, 100)}`;
    } catch {}
  }
  throw new Error(errorMsg);
}
```

---

## Verification

Manual testing:

1. Load extension: `chrome://extensions/` → Load unpacked → Select folder
2. Test platforms: ChatGPT, Claude, Gemini, Grok, DeepSeek, Perplexity
3. Test templates: All 8 templates
4. Test levels: Light, Medium, Aggressive
5. Test with/without API key
6. Test edge cases: empty prompt, special characters in prompt

---

## Estimated Changes

| Phase | Files | Issues | Complexity |
|-------|-------|--------|-----------|
| 1 | content.js, service-worker.js, enhancer.js | 4 | Medium |
| 2 | service-worker.js, options.js, enhancer.js | 4 | Easy |
| 3 | enhancer.js, service-worker.js | 2 | Easy |

Total: ~10 edits across 4 files.