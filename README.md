# Screenshot Capture Extension

A Firefox extension for capturing and cropping screenshots with automatic scrolling support.

## Features

- **Area Selection**: Click and drag to select the exact area you want to capture
- **Auto-Scroll**: Automatically scrolls when you move the mouse to screen edges during selection
- **Instant Clipboard Copy**: Selected area is instantly copied to clipboard as PNG
- **Keyboard Shortcut**: Use `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac) to start capture
- **Audio Feedback**: Plays a sound when screenshot is successfully captured
- **Visual Feedback**: Shows notification on successful capture or error

## How to Use

### Method 1: Extension Icon
1. Click the extension icon in the browser toolbar
2. The screen will darken
3. Click and hold the mouse button to start selecting an area
4. Drag to define the rectangle
5. Move mouse to edges to auto-scroll if needed
6. Release mouse button to capture and copy to clipboard

### Method 2: Keyboard Shortcut
1. Press `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)
2. Follow the same steps as above

### Tips
- The selection tool works on scrollable pages - just drag to the edge to auto-scroll
- Press `Escape` to cancel selection at any time
- Minimum selection size is 10x10 pixels (smaller selections are ignored)
- The captured image is automatically copied to clipboard as PNG

## Installation

### Development Build
1. Load unpacked extension in Firefox:
   - Open Firefox and go to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file in this directory

### Building for Distribution
1. Create a zip file of all extension files
2. Upload to Firefox Add-ons (AMO) or distribute manually

## Permissions

- `activeTab`: Access to the current tab for capturing screenshots
- `scripting`: Inject content scripts for selection UI
- `notifications`: Show success/error notifications
- `clipboardWrite`: Copy screenshots to clipboard

## Technical Details

### Architecture
- **background.js**: Handles extension events, captures screenshots, manages keyboard shortcuts
- **content.js**: Implements selection UI, auto-scroll logic, image cropping, clipboard operations

### Auto-Scroll Logic
- Detects when mouse is within 30px of screen edge
- Scrolls at 15px per 16ms interval
- Adjusts selection coordinates during scroll
- Works both horizontally and vertically

### Crop Process
1. Capture full visible tab as data URL
2. Convert to Image object
3. Use HTML5 Canvas to extract selected region
4. Convert canvas to Blob
5. Write to Clipboard API with `ClipboardItem`

## License

MIT License
