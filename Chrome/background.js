/*****************************************************************************/
/*                                                                           */
/*  background.js                                        TTTTTTTT SSSSSSS II */
/*                                                          TT    SS      II */
/*  By: st93642@students.tsi.lv                             TT    SSSSSSS II */
/*                                                          TT         SS II */
/*  Created: Jan 31 2026 08:04 st93642                      TT    SSSSSSS II */
/*  Updated: Jan 31 2026 08:04 st93642                                       */
/*                                                                           */
/*   Transport and Telecommunication Institute - Riga, Latvia                */
/*                       https://tsi.lv                                      */
/*****************************************************************************/

// Background script for Screenshot Area Capture extension

chrome.browserAction.onClicked.addListener(async (tab) => {
  try {
    // Inject content script into the active tab
    await chrome.tabs.executeScript(tab.id, {
      file: "content.js",
      runAt: "document_idle"
    });

    // Send message to start selection
    await chrome.tabs.sendMessage(tab.id, {
      action: "startSelection"
    });
  } catch (error) {
    console.error("Failed to inject content script:", error);
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureDone") {
    console.log("Screenshot capture completed");
  } else if (message.action === "captureError") {
    console.error("Screenshot capture error:", message.error);
  } else if (message.action === "captureVisibleTab") {
    // Capture the visible tab and return data URL
    chrome.tabs.captureVisibleTab(null, { format: "png" })
      .then(dataUrl => {
        sendResponse(dataUrl);
      })
      .catch(error => {
        console.error("Failed to capture visible tab:", error);
        sendResponse(null);
      });
    return true; // Keep channel open for async response
  } else if (message.action === "copyImageToClipboard") {
    // In Chrome, writing images to the clipboard must be done from a document context
    // (content script) via navigator.clipboard.write() + ClipboardItem.
    const tabId = sender && sender.tab && sender.tab.id;
    if (typeof tabId !== 'number') {
      sendResponse({ success: false, error: "No sender tab for clipboard operation" });
      return false;
    }

    const dataUrl = message.dataUrl;
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      sendResponse({ success: false, error: "Missing or invalid image data URL" });
      return false;
    }

    const code = `
      (async () => {
        try {
          const blob = await fetch(${JSON.stringify(dataUrl)}).then(r => r.blob());
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          return { success: true };
        } catch (error) {
          return { success: false, error: (error && error.message) ? error.message : String(error) };
        }
      })();
    `;

    chrome.tabs.executeScript(tabId, { code, runAt: 'document_idle' }, (results) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      const result = Array.isArray(results) ? results[0] : null;
      if (!result || result.success !== true) {
        sendResponse({ success: false, error: (result && result.error) ? result.error : 'Clipboard write failed' });
        return;
      }

      sendResponse({ success: true });
    });

    return true;
  }
});
