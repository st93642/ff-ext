# Installation Guide

## Quick Start - Load Extension in Firefox

### Step 1: Open Firefox Developer Tools
1. Open Firefox browser
2. Type in the address bar: `about:debugging`
3. Press Enter
4. Click on "This Firefox" in the left sidebar

### Step 2: Load the Extension
1. Click the **"Load Temporary Add-on..."** button
2. Navigate to the extension directory (where you cloned this repo)
3. Select the `manifest.json` file
4. Click "Open"

### Step 3: Verify Installation
You should see:
- Extension listed in the Temporary Extensions section
- Extension icon appears in the Firefox toolbar
- Name: "Screenshot Capture"
- Status: Active/Enabled

## Testing the Extension

### Test 1: Basic Capture
1. Open any webpage (e.g., https://example.com)
2. Click the extension icon in the toolbar
3. You should see a dark overlay with crosshair cursor
4. Click and drag to select a small area
5. Release mouse button
6. You should hear a capture sound and see a notification
7. Paste (Ctrl+V) in an image editor to verify the screenshot

### Test 2: Keyboard Shortcut
1. Open any webpage
2. Press `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)
3. The overlay should appear
4. Follow steps 4-7 from Test 1

### Test 3: Auto-Scroll
1. Open the included `test.html` file in Firefox
   - File > Open File > Select test.html
2. Click the extension icon or press `Ctrl+Shift+S`
3. Start selecting from the top of the page
4. Drag your mouse down near the bottom edge of the viewport
5. The page should automatically scroll down
6. The selection area should expand as you scroll
7. Release when desired content is in view
8. Verify the screenshot contains the selected viewport area

### Test 4: Cancel with ESC
1. Activate the extension (icon or keyboard)
2. Press the `ESC` key
3. The overlay should disappear without capturing

### Test 5: Multiple Captures
1. Make a selection and capture
2. Paste in an image editor (keep it open)
3. Go back to Firefox
4. Make another selection and capture
5. Paste in the image editor again
6. Verify you have two different screenshots

## Troubleshooting

### Extension doesn't load
- **Solution**: Make sure you selected the `manifest.json` file, not a folder
- Check the console for error messages

### Overlay doesn't appear
- **Solution**: Refresh the webpage (F5) and try again
- Some pages like `about:*` don't support extensions

### Can't paste screenshot
- **Solution**: Make sure to click on the page before activating
- Try pasting in different applications (Paint, GIMP, etc.)
- Check Firefox permissions for clipboard access

### Auto-scroll doesn't work
- **Solution**: Make sure the page is scrollable
- Try on the test.html page which is designed for scrolling
- Drag mouse very close to the bottom edge (within 50px)

## Permissions

When you first install, Firefox will ask for these permissions:
- **Access your data for all websites**: Required to capture screenshots
- **Store unlimited amount of client-side data**: Not actually used, but required for Manifest V3
- **Display notifications**: To show success/error messages

These are all necessary for the extension to function.

## Uninstalling

### Temporary Extensions
Temporary extensions are automatically removed when you:
- Close Firefox
- Click the "Remove" button in about:debugging

### Permanent Installation
If you've installed from AMO:
1. Go to `about:addons`
2. Find "Screenshot Capture"
3. Click the three dots
4. Select "Remove"

## Next Steps

After successful testing:
1. Report any bugs or issues on GitHub
2. Suggest features or improvements
3. Star the repository if you find it useful
4. Share with others who might benefit

## Development Mode

If you're developing or modifying the extension:

### Auto-Reload
Firefox doesn't auto-reload temporary extensions. After making changes:
1. Go to `about:debugging`
2. Find your extension
3. Click "Reload"

### Console Logs
To see debug logs:
1. Press F12 to open Developer Tools
2. Click the "Console" tab
3. Look for messages starting with your extension name
4. Filter by "screenshot" to see only relevant logs

### Background Script Console
To see background script logs:
1. Go to `about:debugging`
2. Find your extension
3. Click "Inspect" next to the background script
4. This opens a separate console for the background script

## System Requirements

- **Browser**: Firefox 109 or later (for Manifest V3 support)
- **OS**: Windows, macOS, or Linux
- **Memory**: At least 4GB RAM recommended
- **Display**: Any resolution (high-DPI supported)

## File Permissions

Make sure the extension files have correct permissions:
```bash
chmod 644 manifest.json background.js content.js
chmod 755 icons/
```

## Browser Configuration

No special Firefox configuration required. The extension works with default settings.

## Privacy Notice

This extension:
- ✅ Does NOT collect any data
- ✅ Does NOT send anything to external servers
- ✅ Works completely offline
- ✅ Only accesses the current tab when you activate it
- ✅ Does NOT store screenshots persistently

## Support

For help or questions:
1. Check the README.md for usage instructions
2. Check the USAGE.md for detailed guide
3. Check the IMPLEMENTATION.md for technical details
4. Open an issue on GitHub
5. Check existing issues for similar problems

## Contributing

If you want to contribute:
1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Describe your changes clearly

---

**Enjoy capturing screenshots with ease!** 📸
