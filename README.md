<div align="center">

# ✨ Prompt Enhancer

**Supercharge your AI prompts with one click.**

A Chrome Extension that enhances your prompts on ChatGPT, Claude, and Gemini — making them clearer, more structured, and dramatically more effective.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/JeevaVenkidu/Prompt-Enhancer)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-8b5cf6?style=for-the-badge)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-f59e0b?style=for-the-badge)](CONTRIBUTING.md)

<br />

<img src="https://raw.githubusercontent.com/JeevaVenkidu/Prompt-Enhancer/main/icons/icon128.png" alt="Prompt Enhancer Logo" width="128" />

<br />

**Works on** &nbsp; ChatGPT · Claude · Gemini

</div>

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **✨ One-Click Enhance** | Floating "Enhance" button appears right next to your prompt input |
| **🎯 Smart Detection** | Auto-detects prompt category (coding, writing, analysis, creative, etc.) |
| **📋 8 Templates** | Pre-built enhancement patterns for different use cases |
| **⚡ 3 Enhancement Levels** | Light (cleanup), Medium (structure), Aggressive (full rewrite) |
| **📝 Fix Typos** | Dedicated Quick Enhance button to instantly correct English grammar |
| **🔌 Hybrid Mode** | Works offline with templates; add an API key for AI-powered enhancement |
| **📜 History** | Keeps track of your last 50 enhanced prompts |
| **🎨 Premium UI** | Dark glassmorphism design with smooth animations |
| **⚙️ Customizable** | Default template, level, and API provider settings |

---

## 📸 Screenshots

<div align="center">

| Popup UI | On-Page Button | Settings |
|----------|---------------|----------|
| Dark glassmorphism popup with template grid and quick enhance | Floating ✨ Enhance button on ChatGPT/Claude/Gemini | API key management and preferences |

</div>

---

## 🛠️ Tech Stack

- **Platform**: Chrome Extension (Manifest V3)
- **Language**: Vanilla JavaScript (no frameworks, lightweight)
- **Styling**: CSS Variables with glassmorphism design
- **Typography**: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)
- **Storage**: `chrome.storage` API
- **AI APIs** (optional): Google Gemini, OpenAI

---

## 📦 Installation

### From Source (Developer Mode)

1. **Clone the repository**

   ```bash
   git clone https://github.com/JeevaVenkidu/Prompt-Enhancer.git
   cd Prompt-Enhancer
   ```

2. **Load in Chrome**

   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (top-right toggle)
   - Click **Load unpacked**
   - Select the `Prompt-Enhancer` folder

3. **Done!** The extension icon will appear in your toolbar. Visit any supported AI platform to see the ✨ Enhance button.

---

## 🎯 How to Use

### On AI Platforms (Content Script)

1. Go to [ChatGPT](https://chatgpt.com), [Claude](https://claude.ai), or [Gemini](https://gemini.google.com)
2. Type your prompt in the input field
3. Click the **✨ Enhance** button that appears
4. Your prompt is instantly enhanced!

> **💡 Tip:** Right-click the Enhance button to switch templates and enhancement levels on-the-fly.

### Quick Enhance (Popup)

1. Click the extension icon in the toolbar
2. Select a **template** (General, Coding, Writing, etc.)
3. Choose an **enhancement level** (Light, Medium, Aggressive)
4. Paste your prompt and click **✨ Enhance Prompt** or **📝 Fix Typos**
5. Copy the enhanced result

> **⌨️ Shortcut:** Press `Ctrl+Enter` to enhance from the popup.

---

## 📋 Enhancement Templates

| Template | Icon | Best For |
|----------|------|----------|
| **General** | ✨ | Everyday prompts, Q&A |
| **Coding** | 💻 | Code generation, debugging, architecture |
| **Writing** | ✍️ | Content creation, emails, copywriting |
| **Analysis** | 📊 | Data analysis, research, comparisons |
| **Creative** | 🎨 | Design, brainstorming, ideation |
| **Learning** | 📚 | Explanations, tutorials, teaching |
| **Academic** | 🎓 | Research papers, scholarly writing |
| **Business** | 💼 | Strategy, planning, reports |

---

## ⚡ Enhancement Levels

| Level | Effect | Example |
|-------|--------|---------|
| 🌱 **Light** | Minor cleanup and formatting | Adds punctuation, basic clarity |
| ⚡ **Medium** | Add structure, role, and format | Adds role prefix, output format instructions |
| 🚀 **Aggressive** | Full prompt restructuring | Complete rewrite with role, context, requirements, and quality standards |

---

## 🔌 Hybrid Mode

The extension works in two modes:

### Template Mode (Default — No API Key Required)
Uses built-in enhancement algorithms and templates. Works completely offline. Great for most use cases.

### AI-Powered Mode (Optional)
Add your own API key for smarter, context-aware enhancement:

1. Click the **⚙️ Settings** icon in the popup
2. Choose **Google Gemini** or **OpenAI**
3. Paste your API key
4. Click **Save API Key**

| Provider | Free Tier | Get API Key |
|----------|-----------|-------------|
| **Google Gemini** | ✅ Generous free tier | [Google AI Studio](https://aistudio.google.com/apikey) |
| **OpenAI** | ❌ Pay-as-you-go | [OpenAI Platform](https://platform.openai.com/api-keys) |

> **🔒 Security:** Your API key is stored locally in `chrome.storage.sync` and never leaves your browser except for API calls.

---

## 🏗️ Architecture

```
Prompt Enhancer/
├── manifest.json              # Extension config (Manifest V3)
├── icons/                     # Extension icons (16/48/128px)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── lib/                       # Core logic (shared)
│   ├── enhancer.js            # Enhancement engine
│   └── templates.js           # Pre-built templates
├── content/                   # Content scripts (injected into pages)
│   └── content.js             # Detects inputs, injects button
├── styles/                    # Injected CSS
│   └── content.css            # Floating button styling
├── popup/                     # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── background/                # Service worker
│   └── service-worker.js      # API calls & message routing
└── options/                   # Settings page
    └── options.html
```

### Communication Flow

```
Popup ←→ Service Worker (Background) ←→ Content Script
                ↓                              ↓
          chrome.storage              AI Platform Input
          (Gemini/OpenAI              (ChatGPT, Claude,
            API calls)                    Gemini)
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Prompt-Enhancer.git
cd Prompt-Enhancer

# Load in Chrome (Developer Mode)
# Make your changes
# Test thoroughly
# Submit a PR
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🔒 Security

If you discover a security vulnerability, please see [SECURITY.md](SECURITY.md) for responsible disclosure guidelines.

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

## 🙏 Acknowledgments

- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/) — Official documentation
- [Google Fonts - Inter](https://fonts.google.com/specimen/Inter) — Typography
- [Google Gemini API](https://ai.google.dev/) — AI-powered enhancement
- [OpenAI API](https://platform.openai.com/) — AI-powered enhancement

---

<div align="center">

**Built with ❤️ by [Jeeva Venkidu](https://github.com/JeevaVenkidu)**

⭐ Star this repo if you find it useful!

</div>
