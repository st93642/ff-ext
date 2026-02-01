# Chrome & Yandex Browser Port - Changes Summary

## What Was Done

This document summarizes the changes made to create a Chrome & Yandex Browser compatible version of the Screenshot Area Capture extension.

## New Directory Structure

```
Chrome/
├── manifest.json       # Chrome/Yandex compatible manifest
├── background.js       # Chrome/Yandex background script (chrome.* APIs)
├── content.js          # Content script (converted to chrome.* APIs)
├── icons/              # Icon files (copied from root)
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── README.md           # Chrome/Yandex specific documentation
└── CHANGES.md          # This file
```

## Key Changes

### 1. manifest.json

**Removed (Firefox-specific):**
- `browser_specific_settings` with `gecko` configuration
- `clipboardRead` permission (not needed for Chrome/Yandex)

**Kept:**
- Manifest V2 format for broad compatibility
- `browser_action` (same as Firefox)
- All other permissions and settings

### 2. background.js

**API Changes:**
- Changed all `browser.*` to `chrome.*`
- All functionality remains identical
- Same message handling and logic

**Changed:**
- `browser.browserAction` → `chrome.browserAction`
- `browser.tabs` → `chrome.tabs`
- `browser.runtime` → `chrome.runtime`
- `browser.clipboard` → `chrome.clipboard`

### 3. content.js

**API Changes:**
- Changed all `browser.*` to `chrome.*`
- All functionality remains identical
- Same auto-scroll and stitching logic

**Changed:**
- `browser.runtime.sendMessage()` → `chrome.runtime.sendMessage()`
- `browser.runtime.onMessage` → `chrome.runtime.onMessage`

### 4. Icons

- Copied all icon files from root `icons/` directory
- No changes to icons

### 5. Documentation

**Root README.md:**
- Updated to document both Firefox and Chrome/Yandex versions
- Added installation instructions for all browsers
- Added comparison table between browser versions
- Added file structure showing both versions

**Chrome/README.md:**
- Comprehensive documentation for Chrome and Yandex Browser
- Detailed installation steps for both browsers
- Browser-specific notes and limitations
- Debugging instructions for each browser

## Browser Compatibility

### Chrome
- Version 88+ (for clipboard image API)
- Full functionality supported
- Can load as unpacked extension
- Can be packaged as .crx

### Yandex Browser
- Version 21+ (Chromium-based)
- Full functionality supported
- Uses same extension format as Chrome
- Can load as unpacked extension
- Can be packaged as .crx

### Other Chromium Browsers
The Chrome version is also compatible with:
- Brave Browser
- Microsoft Edge
- Opera
- Any other Chromium-based browser

## Testing Recommendations

Test the Chrome/Yandex version on:

1. **Google Chrome**
   - Load as unpacked extension
   - Test on various websites
   - Verify clipboard functionality
   - Test auto-scroll and stitching

2. **Yandex Browser**
   - Load as unpacked extension
   - Test on various websites
   - Verify clipboard functionality
   - Test auto-scroll and stitching

3. **Other Chromium Browsers** (optional)
   - Verify compatibility with Brave, Edge, Opera
   - Same testing steps as above

## Known Limitations

- Manifest V2 may show warnings in future Chrome versions
- Chrome 88+ required for clipboard image API
- Same limitations as Firefox version (cross-origin iframes, CSP, etc.)

## Future Improvements

- Upgrade to Manifest V3 for Chrome
- Consider unifying codebase with build tools
- Add browser-specific polyfills for unified source
- Add automated cross-browser testing

## Version Information

- Extension version: 1.2.0
- This port created: February 1, 2026
- Based on Firefox version 1.1.0
