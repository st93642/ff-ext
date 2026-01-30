# Usage Guide: Screenshot Crop Extension

## Quick Start

### Activation
Two ways to activate the screenshot crop mode:
1. **Click** the extension icon in the Firefox toolbar
2. **Press** `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)

### Making a Selection

#### Step 1: Activation
When you activate the extension, you'll see:
- The entire page covered with a dark semi-transparent overlay
- Your cursor changes to a crosshair (+)

#### Step 2: Start Selection
- Click and **hold** the left mouse button at the starting point
- A blue selection rectangle appears

#### Step 3: Drag to Select
- While holding the mouse button, drag to select the area
- The blue rectangle shows your selection
- The selected area is highlighted with a semi-transparent blue fill

#### Step 4: Auto-Scroll (Optional)
- If you drag near the **bottom edge** of the viewport, the page automatically scrolls down
- If you drag near the **top edge**, the page scrolls up
- The selection area expands as you scroll
- This helps you navigate to and select content that's not immediately visible
- **Note**: The screenshot captures only what's visible in the viewport when you release the mouse

#### Step 5: Complete Selection
- Release the mouse button to capture the screenshot
- The selection area is instantly cropped and copied to your clipboard
- You'll hear a quick capture sound
- A notification appears: "Cropped screenshot copied to clipboard!"

#### Step 6: Use Your Screenshot
- Paste the screenshot anywhere (Ctrl+V or Cmd+V):
  - Image editors (GIMP, Photoshop, Paint)
  - Document editors (Word, Google Docs)
  - Chat applications (Slack, Discord)
  - Email clients
  - Any application that accepts image paste

### Canceling
- Press **ESC** at any time to cancel and close the overlay
- The selection will be discarded

## Tips & Tricks

### Precise Selection
- Take your time to position the crosshair exactly where you want
- The selection rectangle shows pixel-perfect boundaries

### Auto-Scroll Threshold
- Auto-scroll activates when your mouse is within 50 pixels of the edge
- Speed: 10 pixels per frame (~60fps)
- Move your mouse away from the edge to stop scrolling

### High-DPI Displays
- The extension automatically handles retina and 4K displays
- Screenshots are captured at the correct pixel density
- No blurry or pixelated results

### Multiple Screenshots
- You can activate the extension multiple times
- Each screenshot overwrites the previous one in the clipboard
- Paste immediately after capture to save each screenshot

### Keyboard Shortcut
- Default: `Ctrl+Shift+S`
- Can be customized in Firefox:
  1. Go to `about:addons`
  2. Click the gear icon
  3. Select "Manage Extension Shortcuts"
  4. Find "Screenshot Capture"
  5. Set your preferred shortcut

## Common Use Cases

### 1. Capture a Specific UI Element
- Activate extension
- Select just the element you want (button, form, card, etc.)
- Perfect for bug reports or documentation

### 2. Capture Long Content
- Start selection at the top
- Drag down near the bottom edge to auto-scroll
- Navigate through the page to find the content you want
- Position your selection on the visible content and release
- Note: Only the visible viewport area is captured, so position carefully

### 3. Quick Social Media Sharing
- Capture the specific part of a webpage you want to share
- Paste directly into your social media post
- No need to crop in a separate tool

### 4. Documentation & Tutorials
- Capture step-by-step screenshots for guides
- Annotate in your favorite image editor after pasting
- Include in presentations or documentation

### 5. Bug Reports
- Capture the exact error message or UI issue
- Paste into your bug tracking system
- Developers get precise visual context

## Troubleshooting

### Extension Doesn't Activate
- **Solution**: Refresh the page (F5) and try again
- Some pages load slowly and may not have the content script ready

### Overlay Doesn't Appear
- **Solution**: Check if you're on a special Firefox page (about:*, chrome://*) 
- These pages don't support extensions
- Try on a regular webpage

### Clipboard Copy Fails
- **Solution**: Click on the page first to ensure it has focus
- Some websites have clipboard restrictions
- Try on a different website to verify the extension works

### Selection Looks Wrong
- **Solution**: Make sure to start from top-left and drag to bottom-right
- Or start from any corner and drag to the opposite corner
- The selection automatically adjusts to show the correct rectangle

### Auto-Scroll Too Fast/Slow
- The scroll speed is fixed at 10px per frame
- Move your mouse closer or further from the edge to control timing
- Or use regular page scrolling (mousewheel) to position first

## Privacy & Security

### What Data is Collected?
- **None!** The extension collects zero data
- No analytics, no telemetry, no tracking
- No external network requests

### Where are Screenshots Stored?
- Only in your clipboard (temporary)
- Not saved to disk automatically
- Not uploaded to any server
- You control what happens next

### What Can the Extension See?
- Only the current tab when you activate it
- Only when you explicitly click the icon or use the keyboard shortcut
- Cannot access other tabs or browser data

## Advanced

### Browser Developer Console
Open the console (F12) to see debug logs:
- Extension activation messages
- Screenshot capture progress
- Any errors or issues

### Manual Installation
For developers or testers:
```
1. Clone or download the repository
2. Open Firefox
3. Go to about:debugging#/runtime/this-firefox
4. Click "Load Temporary Add-on"
5. Select manifest.json from the extension directory
6. Extension is now active for this session
```

### Customization
Edit the source code to customize:
- `content.js`: Change overlay colors, scroll speed, thresholds
- `background.js`: Modify capture format, quality settings
- `manifest.json`: Change keyboard shortcut, permissions

## Support

### Reporting Issues
If you encounter problems:
1. Check the console for error messages (F12)
2. Try on a simple webpage to isolate the issue
3. Report with:
   - Firefox version
   - Operating system
   - Steps to reproduce
   - Console error messages (if any)

### Feature Requests
Future enhancements could include:
- Save to file (in addition to clipboard)
- Multiple selection areas
- Drawing/annotation tools
- Full page capture
- Delayed timer capture

## Summary

The Screenshot Crop Extension makes it easy to:
✅ Select exactly what you want to capture
✅ Auto-scroll for long content
✅ Instantly copy to clipboard
✅ Use keyboard shortcuts for efficiency
✅ Work with high-DPI displays
✅ Maintain privacy (no data collection)

**Enjoy capturing screenshots with precision and ease!**
