# Changelog

## [Unreleased] - 2026-01-30

### Added
- New camera icon design (fotocamera) for the extension toolbar icon
- Better coordinate clamping to handle edge cases and rounding errors

### Fixed
- **Fixed "Capture Failed" error**: Replaced strict bounds validation with intelligent clamping logic that handles rounding errors and edge cases gracefully
- **Fixed auto-scroll functionality**: Removed buggy selection box manipulation during scroll, simplified scrolling logic
- **Improved scroll smoothness**: Reduced scroll speed from 10px to 5px per frame for smoother, more controlled scrolling
- Fixed coordinate tracking during scroll with `initialScrollY` tracking

### Changed
- Extension icon changed from generic icon to camera icon (16x16, 48x48, 128x128 sizes)
- Auto-scroll now works more smoothly and reliably
- Selection coordinates are now properly clamped to viewport bounds instead of throwing errors
- Updated README to reflect camera icon and improved auto-scroll behavior

### Technical Details

#### content.js Changes
- Added `initialScrollY` variable to track scroll position when selection starts
- Removed problematic code that tried to adjust selection box dimensions during scroll
- Simplified `handleAutoScroll` function to only scroll the page, not manipulate the selection box
- Reduced `scrollSpeed` from 10 to 5 for smoother scrolling

#### background.js Changes
- Replaced strict bounds checking (`if (rect exceeds bounds) throw error`) with clamping logic
- Added `clampedRect` that automatically adjusts coordinates to fit within image bounds
- Better error messages for invalid selections
- Handles floating-point rounding errors gracefully

#### Icons
- Created new camera icon design using Python/Pillow
- Icons feature a simple camera body with lens and flash indicator
- Available in 16x16, 48x48, and 128x128 pixel sizes
- PNG format with transparency

### Testing
All changes have been validated:
- ✅ JavaScript syntax checked with Node.js
- ✅ Extension lint checked with web-ext
- ✅ Icon files validated as proper PNG format
- ✅ All required files present and properly formatted

The extension is ready for manual testing in Firefox.
