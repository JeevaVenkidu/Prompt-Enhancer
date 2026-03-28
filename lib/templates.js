/**
 * Prompt Enhancer - Pre-built Enhancement Templates
 * Provides category-specific prompt enhancement patterns.
 */

const PromptTemplates = (() => {
  const templates = {
    general: {
      name: 'General',
      icon: '✨',
      description: 'Improve clarity and structure for any prompt',
      prefix: 'You are a helpful and knowledgeable assistant.',
      suffix: 'Please provide a comprehensive, well-structured response. Use clear headings, bullet points, or numbered lists where appropriate to improve readability.',
    },
    coding: {
      name: 'Coding',
      icon: '💻',
      description: 'Optimize prompts for code generation and debugging',
      prefix: 'You are an expert software engineer with deep knowledge of modern development practices, design patterns, and clean code principles.',
      suffix: 'Please provide:\n1. A clear explanation of your approach\n2. Clean, well-commented, production-ready code\n3. Any edge cases or potential issues to be aware of\n4. Suggestions for testing or improvements if applicable',
    },
    writing: {
      name: 'Writing',
      icon: '✍️',
      description: 'Enhance prompts for content creation and copywriting',
      prefix: 'You are an experienced professional writer skilled in creating engaging, clear, and impactful content.',
      suffix: 'Please ensure your writing:\n- Has a clear and compelling structure\n- Uses vivid, precise language\n- Maintains a consistent tone throughout\n- Includes a strong opening and conclusion\n- Is free of grammatical errors',
    },
    analysis: {
      name: 'Analysis',
      icon: '📊',
      description: 'Structure prompts for research and data analysis',
      prefix: 'You are a senior analyst with expertise in research methodology, data interpretation, and evidence-based reasoning.',
      suffix: 'Please structure your analysis as follows:\n1. **Executive Summary** — Key findings at a glance\n2. **Detailed Analysis** — In-depth breakdown with supporting evidence\n3. **Conclusions** — Data-driven insights\n4. **Recommendations** — Actionable next steps',
    },
    creative: {
      name: 'Creative',
      icon: '🎨',
      description: 'Boost prompts for creative and design tasks',
      prefix: 'You are a highly creative professional who thinks outside the box and delivers innovative, original, and visually compelling ideas.',
      suffix: 'Please provide:\n- Multiple creative approaches or variations\n- Visual descriptions or mood references where applicable\n- Practical considerations for implementation\n- Inspiration sources or style references',
    },
    learning: {
      name: 'Learning',
      icon: '📚',
      description: 'Improve prompts for explanations and tutorials',
      prefix: 'You are a patient and skilled educator who excels at breaking down complex topics into clear, easy-to-understand explanations.',
      suffix: 'Please structure your explanation:\n1. **Simple Overview** — The concept in 1-2 sentences\n2. **Detailed Explanation** — Step-by-step breakdown with examples\n3. **Real-World Analogy** — A relatable comparison to aid understanding\n4. **Common Pitfalls** — Mistakes or misconceptions to avoid\n5. **Key Takeaways** — Summary of the most important points',
    },
    academic: {
      name: 'Academic',
      icon: '🎓',
      description: 'Formalize prompts for academic and research writing',
      prefix: 'You are an academic researcher with expertise in scholarly writing, critical analysis, and evidence-based argumentation.',
      suffix: 'Please provide a rigorous, well-cited response:\n- Use formal academic language\n- Support claims with evidence and logical reasoning\n- Acknowledge counterarguments and limitations\n- Suggest areas for further research if applicable',
    },
    business: {
      name: 'Business',
      icon: '💼',
      description: 'Optimize prompts for business strategy and planning',
      prefix: 'You are a senior business strategist with extensive experience in market analysis, strategic planning, and organizational leadership.',
      suffix: 'Please structure your response for a business audience:\n- Start with an executive summary\n- Include relevant market context\n- Provide data-driven recommendations\n- Consider ROI and implementation feasibility\n- Highlight risks and mitigation strategies',
    },
  };

  /**
   * Get a template by name
   */
  function getTemplate(name) {
    return templates[name] || templates.general;
  }

  /**
   * Get all template names and metadata
   */
  function getAllTemplates() {
    return Object.entries(templates).map(([key, template]) => ({
      key,
      name: template.name,
      icon: template.icon,
      description: template.description,
    }));
  }

  /**
   * Get template names
   */
  function getTemplateNames() {
    return Object.keys(templates);
  }

  return {
    getTemplate,
    getAllTemplates,
    getTemplateNames,
  };
})();

if (typeof window !== 'undefined') {
  window.PromptTemplates = PromptTemplates;
}
