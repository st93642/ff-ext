# Screenshot Area Capture - Browser Extension

A powerful cross-browser extension that enables users to capture any area of a webpage with auto-scroll support. Click the extension icon, drag to select an area, and the screenshot is automatically copied to your clipboard as PNG.

## Features

- **One-Click Activation**: Click the extension icon to immediately start area selection
- **Auto-Scroll During Selection**: Selection automatically scrolls the page when mouse reaches viewport edges
- **Intelligent Stitching**: Captures areas larger than viewport by automatically scrolling and stitching multiple screenshots
- **Video & Canvas Support**: Captures video elements and HTML5 canvas content including shared screens
- **Clipboard Integration**: Automatically copies the captured screenshot to clipboard
- **Universal Compatibility**: Works across most websites
- **Visual Feedback**: Toast notifications keep you informed of capture status

## Supported Browsers

This repository includes extensions for multiple browsers:

- **Firefox**: Full support (Manifest V2, uses `browser.*` APIs) - Root directory
- **Google Chrome**: Full support (Manifest V2, uses `chrome.*` APIs) - `Chrome/` directory
- **Yandex Browser**: Full support (Manifest V2, uses `chrome.*` APIs) - `Chrome/` directory
- Other Chromium-based browsers (Brave, Edge, Opera) - Use `Chrome/` directory

## Installation

### Firefox

#### Load as Temporary Extension (for testing)

1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Navigate to the extension directory (root) and select `manifest.json`

#### Permanent Installation

1. Open Firefox
2. Navigate to `about:addons`
3. Click the gear icon and select "Install Add-on From File..."
4. Select the packaged `.xpi` file (or zip the extension directory and rename to `.xpi`)

### Google Chrome & Yandex Browser

#### Load as Unpacked Extension (for testing)

**Google Chrome:**
1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked"
5. Navigate to the `Chrome/` directory and select it

**Yandex Browser:**
1. Open Yandex Browser
2. Navigate to `browser://extensions/` or `yabrowser://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked extension"
5. Navigate to the `Chrome/` directory and select it

#### Permanent Installation

**Google Chrome & Yandex Browser:**
1. Navigate to the extensions page (`chrome://extensions/` or `browser://extensions/`)
2. Enable "Developer mode"
3. Click "Pack extension"
4. Select the `Chrome/` directory and click "Pack extension"
5. This will create a `.crx` file that can be shared and installed
6. To install: Drag and drop the `.crx` file onto the extensions page with Developer mode enabled

**Note**: For production distribution, extensions should be published to their respective web stores (Chrome Web Store for Chrome/Yandex, Firefox Add-ons for Firefox).

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
- `clipboardRead`: Read from clipboard (Firefox only)
- `<all_urls>`: Access content across all websites

### Browser Compatibility

#### Firefox Version (Root Directory)
- Minimum Firefox version: 57+ (Quantum)
- Uses `browser.*` APIs (WebExtensions standard)
- Manifest V2 format
- Includes Firefox-specific settings

#### Chrome/Yandex Browser Version (`Chrome/` Directory)
- Minimum Chrome version: 88+
- Minimum Yandex Browser version: 21+
- Uses `chrome.*` APIs
- Manifest V2 format
- Compatible with all Chromium-based browsers

### File Structure

```
/                           # Firefox version
├── manifest.json           # Firefox manifest (Manifest V2)
├── background.js           # Firefox background script (browser.* APIs)
├── content.js              # Content script (shared logic)
├── icons/                  # Icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── README.md               # This file
└── Chrome/                 # Chrome & Yandex Browser version
    ├── manifest.json       # Chrome manifest (Manifest V2)
    ├── background.js       # Chrome background script (chrome.* APIs)
    ├── content.js          # Content script (shared logic)
    ├── icons/              # Icons (copy)
    └── README.md           # Chrome-specific documentation
```

## Differences Between Browser Versions

### Firefox vs Chrome/Yandex

| Feature | Firefox | Chrome/Yandex |
|---------|---------|---------------|
| API Namespace | `browser.*` | `chrome.*` |
| Manifest | V2 | V2 |
| Clipboard Read | Supported | Not needed |
| Browser-Specific Settings | Yes (gecko) | No |
| Clipboard Image API | Full support | Chrome 88+ |

### Shared Components

- `content.js` contains identical logic across all versions
- Auto-scroll and stitching algorithms are the same
- Icons are identical across all versions
- User experience is consistent across browsers

## Limitations

- Cross-origin iframes may not be fully captured due to browser security policies
- Some websites with aggressive CSP may limit functionality
- Fixed/sticky headers may appear in stitched screenshots
- Cross-origin video/canvas elements with CORS restrictions may not be capturable
- Chrome/Yandex: Clipboard API may require user gesture in some versions
- Firefox: `clipboardRead` permission may require user approval

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

#### Firefox

1. Open Firefox Developer Tools (F12)
2. Check Console for errors
3. Use `about:debugging` to inspect the extension
4. Check background page logs in extension debugging view

#### Chrome

1. Open Chrome Developer Tools (F12)
2. Check Console for errors
3. Navigate to `chrome://extensions/`
4. Click "Inspect views: background page" to view background script logs

#### Yandex Browser

1. Open Yandex Browser Developer Tools (F12)
2. Check Console for errors
3. Navigate to `browser://extensions/`
4. Click "Inspect views: background page" to view background script logs

## Browser-Specific Documentation

- **Firefox**: See this README for Firefox-specific information
- **Chrome & Yandex Browser**: See `Chrome/README.md` for detailed Chrome/Yandex information

## Future Improvements

- Upgrade to Manifest V3 for Chrome compatibility
- Add option to save to file in addition to clipboard
- Add configurable hotkeys
- Add annotation tools after capture
- Support for capturing full page with one click
- Unify codebase to use a single source with build tools

## License

MIT License - feel free to modify and distribute.

## Version History

### 1.2.0
- Added Chrome & Yandex Browser support in `Chrome/` directory
- Cross-browser compatibility with separate API implementations
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
