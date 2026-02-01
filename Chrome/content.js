/*****************************************************************************/
/*                                                                           */
/*  content.js                                           TTTTTTTT SSSSSSS II */
/*                                                          TT    SS      II */
/*  By: st93642@students.tsi.lv                             TT    SSSSSSS II */
/*                                                          TT         SS II */
/*  Created: Jan 31 2026 08:04 st93642                      TT    SSSSSSS II */
/*  Updated: Jan 31 2026 08:04 st93642                                       */
/*                                                                           */
/*   Transport and Telecommunication Institute - Riga, Latvia                */
/*                       https://tsi.lv                                      */
/*****************************************************************************/

// Content script for Screenshot Area Capture extension

(function() {
  'use strict';

  // Prevent multiple injections
  if (window.__screenshotExtensionLoaded) {
    return;
  }
  window.__screenshotExtensionLoaded = true;

  let isSelecting = false;
  let startX = 0;
  let startY = 0;
  let overlay = null;
  let selectionBox = null;
  let autoScrollInterval = null;
  let autoScrollVelocityX = 0;
  let autoScrollVelocityY = 0;
  let activeScroller = window;

  const EDGE_THRESHOLD = 60; // px from edge to trigger auto-scroll
  const SCROLL_SPEED = 18; // px per frame
  const MIN_SELECTION_SIZE = 10; // minimum 10x10px

  // Utility: Find the best scrollable element on the page
  function findBestScroller() {
    if (document.scrollingElement && (document.scrollingElement.scrollHeight > window.innerHeight + 10 || document.scrollingElement.scrollWidth > window.innerWidth + 10)) {
      return window;
    }

    const elements = document.querySelectorAll('div, main, section, article');
    let best = window;
    let maxArea = 0;

    for (const el of elements) {
      const isScrollable = el.scrollHeight > el.clientHeight + 10 || el.scrollWidth > el.clientWidth + 10;
      if (isScrollable) {
        const style = window.getComputedStyle(el);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll' ||
            style.overflowX === 'auto' || style.overflowX === 'scroll') {
          const rect = el.getBoundingClientRect();
          const area = rect.width * rect.height;
          if (area > maxArea) {
            maxArea = area;
            best = el;
          }
        }
      }
    }
    return best;
  }

  // Utility: Get current scroll position
  function getScroll() {
    if (activeScroller === window) {
      return {
        x: window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
        y: window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      };
    } else {
      const rect = activeScroller.getBoundingClientRect();
      return {
        x: activeScroller.scrollLeft - rect.left,
        y: activeScroller.scrollTop - rect.top
      };
    }
  }

  // Utility: Scroll to position
  function scrollToPos(x, y) {
    if (activeScroller === window) {
      window.scrollTo(x, y);
      // Fallback for some sites
      const scroll = getScroll();
      if (Math.abs(scroll.x - x) > 1 || Math.abs(scroll.y - y) > 1) {
        if (document.scrollingElement) document.scrollingElement.scrollTo(x, y);
      }
    } else {
      const rect = activeScroller.getBoundingClientRect();
      activeScroller.scrollLeft = x + rect.left;
      activeScroller.scrollTop = y + rect.top;
    }
  }

  // Utility: Scroll by amount
  function scrollByAmount(vx, vy) {
    if (activeScroller === window) {
      const oldScroll = getScroll();
      window.scrollBy(vx, vy);
      const newScroll = getScroll();
      if (Math.abs(newScroll.x - oldScroll.x) < 1 && Math.abs(newScroll.y - oldScroll.y) < 1) {
        if (document.scrollingElement) document.scrollingElement.scrollBy(vx, vy);
      }
    } else {
      activeScroller.scrollLeft += vx;
      activeScroller.scrollTop += vy;
    }
  }

  // Create selection UI
  function createSelectionUI() {
    // Create overlay
    overlay = document.createElement('div');
    overlay.id = '__screenshot_overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      cursor: crosshair;
      background: rgba(0, 0, 0, 0.1);
    `;

    // Create selection box
    selectionBox = document.createElement('div');
    selectionBox.id = '__screenshot_selection';
    selectionBox.style.cssText = `
      position: fixed;
      border: 2px dashed #0066ff;
      background: rgba(0, 102, 255, 0.1);
      display: none;
      pointer-events: none;
      z-index: 2147483648;
      box-sizing: border-box;
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(selectionBox);
  }

  // Remove selection UI
  function removeSelectionUI() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    if (selectionBox) {
      selectionBox.remove();
      selectionBox = null;
    }
    stopAutoScroll();
  }

  // Auto-scroll functionality
  function startAutoScroll() {
    if (autoScrollInterval) return;

    autoScrollInterval = setInterval(() => {
      if (autoScrollVelocityX !== 0 || autoScrollVelocityY !== 0) {
        scrollByAmount(autoScrollVelocityX, autoScrollVelocityY);
      }
    }, 16); // ~60fps
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
    autoScrollVelocityX = 0;
    autoScrollVelocityY = 0;
  }

  function updateAutoScroll(clientX, clientY) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate X velocity
    if (clientX < EDGE_THRESHOLD) {
      autoScrollVelocityX = -SCROLL_SPEED;
    } else if (clientX > viewportWidth - EDGE_THRESHOLD) {
      autoScrollVelocityX = SCROLL_SPEED;
    } else {
      autoScrollVelocityX = 0;
    }

    // Calculate Y velocity
    if (clientY < EDGE_THRESHOLD) {
      autoScrollVelocityY = -SCROLL_SPEED;
    } else if (clientY > viewportHeight - EDGE_THRESHOLD) {
      autoScrollVelocityY = SCROLL_SPEED;
    } else {
      autoScrollVelocityY = 0;
    }
  }

  // Handle mouse down
  function handleMouseDown(e) {
    if (e.button !== 0) return; // Only left click

    activeScroller = findBestScroller();
    isSelecting = true;
    const scroll = getScroll();
    startX = e.clientX + scroll.x;
    startY = e.clientY + scroll.y;

    selectionBox.style.display = 'block';
    startAutoScroll();

    e.preventDefault();
    e.stopPropagation();
  }

  // Handle mouse move
  function handleMouseMove(e) {
    if (!isSelecting) return;

    const scroll = getScroll();
    const currentX = e.clientX + scroll.x;
    const currentY = e.clientY + scroll.y;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    // Update selection box position (fixed positioning relative to viewport)
    selectionBox.style.left = (left - scroll.x) + 'px';
    selectionBox.style.top = (top - scroll.y) + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';

    // Update auto-scroll based on mouse position
    updateAutoScroll(e.clientX, e.clientY);

    e.preventDefault();
    e.stopPropagation();
  }

  // Handle mouse up - trigger capture
  async function handleMouseUp(e) {
    if (!isSelecting) return;

    stopAutoScroll();
    isSelecting = false;

    const scroll = getScroll();
    const endX = e.clientX + scroll.x;
    const endY = e.clientY + scroll.y;

    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    e.preventDefault();
    e.stopPropagation();

    // Check minimum size
    if (width < MIN_SELECTION_SIZE || height < MIN_SELECTION_SIZE) {
      removeSelectionUI();
      return;
    }

    // Hide selection UI before capture so it doesn't appear in the screenshot
    // (tabs.captureVisibleTab captures what's currently rendered)
    overlay.style.display = 'none';
    selectionBox.style.display = 'none';

    // Let the browser paint the UI changes before capturing
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    // Capture the selected area
    try {
      await captureArea(left, top, width, height);
    } catch (error) {
      console.error('Capture failed:', error);
      showNotification('Screenshot capture failed: ' + error.message, true);
      chrome.runtime.sendMessage({
        action: "captureError",
        error: error.message
      });
    } finally {
      removeSelectionUI();
    }
  }

  // Handle escape key
  function handleKeyDown(e) {
    if (e.key === 'Escape' && isSelecting) {
      isSelecting = false;
      stopAutoScroll();
      removeSelectionUI();
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // Main capture function with stitching
  async function captureArea(left, top, width, height) {
    showNotification('Capturing screenshot...', false, true);

    // Store original scroll position
    const originalScroll = getScroll();

    try {
      const canvas = await captureWithStitching(left, top, width, height);
      
      // Convert canvas to blob
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png');
      });

      // Copy to clipboard
      await copyToClipboard(blob);
      
      showNotification('Screenshot copied to clipboard!', false);
      
      chrome.runtime.sendMessage({
        action: "captureDone"
      });
    } finally {
      // Restore original scroll position
      scrollToPos(originalScroll.x, originalScroll.y);
    }
  }

  // Capture with stitching for large areas
  async function captureWithStitching(left, top, width, height) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Check if area fits in viewport
    const fitsInViewport = width <= viewportWidth && height <= viewportHeight;
    
    if (fitsInViewport) {
      // Simple single capture
      return await captureSingleView(left, top, width, height);
    } else {
      // Need stitching
      return await captureMultipleViews(left, top, width, height);
    }
  }

  // Simple single viewport capture
  async function captureSingleView(left, top, width, height) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Scroll to position
    scrollToPos(left, top);
    await sleep(200); // Wait for scroll to complete

    const scroll = getScroll();

    // Capture visible page
    const pageCanvas = await captureVisiblePage();
    const scaleX = pageCanvas.width / viewportWidth;
    const scaleY = pageCanvas.height / viewportHeight;

    // Crop to selection
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = Math.round(width * scaleX);
    finalCanvas.height = Math.round(height * scaleY);
    const ctx = finalCanvas.getContext('2d');

    // Calculate offset in case we couldn't scroll exactly to (left, top)
    const offsetX = (left - scroll.x) * scaleX;
    const offsetY = (top - scroll.y) * scaleY;

    ctx.drawImage(
      pageCanvas,
      offsetX, offsetY, width * scaleX, height * scaleY,
      0, 0, width * scaleX, height * scaleY
    );

    return finalCanvas;
  }

  // Multi-view capture with stitching
  async function captureMultipleViews(left, top, width, height) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate overlap (20% to ensure smooth stitching)
    const overlapY = Math.floor(viewportHeight * 0.2);
    const overlapX = Math.floor(viewportWidth * 0.2);

    const stepY = viewportHeight - overlapY;
    const stepX = viewportWidth - overlapX;

    // Calculate number of rows and columns needed
    const numRows = Math.ceil(height / stepY);
    const numCols = Math.ceil(width / stepX);

    let finalCanvas = null;
    let ctx = null;
    let scaleX = 1;
    let scaleY = 1;

    // Capture each section
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const targetX = left + (col * stepX);
        const targetY = top + (row * stepY);

        // Scroll to position
        scrollToPos(targetX, targetY);
        await sleep(250); // Wait for scroll and rendering

        const scroll = getScroll();

        // Capture this view
        const viewCanvas = await captureVisiblePage();

        if (!finalCanvas) {
          scaleX = viewCanvas.width / viewportWidth;
          scaleY = viewCanvas.height / viewportHeight;
          finalCanvas = document.createElement('canvas');
          finalCanvas.width = Math.round(width * scaleX);
          finalCanvas.height = Math.round(height * scaleY);
          ctx = finalCanvas.getContext('2d');
        }

        // Calculate where our target is within the captured viewport
        const offsetX = (targetX - scroll.x);
        const offsetY = (targetY - scroll.y);

        // Calculate how much to take from this view
        const remainingWidth = width - (col * stepX);
        const remainingHeight = height - (row * stepY);

        const captureWidth = Math.min(viewportWidth - offsetX, remainingWidth);
        const captureHeight = Math.min(viewportHeight - offsetY, remainingHeight);

        if (captureWidth > 0 && captureHeight > 0) {
          ctx.drawImage(
            viewCanvas,
            offsetX * scaleX, offsetY * scaleY, captureWidth * scaleX, captureHeight * scaleY,
            (col * stepX) * scaleX, (row * stepY) * scaleY, captureWidth * scaleX, captureHeight * scaleY
          );
        }
      }
    }

    return finalCanvas;
  }

  // Capture the current visible page
  async function captureVisiblePage() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Create canvas for the capture
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewportWidth * devicePixelRatio);
    canvas.height = Math.round(viewportHeight * devicePixelRatio);
    const ctx = canvas.getContext('2d');
    
    // Scale context to match device pixel ratio
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    try {
      // First, try to use captureVisibleTab for the base layer
      const dataUrl = await chrome.runtime.sendMessage({
        action: "captureVisibleTab"
      });
      
      if (dataUrl) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, viewportWidth, viewportHeight);
            resolve();
          };
          img.onerror = () => reject(new Error('Failed to load captured image'));
          img.src = dataUrl;
        });
      }
    } catch (error) {
      console.warn('captureVisibleTab failed, using fallback:', error);
      // Fill with white background as fallback
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);
    }
    
    // Now overlay video and canvas elements that captureVisibleTab can't capture
    await captureMediaElements(ctx, viewportWidth, viewportHeight);
    
    return canvas;
  }
  
  // Capture video, canvas, and other media elements that captureVisibleTab misses
  async function captureMediaElements(ctx, viewportWidth, viewportHeight) {
    const scroll = getScroll();
    
    // Capture all video elements
    const videos = document.querySelectorAll('video');
    for (const video of videos) {
      try {
        const rect = video.getBoundingClientRect();
        
        // Check if video is visible in viewport
        if (rect.width > 0 && rect.height > 0 &&
            rect.left < viewportWidth && rect.right > 0 &&
            rect.top < viewportHeight && rect.bottom > 0) {
          
          // Create temporary canvas for video
          const videoCanvas = document.createElement('canvas');
          videoCanvas.width = rect.width;
          videoCanvas.height = rect.height;
          const videoCtx = videoCanvas.getContext('2d');
          
          // Draw video frame
          videoCtx.drawImage(video, 0, 0, rect.width, rect.height);
          
          // Draw onto main canvas at correct position
          ctx.drawImage(videoCanvas, rect.left, rect.top, rect.width, rect.height);
        }
      } catch (error) {
        console.warn('Failed to capture video element:', error);
      }
    }
    
    // Capture all canvas elements
    const canvases = document.querySelectorAll('canvas');
    for (const sourceCanvas of canvases) {
      try {
        // Skip our own canvases
        if (sourceCanvas.id && sourceCanvas.id.startsWith('__screenshot_')) {
          continue;
        }
        
        const rect = sourceCanvas.getBoundingClientRect();
        
        // Check if canvas is visible in viewport
        if (rect.width > 0 && rect.height > 0 &&
            rect.left < viewportWidth && rect.right > 0 &&
            rect.top < viewportHeight && rect.bottom > 0) {
          
          // Draw canvas onto main canvas at correct position
          ctx.drawImage(sourceCanvas, rect.left, rect.top, rect.width, rect.height);
        }
      } catch (error) {
        console.warn('Failed to capture canvas element:', error);
      }
    }
    
    // Capture iframe videos (for same-origin iframes)
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) continue; // Cross-origin iframe
        
        const rect = iframe.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        
        const iframeVideos = iframeDoc.querySelectorAll('video');
        for (const video of iframeVideos) {
          try {
            const videoRect = video.getBoundingClientRect();
            
            // Calculate position relative to main viewport
            const absoluteLeft = rect.left + videoRect.left;
            const absoluteTop = rect.top + videoRect.top;
            
            // Check if visible
            if (videoRect.width > 0 && videoRect.height > 0 &&
                absoluteLeft < viewportWidth && absoluteLeft + videoRect.width > 0 &&
                absoluteTop < viewportHeight && absoluteTop + videoRect.height > 0) {
              
              const videoCanvas = document.createElement('canvas');
              videoCanvas.width = videoRect.width;
              videoCanvas.height = videoRect.height;
              const videoCtx = videoCanvas.getContext('2d');
              
              videoCtx.drawImage(video, 0, 0, videoRect.width, videoRect.height);
              ctx.drawImage(videoCanvas, absoluteLeft, absoluteTop, videoRect.width, videoRect.height);
            }
          } catch (error) {
            console.warn('Failed to capture iframe video:', error);
          }
        }
      } catch (error) {
        // Likely a cross-origin iframe, skip
      }
    }
  }

  // Copy image blob to clipboard
  async function copyToClipboard(blob) {
    // Prefer writing directly from the content script (Chrome requirement).
    if (navigator.clipboard && window.ClipboardItem) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        return;
      } catch (error) {
        // Fall back to background-assisted approach (executeScript) for cases where
        // clipboard write requires a fresh user gesture or other transient conditions.
        console.warn('Direct clipboard write failed, falling back:', error);
      }
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image for clipboard'));
      reader.readAsDataURL(blob);
    });

    const response = await chrome.runtime.sendMessage({
      action: 'copyImageToClipboard',
      dataUrl
    });

    if (!response || !response.success) {
      const errorMessage = response && response.error ? response.error : 'Unknown clipboard error';
      throw new Error('Failed to copy to clipboard: ' + errorMessage);
    }
  }

  // Show notification to user
  function showNotification(message, isError = false, isPersistent = false) {
    // Remove any existing notification
    const existing = document.getElementById('__screenshot_notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.id = '__screenshot_notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isError ? '#f44336' : '#4CAF50'};
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;

    // Add animation
    const style = document.createElement('style');
    style.id = '__screenshot_notification_style';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    if (!document.getElementById('__screenshot_notification_style')) {
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    if (!isPersistent) {
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentElement) notification.remove();
        }, 300);
      }, 3000);
    }
  }

  // Utility: sleep
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Start selection mode
  function startSelection() {
    if (isSelecting) return;

    createSelectionUI();

    overlay.addEventListener('mousedown', handleMouseDown);
    overlay.addEventListener('mousemove', handleMouseMove);
    overlay.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startSelection') {
      startSelection();
    }
  });
})();
