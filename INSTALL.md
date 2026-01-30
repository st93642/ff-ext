# Installation Guide

## Quick Install (Temporary - For Testing)

### Firefox Developer Edition or Firefox Nightly
1. Open Firefox
2. Type `about:debugging#/runtime/this-firefox` in the address bar and press Enter
3. Click **"Load Temporary Add-on..."** button
4. Navigate to the extension directory
5. Select the `manifest.json` file
6. The extension will be loaded and the icon will appear in your toolbar

**Note:** Temporary add-ons are removed when you close Firefox. You'll need to reload it each time.

### Firefox Regular Edition
Same steps as above. The extension will work but needs to be reloaded each browser session.

---

## Permanent Install (Signed Extension)

For permanent installation, the extension needs to be signed by Mozilla. There are two approaches:

### Option 1: Self-Distribution (Recommended for Testing)

1. **Get an API Key from Mozilla:**
   - Go to https://addons.mozilla.org/developers/
   - Sign in or create an account
   - Go to Tools → API Credentials
   - Generate new credentials

2. **Install web-ext:**
   ```bash
   npm install -g web-ext
   ```

3. **Sign the extension:**
   ```bash
   cd /path/to/extension
   web-ext sign --api-key=YOUR_API_KEY --api-secret=YOUR_API_SECRET
   ```

4. **Install the signed .xpi:**
   - Firefox will generate a signed `.xpi` file in `web-ext-artifacts/`
   - Open Firefox
   - Type `about:addons` in the address bar
   - Click the gear icon (⚙️) and select "Install Add-on From File..."
   - Select the signed `.xpi` file

### Option 2: Firefox Add-ons Store (AMO)

For public distribution:

1. Create a ZIP file of the extension:
   ```bash
   cd /path/to/extension
   zip -r screenshot-extension.zip * -x "*.git*" -x "*node_modules*" -x "test-page.html" -x "TESTING.md"
   ```

2. Submit to AMO:
   - Go to https://addons.mozilla.org/developers/
   - Click "Submit a New Add-on"
   - Upload your ZIP file
   - Fill in required information
   - Wait for review (can take several days to weeks)

---

## Verify Installation

After installation, verify it works:

1. Look for the extension icon in the Firefox toolbar
2. Click the icon - you should see a selection overlay
3. If you don't see the icon:
   - Right-click the toolbar
   - Select "Customize Toolbar..."
   - Drag the extension icon from the overflow menu to the toolbar

---

## Troubleshooting

### Extension Not Loading

**Error: "Reading manifest: Error processing browser_action"**
- Make sure you're using Firefox (not Chrome)
- Verify manifest.json is valid JSON

**Error: "Invalid extension"**
- Check that all files exist: `manifest.json`, `background.js`, `content.js`
- Verify icon files exist in `icons/` directory

### Icon Not Appearing

If installed but icon not visible:
1. Type `about:addons` in address bar
2. Check if "Screenshot Area Capture" is listed and enabled
3. Try disabling and re-enabling the extension

### Permission Warnings

Firefox may show warnings about permissions:
- ✅ **"Access your data for all websites"** - Required to inject content script
- ✅ **"Input data to the clipboard"** - Required to copy screenshots

These are necessary for the extension to function.

---

## Uninstallation

### Temporary Extension
Simply close Firefox and the extension will be removed.

### Permanent Extension
1. Type `about:addons` in the address bar
2. Find "Screenshot Area Capture"
3. Click the three-dot menu (⋯)
4. Select "Remove"

---

## Platform-Specific Notes

### Linux
- Clipboard functionality requires X11 or Wayland with proper clipboard support
- Test clipboard by pasting in GIMP, Krita, or LibreOffice

### macOS
- Clipboard integration works with all standard apps
- Paste into Preview, Pixelmator, Photoshop, etc.

### Windows
- Works with Paint, Photoshop, GIMP, etc.
- Some UWP apps may have clipboard restrictions

---

## Alternative Loading Methods

### Using web-ext (Development Mode)

```bash
# Install web-ext
npm install -g web-ext

# Run in development mode
cd /path/to/extension
web-ext run
```

This will:
- Open a new Firefox profile
- Automatically load the extension
- Auto-reload on file changes

### Using Firefox Developer Edition

Firefox Developer Edition provides better extension development tools:
- Better debugging
- More detailed error messages
- Extension reload button in about:debugging

Download: https://www.mozilla.org/firefox/developer/

---

## Post-Installation

After installing:

1. **Test the Extension:**
   - Open `test-page.html` in Firefox
   - Click the extension icon
   - Try capturing different areas
   - See `TESTING.md` for comprehensive test cases

2. **Read the Documentation:**
   - `README.md` - Feature overview and technical details
   - `TESTING.md` - Comprehensive testing guide
   - This file (`INSTALL.md`) - Installation instructions

3. **Report Issues:**
   - Note any errors in the browser console
   - Check `about:debugging` for extension logs
   - Document steps to reproduce any problems

---

## Next Steps

✅ Extension installed successfully?
→ Open `test-page.html` and try your first screenshot!

❌ Having issues?
→ Check "Troubleshooting" section above or see `TESTING.md`

Ready to develop?
→ See `README.md` for technical architecture and file structure
