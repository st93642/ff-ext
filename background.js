// Handle icon click - capture screenshot immediately
browser.action.onClicked.addListener(async (tab) => {
    console.log('Extension clicked, starting capture...');
    
    try {
        // Capture screenshot first
        console.log('Capturing visible tab...');
        const dataUrl = await browser.tabs.captureVisibleTab(null, { format: "png" });
        console.log('Screenshot captured, dataUrl length:', dataUrl.length);
        
        // Convert data URL to blob in background
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        console.log('Blob created, size:', blob.size, 'type:', blob.type);
        
        // Inject script to write to clipboard
        const results = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: async (blobData) => {
                try {
                    // Convert base64 to blob
                    const byteString = atob(blobData.split(',')[1]);
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([ab], { type: 'image/png' });
                    
                    // Write to clipboard
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.toString() };
                }
            },
            args: [dataUrl]
        });
        
        console.log('Script execution result:', results);
        
        if (results && results[0] && results[0].result && results[0].result.success) {
            // Play capture sound
            try {
                await browser.scripting.executeScript({
                    target: { tabId: tab.id },
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
                message: 'Screenshot copied to clipboard!'
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
});
