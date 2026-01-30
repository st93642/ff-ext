// Content script for screenshot selection overlay
(function() {
    'use strict';
    
    let isSelecting = false;
    let startX = 0;
    let startY = 0;
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
    
    // Handle mouse down - start selection
    function handleMouseDown(e) {
        if (e.button !== 0) return; // Only left mouse button
        
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;
        
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
        
        const currentX = e.clientX;
        const currentY = e.clientY;
        
        // Calculate selection box dimensions (viewport-relative)
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        
        // Update selection box position
        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';
        
        // Auto-scroll logic
        handleAutoScroll(currentY, currentX);
        
        e.preventDefault();
    }
    
    // Handle auto-scroll when mouse is near viewport edges
    function handleAutoScroll(mouseY, mouseX) {
        // Clear any existing scroll interval
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
        
        const scrollThreshold = 50; // pixels from edge to trigger scroll
        const scrollSpeed = 5; // pixels per interval (reduced for smoother scrolling)
        const viewportHeight = window.innerHeight;
        
        // Check if mouse is near bottom edge and can scroll down
        const canScrollDown = (window.scrollY + window.innerHeight) < document.documentElement.scrollHeight;
        if (mouseY > viewportHeight - scrollThreshold && canScrollDown) {
            scrollInterval = setInterval(() => {
                // Check if we can still scroll
                if ((window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                    return;
                }
                
                window.scrollBy(0, scrollSpeed);
                
                // Adjust startY to keep it anchored to the same document position
                // As we scroll down, the start point appears to move up in viewport coordinates
                startY -= scrollSpeed;
                
                // Update selection box to reflect the adjusted start position
                if (isSelecting && selectionBox) {
                    const left = Math.min(startX, mouseX);
                    const top = Math.min(startY, mouseY);
                    const width = Math.abs(mouseX - startX);
                    const height = Math.abs(mouseY - startY);
                    
                    selectionBox.style.left = left + 'px';
                    selectionBox.style.top = top + 'px';
                    selectionBox.style.width = width + 'px';
                    selectionBox.style.height = height + 'px';
                }
            }, 16); // ~60fps
        }
        // Check if mouse is near top edge and can scroll up
        else if (mouseY < scrollThreshold && window.scrollY > 0) {
            scrollInterval = setInterval(() => {
                // Check if we can still scroll
                if (window.scrollY <= 0) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                    return;
                }
                
                window.scrollBy(0, -scrollSpeed);
                
                // Adjust startY to keep it anchored to the same document position
                // As we scroll up, the start point appears to move down in viewport coordinates
                startY += scrollSpeed;
                
                // Update selection box to reflect the adjusted start position
                if (isSelecting && selectionBox) {
                    const left = Math.min(startX, mouseX);
                    const top = Math.min(startY, mouseY);
                    const width = Math.abs(mouseX - startX);
                    const height = Math.abs(mouseY - startY);
                    
                    selectionBox.style.left = left + 'px';
                    selectionBox.style.top = top + 'px';
                    selectionBox.style.width = width + 'px';
                    selectionBox.style.height = height + 'px';
                }
            }, 16); // ~60fps
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
        
        // Get selection dimensions (viewport-relative)
        const rect = {
            left: parseInt(selectionBox.style.left),
            top: parseInt(selectionBox.style.top),
            width: parseInt(selectionBox.style.width),
            height: parseInt(selectionBox.style.height)
        };
        
        // Only capture if selection has some size
        if (rect.width > 5 && rect.height > 5) {
            // Coordinates are already viewport-relative (clientX/clientY based)
            // They don't need scroll offset since captureVisibleTab only captures viewport
            
            // Send message to background script to capture
            browser.runtime.sendMessage({
                action: 'captureSelection',
                rect: rect
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
