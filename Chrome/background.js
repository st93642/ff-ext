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

chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Inject content script into the active tab
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
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
    // Handle clipboard copy from background script
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

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: async (dataUrl) => {
        try {
          const blob = await fetch(dataUrl).then(r => r.blob());
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          return { success: true };
        } catch (error) {
          return { success: false, error: (error && error.message) ? error.message : String(error) };
        }
      },
      args: [dataUrl]
    }, (results) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      const result = results[0].result;
      if (!result || result.success !== true) {
        sendResponse({ success: false, error: (result && result.error) ? result.error : 'Clipboard write failed' });
        return;
      }

      sendResponse({ success: true });
    });

    return true;
  }
});
