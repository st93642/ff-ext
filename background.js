// Handle icon click - start selection mode
browser.action.onClicked.addListener(async (tab) => {
    console.log('Extension clicked, starting selection mode...');
    
    try {
        // Inject content script
        await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        
        // Start selection mode
        await browser.tabs.sendMessage(tab.id, { action: 'startSelection' });
        
    } catch (error) {
        console.error('Error starting selection:', error);
        await browser.notifications.create({
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/icon-48.png'),
            title: 'Error',
            message: 'Failed to start selection mode'
        });
    }
});

// Handle keyboard shortcut
browser.commands.onCommand.addListener(async (command, tab) => {
    if (command === 'capture-selection') {
        console.log('Keyboard shortcut triggered');
        
        try {
            // Inject content script
            await browser.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            
            // Start selection mode
            await browser.tabs.sendMessage(tab.id, { action: 'startSelection' });
            
        } catch (error) {
            console.error('Error starting selection via shortcut:', error);
            await browser.notifications.create({
                type: 'basic',
                iconUrl: browser.runtime.getURL('icons/icon-48.png'),
                title: 'Error',
                message: 'Failed to start selection mode'
            });
        }
    }
});

// Handle messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message);
    
    if (message.action === 'capture') {
        // Capture screenshot and send to content script
        browser.tabs.captureVisibleTab(null, { format: "png" })
            .then(dataUrl => {
                console.log('Screenshot captured, length:', dataUrl.length);
                sendResponse({ dataUrl });
            })
            .catch(error => {
                console.error('Capture error:', error);
                sendResponse({ error: error.message });
            });
        return true; // Keep message channel open for async response
    }
    
    if (message.action === 'notify') {
        // Show notification
        browser.notifications.create({
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/icon-48.png'),
            title: message.title,
            message: message.message
        }).catch(console.error);
    }
    
    return true;
});

console.log('Background script loaded');
