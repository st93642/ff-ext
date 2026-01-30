# Screenshot Area Capture - Firefox Extension

A powerful Firefox extension that enables users to capture any area of a webpage with auto-scroll support. Click the extension icon, drag to select an area, and the screenshot is automatically copied to your clipboard as PNG.

## Features

- **One-Click Activation**: Click the extension icon to immediately start area selection
- **Auto-Scroll During Selection**: Selection automatically scrolls the page when mouse reaches viewport edges
- **Intelligent Stitching**: Captures areas larger than viewport by automatically scrolling and stitching multiple screenshots
- **Clipboard Integration**: Automatically copies the captured screenshot to clipboard
- **Universal Compatibility**: Works across most websites
- **Visual Feedback**: Toast notifications keep you informed of capture status

## Installation

### Load as Temporary Extension (for testing)

1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Navigate to the extension directory and select `manifest.json`

### Permanent Installation

1. Open Firefox
2. Navigate to `about:addons`
3. Click the gear icon and select "Install Add-on From File..."
4. Select the packaged `.xpi` file (or zip the extension directory and rename to `.xpi`)

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

- **Firefox**: Full support (Manifest V2)
- Minimum Firefox version: 57+ (Quantum)
- Uses `browser.*` APIs (not `chrome.*`)

### File Structure

```
/
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
- WebGL/Canvas content may have rendering limitations

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

1. Open Firefox Developer Tools (F12)
2. Check Console for errors
3. Use `about:debugging` to inspect the extension
4. Check background page logs in extension debugging view

## License

MIT License - feel free to modify and distribute.

## Version History

### 1.0.0
- Initial release
- One-click area selection
- Auto-scroll during selection
- Multi-viewport stitching
- Clipboard integration
