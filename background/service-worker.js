/**
 * Prompt Enhancer - Service Worker (Background)
 * Handles API calls and message routing.
 */

// Import enhancement modules
importScripts('/lib/enhancer.js', '/lib/templates.js');

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      template: 'general',
      level: 'medium',
      apiProvider: 'gemini',
    });

    console.log('[Prompt Enhancer] Extension installed successfully');
  }
});

/**
 * Message handler
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENHANCE_WITH_API') {
    handleAPIEnhancement(message)
      .then((enhanced) => sendResponse({ enhanced }))
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'GET_HISTORY') {
    chrome.storage.local.get(['history'], (result) => {
      sendResponse({ history: result.history || [] });
    });
    return true;
  }

  if (message.type === 'CLEAR_HISTORY') {
    chrome.storage.local.set({ history: [] }, () => {
      sendResponse({ status: 'ok' });
    });
    return true;
  }
});

/**
 * Handle AI-powered enhancement
 */
async function handleAPIEnhancement(message) {
  const { prompt, template, level, apiKey, apiProvider } = message;

  const systemPrompt = buildSystemPrompt(template, level);

  if (apiProvider === 'gemini') {
    return await callGeminiAPI(prompt, systemPrompt, apiKey);
  } else if (apiProvider === 'openai') {
    return await callOpenAICompatibleAPI(prompt, systemPrompt, apiKey, 'https://api.openai.com/v1/chat/completions', 'gpt-4o-mini');
  } else if (apiProvider === 'groq') {
    return await callOpenAICompatibleAPI(prompt, systemPrompt, apiKey, 'https://api.groq.com/openai/v1/chat/completions', 'llama-3.3-70b-versatile');
  } else if (apiProvider === 'openrouter') {
    return await callOpenAICompatibleAPI(prompt, systemPrompt, apiKey, 'https://openrouter.ai/api/v1/chat/completions', 'meta-llama/llama-3.1-70b-instruct:free');
  }

  throw new Error('Unsupported API provider');
}

/**
 * Build system prompt based on template and level
 */
function buildSystemPrompt(templateName, level) {
  const template = PromptTemplates.getTemplate(templateName);
  
  const levelInstructions = {
    light: 'Make minimal improvements. Fix grammar, add clarity, but keep the original structure intact.',
    medium: 'Moderately enhance the prompt. Add a role, improve specificity, suggest an output format, but keep the core message.',
    aggressive: 'Fully restructure the prompt for maximum effectiveness. Add role, context, task description, constraints, output format, and quality standards.',
  };

  return `You are an expert prompt engineer. Your job is to enhance user prompts to be more effective with AI assistants.

Template context: ${template.name} - ${template.description}

Enhancement level: ${level}
${levelInstructions[level]}

Rules:
- Keep the user's original intent and meaning intact
- Do NOT fabricate information or add topics not mentioned
- Make the prompt clearer, more specific, and better structured
- Return ONLY the enhanced prompt text, no explanations or meta-commentary
- Do not wrap in quotes or code blocks`;
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(prompt, systemPrompt, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: `Please enhance this prompt:\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API request failed');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini API returned empty response');
  }

  return text.trim();
}

/**
 * Call OpenAI Compatible API (OpenAI, Groq, OpenRouter)
 */
async function callOpenAICompatibleAPI(prompt, systemPrompt, apiKey, endpoint, model) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  // OpenRouter requires an additional referer header (optional but recommended for ranking)
  if (endpoint.includes('openrouter')) {
    headers['HTTP-Referer'] = 'https://github.com/prompt-enhancer';
    headers['X-Title'] = 'Prompt Enhancer Extension';
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please enhance this prompt:\n\n${prompt}` },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('API returned empty response');
  }

  return text.trim();
}
