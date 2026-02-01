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

**Migrated to Manifest V3:**
- `manifest_version`: 2 → 3
- `browser_action` → `action`
- `background.scripts` → `background.service_worker`
- Permissions reorganized: `permissions` for API access, `host_permissions` for host matching
- Removed `clipboardWrite` (handled via user gesture in content script)
- Updated CSP format for extension pages
- Added `scripting` permission for content script injection

**Removed (Firefox-specific):**
- `browser_specific_settings` with `gecko` configuration
- `clipboardRead` permission (not needed for Chrome/Yandex)

### 2. background.js

**API Changes:**
- Changed all `browser.*` to `chrome.*`
- Migrated to service worker architecture (Manifest V3)
- Updated content script injection to use `chrome.scripting.executeScript`
- Clipboard implementation uses function injection instead of code string

**Changed:**
- `chrome.browserAction` → `chrome.action`
- `chrome.tabs.executeScript` → `chrome.scripting.executeScript`
- Clipboard code injection replaced with function injection for better security

### 3. content.js

**API Changes:**
- Changed all `browser.*` to `chrome.*`
- All functionality remains identical
- Same auto-scroll and stitching logic
- Added rate limiting delay in stitching loop to prevent captureVisibleTab quota exceeded errors
- Clipboard functionality uses background script method as primary (preserves user gesture context)
- Fixed sleep function hoisting issue by moving to top of scope

**Changed:**
- `browser.runtime.sendMessage()` → `chrome.runtime.sendMessage()`
- Added 500ms delay between captures in multi-view stitching to comply with Chrome's MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND quota
- Clipboard copy now prioritizes background script method (maintains user gesture context), with direct clipboard and download fallbacks
- Moved sleep utility function to top of IIFE to fix ReferenceError
- Background script method is more reliable for multi-viewport captures due to user gesture preservation
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
