/**
 * Prompt Enhancer - Core Enhancement Engine
 * Transforms basic prompts into well-structured, effective ones.
 */

const PromptEnhancer = (() => {
  /**
   * Main enhancement function
   * @param {string} prompt - The original user prompt
   * @param {object} options - Enhancement options
   * @returns {string} Enhanced prompt
   */
  function enhance(prompt, options = {}) {
    const {
      template = 'general',
      level = 'medium', // light, medium, aggressive
      addRole = true,
      addFormat = true,
      addConstraints = true,
    } = options;

    if (!prompt || prompt.trim().length === 0) return prompt;

    const trimmed = prompt.trim();
    const analysis = analyzePrompt(trimmed);
    let enhanced = trimmed;

    // Apply enhancements based on level
    if (level === 'light') {
      enhanced = applyLightEnhancements(enhanced, analysis);
    } else if (level === 'medium') {
      enhanced = applyMediumEnhancements(enhanced, analysis, { addRole, addFormat });
    } else if (level === 'aggressive') {
      enhanced = applyAggressiveEnhancements(enhanced, analysis, { addRole, addFormat, addConstraints });
    }

    // Apply template-specific enhancements
    const templateEnhancements = getTemplateEnhancements(template);
    if (templateEnhancements) {
      enhanced = applyTemplateEnhancements(enhanced, analysis, templateEnhancements);
    }

    return enhanced;
  }

  /**
   * Analyze the prompt to determine what's missing
   */
  function analyzePrompt(prompt) {
    const lower = prompt.toLowerCase();
    return {
      hasRole: /^(you are|act as|behave as|pretend to be|as a)/i.test(prompt),
      hasContext: lower.includes('context') || lower.includes('background') || lower.includes('given that'),
      hasFormat: /format|output|respond (in|as|with)|return (as|in)|give me.*in/i.test(lower),
      hasConstraints: /must|should|don't|do not|avoid|make sure|ensure|limit|maximum|minimum/i.test(lower),
      hasExamples: /example|for instance|such as|like this|e\.g\./i.test(lower),
      hasTone: /tone|style|formal|casual|professional|friendly|concise|detailed/i.test(lower),
      hasSteps: /step|first|then|finally|1\.|2\.|3\./i.test(lower),
      wordCount: prompt.split(/\s+/).length,
      isQuestion: prompt.trim().endsWith('?'),
      isShort: prompt.split(/\s+/).length < 15,
      isMedium: prompt.split(/\s+/).length >= 15 && prompt.split(/\s+/).length < 50,
      isLong: prompt.split(/\s+/).length >= 50,
      detectedCategory: detectCategory(lower),
    };
  }

  /**
   * Detect the likely category of the prompt
   */
  function detectCategory(lower) {
    if (/code|function|bug|error|api|database|sql|python|javascript|html|css|react|debug/i.test(lower)) return 'coding';
    if (/write|essay|article|blog|story|poem|email|letter|content|copy/i.test(lower)) return 'writing';
    if (/analyze|data|compare|evaluate|research|study|statistics|trend|metric/i.test(lower)) return 'analysis';
    if (/design|create|imagine|generate|draw|logo|ui|ux|brand|visual/i.test(lower)) return 'creative';
    if (/explain|what is|how does|why|teach|learn|understand/i.test(lower)) return 'learning';
    return 'general';
  }

  /**
   * Light enhancements - just clean up and add minor improvements
   */
  function applyLightEnhancements(prompt, analysis) {
    let enhanced = prompt;

    // Capitalize first letter
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

    // Add period if no ending punctuation
    if (!/[.!?]$/.test(enhanced.trim())) {
      enhanced = enhanced.trim() + '.';
    }

    // If very short, add "Please provide a detailed response."
    if (analysis.isShort && !analysis.hasFormat) {
      enhanced += '\n\nPlease provide a detailed and well-structured response.';
    }

    return enhanced;
  }

  /**
   * Medium enhancements - add structure and missing elements
   */
  function applyMediumEnhancements(prompt, analysis, options) {
    let parts = [];

    // Add role if missing
    if (options.addRole && !analysis.hasRole) {
      const role = getRoleForCategory(analysis.detectedCategory);
      if (role) parts.push(role);
    }

    // Add the main prompt
    parts.push(prompt);

    // Add format instructions if missing
    if (options.addFormat && !analysis.hasFormat) {
      const format = getFormatForCategory(analysis.detectedCategory);
      if (format) parts.push(format);
    }

    // Add clarity request for short prompts
    if (analysis.isShort) {
      parts.push('Be thorough and specific in your response. Include relevant details and examples where appropriate.');
    }

    return parts.join('\n\n');
  }

  /**
   * Aggressive enhancements - full restructure
   */
  function applyAggressiveEnhancements(prompt, analysis, options) {
    let sections = [];

    // Role
    if (options.addRole && !analysis.hasRole) {
      const role = getRoleForCategory(analysis.detectedCategory);
      if (role) sections.push(`## Role\n${role}`);
    }

    // Context
    if (!analysis.hasContext) {
      sections.push(`## Task\n${prompt}`);
    } else {
      sections.push(prompt);
    }

    // Constraints
    if (options.addConstraints && !analysis.hasConstraints) {
      const constraints = getConstraintsForCategory(analysis.detectedCategory);
      if (constraints) sections.push(`## Requirements\n${constraints}`);
    }

    // Format
    if (options.addFormat && !analysis.hasFormat) {
      const format = getFormatForCategory(analysis.detectedCategory);
      if (format) sections.push(`## Output Format\n${format}`);
    }

    // Quality instructions
    sections.push('## Quality Standards\n- Be accurate and factual\n- Provide specific, actionable information\n- Use clear, concise language\n- Include examples where helpful\n- Acknowledge any limitations or uncertainties');

    return sections.join('\n\n');
  }

  /**
   * Get a role prefix based on detected category
   */
  function getRoleForCategory(category) {
    const roles = {
      coding: 'You are an expert software developer with deep knowledge of best practices, clean code, and modern development patterns.',
      writing: 'You are a skilled writer with expertise in creating clear, engaging, and well-structured content.',
      analysis: 'You are a data analyst with strong analytical skills, experienced in breaking down complex problems and providing data-driven insights.',
      creative: 'You are a creative professional with expertise in design thinking, visual communication, and innovative problem-solving.',
      learning: 'You are a knowledgeable teacher who explains concepts clearly, uses analogies, and adapts explanations to the learner\'s level.',
      general: 'You are a helpful and knowledgeable assistant who provides thorough, accurate, and well-organized responses.',
    };
    return roles[category] || roles.general;
  }

  /**
   * Get format instructions based on category
   */
  function getFormatForCategory(category) {
    const formats = {
      coding: 'Please structure your response with:\n- A brief explanation of the approach\n- Clean, well-commented code\n- Any important notes or caveats',
      writing: 'Please format your response with:\n- Clear headings and sections\n- Proper paragraph structure\n- A logical flow from introduction to conclusion',
      analysis: 'Please structure your analysis with:\n- Key findings summary\n- Detailed breakdown\n- Data-supported conclusions\n- Actionable recommendations',
      creative: 'Please present your ideas with:\n- Concept overview\n- Detailed description\n- Variations or alternatives\n- Implementation considerations',
      learning: 'Please structure your explanation with:\n- Simple overview\n- Detailed explanation with examples\n- Common misconceptions\n- Summary of key points',
      general: 'Please provide a well-structured response with clear sections and specific details.',
    };
    return formats[category] || formats.general;
  }

  /**
   * Get constraints based on category
   */
  function getConstraintsForCategory(category) {
    const constraints = {
      coding: '- Follow best practices and coding standards\n- Handle edge cases\n- Consider performance implications\n- Include error handling where appropriate',
      writing: '- Use clear and engaging language\n- Maintain consistent tone throughout\n- Support claims with evidence or examples\n- Keep the target audience in mind',
      analysis: '- Base conclusions on evidence\n- Consider multiple perspectives\n- Identify potential biases\n- Quantify findings where possible',
      creative: '- Think outside conventional boundaries\n- Consider feasibility and practicality\n- Provide unique and original ideas\n- Balance creativity with usability',
      learning: '- Start from foundational concepts\n- Build complexity gradually\n- Use real-world analogies\n- Check for understanding at each step',
      general: '- Be accurate and factual\n- Provide specific details\n- Consider multiple perspectives\n- Be helpful and actionable',
    };
    return constraints[category] || constraints.general;
  }

  /**
   * Apply template-specific enhancements
   */
  function applyTemplateEnhancements(prompt, analysis, template) {
    if (template.prefix && !analysis.hasRole) {
      prompt = template.prefix + '\n\n' + prompt;
    }
    if (template.suffix && !analysis.hasFormat) {
      prompt = prompt + '\n\n' + template.suffix;
    }
    return prompt;
  }

  /**
   * Get template enhancements configuration
   */
  function getTemplateEnhancements(templateName) {
    if (typeof PromptTemplates !== 'undefined' && PromptTemplates.getTemplate) {
      return PromptTemplates.getTemplate(templateName);
    }
    return null;
  }

  // Public API
  return {
    enhance,
    analyzePrompt,
    detectCategory,
  };
})();

// Make available globally
if (typeof globalThis !== 'undefined') {
  globalThis.PromptEnhancer = PromptEnhancer;
} else if (typeof window !== 'undefined') {
  window.PromptEnhancer = PromptEnhancer;
} else if (typeof self !== 'undefined') {
  self.PromptEnhancer = PromptEnhancer;
}
