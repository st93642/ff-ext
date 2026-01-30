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
            z-index: 2147483647;
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
            z-index: 2147483648;
            display: none;
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(selectionBox);
        
        // Add event listeners
        overlay.addEventListener('mousedown', handleMouseDown);
        overlay.addEventListener('mousemove', handleMouseMove);
        overlay.addEventListener('mouseup', handleMouseUp);
        overlay.addEventListener('keydown', handleKeyDown);
        
        // Focus overlay to receive keyboard events
        overlay.setAttribute('tabindex', '-1');
        overlay.focus();
    }
    
    // Remove overlay elements
    function removeOverlay() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
        
        if (overlay) {
            overlay.removeEventListener('mousedown', handleMouseDown);
            overlay.removeEventListener('mousemove', handleMouseMove);
            overlay.removeEventListener('mouseup', handleMouseUp);
            overlay.removeEventListener('keydown', handleKeyDown);
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
        
        // Calculate selection box dimensions
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        
        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';
        
        // Auto-scroll logic
        handleAutoScroll(e.clientY);
        
        e.preventDefault();
    }
    
    // Handle auto-scroll when mouse is near viewport edges
    function handleAutoScroll(mouseY) {
        // Clear any existing scroll interval
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
        
        const scrollThreshold = 50; // pixels from edge to trigger scroll
        const scrollSpeed = 10; // pixels per interval
        const viewportHeight = window.innerHeight;
        
        // Check if mouse is near bottom edge
        if (mouseY > viewportHeight - scrollThreshold) {
            scrollInterval = setInterval(() => {
                window.scrollBy(0, scrollSpeed);
                
                // Update selection box position during scroll
                if (selectionBox && isSelecting) {
                    const currentHeight = parseInt(selectionBox.style.height);
                    selectionBox.style.height = (currentHeight + scrollSpeed) + 'px';
                }
            }, 16); // ~60fps
        }
        // Check if mouse is near top edge
        else if (mouseY < scrollThreshold && window.scrollY > 0) {
            scrollInterval = setInterval(() => {
                window.scrollBy(0, -scrollSpeed);
                
                // Update selection box position during scroll
                if (selectionBox && isSelecting) {
                    const currentTop = parseInt(selectionBox.style.top);
                    const currentHeight = parseInt(selectionBox.style.height);
                    selectionBox.style.top = (currentTop - scrollSpeed) + 'px';
                    selectionBox.style.height = (currentHeight + scrollSpeed) + 'px';
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
        
        // Get selection dimensions
        const rect = {
            left: parseInt(selectionBox.style.left),
            top: parseInt(selectionBox.style.top),
            width: parseInt(selectionBox.style.width),
            height: parseInt(selectionBox.style.height)
        };
        
        // Only capture if selection has some size
        if (rect.width > 5 && rect.height > 5) {
            // Add scroll offset to get absolute position
            rect.top += window.scrollY;
            rect.left += window.scrollX;
            
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
