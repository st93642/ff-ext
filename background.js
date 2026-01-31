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

browser.browserAction.onClicked.addListener(async (tab) => {
  try {
    // Inject content script into the active tab
    await browser.tabs.executeScript(tab.id, {
      file: "content.js",
      runAt: "document_idle"
    });

    // Send message to start selection
    await browser.tabs.sendMessage(tab.id, {
      action: "startSelection"
    });
  } catch (error) {
    console.error("Failed to inject content script:", error);
  }
});

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureDone") {
    console.log("Screenshot capture completed");
  } else if (message.action === "captureError") {
    console.error("Screenshot capture error:", message.error);
  } else if (message.action === "captureVisibleTab") {
    // Capture the visible tab and return data URL
    browser.tabs.captureVisibleTab(null, { format: "png" })
      .then(dataUrl => {
        sendResponse(dataUrl);
      })
      .catch(error => {
        console.error("Failed to capture visible tab:", error);
        sendResponse(null);
      });
    return true; // Keep channel open for async response
  } else if (message.action === "copyImageToClipboard") {
    if (!browser.clipboard || !browser.clipboard.setImageData) {
      sendResponse({ success: false, error: "Clipboard image API not available" });
      return false;
    }

    browser.clipboard.setImageData(message.imageData, message.imageType)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error("Failed to write image to clipboard:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});
