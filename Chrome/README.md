# Screenshot Area Capture - Chrome & Yandex Browser Extension

A powerful browser extension that enables users to capture any area of a webpage with auto-scroll support. Click the extension icon, drag to select an area, and the screenshot is automatically copied to your clipboard as PNG.

## Features

- **One-Click Activation**: Click the extension icon to immediately start area selection
- **Auto-Scroll During Selection**: Selection automatically scrolls the page when mouse reaches viewport edges
- **Intelligent Stitching**: Captures areas larger than viewport by automatically scrolling and stitching multiple screenshots
- **Video & Canvas Support**: Captures video elements and HTML5 canvas content including shared screens
- **Clipboard Integration**: Automatically copies the captured screenshot to clipboard
- **Universal Compatibility**: Works across most websites
- **Visual Feedback**: Toast notifications keep you informed of capture status

## Supported Browsers

- **Google Chrome**: Full support (Manifest V3)
- **Yandex Browser**: Full support (Manifest V3)
- Minimum Chrome version: 88+
- Minimum Yandex Browser version: 21+ (Chromium-based)

## Installation

### Load as Unpacked Extension (for testing)

#### Google Chrome

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked"
5. Navigate to the extension directory (`Chrome/`) and select it
6. The extension will appear in your extensions list

#### Yandex Browser

1. Open Yandex Browser
2. Navigate to `browser://extensions/` or `yabrowser://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked extension"
5. Navigate to the extension directory (`Chrome/`) and select it
6. The extension will appear in your extensions list

### Permanent Installation

#### Google Chrome

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Pack extension"
5. Select the extension directory and click "Pack extension"
6. This will create a `.crx` file that can be shared and installed
7. To install: Drag and drop the `.crx` file onto `chrome://extensions/` with Developer mode enabled

#### Yandex Browser

Yandex Browser uses the same extension format as Chrome:
1. Follow the same steps as for Google Chrome above
2. Alternatively, you can load the unpacked extension directly without packing

**Note**: For production distribution, extensions should be published to the Chrome Web Store. Both Chrome and Yandex Browser can install extensions from the Chrome Web Store.

## Usage

1. **Start Selection**: Click the extension icon in your browser toolbar
2. **Select Area**:
   - Click and drag to select the area you want to capture
   - Move mouse to viewport edges to auto-scroll while selecting
   - Press `Escape` to cancel
3. **Capture**: Release mouse button to capture
4. **Paste**: The screenshot is now in your clipboard - paste it anywhere (Ctrl+V / Cmd+V)

## Technical Details

### Auto-Scroll Stitching

When capturing an area larger than the current viewport:

1. Extension calculates the number of viewport-sized sections needed
2. Automatically scrolls to each position
3. Captures visible content at each position
4. Stitches all sections together on a canvas
5. Returns to original scroll position

### Permissions

- `activeTab`: Access the current tab to inject content script
- `tabs`: Required for `captureVisibleTab` API
- `clipboardWrite`: Copy screenshot to clipboard
- `<all_urls>`: Access content across all websites

### Browser Compatibility

This version uses Chrome-compatible APIs (`chrome.*`) and Manifest V2, making it compatible with:

- **Google Chrome**: Full native support
- **Yandex Browser**: Full native support (based on Chromium)
- **Brave Browser**: Compatible (Chromium-based)
- **Microsoft Edge**: Compatible (Chromium-based)
- **Opera**: Compatible (Chromium-based)

### Key Differences from Firefox Version

- Uses `chrome.*` namespace instead of `browser.*`
- Removed Firefox-specific `browser_specific_settings`
- Removed `clipboardRead` permission (not needed for Chrome/Yandex)
- Manifest V2 format (Chromium standard)

### File Structure

```
Chrome/
├── manifest.json       # Extension manifest (Manifest V2)
├── background.js       # Background script for icon clicks and tab capture
├── content.js         # Content script with selection UI and stitching logic
├── icons/
│   ├── icon-16.png    # 16x16 icon
│   ├── icon-48.png    # 48x48 icon
│   └── icon-128.png   # 128x128 icon
└── README.md          # This file
```

## Limitations

- Cross-origin iframes may not be fully captured due to browser security policies
- Some websites with aggressive CSP may limit functionality
- Fixed/sticky headers may appear in stitched screenshots
- Cross-origin video/canvas elements with CORS restrictions may not be capturable
- Clipboard API may require user gesture in some Chromium versions

## Development

### Building from Source

No build process required - this is a pure JavaScript extension.

### Testing

Test on various websites:
- News sites (scrolling long articles)
- Web applications (Google Docs, etc.)
- Video platforms (YouTube, Vimeo)
- Canvas-heavy sites

Verify:
- Auto-scroll works smoothly during selection
- Stitching aligns correctly for tall selections
- Clipboard write succeeds
- Original scroll position is restored

### Debugging

#### Google Chrome

1. Open Chrome Developer Tools (F12)
2. Check Console for errors
3. Navigate to `chrome://extensions/`
4. Click "Inspect views: background page" to view background script logs
5. For content script errors, open Developer Tools on the active tab

#### Yandex Browser

1. Open Yandex Browser Developer Tools (F12)
2. Check Console for errors
3. Navigate to `browser://extensions/`
4. Click "Inspect views: background page" to view background script logs
5. For content script errors, open Developer Tools on the active tab

## Browser-Specific Notes

### Google Chrome

- Supports both Manifest V2 and V3, this version uses V2 for maximum compatibility
- Clipboard image API (`chrome.clipboard.setImageData`) requires Chrome 88+
- Extension may show warnings in future Chrome versions as V2 is being phased out
- Consider upgrading to Manifest V3 for future-proofing

### Yandex Browser

- Based on Chromium engine, fully compatible with Chrome extensions
- Supports the same APIs as Google Chrome
- Extension loading process is identical to Chrome
- All features work exactly as in Google Chrome

## Future Improvements

- Upgrade to Manifest V3 for future Chrome compatibility
- Add option to save to file in addition to clipboard
- Add configurable hotkeys
- Add annotation tools after capture
- Support for capturing full page with one click

## License

MIT License - feel free to modify and distribute.

## Version History

### 1.2.0
- Ported to Chrome/Yandex Browser compatibility
- Changed API namespace from `browser.*` to `chrome.*`
- Removed Firefox-specific settings
- Updated documentation for multi-browser support

### 1.1.0
- Added support for capturing video elements
- Added support for capturing HTML5 canvas elements
- Improved capture of shared screen content
- Better handling of media elements in iframes

### 1.0.0
- Initial release (Firefox version)
- One-click area selection
- Auto-scroll during selection
- Multi-viewport stitching
- Clipboard integration
