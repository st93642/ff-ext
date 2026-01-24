browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "screenshot") {
        browser.tabs.captureVisibleTab(null, { format: "png" })
            .then(dataUrl => {
                sendResponse({ success: true, dataUrl: dataUrl });
            })
            .catch(err => {
                console.error("Screenshot capture failed:", err);
                sendResponse({ success: false, error: err.message });
            });
        return true; // Keep message channel open for async response
    } else if (request.action === "notify") {
        browser.notifications.create({
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/icon-48.png'),
            title: request.title,
            message: request.message
        });
        sendResponse({ success: true });
    }
});
