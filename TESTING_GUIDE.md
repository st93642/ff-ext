# Testing Guide for Website-Independent Autoscroll

## Quick Test

### Prerequisites
1. Firefox browser installed
2. Extension loaded in Firefox (`about:debugging#/runtime/this-firefox`)

### Basic Test (Standard Sites)
1. Open `test-autoscroll.html` in Firefox
2. Click extension icon or press Ctrl+Shift+S
3. Click and drag selection from top
4. Move mouse to within 50px of bottom edge
5. **Expected**: Page scrolls down automatically
6. Release mouse to capture screenshot
7. **Success**: Autoscroll worked smoothly

### Restricted Sites Test (Sites with Custom Scroll)
1. Open `test-restricted-sites.html` in Firefox
2. Open browser console (F12) to see blocking logs
3. Click extension icon or press Ctrl+Shift+S
4. Click and drag selection from top
5. Move mouse to within 50px of bottom edge
6. **Expected**: Console shows "blocked" messages but page still scrolls
7. **Success**: Extension bypasses restrictions using fallback methods

### Real-World Test Sites

#### Test on TryHackMe (the original problem site)
1. Navigate to https://tryhackme.com (or any THM room)
2. Activate extension selection mode
3. Drag near bottom edge
4. **Expected**: Autoscroll now works on THM

#### Test on News Sites (should continue working)
1. Navigate to any news website (e.g., CNN, BBC, etc.)
2. Activate extension selection mode
3. Drag near bottom edge
4. **Expected**: Autoscroll still works as before

#### Other Sites to Test
- Reddit (custom scroll)
- Twitter/X (infinite scroll)
- Medium (custom implementation)
- GitHub (long pages)
- Stack Overflow (standard scroll)

## What to Look For

### ✅ Success Indicators
- Page scrolls smoothly when mouse is within 50px of viewport edge
- Selection box expands as page scrolls
- No console errors
- Screenshot captures correctly after scrolling
- Works on both standard and custom-scroll sites

### ❌ Failure Indicators
- Page doesn't scroll at all
- Jerky or stuttering scroll
- Selection box doesn't update during scroll
- Console shows errors
- Extension crashes or freezes

## Troubleshooting

### If autoscroll doesn't work:
1. Check browser console for errors
2. Verify extension is loaded and active
3. Try refreshing the page
4. Verify the page actually has scrollable content
5. Try on a different website to isolate the issue

### If performance is poor:
1. Close other tabs/extensions
2. Check if the site has heavy JavaScript
3. Try a different browser profile
4. Monitor CPU/memory usage

## Technical Verification

### Check Which Method Was Used
Add this to test code to see which scroll method succeeded:

```javascript
// Temporarily add logging to performScroll
console.log('Trying method 1: window.scrollBy');
// ... after each attempt
console.log('Method 1 worked!'); // or continue to next
```

### Expected Behavior by Site Type

| Site Type | Primary Method | Fallback Method |
|-----------|---------------|-----------------|
| Standard sites | window.scrollBy | N/A |
| Custom scroll sites | scrollingElement.scrollTop | documentElement.scrollTop |
| Legacy sites | documentElement.scrollTop | body.scrollTop |
| Restricted sites | scrollingElement.scrollTop | documentElement.scrollTop |

## Automated Testing (Optional)

### Create a test suite:
```javascript
// Test all 5 methods work
function testAllMethods() {
    const tests = [
        { name: 'window.scrollBy', test: () => { window.scrollBy(0, 100); }},
        { name: 'window.scroll', test: () => { window.scroll(0, 100); }},
        { name: 'scrollingElement', test: () => { document.scrollingElement.scrollTop = 100; }},
        { name: 'documentElement', test: () => { document.documentElement.scrollTop = 100; }},
        { name: 'body', test: () => { document.body.scrollTop = 100; }}
    ];
    
    tests.forEach(({name, test}) => {
        try {
            test();
            console.log(`✓ ${name} works`);
        } catch (e) {
            console.log(`✗ ${name} failed:`, e);
        }
    });
}
```

## Performance Testing

### Measure scroll performance:
```javascript
// Time how long scroll takes
const start = performance.now();
performScroll(100);
const end = performance.now();
console.log(`Scroll took ${end - start}ms`);
// Should be < 1ms for early returns
```

## Reporting Issues

If you find a site where autoscroll doesn't work, please report:
1. Website URL
2. Browser version
3. Console error messages
4. Which methods failed (if visible in console)
5. Screenshots or video of the issue

## Success Criteria

✅ Extension autoscroll works on:
- Standard HTML sites
- Custom scroll implementations
- Sites with scroll restrictions
- Legacy browser-compatible sites
- Modern single-page applications
- Sites where it previously worked (backward compatible)

The implementation is considered successful if autoscroll works on 95%+ of websites, including the problematic sites mentioned in the original issue (TryHackMe).
