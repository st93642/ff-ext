# Firefox Screenshot Extension - AI Coding Guidelines

## Architecture Overview
This is a Firefox extension (Manifest V2) for capturing webpage areas with auto-scroll and stitching. Key components:
- `manifest.json`: Defines permissions, browser action, and background script
- `background.js`: Handles icon clicks, injects content script, manages tab capture and clipboard
- `content.js`: Implements selection UI, auto-scroll logic, and multi-viewport stitching

## Communication Patterns
- Background injects `content.js` dynamically via `browser.tabs.executeScript`
- Use `browser.runtime.sendMessage` for cross-script communication
- Prevent multiple content script injections with `window.__screenshotExtensionLoaded`

## Key Implementation Details
- **Auto-scroll**: Triggers at 60px from viewport edges, scrolls at 18px/frame (~60fps)
- **Stitching**: Uses 20% overlap between captures for seamless assembly
- **Z-index**: UI elements use `2147483647` for maximum layering
- **Capture API**: Relies on `browser.tabs.captureVisibleTab` (not `chrome.tabs.captureVisibleTab`)
- **Clipboard**: Uses `browser.clipboard.setImageData` for PNG data

## Development Workflow
- No build process required - pure JavaScript
- Test via `about:debugging#/runtime/this-firefox` (Load Temporary Add-on)
- Debug with Firefox DevTools console and extension debugging panel
- Verify on scroll-heavy sites (news articles, docs) and canvas/WebGL content

## Code Patterns
- Async/await for all capture operations with `sleep()` delays for scroll completion
- Canvas-based image processing for cropping and stitching
- Event prevention (`e.preventDefault()`) on selection UI interactions
- Toast notifications with CSS animations for user feedback

## Common Pitfalls
- Always restore original scroll position after capture
- Handle cross-origin iframe limitations gracefully
- Use `requestAnimationFrame` for UI updates before capture
- Check minimum selection size (10x10px) before processing