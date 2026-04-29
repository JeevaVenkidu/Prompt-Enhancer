/**
 * Prompt Enhancer - Content Script
 * Detects prompt input fields on AI platforms and injects the enhance button.
 */

(() => {
  'use strict';

  // Platform-specific selectors for prompt input areas
  const PLATFORM_SELECTORS = {
    'chat.openai.com': {
      input: '#prompt-textarea, [data-id="root"] textarea, div[contenteditable="true"][id="prompt-textarea"]',
      container: 'form',
      name: 'ChatGPT',
    },
    'chatgpt.com': {
      input: '#prompt-textarea, [data-id="root"] textarea, div[contenteditable="true"][id="prompt-textarea"]',
      container: 'form',
      name: 'ChatGPT',
    },
    'claude.ai': {
      input: 'div[contenteditable="true"].ProseMirror, div[contenteditable="true"][data-placeholder]',
      container: 'fieldset, .composer-container, form',
      name: 'Claude',
    },
    'gemini.google.com': {
      input: 'div[contenteditable="true"].ql-editor, div[contenteditable="true"][data-placeholder], .text-input-field textarea, rich-textarea div[contenteditable="true"]',
      container: '.input-area-container, form, .text-input-field-container',
      name: 'Gemini',
    },
    'grok.com': {
      input: 'textarea',
      container: 'form',
      name: 'Grok',
    },
    'x.com': {
      input: 'textarea[placeholder*="Ask" i], textarea[aria-label*="Grok" i], div[data-testid="GrokDrawer"] textarea',
      container: 'form, div[data-testid="GrokDrawer"], [role="button"]',
      name: 'Grok on X',
    },
    'chat.deepseek.com': {
      input: '#chat-input, textarea',
      container: 'form, .chat-input-wrapper',
      name: 'DeepSeek',
    },
    'huggingface.co': {
      input: 'textarea',
      container: 'form',
      name: 'HuggingChat',
    },
    'perplexity.ai': {
      input: 'textarea',
      container: 'form, .relative',
      name: 'Perplexity',
    },
  };

  let currentPlatform = null;
  let enhanceButton = null;
  let isEnhancing = false;
  let currentSettings = {
    template: 'general',
    level: 'medium',
    mode: 'hybrid',
  };

  /**
   * Initialize the content script
   */
  async function init() {
    // Detect current platform
    const hostname = window.location.hostname;
    for (const [domain, config] of Object.entries(PLATFORM_SELECTORS)) {
      if (hostname.includes(domain)) {
        currentPlatform = { domain, ...config };
        break;
      }
    }

    if (!currentPlatform) return;

    console.log(`[Prompt Enhancer] Detected platform: ${currentPlatform.name}`);

    // Load user settings
    await loadSettings();

    // Start observing for input fields
    observeForInputFields();
  }

  /**
   * Load settings from chrome.storage
   */
  async function loadSettings() {
    return new Promise((resolve) => {
      if (chrome?.storage?.sync) {
        chrome.storage.sync.get(['template', 'level', 'mode'], (result) => {
          if (result.template) currentSettings.template = result.template;
          if (result.level) currentSettings.level = result.level;
          if (result.mode) currentSettings.mode = result.mode;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Observe DOM for input fields appearing
   */
  function observeForInputFields() {
    // Try to find input immediately
    tryInjectButton();

    // Also observe for dynamically loaded content
    const observer = new MutationObserver(() => {
      if (!enhanceButton || !document.contains(enhanceButton)) {
        tryInjectButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Try to find the input field and inject the enhance button
   */
  function tryInjectButton() {
    if (!currentPlatform) return;

    const inputEl = document.querySelector(currentPlatform.input);
    if (!inputEl) return;

    // Don't inject twice
    if (document.getElementById('pe-enhance-btn')) return;

    injectEnhanceButton(inputEl);
  }

  /**
   * Inject the floating enhance button near the input field
   */
  function injectEnhanceButton(inputEl) {
    // Create button
    enhanceButton = document.createElement('button');
    enhanceButton.id = 'pe-enhance-btn';
    enhanceButton.innerHTML = `
      <span class="pe-btn-icon">✨</span>
      <span class="pe-btn-text">Enhance</span>
    `;
    enhanceButton.title = 'Enhance your prompt';

    // Create template dropdown
    const dropdown = createTemplateDropdown();

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'pe-wrapper';
    wrapper.appendChild(enhanceButton);
    wrapper.appendChild(dropdown);

    // Find the best container to append to
    const container = inputEl.closest(currentPlatform.container) || inputEl.parentElement;
    if (container) {
      container.style.position = container.style.position || 'relative';
      container.appendChild(wrapper);
    }

    // Event: Enhance button click
    enhanceButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleEnhance(inputEl);
    });

    // Event: Show/hide dropdown on right-click or long-press
    enhanceButton.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('pe-dropdown-visible');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.remove('pe-dropdown-visible');
      }
    });

    console.log('[Prompt Enhancer] Enhance button injected');
  }

  /**
   * Create the template selector dropdown
   */
  function createTemplateDropdown() {
    const dropdown = document.createElement('div');
    dropdown.id = 'pe-dropdown';
    dropdown.className = 'pe-dropdown';

    const templates = PromptTemplates.getAllTemplates();
    const header = document.createElement('div');
    header.className = 'pe-dropdown-header';
    header.textContent = 'Enhancement Template';
    dropdown.appendChild(header);

    templates.forEach((template) => {
      const item = document.createElement('button');
      item.className = 'pe-dropdown-item pe-template-item';
      item.dataset.value = template.key;
      if (template.key === currentSettings.template) {
        item.classList.add('pe-dropdown-item-active');
      }
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
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSettings.template = template.key;
        // Update active state
        dropdown.querySelectorAll('.pe-template-item').forEach((el) => el.classList.remove('pe-dropdown-item-active'));
        item.classList.add('pe-dropdown-item-active');
        // Save setting
        if (chrome?.storage?.sync) {
          chrome.storage.sync.set({ template: template.key });
        }
        dropdown.classList.remove('pe-dropdown-visible');
      });
      dropdown.appendChild(item);
    });

    // Enhancement level
    const levelHeader = document.createElement('div');
    levelHeader.className = 'pe-dropdown-header';
    levelHeader.textContent = 'Enhancement Level';
    dropdown.appendChild(levelHeader);

    ['light', 'medium', 'aggressive'].forEach((level) => {
      const item = document.createElement('button');
      item.className = 'pe-dropdown-item pe-level-item';
      item.dataset.value = level;
      if (level === currentSettings.level) {
        item.classList.add('pe-dropdown-item-active');
      }
      const labels = { light: '🌱 Light', medium: '⚡ Medium', aggressive: '🚀 Aggressive' };
      const descs = {
        light: 'Minor cleanup and formatting',
        medium: 'Add structure, role, and format',
        aggressive: 'Full prompt restructuring',
      };
      const iconSpan = document.createElement('span');
      iconSpan.className = 'pe-dropdown-icon';
      iconSpan.textContent = labels[level].split(' ')[0];
      const nameSpan = document.createElement('span');
      nameSpan.className = 'pe-dropdown-name';
      nameSpan.textContent = labels[level].split(' ')[1];
      const descSpan = document.createElement('span');
      descSpan.className = 'pe-dropdown-desc';
      descSpan.textContent = descs[level];
      const infoSpan = document.createElement('span');
      infoSpan.className = 'pe-dropdown-info';
      infoSpan.appendChild(nameSpan);
      infoSpan.appendChild(descSpan);
      item.appendChild(iconSpan);
      item.appendChild(infoSpan);
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSettings.level = level;
        dropdown.querySelectorAll('.pe-level-item').forEach((el) => el.classList.remove('pe-dropdown-item-active'));
        item.classList.add('pe-dropdown-item-active');
        if (chrome?.storage?.sync) {
          chrome.storage.sync.set({ level });
        }
        dropdown.classList.remove('pe-dropdown-visible');
      });
      dropdown.appendChild(item);
    });

    // Enhancement Mode
    const modeHeader = document.createElement('div');
    modeHeader.className = 'pe-dropdown-header';
    modeHeader.textContent = 'Enhancement Mode';
    dropdown.appendChild(modeHeader);

    ['offline', 'hybrid', 'online'].forEach((mode) => {
      const item = document.createElement('button');
      item.className = 'pe-dropdown-item pe-mode-item';
      item.dataset.value = mode;
      if (mode === currentSettings.mode) {
        item.classList.add('pe-dropdown-item-active');
      }
      const labels = { offline: '🔒 Offline', hybrid: '🧠 Hybrid', online: '🌐 Online' };
      const descs = {
        offline: 'Fast template, completely private',
        hybrid: 'Smart AI try, fallback to template',
        online: 'Force AI API (shows exact errors)',
      };
      const iconSpan = document.createElement('span');
      iconSpan.className = 'pe-dropdown-icon';
      iconSpan.textContent = labels[mode].split(' ')[0];
      const nameSpan = document.createElement('span');
      nameSpan.className = 'pe-dropdown-name';
      nameSpan.textContent = labels[mode].split(' ')[1];
      const descSpan = document.createElement('span');
      descSpan.className = 'pe-dropdown-desc';
      descSpan.textContent = descs[mode];
      const infoSpan = document.createElement('span');
      infoSpan.className = 'pe-dropdown-info';
      infoSpan.appendChild(nameSpan);
      infoSpan.appendChild(descSpan);
      item.appendChild(iconSpan);
      item.appendChild(infoSpan);
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSettings.mode = mode;
        dropdown.querySelectorAll('.pe-mode-item').forEach((el) => el.classList.remove('pe-dropdown-item-active'));
        item.classList.add('pe-dropdown-item-active');
        if (chrome?.storage?.sync) {
          chrome.storage.sync.set({ mode });
        }
        dropdown.classList.remove('pe-dropdown-visible');
      });
      dropdown.appendChild(item);
    });

    return dropdown;
  }

  /**
   * Handle the enhance button click
   */
  async function handleEnhance(inputEl) {
    if (isEnhancing) return;

    const promptText = getPromptText(inputEl);
    if (!promptText || promptText.trim().length === 0) {
      showToast('Please type a prompt first!', 'warning');
      return;
    }

    isEnhancing = true;
    enhanceButton.classList.add('pe-loading');
    enhanceButton.querySelector('.pe-btn-text').textContent = 'Enhancing...';

    try {
      // Check if API key is configured for AI-powered enhancement
      const settings = await getStorageData(['apiKey', 'apiProvider']);
      let enhanced;

      if (currentSettings.mode === 'offline') {
        enhanced = PromptEnhancer.enhance(promptText, {
          template: currentSettings.template,
          level: currentSettings.level,
        });
      } else if (currentSettings.mode === 'online') {
        if (!settings.apiKey) throw new Error('API Key required for Online Mode. Check Settings.');
        enhanced = await enhanceWithAPI(promptText, settings);
      } else {
        // Hybrid Mode
        if (!settings.apiKey) {
          enhanced = PromptEnhancer.enhance(promptText, {
            template: currentSettings.template,
            level: currentSettings.level,
          });
        } else {
          try {
            enhanced = await enhanceWithAPI(promptText, settings);
          } catch (apiError) {
            console.warn('[Prompt Enhancer] API error in hybrid mode, falling back to template', apiError);
            showToast('AI API failed, fell back to template.', 'warning');
            enhanced = PromptEnhancer.enhance(promptText, {
              template: currentSettings.template,
              level: currentSettings.level,
            });
          }
        }
      }

      // Set the enhanced text back
      setPromptText(inputEl, enhanced);
      showToast('Prompt enhanced! ✨', 'success');

      // Save to history
      saveToHistory(promptText, enhanced);
    } catch (error) {
      console.error('[Prompt Enhancer] Enhancement failed:', error);
      if (currentSettings.mode === 'online') {
        showToast(`AI Error: ${error.message}`, 'error');
      } else {
        showToast('Enhancement failed. Using template fallback.', 'error');
        // Fallback to template-based
        const enhanced = PromptEnhancer.enhance(promptText, {
          template: currentSettings.template,
          level: currentSettings.level,
        });
        setPromptText(inputEl, enhanced);
      }
    } finally {
      isEnhancing = false;
      enhanceButton.classList.remove('pe-loading');
      enhanceButton.querySelector('.pe-btn-text').textContent = 'Enhance';
    }
  }

  /**
   * Get text from the prompt input element
   */
  function getPromptText(el) {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      return el.value;
    }
    // contenteditable divs
    return el.innerText || el.textContent;
  }

  /**
   * Set text into the prompt input element
   */
  function setPromptText(el, text) {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      // Use native setter to trigger React's change detection
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;

      if (nativeSetter) {
        nativeSetter.call(el, text);
      } else {
        el.value = text;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // contenteditable divs
      el.focus();

      // Select all existing content
      document.execCommand('selectAll', false, null);

      // Insert the new text natively
      // This correctly triggers the React/ProseMirror/Lexical input events
      document.execCommand('insertText', false, text);
    }
  }

  /**
   * Enhance prompt using AI API via Background Service Worker
   */
  async function enhanceWithAPI(prompt, settings) {
    const { apiKey, apiProvider = 'gemini' } = settings;

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'ENHANCE_WITH_API',
        prompt,
        template: currentSettings.template,
        level: currentSettings.level,
        apiKey,
        apiProvider
      }, (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }
        if (response && response.error) {
          return reject(new Error(response.error));
        }
        if (response && response.enhanced) {
          return resolve(response.enhanced);
        }
        reject(new Error('Unknown error during API enhancement'));
      });
    });
  }

  /**
   * Helper: Get data from chrome.storage
   */
  function getStorageData(keys) {
    return new Promise((resolve) => {
      if (chrome?.storage?.sync) {
        chrome.storage.sync.get(keys, resolve);
      } else {
        resolve({});
      }
    });
  }

  /**
   * Save enhancement to history
   */
  function saveToHistory(original, enhanced) {
    if (!chrome?.storage?.local) return;

    chrome.storage.local.get(['history'], (result) => {
      const history = result.history || [];
      history.unshift({
        original,
        enhanced,
        template: currentSettings.template,
        level: currentSettings.level,
        platform: currentPlatform?.name || 'Unknown',
        timestamp: Date.now(),
      });
      // Keep last 50 entries
      chrome.storage.local.set({ history: history.slice(0, 50) });
    });
  }

  /**
   * Show a toast notification
   */
  function showToast(message, type = 'info') {
    // Remove existing toast
    const existing = document.getElementById('pe-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'pe-toast';
    toast.className = `pe-toast pe-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('pe-toast-visible');
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('pe-toast-visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Listen for storage changes to sync with popup
  if (chrome?.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
        let changed = false;
        if (changes.template) { currentSettings.template = changes.template.newValue; changed = true; }
        if (changes.level) { currentSettings.level = changes.level.newValue; changed = true; }
        if (changes.mode) { currentSettings.mode = changes.mode.newValue; changed = true; }
        
        if (changed) {
          const dropdown = document.getElementById('pe-dropdown');
          if (dropdown) {
            dropdown.querySelectorAll('.pe-template-item').forEach((el) => {
              el.classList.toggle('pe-dropdown-item-active', el.dataset.value === currentSettings.template);
            });
            dropdown.querySelectorAll('.pe-level-item').forEach((el) => {
              el.classList.toggle('pe-dropdown-item-active', el.dataset.value === currentSettings.level);
            });
            dropdown.querySelectorAll('.pe-mode-item').forEach((el) => {
              el.classList.toggle('pe-dropdown-item-active', el.dataset.value === currentSettings.mode);
            });
          }
        }
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
