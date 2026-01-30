# Local Testing Instructions

## Quick Start

### 1. Load the Extension in Firefox

```bash
# Open Firefox
# Press Ctrl+Shift+Alt+I or navigate to: about:debugging#/runtime/this-firefox
# Click "Load Temporary Add-on"
# Navigate to: /home/runner/work/ff-ext/ff-ext
# Select: manifest.json
```

### 2. Verify the New Camera Icon

Look at your Firefox toolbar - you should see a **camera icon** 📷 (not the old icon).

### 3. Open Test Page

Open this test page in Firefox:
```
file:///tmp/test-page.html
```

Or use any website with scrollable content.

### 4. Test Basic Capture

1. Click the camera icon (or press `Ctrl+Shift+S`)
2. Click and drag to select any area
3. Release the mouse
4. You should see a notification: "Screenshot Captured"
5. Open any image editor (like GIMP, Paint, etc.) and paste (`Ctrl+V`)
6. Your screenshot should appear!

### 5. Test Auto-Scroll (Main Fix)

This is the key test for the "screen not scrolling" issue:

1. Scroll to the top of the test page
2. Click the camera icon to activate selection mode
3. Click near the top of the page and start dragging
4. **Slowly drag your mouse toward the bottom edge of the viewport**
5. **When your mouse gets within 50 pixels of the bottom, the page should auto-scroll down**
6. Keep dragging and the page should keep scrolling
7. Release when you've scrolled to the desired position
8. The visible content should be captured

Expected behavior:
- ✅ Smooth scrolling when mouse near bottom edge
- ✅ Smooth scrolling when mouse near top edge
- ✅ No errors in console
- ✅ Screenshot captured successfully

### 6. Test Edge Cases

Try these scenarios to test the "capture failed" fix:

1. **Edge Selection**: Select from the very edge of the viewport (should work, not throw bounds error)
2. **Large Selection**: Select the entire visible viewport (should work)
3. **Small Selection**: Select a tiny 10x10 pixel area (should work)
4. **Cancel**: Press `ESC` during selection (should cancel cleanly)
5. **Multiple Captures**: Do several captures in a row (should work each time)

### 7. Check Console for Errors

Open Browser Console (`Ctrl+Shift+J`) and look for:
- ❌ No "Capture Failed" errors
- ❌ No "Selection area exceeds image bounds" errors
- ✅ Should see: "Screenshot captured, dataUrl length: ..."
- ✅ Should see: "Extension clicked, starting selection mode..."

## What Was Fixed

### Issue 1: "i get error capture failed"
**Root Cause**: Strict bounds checking threw errors when selection was slightly outside viewport due to rounding errors.

**Fix**: Implemented intelligent coordinate clamping that automatically adjusts selection to fit within bounds instead of failing.

**Test**: Try selecting at the very edge of viewport - should work without errors now.

### Issue 2: "screen is not scrolling down when i select area"
**Root Cause**: Auto-scroll code was manipulating selection box dimensions during scroll, causing visual glitches and preventing smooth scrolling.

**Fix**: 
- Simplified auto-scroll to only scroll the page
- Removed buggy selection box manipulation
- Reduced scroll speed from 10px to 5px for smoother experience
- Added scroll position tracking

**Test**: Drag near bottom/top edges - should scroll smoothly now.

### Issue 3: "change extension icon to fotocamera"
**Fix**: Created new camera icon design in all required sizes (16x16, 48x48, 128x128).

**Test**: Check toolbar - should show camera icon.

## Expected Results

After testing, you should observe:

1. ✅ Camera icon in toolbar
2. ✅ Smooth auto-scroll when dragging near edges
3. ✅ No "capture failed" errors
4. ✅ Screenshots captured successfully
5. ✅ Can paste screenshots in image editors
6. ✅ Multiple captures work without issues
7. ✅ ESC key cancels selection properly
8. ✅ Edge cases handled gracefully

## Troubleshooting

If something doesn't work:

1. **Extension not loading**: Make sure you selected `manifest.json` file
2. **Icon not updated**: Hard refresh Firefox (`Ctrl+Shift+R`) or reload extension
3. **Scrolling not working**: Make sure the page has scrollable content and your mouse is within 50px of edge
4. **Capture failed**: Check Browser Console for specific error messages
5. **Clipboard not working**: Make sure you're using Firefox 63+ and page has focus

## Files Changed in This Fix

1. `icons/icon-16.png` - New camera icon
2. `icons/icon-48.png` - New camera icon
3. `icons/icon-128.png` - New camera icon
4. `content.js` - Fixed auto-scroll and coordinate tracking
5. `background.js` - Fixed bounds checking with clamping
6. `README.md` - Updated documentation
7. `CHANGELOG.md` - Added changelog

## Next Steps

After successful testing:
1. Confirm all three issues are fixed
2. Test on different websites
3. Test with different viewport sizes
4. Test on high-DPI displays if available

---

**Need Help?** Check the browser console for error messages and compare behavior with the expected results above.
