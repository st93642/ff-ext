// Handle icon click - start selection mode for crop screenshot
let isActivating = false;

browser.action.onClicked.addListener(async (tab) => {
    console.log('Extension clicked, starting selection mode...');
    
    // Prevent concurrent activations
    if (isActivating) {
        console.log('Already activating, ignoring duplicate request');
        return;
    }
    
    isActivating = true;
    
    try {
        // Send message to content script to start selection
        await browser.tabs.sendMessage(tab.id, { action: 'startSelection' });
    } catch (error) {
        console.error('Error starting selection:', error);
        await browser.notifications.create({
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/icon-48.png'),
            title: 'Selection Failed',
            message: 'Could not start selection mode. Please refresh the page.'
        });
    } finally {
        // Reset flag after a short delay to allow activation to complete
        setTimeout(() => {
            isActivating = false;
        }, 500);
    }
});

// Handle messages from content script
browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.action === 'captureSelection') {
        await captureAndCropScreenshot(sender.tab.id, message.rect, message.documentRect, message.currentScrollY, message.currentScrollX);
    }
    return true; // Keep message channel open for async operations
});

// Capture and crop screenshot
async function captureAndCropScreenshot(tabId, rect, documentRect, originalScrollY, originalScrollX) {
    console.log('Capturing selection:', rect, 'Document rect:', documentRect);
    
    try {
        // Validate selection dimensions
        if (!rect || rect.width <= 0 || rect.height <= 0) {
            throw new Error('Invalid selection dimensions');
        }
        
        // Determine if we need to scroll to capture the selection
        // If the selection extends beyond the current viewport, we need to position it optimally
        const viewportDimensions = await browser.scripting.executeScript({
            target: { tabId: tabId },
            func: () => ({ width: window.innerWidth, height: window.innerHeight })
        }).then(results => results[0].result);
        
        let needsScroll = false;
        let targetScrollY = originalScrollY;
        let targetScrollX = originalScrollX;
        
        // Check if selection is fully visible in current viewport (vertically)
        if (rect.top < 0 || rect.top + rect.height > viewportDimensions.height) {
            needsScroll = true;
            // Scroll to center the selection vertically
            targetScrollY = documentRect.top - (viewportDimensions.height - documentRect.height) / 2;
            targetScrollY = Math.max(0, targetScrollY); // Don't scroll above page
        }
        
        // Check if selection is fully visible in current viewport (horizontally)
        if (rect.left < 0 || rect.left + rect.width > viewportDimensions.width) {
            needsScroll = true;
            // Scroll to center the selection horizontally
            targetScrollX = documentRect.left - (viewportDimensions.width - documentRect.width) / 2;
            targetScrollX = Math.max(0, targetScrollX); // Don't scroll left of page
        }
        
        // If we need to scroll, do it before capturing
        if (needsScroll) {
            await browser.scripting.executeScript({
                target: { tabId: tabId },
                func: (scrollX, scrollY) => {
                    window.scrollTo(scrollX, scrollY);
                },
                args: [targetScrollX, targetScrollY]
            });
            
            // Wait a bit for the scroll to complete and page to render
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Recalculate viewport-relative coordinates based on new scroll position
            // Create a new rect object instead of modifying the parameter
            rect = {
                left: documentRect.left - targetScrollX,
                top: documentRect.top - targetScrollY,
                width: rect.width,
                height: rect.height
            };
        }
        
        // Capture the entire visible tab
        console.log('Capturing visible tab...');
        const dataUrl = await browser.tabs.captureVisibleTab(null, { format: "png" });
        console.log('Screenshot captured, dataUrl length:', dataUrl.length);
        
        // Inject script to crop and copy to clipboard
        const results = await browser.scripting.executeScript({
            target: { tabId: tabId },
            func: async (imageDataUrl, cropRect) => {
                try {
                    // Create an image from the data URL
                    const img = new Image();
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = imageDataUrl;
                    });
                    
                    // Get device pixel ratio for high-DPI screens
                    const dpr = window.devicePixelRatio || 1;
                    
                    // Validate and clamp crop area to be within image bounds
                    const maxWidth = img.width / dpr;
                    const maxHeight = img.height / dpr;
                    
                    // Clamp the crop rectangle to image bounds (allow small rounding errors)
                    const clampedRect = {
                        left: Math.max(0, Math.min(cropRect.left, maxWidth - 1)),
                        top: Math.max(0, Math.min(cropRect.top, maxHeight - 1)),
                        width: cropRect.width,
                        height: cropRect.height
                    };
                    
                    // Adjust width and height to fit within bounds
                    clampedRect.width = Math.min(clampedRect.width, maxWidth - clampedRect.left);
                    clampedRect.height = Math.min(clampedRect.height, maxHeight - clampedRect.top);
                    
                    // Ensure we have a valid selection
                    if (clampedRect.width <= 0 || clampedRect.height <= 0) {
                        throw new Error('Selection area is invalid or too small');
                    }
                    
                    // Create a canvas to crop the image
                    const canvas = document.createElement('canvas');
                    canvas.width = clampedRect.width * dpr;
                    canvas.height = clampedRect.height * dpr;
                    
                    const ctx = canvas.getContext('2d');
                    
                    // Draw the cropped portion
                    // The captureVisibleTab captures the visible viewport with DPI scaling
                    ctx.drawImage(
                        img,
                        clampedRect.left * dpr,
                        clampedRect.top * dpr,
                        clampedRect.width * dpr,
                        clampedRect.height * dpr,
                        0,
                        0,
                        clampedRect.width * dpr,
                        clampedRect.height * dpr
                    );
                    
                    // Convert canvas to blob
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, 'image/png');
                    });
                    
                    // Write to clipboard
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.toString() };
                }
            },
            args: [dataUrl, rect]
        });
        
        console.log('Script execution result:', results);
        
        if (results && results[0] && results[0].result && results[0].result.success) {
            // Restore original scroll position if we changed it
            if (needsScroll) {
                try {
                    await browser.scripting.executeScript({
                        target: { tabId: tabId },
                        func: (scrollX, scrollY) => {
                            window.scrollTo(scrollX, scrollY);
                        },
                        args: [originalScrollX, originalScrollY]
                    });
                } catch (e) {
                    console.log('Could not restore scroll position:', e);
                }
            }
            
            // Play capture sound
            try {
                await browser.scripting.executeScript({
                    target: { tabId: tabId },
                    func: () => {
                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        
                        // Ensure context is running
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
                        
                        // Close context after playing to free resources
                        setTimeout(() => {
                            audioCtx.close();
                        }, 200);
                    }
                });
            } catch (e) {
                console.log('Sound failed (optional):', e);
            }
            
            // Show success notification
            await browser.notifications.create({
                type: 'basic',
                iconUrl: browser.runtime.getURL('icons/icon-48.png'),
                title: 'Screenshot Captured',
                message: 'Cropped screenshot copied to clipboard!'
            });
        } else {
            throw new Error(results[0]?.result?.error || 'Clipboard write failed');
        }
        
    } catch (error) {
        console.error('Error during capture:', error);
        await browser.notifications.create({
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/icon-48.png'),
            title: 'Capture Failed',
            message: error.message || 'Failed to capture screenshot'
        });
    }
}
