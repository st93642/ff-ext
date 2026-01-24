# Text Capture & Screenshot Firefox Extension

This Firefox extension allows users to capture text from any webpage with a single click. If the page contains minimal text (e.g., image-heavy pages), it automatically falls back to capturing a screenshot of the viewport.

## Features

- **Text Extraction**: Captures all visible text from the current page.
- **Screenshot Fallback**: Automatically takes a screenshot if the text content is less than 50 characters.
- **Clipboard Integration**: 
  - Text is copied to the clipboard as plain text.
  - Screenshots are copied to the clipboard as image data.
- **Visual Feedback**:
  - Button state changes from "Capture" to "Captured".
  - Status messages indicating the capture type.
  - Native browser notifications for confirmation.

## Technical Implementation

- **Manifest V3**: Compatible with the latest Firefox extension standards.
- **Native Screenshot API**: Uses `browser.tabs.captureVisibleTab` for high-quality, reliable viewport capture.
- **Clipboard API**: Utilizes the modern `navigator.clipboard` API for both text and image blobs.
- **Content Scripts**: Safely extracts text from the DOM using `innerText` to respect CSS visibility.

## Installation

1. Open Firefox and navigate to `about:debugging`.
2. Click on **"This Firefox"** in the left sidebar.
3. Click on **"Load Temporary Add-on..."**.
4. Navigate to the extension directory and select the `manifest.json` file.
5. The extension icon (a blue square) will appear in your browser toolbar or under the extensions menu.

## Usage

1. Navigate to any webpage you want to capture.
2. Click the extension icon in the toolbar.
3. Click the **"Capture"** button.
4. The content will be copied to your clipboard, and you will receive a notification.
5. If the page is primarily images or has very little text, a screenshot will be captured instead.

## Project Structure

- `manifest.json`: Extension configuration.
- `popup/`: UI for the extension's browser action.
- `scripts/content.js`: Script injected into webpages to extract text.
- `scripts/background.js`: Handles screenshot capture.
- `icons/`: Extension icons (16x16, 48x48, 128x128).
