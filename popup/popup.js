/**
 * Prompt Enhancer - Popup Script
 * Handles the extension popup UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─── State ───
  let currentTemplate = 'general';
  let currentLevel = 'medium';
  let currentMode = 'hybrid';

  // ─── DOM Elements ───
  const templateGrid = document.getElementById('template-grid');
  const promptInput = document.getElementById('prompt-input');
  const enhanceBtn = document.getElementById('enhance-btn');
  const resultSection = document.getElementById('result-section');
  const resultText = document.getElementById('result-text');
  const copyBtn = document.getElementById('copy-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const historyList = document.getElementById('history-list');
  const statusText = document.getElementById('status-text');
  const statusDot = document.querySelector('.status-dot');
  const tabs = document.querySelectorAll('.tab');
  const levelBtns = document.querySelectorAll('.level-btn');
  const modeBtns = document.querySelectorAll('#mode-selector .level-btn');

  // ─── Initialize ───
  loadSettings();
  populateTemplates();
  loadHistory();
  checkAPIStatus();

  // ─── Tab Switching ───
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');

      if (tab.dataset.tab === 'history') {
        loadHistory();
      }
    });
  });

  // ─── Template Grid ───
  function populateTemplates() {
    const templates = PromptTemplates.getAllTemplates();
    templateGrid.innerHTML = '';

    templates.forEach((template) => {
      const card = document.createElement('button');
      card.className = `template-card ${template.key === currentTemplate ? 'active' : ''}`;
      card.dataset.template = template.key;
      card.innerHTML = `
        <span class="template-card-icon">${template.icon}</span>
        <span class="template-card-name">${template.name}</span>
      `;

      card.addEventListener('click', () => {
        currentTemplate = template.key;
        templateGrid.querySelectorAll('.template-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        saveSettings();
      });

      templateGrid.appendChild(card);
    });
  }

  // ─── Level Selector ───
  levelBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentLevel = btn.dataset.level;
      levelBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      saveSettings();
    });
  });

  // ─── Mode Selector ───
  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentMode = btn.dataset.mode;
      modeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      saveSettings();
    });
  });

  // ─── Enhance Button ───
  enhanceBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      promptInput.focus();
      promptInput.style.borderColor = 'var(--warning)';
      setTimeout(() => {
        promptInput.style.borderColor = '';
      }, 1500);
      return;
    }

    enhanceBtn.disabled = true;
    enhanceBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Enhancing...</span>';

    try {
      // Check for API key
      const settings = await getStorage(['apiKey', 'apiProvider']);
      let enhanced;

      if (currentMode === 'offline') {
        enhanced = PromptEnhancer.enhance(prompt, { template: currentTemplate, level: currentLevel });
      } else if (currentMode === 'online') {
        if (!settings.apiKey) throw new Error('API Key required for Online Mode. Please set it in Settings.');
        enhanced = await sendMessage({
          type: 'ENHANCE_WITH_API',
          prompt,
          template: currentTemplate,
          level: currentLevel,
          apiKey: settings.apiKey,
          apiProvider: settings.apiProvider || 'gemini',
        });
      } else {
        // Hybrid Mode
        if (!settings.apiKey) {
          enhanced = PromptEnhancer.enhance(prompt, { template: currentTemplate, level: currentLevel });
        } else {
          try {
            enhanced = await sendMessage({
              type: 'ENHANCE_WITH_API',
              prompt,
              template: currentTemplate,
              level: currentLevel,
              apiKey: settings.apiKey,
              apiProvider: settings.apiProvider || 'gemini',
            });
          } catch (apiError) {
            console.warn('API error in hybrid mode, falling back to template', apiError);
            enhanced = PromptEnhancer.enhance(prompt, { template: currentTemplate, level: currentLevel });
          }
        }
      }

      // Show result
      resultText.textContent = enhanced;
      resultSection.classList.remove('hidden');

      // Save to history
      saveToHistory(prompt, enhanced);
    } catch (error) {
      console.error('Enhancement failed:', error);
      if (currentMode === 'online') {
        resultText.textContent = `Error: ${error.message}`;
        resultText.style.color = '#ef4444'; // error color
        setTimeout(() => resultText.style.color = '', 5000);
      } else {
        // Fallback to template
        const enhanced = PromptEnhancer.enhance(prompt, {
          template: currentTemplate,
          level: currentLevel,
        });
        resultText.textContent = enhanced;
      }
      resultSection.classList.remove('hidden');
    } finally {
      enhanceBtn.disabled = false;
      enhanceBtn.innerHTML = '<span class="btn-icon">✨</span><span>Enhance Prompt</span>';
    }
  });

  // ─── Copy Button ───
  copyBtn.addEventListener('click', async () => {
    const text = resultText.textContent;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
        <span>Copied!</span>
      `;
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        `;
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  });

  // ─── Settings Button ───
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // ─── History ───
  function loadHistory() {
    chrome.storage.local.get(['history'], (result) => {
      const history = result.history || [];
      if (history.length === 0) {
        historyList.innerHTML = `
          <div class="history-empty">
            <span class="history-empty-icon">📋</span>
            <p>No enhancements yet</p>
            <p class="text-muted">Enhanced prompts will appear here</p>
          </div>
        `;
        return;
      }

      historyList.innerHTML = '';
      history.slice(0, 20).forEach((item) => {
        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `
          <div class="history-item-header">
            <span class="history-item-platform">${item.platform || 'Quick'}</span>
            <span class="history-item-time">${formatTime(item.timestamp)}</span>
          </div>
          <div class="history-item-preview">${escapeHTML(item.original.substring(0, 80))}${item.original.length > 80 ? '...' : ''}</div>
        `;

        el.addEventListener('click', () => {
          // Switch to enhance tab and populate
          tabs.forEach((t) => t.classList.remove('active'));
          tabs[0].classList.add('active');
          document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
          document.getElementById('tab-enhance').classList.add('active');

          promptInput.value = item.original;
          resultText.textContent = item.enhanced;
          resultSection.classList.remove('hidden');
        });

        historyList.appendChild(el);
      });
    });
  }

  function saveToHistory(original, enhanced) {
    chrome.storage.local.get(['history'], (result) => {
      const history = result.history || [];
      history.unshift({
        original,
        enhanced,
        template: currentTemplate,
        level: currentLevel,
        platform: 'Quick',
        timestamp: Date.now(),
      });
      chrome.storage.local.set({ history: history.slice(0, 50) });
    });
  }

  // ─── API Status ───
  function checkAPIStatus() {
    chrome.storage.sync.get(['apiKey'], (result) => {
      if (result.apiKey) {
        statusText.textContent = 'AI-Powered Mode';
        statusDot.classList.add('api-mode');
      } else {
        statusText.textContent = 'Template Mode';
        statusDot.classList.remove('api-mode');
      }
    });
  }

  // ─── Settings ───
  function loadSettings() {
    chrome.storage.sync.get(['template', 'level'], (result) => {
      if (result.template) {
        currentTemplate = result.template;
        templateGrid?.querySelectorAll('.template-card').forEach((c) => {
          c.classList.toggle('active', c.dataset.template === currentTemplate);
        });
      }
      if (result.level) {
        currentLevel = result.level;
        levelBtns.forEach((b) => {
          b.classList.toggle('active', b.dataset.level === currentLevel);
        });
      }
      if (result.mode) {
        currentMode = result.mode;
        modeBtns.forEach((b) => {
          b.classList.toggle('active', b.dataset.mode === currentMode);
        });
      }
    });
  }

  function saveSettings() {
    chrome.storage.sync.set({
      template: currentTemplate,
      level: currentLevel,
      mode: currentMode,
    });
  }

  // ─── Helpers ───
  function getStorage(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, resolve);
    });
  }

  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response?.enhanced || response);
        }
      });
    });
  }

  function formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Keyboard Shortcut ───
  promptInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      enhanceBtn.click();
    }
  });
});
