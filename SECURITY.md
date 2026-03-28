# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Supported       |

## Reporting a Vulnerability

If you discover a security vulnerability in Prompt Enhancer, please report it responsibly.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Instead, email the maintainer or use [GitHub Security Advisories](https://github.com/JeevaVenkidu/Prompt-Enhancer/security/advisories/new)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix**: As soon as possible, depending on severity

### Security Considerations

This extension handles:

- **API Keys**: Stored in `chrome.storage.sync` (encrypted by Chrome). Keys are only sent to their respective API endpoints (Google Gemini or OpenAI).
- **Prompt Data**: Enhanced prompts are stored locally in `chrome.storage.local` for history. Data never leaves the browser except for optional API calls.
- **Permissions**: The extension uses minimal permissions (`storage`, `activeTab`) following the principle of least privilege.
- **Content Scripts**: Injected only on specified AI platform domains. No `<all_urls>` access.
- **No Tracking**: The extension does not collect analytics, telemetry, or any user data.

### Best Practices for Users

- Keep your API keys secret — do not share them
- Regularly rotate your API keys
- Review the extension's permissions in `chrome://extensions/`
- Only install from trusted sources (this repository)

## Attribution

Thank you to all security researchers who help keep this project safe.
