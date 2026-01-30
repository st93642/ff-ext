# Screenshot Capture Extension

A Firefox extension that allows you to crop and capture screenshots with drag selection and automatic clipboard copy.

## Features

- 🖱️ **Drag Selection**: Click and drag to select any rectangular area on a webpage
- 📋 **Instant Clipboard Copy**: Automatically copies the cropped screenshot to your clipboard
- ⬇️ **Auto-Scroll**: Automatically scrolls down when you drag near the bottom of the viewport
- ⌨️ **Keyboard Shortcut**: Use `Ctrl+Shift+S` to quickly activate selection mode
- 🎨 **Visual Feedback**: Clear visual overlay shows your selection area
- 🔊 **Audio Feedback**: Plays a capture sound when screenshot is taken
- 📱 **Notification**: Shows a success notification after capture

## Installation

### For Development/Testing

1. Clone this repository or download the source code
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to the extension directory and select the `manifest.json` file
5. The extension will be loaded and its icon will appear in the toolbar

### For Production

1. Package the extension files into a `.zip` file
2. Submit to Mozilla Add-ons (AMO) for review and distribution
3. Or use it as a private extension for your organization

## Usage

### Method 1: Extension Icon
1. Click the extension icon in the toolbar
2. The page will be overlaid with a dark semi-transparent layer
3. Your cursor will change to a crosshair
4. Click and hold the left mouse button, then drag to select the area you want to capture
5. Release the mouse button to capture the selected area
6. The cropped screenshot is automatically copied to your clipboard
7. Paste it anywhere (e.g., in an image editor, document, or chat application)

### Method 2: Keyboard Shortcut
1. Press `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)
2. Follow steps 2-7 from Method 1

### Auto-Scroll Feature
- When selecting an area, if you drag your mouse near the bottom edge of the viewport, the page will automatically scroll down
- This allows you to capture areas larger than the visible viewport
- The selection area expands as the page scrolls

### Canceling Selection
- Press `ESC` key at any time to cancel the selection and close the overlay

## Permissions

This extension requires the following permissions:

- **activeTab**: To capture the current tab's content
- **scripting**: To inject the selection overlay into web pages
- **notifications**: To show success/error notifications
- **clipboardWrite**: To copy the screenshot to clipboard
- **host_permissions** (`<all_urls>`): To work on all websites

## Technical Details

### How It Works

1. **Activation**: When you click the extension icon or use the keyboard shortcut, the background script sends a message to the content script
2. **Selection Overlay**: The content script creates a visual overlay with selection tracking
3. **Capture**: When you finish selecting, the content script sends the selection coordinates to the background script
4. **Screenshot**: The background script uses `browser.tabs.captureVisibleTab()` to capture the entire visible viewport
5. **Cropping**: The captured image is loaded into a canvas, and only the selected portion is extracted
6. **Clipboard**: The cropped image is converted to a blob and written to the clipboard using the Clipboard API
7. **Feedback**: A notification is shown and an audio cue is played

### Browser Compatibility

- **Firefox**: Fully supported (Manifest V3)
- **Chrome/Edge**: Should work with minor modifications (using `chrome.*` APIs instead of `browser.*`)

### Files Structure

```
ff-ext/
├── manifest.json       # Extension configuration
├── background.js       # Background script handling capture and cropping
├── content.js         # Content script for selection overlay UI
├── icons/             # Extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md          # This file
```

## Development

### Testing
1. Load the extension as described in the Installation section
2. Open any webpage
3. Use the extension to capture screenshots
4. Check the browser console for debug logs

### Building
No build step is required. The extension uses vanilla JavaScript without any dependencies.

## Privacy

This extension:
- ✅ Does NOT send any data to external servers
- ✅ Does NOT store any screenshots or user data
- ✅ Only accesses the current tab when you explicitly activate it
- ✅ Works completely offline

## Troubleshooting

### Extension doesn't activate
- Make sure you've granted all required permissions
- Try refreshing the page and activating again
- Check the browser console for error messages

### Clipboard copy fails
- Some websites may have restrictions on clipboard access
- Make sure you're using a recent version of Firefox
- Try clicking on the page first to ensure it has focus

### Selection overlay doesn't appear
- The page might be blocking content scripts
- Try refreshing the page
- Some special pages (like `about:` pages) cannot run extensions

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

[Specify your license here]

## Credits

Developed using Firefox WebExtension APIs (Manifest V3).
