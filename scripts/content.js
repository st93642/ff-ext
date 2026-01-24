(function() {
    /**
     * Extracts all visible text from the page.
     * Tries to be smart about what's actually visible.
     */
    function extractText() {
        // We use a clone to avoid messing with the actual page
        const body = document.body;
        if (!body) return "";

        // Alternatively, we can just use document.body.innerText
        // but it might include things we don't want.
        // innerText is generally better than textContent because it respects CSS styling (like display: none)
        
        return body.innerText.trim();
    }

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "extractText") {
            try {
                const text = extractText();
                sendResponse({ success: true, text: text });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        }
        return true; // Keep message channel open for async response
    });
})();
