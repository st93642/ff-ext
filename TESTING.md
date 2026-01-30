# Testing Guide for Screenshot Area Capture Extension

## Quick Start Testing

### 1. Load the Extension

**Firefox:**
1. Open Firefox
2. Type `about:debugging#/runtime/this-firefox` in the address bar
3. Click "Load Temporary Add-on..."
4. Navigate to the extension directory and select `manifest.json`
5. The extension icon should appear in the toolbar

### 2. Open Test Page

1. Open `test-page.html` in Firefox
2. Or navigate to any website you want to test

### 3. Basic Test

1. Click the extension icon in the toolbar
2. You should see a semi-transparent overlay with crosshair cursor
3. Click and drag to select an area
4. Release to capture
5. A green toast notification should appear
6. Press Ctrl+V (or Cmd+V) in an image editor to paste the screenshot

## Test Cases

### Test 1: Simple Small Selection
**Goal:** Verify basic capture functionality

1. Click extension icon
2. Select a small area (e.g., just the header on test-page.html)
3. Release
4. Verify:
   - Toast shows "Screenshot copied to clipboard!"
   - Pasted image matches selected area
   - Original scroll position unchanged

### Test 2: Auto-Scroll During Selection
**Goal:** Verify auto-scroll triggers when mouse approaches edges

1. Click extension icon
2. Start selection at top of page
3. While holding mouse button, move cursor to bottom edge of viewport
4. Verify:
   - Page automatically scrolls down
   - Selection box grows accordingly
5. Release at desired point
6. Check captured image includes scrolled content

### Test 3: Large Area Stitching (Multiple Viewports)
**Goal:** Verify stitching works for tall selections

1. Scroll to top of test page
2. Click extension icon
3. Select from top of "Tall Content Section" to bottom (spans ~1.5 viewports)
4. Release
5. Verify:
   - Toast shows "Capturing screenshot..." during processing
   - Final screenshot includes entire selected area
   - Content is properly aligned (no gaps or overlaps)
   - Colors and text are clear

### Test 4: Escape to Cancel
**Goal:** Verify selection can be canceled

1. Click extension icon
2. Start dragging a selection
3. Press Escape key
4. Verify:
   - Overlay disappears
   - No screenshot captured
   - No error messages

### Test 5: Minimum Selection Size
**Goal:** Verify tiny selections are ignored

1. Click extension icon
2. Click and immediately release (or make very small selection < 10x10px)
3. Verify:
   - No capture occurs
   - Overlay disappears cleanly

### Test 6: Multiple Consecutive Captures
**Goal:** Verify extension can be used multiple times

1. Click extension icon, capture area A
2. Wait for completion
3. Click extension icon again, capture area B
4. Verify both captures work independently

### Test 7: Different Website Types

**News Sites (e.g., BBC, CNN):**
- Test on long articles
- Verify text readability
- Check image quality

**Web Apps (e.g., Google Docs):**
- May have limited functionality due to CSP
- Test basic capture capabilities

**Video Platforms (e.g., YouTube):**
- Capture video player
- Verify UI elements captured correctly

**Canvas-Heavy Sites:**
- Open test-page.html
- Capture the canvas element section
- Verify canvas content appears in screenshot

## Debugging

### Extension Not Loading
- Check browser console for errors
- Verify manifest.json is valid JSON
- Ensure all file paths are correct

### Capture Not Working
1. Open Firefox Developer Tools (F12)
2. Check Console tab for errors
3. Look for messages like:
   - "Failed to capture visible tab"
   - "Clipboard write failed"

### Clipboard Issues
- Ensure Firefox has clipboard permissions
- Try pasting in different applications
- Check Firefox privacy settings

### Stitching Misalignment
- May occur on sites with:
  - Sticky/fixed headers
  - Parallax effects
  - Animated content
- Expected limitation - note in bug report

## Common Issues and Solutions

### Issue: "Screenshot copied to clipboard!" but paste fails
**Solution:** 
- Try pasting in different application
- Check Firefox clipboard permissions
- Some applications may not support PNG from clipboard

### Issue: Captured area is offset or wrong size
**Solution:**
- May occur on pages with transforms or zoom
- Try on test-page.html to verify extension works
- Report specific website if issue persists

### Issue: Auto-scroll doesn't trigger
**Solution:**
- Ensure mouse is within 60px of viewport edge
- Try moving mouse more slowly to edge
- Some pages may prevent scrolling (rare)

### Issue: Extension icon click does nothing
**Solution:**
- Check that content script injected (see Developer Tools)
- Reload the page and try again
- Some restricted pages (about:, chrome://) cannot be accessed

## Performance Testing

### Expected Performance

| Scenario | Expected Time |
|----------|--------------|
| Small selection (< viewport) | < 1 second |
| Medium (1-2 viewports) | 1-3 seconds |
| Large (3+ viewports) | 3-6 seconds |

### Performance Test Steps

1. Use browser's Performance tools
2. Start recording
3. Capture various sized areas
4. Check for:
   - Memory usage (should not leak)
   - CPU usage (brief spike is normal)
   - Cleanup (overlay elements removed)

## Browser Console Tests

### Enable Verbose Logging

Edit `content.js` and add console.log statements if needed:
```javascript
console.log('Selection started', { startX, startY });
console.log('Capture area', { left, top, width, height });
console.log('Stitching', { numRows, numCols });
```

### Expected Console Output

**Successful capture:**
```
Screenshot capture completed
```

**Error scenario:**
```
Screenshot capture error: [error message]
```

## Automated Testing Notes

The extension currently does not have automated tests. Future improvements could include:

1. Unit tests for utility functions
2. Integration tests using WebExtensions testing framework
3. Visual regression tests for stitching accuracy

## Reporting Issues

When reporting bugs, include:

1. Firefox version
2. Operating system
3. URL where issue occurred (if public)
4. Steps to reproduce
5. Expected vs actual behavior
6. Console errors (if any)
7. Screenshot of the issue (if applicable)

## Success Criteria

The extension passes testing if:

- ✅ Extension loads without errors
- ✅ Icon click triggers selection overlay
- ✅ Selection box follows mouse during drag
- ✅ Auto-scroll activates at viewport edges
- ✅ Small selections capture correctly
- ✅ Large selections stitch properly
- ✅ Captured image copies to clipboard
- ✅ Escape key cancels selection
- ✅ Toast notifications appear appropriately
- ✅ Original scroll position restored after capture
- ✅ No memory leaks or performance issues
- ✅ Works on test-page.html and at least 3 different websites
