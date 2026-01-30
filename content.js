// Content script for screenshot selection overlay
(function() {
    'use strict';
    
    let isSelecting = false;
    let startX = 0;
    let startY = 0;
    let startDocumentX = 0; // Document coordinates at selection start
    let startDocumentY = 0;
    let currentMouseX = 0; // Track current mouse X position for auto-scroll
    let currentMouseY = 0; // Track current mouse Y position for auto-scroll
    let overlay = null;
    let selectionBox = null;
    let scrollInterval = null;
    
    // Create overlay elements
    function createOverlay() {
        // Create dark overlay
        overlay = document.createElement('div');
        overlay.id = 'screenshot-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            cursor: crosshair;
            z-index: 2147483646;
        `;
        
        // Create selection box
        selectionBox = document.createElement('div');
        selectionBox.id = 'screenshot-selection';
        selectionBox.style.cssText = `
            position: fixed;
            border: 2px solid #0080ff;
            background: rgba(0, 128, 255, 0.1);
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
            pointer-events: none;
            z-index: 2147483647;
            display: none;
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(selectionBox);
        
        // Add event listeners
        // mousedown only on overlay to start selection
        overlay.addEventListener('mousedown', handleMouseDown);
        // mousemove and mouseup on document to track mouse even outside viewport edges
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Add ESC key handler to document for better reliability
        document.addEventListener('keydown', handleKeyDown);
    }
    
    // Remove overlay elements
    function removeOverlay() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
        
        // Remove event listeners from document
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        if (overlay) {
            overlay.removeEventListener('mousedown', handleMouseDown);
            overlay.remove();
            overlay = null;
        }
        
        if (selectionBox) {
            selectionBox.remove();
            selectionBox = null;
        }
        
        isSelecting = false;
    }
    
    // Helper function to get current scroll position
    function getCurrentScrollY() {
        return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }
    
    // Helper function to update selection box dimensions
    function updateSelectionBox() {
        if (isSelecting && selectionBox) {
            // Convert document coordinates back to viewport coordinates for display
            const currentScrollY = getCurrentScrollY();
            const startViewportY = startDocumentY - currentScrollY;
            const currentViewportY = currentMouseY;
            
            const left = Math.min(startX, currentMouseX);
            const top = Math.min(startViewportY, currentViewportY);
            const width = Math.abs(currentMouseX - startX);
            const height = Math.abs(currentViewportY - startViewportY);
            
            selectionBox.style.left = left + 'px';
            selectionBox.style.top = top + 'px';
            selectionBox.style.width = width + 'px';
            selectionBox.style.height = height + 'px';
        }
    }
    
    // Handle mouse down - start selection
    function handleMouseDown(e) {
        if (e.button !== 0) return; // Only left mouse button
        
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;
        
        // Store document coordinates for proper handling of scrolling
        const scrollY = getCurrentScrollY();
        startDocumentX = startX;
        startDocumentY = startY + scrollY;
        
        currentMouseX = e.clientX; // Initialize current mouse position
        currentMouseY = e.clientY;
        
        selectionBox.style.left = startX + 'px';
        selectionBox.style.top = startY + 'px';
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        selectionBox.style.display = 'block';
        
        e.preventDefault();
    }
    
    // Handle mouse move - update selection and auto-scroll
    function handleMouseMove(e) {
        if (!isSelecting) return;
        
        // Update current mouse position for use during auto-scroll
        currentMouseX = e.clientX;
        currentMouseY = e.clientY;
        
        // Update selection box using helper function
        updateSelectionBox();
        
        // Auto-scroll logic
        handleAutoScroll(currentMouseY);
        
        e.preventDefault();
    }
    
    // Robust scroll function that works on all websites
    // Tries multiple methods with early return on success
    function performScroll(deltaY) {
        // Helper to get current scroll position consistently
        function getCurrentScroll() {
            return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        }
        
        const initialScroll = getCurrentScroll();
        const targetScroll = initialScroll + deltaY;
        
        // Method 1: Try window.scrollBy() (standard method)
        try {
            window.scrollBy(0, deltaY);
            // Check if it worked (allow 1px tolerance for rounding)
            if (Math.abs(getCurrentScroll() - targetScroll) < 1) return;
        } catch (e) {
            // Continue to next method
        }
        
        // Method 2: Try window.scroll() with absolute position
        try {
            window.scroll(0, targetScroll);
            if (Math.abs(getCurrentScroll() - targetScroll) < 1) return;
        } catch (e) {
            // Continue to next method
        }
        
        // Method 3: Direct manipulation of scrollTop (bypasses most restrictions)
        try {
            if (document.scrollingElement) {
                document.scrollingElement.scrollTop = targetScroll;
                if (Math.abs(getCurrentScroll() - targetScroll) < 1) return;
            }
        } catch (e) {
            // Continue to next method
        }
        
        // Method 4: Try document.documentElement.scrollTop
        try {
            document.documentElement.scrollTop = targetScroll;
            if (Math.abs(getCurrentScroll() - targetScroll) < 1) return;
        } catch (e) {
            // Continue to next method
        }
        
        // Method 5: Try document.body.scrollTop (for older browsers/websites)
        try {
            document.body.scrollTop = targetScroll;
            // No check needed - last attempt
        } catch (e) {
            // All methods failed - scroll may be restricted on this site
        }
    }
    
    // Handle auto-scroll when mouse is near viewport edges
    function handleAutoScroll(mouseY) {
        const scrollThreshold = 50; // pixels from edge to trigger scroll
        const scrollSpeed = 5; // pixels per interval (reduced for smoother scrolling)
        const viewportHeight = window.innerHeight;
        
        // Check if mouse is near bottom edge and can scroll down
        const canScrollDown = (window.scrollY + window.innerHeight) < document.documentElement.scrollHeight;
        const isNearBottom = mouseY > viewportHeight - scrollThreshold;
        
        // Check if mouse is near top edge and can scroll up
        const canScrollUp = window.scrollY > 0;
        const isNearTop = mouseY < scrollThreshold;
        
        // If we're in a scroll zone and not already scrolling in that direction
        if (isNearBottom && canScrollDown && (!scrollInterval || scrollInterval._direction !== 'down')) {
            // Clear any existing scroll interval
            if (scrollInterval) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }
            
            scrollInterval = setInterval(() => {
                // Check if we can still scroll
                if ((window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                    return;
                }
                
                // Use robust scroll method
                performScroll(scrollSpeed);
                
                // Update selection box to reflect the new scroll position
                updateSelectionBox();
            }, 16); // ~60fps
            scrollInterval._direction = 'down';
        }
        // Check if mouse is near top edge and can scroll up
        else if (isNearTop && canScrollUp && (!scrollInterval || scrollInterval._direction !== 'up')) {
            // Clear any existing scroll interval
            if (scrollInterval) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }
            
            scrollInterval = setInterval(() => {
                // Check if we can still scroll
                if (window.scrollY <= 0) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                    return;
                }
                
                // Use robust scroll method
                performScroll(-scrollSpeed);
                
                // Update selection box to reflect the new scroll position
                updateSelectionBox();
            }, 16); // ~60fps
            scrollInterval._direction = 'up';
        }
        // If we're not in a scroll zone, clear the interval
        else if (!isNearBottom && !isNearTop && scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    }
    
    // Handle mouse up - capture selection
    function handleMouseUp(e) {
        if (!isSelecting) return;
        
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
        
        isSelecting = false;
        
        // Get current scroll position and calculate document coordinates
        const currentScrollY = getCurrentScrollY();
        const currentDocumentX = currentMouseX;
        const currentDocumentY = currentMouseY + currentScrollY;
        
        // Calculate selection in document coordinates
        const docLeft = Math.min(startDocumentX, currentDocumentX);
        const docTop = Math.min(startDocumentY, currentDocumentY);
        const docWidth = Math.abs(currentDocumentX - startDocumentX);
        const docHeight = Math.abs(currentDocumentY - startDocumentY);
        
        // Only capture if selection has some size
        if (docWidth > 5 && docHeight > 5) {
            // Calculate viewport coordinates for the selection
            // We need to scroll to position the selection optimally in the viewport
            const viewportLeft = docLeft;
            const viewportTop = docTop - currentScrollY;
            
            // Send message to background script to capture
            // Include both viewport and document coordinates
            browser.runtime.sendMessage({
                action: 'captureSelection',
                rect: {
                    left: viewportLeft,
                    top: viewportTop,
                    width: docWidth,
                    height: docHeight
                },
                documentRect: {
                    left: docLeft,
                    top: docTop,
                    width: docWidth,
                    height: docHeight
                },
                currentScrollY: currentScrollY
            });
        }
        
        // Remove overlay
        removeOverlay();
        
        e.preventDefault();
    }
    
    // Handle keyboard - ESC to cancel
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            removeOverlay();
            e.preventDefault();
        }
    }
    
    // Listen for messages from background script
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'startSelection') {
            // Remove existing overlay if any
            if (overlay) {
                removeOverlay();
            }
            
            // Create new overlay
            createOverlay();
            
            sendResponse({ success: true });
        }
        
        return false;
    });
})();
