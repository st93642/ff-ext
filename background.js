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
        await captureAndCropScreenshot(sender.tab.id, message.rect);
    }
    return true; // Keep message channel open for async operations
});

// Capture and crop screenshot
async function captureAndCropScreenshot(tabId, rect) {
    console.log('Capturing selection:', rect);
    
    try {
        // Validate selection dimensions
        if (!rect || rect.width <= 0 || rect.height <= 0) {
            throw new Error('Invalid selection dimensions');
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
                    
                    // Validate that crop area is within image bounds
                    const maxWidth = img.width / dpr;
                    const maxHeight = img.height / dpr;
                    
                    if (cropRect.left + cropRect.width > maxWidth || 
                        cropRect.top + cropRect.height > maxHeight ||
                        cropRect.left < 0 || cropRect.top < 0) {
                        throw new Error('Selection area exceeds image bounds');
                    }
                    
                    // Create a canvas to crop the image
                    const canvas = document.createElement('canvas');
                    canvas.width = cropRect.width * dpr;
                    canvas.height = cropRect.height * dpr;
                    
                    const ctx = canvas.getContext('2d');
                    
                    // Draw the cropped portion
                    // The captureVisibleTab captures the visible viewport with DPI scaling
                    ctx.drawImage(
                        img,
                        cropRect.left * dpr,
                        cropRect.top * dpr,
                        cropRect.width * dpr,
                        cropRect.height * dpr,
                        0,
                        0,
                        cropRect.width * dpr,
                        cropRect.height * dpr
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
