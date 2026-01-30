# 🚀 Quick Start Guide

## Get Started in 3 Steps

### Step 1: Install the Extension
1. Open **Firefox**
2. Type `about:debugging#/runtime/this-firefox` in the address bar
3. Click **"Load Temporary Add-on..."**
4. Select `manifest.json` from this directory

### Step 2: Test It
1. Open `test-page.html` in Firefox (or any website)
2. Click the extension icon in your toolbar
3. Click and drag to select an area
4. Release to capture

### Step 3: Paste Your Screenshot
1. Open any image editor (Paint, GIMP, Photoshop, etc.)
2. Press **Ctrl+V** (or **Cmd+V** on Mac)
3. Your screenshot appears!

---

## Tips & Tricks

### 🎯 Auto-Scroll
Move your mouse to the edge of the screen while dragging to automatically scroll the page.

### ⌨️ Cancel Selection
Press **Escape** at any time to cancel the selection.

### 📏 Large Captures
Select areas larger than your screen - the extension automatically stitches multiple screenshots together!

### 🔄 Multiple Captures
Click the icon again to take another screenshot. No limit!

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Escape** | Cancel current selection |
| **Ctrl+V** / **Cmd+V** | Paste screenshot |

---

## What You Can Capture

 **Text content** - Articles, documentation, code  
 **Images** - Photos, diagrams, infographics  
 **Tables & data** - Spreadsheets, dashboards  
 **UI elements** - Buttons, menus, layouts  
 **Charts & graphs** - Data visualizations  
 **Canvas elements** - Drawn graphics  
 **Tall content** - Long articles (auto-stitched)  
 **Wide content** - Wide tables (auto-stitched)  

---

## Common Use Cases

### 📝 Documentation
Capture parts of web pages for tutorials or guides.

### 🐛 Bug Reports
Screenshot specific UI issues to share with developers.

### 💼 Presentations
Grab charts, graphs, or data for your slides.

### 📚 Research
Capture quotes, tables, or diagrams for reference.

### 🎨 Design
Screenshot UI elements for inspiration or mockups.

---

## Troubleshooting

### Icon not visible?
- Check `about:addons` to ensure the extension is enabled
- Right-click toolbar → Customize → drag icon from overflow menu

### Clipboard not working?
- Try pasting in a different application
- Some apps don't support PNG from clipboard

### Selection not starting?
- Reload the page and try again
- Check browser console for errors (F12)

### For more help, see:
- `README.md` - Complete documentation
- `INSTALL.md` - Installation troubleshooting
- `TESTING.md` - Detailed test cases

---

## File Reference

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration |
| `background.js` | Handles icon clicks and tab capture |
| `content.js` | Selection UI and screenshot logic |
| `test-page.html` | Test page with various content types |
| `README.md` | Full documentation |
| `INSTALL.md` | Installation guide |
| `TESTING.md` | Testing guide |
| `QUICK_START.md` | This file |

---

## Ready to Capture! 📸

That's it! You're ready to start capturing screenshots. 

**Happy screenshotting!** 🎉
