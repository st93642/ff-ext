// State for selection
let isSelecting = false;
let startX, startY;
let currentX, currentY;
let overlay, selectionBox, screenshotImage;
let screenshotDataUrl = null;
let scrollInterval = null;
let SCROLL_SPEED = 15;
let SCROLL_THRESHOLD = 30;
let SCROLL_INTERVAL = 16;

// Initialize overlay
function createOverlay() {
    if (overlay) return;
    
    overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2147483647;
        background: rgba(0, 0, 0, 0.3);
        cursor: crosshair;
        display: none;
        user-select: none;
    `;
    
    selectionBox = document.createElement('div');
    selectionBox.style.cssText = `
        position: absolute;
        border: 2px dashed #ffffff;
        background: rgba(255, 255, 255, 0.2);
        pointer-events: none;
        display: none;
    `;
    
    overlay.appendChild(selectionBox);
    document.body.appendChild(overlay);
}

// Remove overlay
function removeOverlay() {
    if (overlay) {
        overlay.remove();
        overlay = null;
        selectionBox = null;
    }
}

// Calculate scroll direction based on mouse position
function checkScroll(x, y) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let scrollX = 0;
    let scrollY = 0;
    
    // Horizontal scroll
    if (x < SCROLL_THRESHOLD) {
        scrollX = -SCROLL_SPEED;
    } else if (x > viewportWidth - SCROLL_THRESHOLD) {
        scrollX = SCROLL_SPEED;
    }
    
    // Vertical scroll
    if (y < SCROLL_THRESHOLD) {
        scrollY = -SCROLL_SPEED;
    } else if (y > viewportHeight - SCROLL_THRESHOLD) {
        scrollY = SCROLL_SPEED;
    }
    
    return { scrollX, scrollY };
}

// Auto-scroll function
function startAutoScroll(x, y) {
    stopAutoScroll();
    
    function scroll() {
        if (!isSelecting) return;
        
        const { scrollX, scrollY } = checkScroll(x, y);
        
        if (scrollX !== 0 || scrollY !== 0) {
            window.scrollBy(scrollX, scrollY);
            
            // Adjust current coordinates based on scroll
            currentX = Math.max(0, Math.min(window.innerWidth, currentX + scrollX));
            currentY = Math.max(0, Math.min(window.innerHeight, currentY + scrollY));
            
            updateSelectionBox();
        }
    }
    
    scrollInterval = setInterval(scroll, SCROLL_INTERVAL);
}

function stopAutoScroll() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
}

// Update selection box
function updateSelectionBox() {
    if (!selectionBox || !isSelecting) return;
    
    const rect = getSelectionRect();
    selectionBox.style.left = rect.left + 'px';
    selectionBox.style.top = rect.top + 'px';
    selectionBox.style.width = rect.width + 'px';
    selectionBox.style.height = rect.height + 'px';
    selectionBox.style.display = 'block';
}

// Get selection rectangle
function getSelectionRect() {
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    return { left, top, width, height };
}

// Capture visible tab
async function captureTab() {
    return new Promise((resolve, reject) => {
        browser.runtime.sendMessage({ action: 'capture' }, (response) => {
            if (response && response.dataUrl) {
                resolve(response.dataUrl);
            } else {
                reject(new Error(response?.error || 'Capture failed'));
            }
        });
    });
}

// Crop image from data URL
function cropImage(dataUrl, rect) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Get current scroll position
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;
            
            // Calculate actual position in the screenshot
            const actualX = Math.floor(rect.left + scrollX);
            const actualY = Math.floor(rect.top + scrollY);
            const actualWidth = Math.floor(rect.width);
            const actualHeight = Math.floor(rect.height);
            
            // Validate crop area
            if (actualX < 0 || actualY < 0 || 
                actualX + actualWidth > img.width || 
                actualY + actualHeight > img.height ||
                actualWidth <= 0 || actualHeight <= 0) {
                reject(new Error('Invalid crop area'));
                return;
            }
            
            canvas.width = actualWidth;
            canvas.height = actualHeight;
            
            ctx.drawImage(
                img,
                actualX, actualY, actualWidth, actualHeight,
                0, 0, actualWidth, actualHeight
            );
            
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob'));
                }
            }, 'image/png');
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
    });
}

// Copy blob to clipboard
async function copyToClipboard(blob) {
    try {
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        return true;
    } catch (e) {
        console.error('Clipboard error:', e);
        return false;
    }
}

// Play capture sound
function playCaptureSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const bufferSize = audioCtx.sampleRate * 0.1;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        const envelope = audioCtx.createGain();
        envelope.gain.setValueAtTime(0.3, audioCtx.currentTime);
        envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        whiteNoise.connect(filter);
        filter.connect(envelope);
        envelope.connect(audioCtx.destination);
        
        whiteNoise.start();
        whiteNoise.stop(audioCtx.currentTime + 0.1);
        
        setTimeout(() => {
            audioCtx.close();
        }, 200);
    } catch (e) {
        console.log('Sound failed (optional):', e);
    }
}

// Show notification
function showNotification(title, message) {
    browser.runtime.sendMessage({
        action: 'notify',
        title,
        message
    });
}

// Start selection mode
async function startSelectionMode() {
    createOverlay();
    overlay.style.display = 'block';
    
    // Capture screenshot for later use
    try {
        screenshotDataUrl = await captureTab();
        console.log('Screenshot captured, ready for selection');
    } catch (e) {
        console.error('Failed to capture:', e);
        removeOverlay();
        showNotification('Error', 'Failed to capture screenshot');
        return;
    }
}

// Mouse down handler
overlay.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only left click
    
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    currentX = e.clientX;
    currentY = e.clientY;
    
    updateSelectionBox();
});

// Mouse move handler
overlay.addEventListener('mousemove', (e) => {
    if (!isSelecting) return;
    
    currentX = e.clientX;
    currentY = e.clientY;
    
    updateSelectionBox();
    
    // Check if we need to auto-scroll
    const { scrollX, scrollY } = checkScroll(currentX, currentY);
    if (scrollX !== 0 || scrollY !== 0) {
        startAutoScroll(currentX, currentY);
    } else {
        stopAutoScroll();
    }
});

// Mouse up handler
overlay.addEventListener('mouseup', async (e) => {
    if (!isSelecting) return;
    
    stopAutoScroll();
    isSelecting = false;
    
    const rect = getSelectionRect();
    
    // If selection is too small, cancel
    if (rect.width < 10 || rect.height < 10) {
        removeOverlay();
        return;
    }
    
    // Crop and copy
    try {
        overlay.style.display = 'none';
        
        const blob = await cropImage(screenshotDataUrl, rect);
        const success = await copyToClipboard(blob);
        
        if (success) {
            playCaptureSound();
            showNotification('Screenshot Captured', 'Cropped area copied to clipboard!');
        } else {
            showNotification('Error', 'Failed to copy to clipboard');
        }
    } catch (e) {
        console.error('Crop/copy error:', e);
        showNotification('Error', 'Failed to crop and copy: ' + e.message);
    } finally {
        removeOverlay();
    }
});

// Mouse leave handler
overlay.addEventListener('mouseleave', () => {
    if (isSelecting) {
        stopAutoScroll();
    }
});

// Escape key to cancel
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay) {
        stopAutoScroll();
        isSelecting = false;
        removeOverlay();
    }
});

// Listen for messages from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startSelection') {
        startSelectionMode();
        sendResponse({ success: true });
    }
    return true;
});

console.log('Screenshot capture content script loaded');
