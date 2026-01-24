const captureBtn = document.getElementById('captureBtn');
const statusDiv = document.getElementById('status');

captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    statusDiv.textContent = 'Capturing...';

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
    await showNotification('Text captured', 'The page text has been copied to your clipboard.');
}

async function copyImageToClipboard(dataUrl) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    await navigator.clipboard.write([
        new ClipboardItem({
            [blob.type]: blob
        })
    ]);
    await showNotification('Screenshot captured', 'A screenshot of the viewport has been copied to your clipboard.');
}

async function showNotification(title, message) {
    await browser.runtime.sendMessage({
        action: 'notify',
        title: title,
        message: message
    });
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
