const $ = (sel) => document.querySelector(sel);

// ── Load settings ──
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['apiKey', 'apiProvider', 'template', 'level', 'mode', 'saveHistory'], (r) => {
    if (r.apiKey) $('#api-key').value = '••••••••••••••••';
    if (r.apiProvider) $('#api-provider').value = r.apiProvider;
    if (r.template) $('#default-template').value = r.template;
    if (r.level) $('#default-level').value = r.level;
    if (r.mode) $('#default-mode').value = r.mode;
    if (r.saveHistory === false) $('#toggle-history').classList.remove('active');
    
    initCustomSelects(); // Initialize custom glassmorphic dropdowns
    
    // Trigger visual help update for API provider on load
    $('#api-provider').dispatchEvent(new Event('change'));
  });

  // ── API Provider change ──
  $('#api-provider').addEventListener('change', () => {
    const provider = $('#api-provider').value;
    if (provider === 'gemini') {
      $('#api-help').innerHTML = 'Get a free Gemini API key from <a class="help-link" href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a>';
    } else if (provider === 'groq') {
      $('#api-help').innerHTML = 'Get a free Groq API key from <a class="help-link" href="https://console.groq.com/keys" target="_blank">Groq Console</a>';
    } else if (provider === 'openrouter') {
      $('#api-help').innerHTML = 'Get an OpenRouter API key from <a class="help-link" href="https://openrouter.ai/keys" target="_blank">OpenRouter</a>';
    } else {
      $('#api-help').innerHTML = 'Get an OpenAI API key from <a class="help-link" href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>';
    }
  });

  // ── Save API Key ──
  $('#save-api').addEventListener('click', () => {
    const key = $('#api-key').value.trim();
    if (!key || key === '••••••••••••••••') {
      showToast('Please enter a valid API key', 'error');
      return;
    }
    chrome.storage.sync.set({
      apiKey: key,
      apiProvider: $('#api-provider').value,
    }, () => {
      $('#api-key').value = '••••••••••••••••';
      showToast('API key saved successfully!', 'success');
    });
  });

  // ── Test API ──
  $('#test-api').addEventListener('click', async () => {
    chrome.storage.sync.get(['apiKey', 'apiProvider'], async (r) => {
      if (!r.apiKey) {
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
          apiKey: r.apiKey,
          apiProvider: r.apiProvider || 'gemini',
        });

        if (response.error) throw new Error(response.error);
        showToast('API connection successful! ✅', 'success');
      } catch (e) {
        showToast('API test failed: ' + e.message, 'error');
      } finally {
        $('#test-api').textContent = 'Test Connection';
      }
    });
  });

  // ── Remove API Key ──
  $('#remove-api').addEventListener('click', () => {
    chrome.storage.sync.remove(['apiKey'], () => {
      $('#api-key').value = '';
      showToast('API key removed', 'success');
    });
  });

  // ── Save Preferences ──
  $('#save-prefs').addEventListener('click', () => {
    chrome.storage.sync.set({
      template: $('#default-template').value,
      level: $('#default-level').value,
      mode: $('#default-mode').value,
    }, () => {
      showToast('Preferences saved!', 'success');
    });
  });

  // ── Toggle History ──
  $('#toggle-history').addEventListener('click', function () {
    this.classList.toggle('active');
    chrome.storage.sync.set({ saveHistory: this.classList.contains('active') });
  });

  // ── Export Data ──
  $('#export-data').addEventListener('click', () => {
    chrome.storage.local.get(['history'], (r) => {
      const data = JSON.stringify(r.history || [], null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'prompt-enhancer-history.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('History exported!', 'success');
    });
  });

  // ── Clear History ──
  $('#clear-history').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all enhancement history?')) {
      chrome.storage.local.set({ history: [] }, () => {
        showToast('History cleared', 'success');
      });
    }
  });
});

// ── Toast ──
function showToast(msg, type) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.className = `toast toast-${type}`;
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => toast.classList.remove('toast-visible'), 3000);
}

// ── Custom Dropdowns ──
function initCustomSelects() {
  document.querySelectorAll('select').forEach(select => {
    select.style.display = 'none';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    select.parentNode.insertBefore(wrapper, select.nextSibling);

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    const triggerText = document.createElement('span');
    triggerText.textContent = select.options[select.selectedIndex]?.text || '';
    
    const arrow = document.createElement('div');
    arrow.className = 'custom-select-arrow';
    
    trigger.appendChild(triggerText);
    trigger.appendChild(arrow);
    wrapper.appendChild(trigger);

    const optionsList = document.createElement('div');
    optionsList.className = 'custom-select-options';
    
    Array.from(select.options).forEach((opt, idx) => {
      const optionEl = document.createElement('div');
      optionEl.className = 'custom-select-option';
      if (idx === select.selectedIndex) optionEl.classList.add('selected');
      optionEl.textContent = opt.text;
      optionEl.dataset.value = opt.value;
      
      optionEl.addEventListener('click', (e) => {
        select.value = opt.value;
        select.dispatchEvent(new Event('change'));
        
        triggerText.textContent = opt.text;
        optionsList.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected'));
        optionEl.classList.add('selected');
        
        wrapper.classList.remove('open');
        e.stopPropagation();
      });
      optionsList.appendChild(optionEl);
    });

    wrapper.appendChild(optionsList);

    trigger.addEventListener('click', (e) => {
      document.querySelectorAll('.custom-select').forEach(cs => {
        if (cs !== wrapper) cs.classList.remove('open');
      });
      wrapper.classList.toggle('open');
      e.stopPropagation();
    });

    select.addEventListener('change', () => {
      triggerText.textContent = select.options[select.selectedIndex]?.text || '';
      optionsList.querySelectorAll('.custom-select-option').forEach((el, idx) => {
        if (idx === select.selectedIndex) el.classList.add('selected');
        else el.classList.remove('selected');
      });
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select').forEach(cs => cs.classList.remove('open'));
  });
}
