const captureBtn = document.getElementById('captureBtn');
const statusDiv = document.getElementById('status');

function playCaptureSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
    } catch (e) {
        console.error('Failed to play sound:', e);
    }
}

captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    statusDiv.textContent = 'Capturing...';
    playCaptureSound();

    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        // Try to extract text first
        let response;
        try {
            response = await browser.tabs.sendMessage(tab.id, { action: 'extractText' });
        } catch (err) {
            console.error('Failed to send message to content script:', err);
            // Fallback to screenshot if content script fails (e.g. on restricted pages)
            response = { success: false };
        }

        if (response && response.success && response.text.length >= 50) {
            // Text mode
            await copyTextToClipboard(response.text);
            showFeedback('text');
        } else {
            // Screenshot fallback
            const dataUrl = await browser.runtime.sendMessage({ action: 'screenshot' });
            if (dataUrl.success) {
                await copyImageToClipboard(dataUrl.dataUrl);
                showFeedback('screenshot');
            } else {
                throw new Error(dataUrl.error || 'Screenshot failed');
            }
        }
    } catch (error) {
        console.error('Error during capture:', error);
        statusDiv.textContent = 'Error: ' + error.message;
        captureBtn.disabled = false;
    }
});

async function copyTextToClipboard(text) {
    await navigator.clipboard.writeText(text);
}

async function copyImageToClipboard(dataUrl) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    await navigator.clipboard.write([
        new ClipboardItem({
            [blob.type]: blob
        })
    ]);
}

function showFeedback(type) {
    captureBtn.textContent = 'Captured';
    captureBtn.classList.add('captured');
    statusDiv.textContent = (type === 'text' ? 'Text' : 'Screenshot') + ' copied to clipboard!';
    
    setTimeout(() => {
        captureBtn.textContent = 'Capture';
        captureBtn.classList.remove('captured');
        captureBtn.disabled = false;
        statusDiv.textContent = '';
    }, 3000);
}
