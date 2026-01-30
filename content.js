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
    let currentScrollDirection = null; // Track scroll direction independently
    
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
    
    // Helper function to get current horizontal scroll position
    function getCurrentScrollX() {
        return window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    }
    
    // Helper function to update selection box dimensions
    function updateSelectionBox() {
        if (isSelecting && selectionBox) {
            // Convert document coordinates back to viewport coordinates for display
            const currentScrollY = getCurrentScrollY();
            const currentScrollX = getCurrentScrollX();
            const startViewportX = startDocumentX - currentScrollX;
            const startViewportY = startDocumentY - currentScrollY;
            const currentViewportX = currentMouseX;
            const currentViewportY = currentMouseY;
            
            const left = Math.min(startViewportX, currentViewportX);
            const top = Math.min(startViewportY, currentViewportY);
            const width = Math.abs(currentViewportX - startViewportX);
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
        const scrollX = getCurrentScrollX();
        startDocumentX = startX + scrollX;
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
        
        // Auto-scroll logic - now handles both X and Y
        handleAutoScroll(currentMouseX, currentMouseY);
        
        e.preventDefault();
    }
    
    // Robust scroll function that works on all websites
    // Tries multiple methods including bypasses for restricted sites
    function performScroll(deltaX, deltaY) {
        // Use the helper function for consistency
        const initialScrollY = getCurrentScrollY();
        const initialScrollX = getCurrentScrollX();
        const targetScrollY = Math.max(0, initialScrollY + deltaY); // Ensure non-negative
        const targetScrollX = Math.max(0, initialScrollX + deltaX); // Ensure non-negative
        
        // Clamp target to document limits
        const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const maxScrollX = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
        const clampedTargetY = Math.min(maxScrollY, targetScrollY);
        const clampedTargetX = Math.min(maxScrollX, targetScrollX);
        
        let scrolled = false;
        
        // Method 1: Try window.scrollBy() with behavior auto (standard method)
        if (!scrolled) {
            try {
                window.scrollBy({ left: deltaX, top: deltaY, behavior: 'auto' });
                // Check if any scroll happened (allow 1px tolerance for rounding/constraints)
                const newScrollY = getCurrentScrollY();
                const newScrollX = getCurrentScrollX();
                if (Math.abs(newScrollY - initialScrollY) >= 1 || Math.abs(newScrollX - initialScrollX) >= 1) {
                    scrolled = true;
                }
            } catch (e) {
                // Try without options object (older browsers)
                try {
                    window.scrollBy(deltaX, deltaY);
                    const newScrollY = getCurrentScrollY();
                    const newScrollX = getCurrentScrollX();
                    if (Math.abs(newScrollY - initialScrollY) >= 1 || Math.abs(newScrollX - initialScrollX) >= 1) {
                        scrolled = true;
                    }
                } catch (e2) {
                    // Continue to next method
                }
            }
        }
        
        // Method 2: Try window.scroll() with absolute position
        if (!scrolled) {
            try {
                window.scroll(clampedTargetX, clampedTargetY);
                const newScrollY = getCurrentScrollY();
                const newScrollX = getCurrentScrollX();
                if (Math.abs(newScrollY - initialScrollY) >= 1 || Math.abs(newScrollX - initialScrollX) >= 1) {
                    scrolled = true;
                }
            } catch (e) {
                // Continue to next method
            }
        }
        
        // Method 3: Direct manipulation of scrollTop/scrollLeft on scrollingElement (bypasses most restrictions)
        if (!scrolled && document.scrollingElement) {
            try {
                // Use Object.defineProperty bypass for sites that override scrollTop/scrollLeft
                const descriptorTop = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
                const descriptorLeft = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollLeft');
                if (descriptorTop && descriptorTop.set) {
                    descriptorTop.set.call(document.scrollingElement, clampedTargetY);
                } else {
                    document.scrollingElement.scrollTop = clampedTargetY;
                }
                if (descriptorLeft && descriptorLeft.set) {
                    descriptorLeft.set.call(document.scrollingElement, clampedTargetX);
                } else {
                    document.scrollingElement.scrollLeft = clampedTargetX;
                }
                const newScrollY = getCurrentScrollY();
                const newScrollX = getCurrentScrollX();
                if (Math.abs(newScrollY - initialScrollY) >= 1 || Math.abs(newScrollX - initialScrollX) >= 1) {
                    scrolled = true;
                }
            } catch (e) {
                // Continue to next method
            }
        }
        
        // Method 4: Try document.documentElement.scrollTop/scrollLeft with descriptor bypass
        if (!scrolled) {
            try {
                const descriptorTop = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
                const descriptorLeft = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollLeft');
                if (descriptorTop && descriptorTop.set) {
                    descriptorTop.set.call(document.documentElement, clampedTargetY);
                } else {
                    document.documentElement.scrollTop = clampedTargetY;
                }
                if (descriptorLeft && descriptorLeft.set) {
                    descriptorLeft.set.call(document.documentElement, clampedTargetX);
                } else {
                    document.documentElement.scrollLeft = clampedTargetX;
                }
                const newScrollY = getCurrentScrollY();
                const newScrollX = getCurrentScrollX();
                if (Math.abs(newScrollY - initialScrollY) >= 1 || Math.abs(newScrollX - initialScrollX) >= 1) {
                    scrolled = true;
                }
            } catch (e) {
                // Continue to next method
            }
        }
        
        // Method 5: Try document.body.scrollTop/scrollLeft with descriptor bypass
        if (!scrolled && document.body) {
            try {
                const descriptorTop = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
                const descriptorLeft = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollLeft');
                if (descriptorTop && descriptorTop.set) {
                    descriptorTop.set.call(document.body, clampedTargetY);
                } else {
                    document.body.scrollTop = clampedTargetY;
                }
                if (descriptorLeft && descriptorLeft.set) {
                    descriptorLeft.set.call(document.body, clampedTargetX);
                } else {
                    document.body.scrollLeft = clampedTargetX;
                }
                const newScrollY = getCurrentScrollY();
                const newScrollX = getCurrentScrollX();
                if (Math.abs(newScrollY - initialScrollY) >= 1 || Math.abs(newScrollX - initialScrollX) >= 1) {
                    scrolled = true;
                }
            } catch (e) {
                // Continue to next method
            }
        }
        
        return scrolled;
    }
    
    // Handle auto-scroll when mouse is near viewport edges
    function handleAutoScroll(mouseX, mouseY) {
        const scrollThreshold = 50; // pixels from edge to trigger scroll
        const scrollSpeed = 5; // pixels per interval (reduced for smoother scrolling)
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Determine scroll direction based on mouse position
        let shouldScrollDown = false;
        let shouldScrollUp = false;
        let shouldScrollRight = false;
        let shouldScrollLeft = false;
        
        // Check vertical scrolling
        const canScrollDown = (window.scrollY + window.innerHeight) < document.documentElement.scrollHeight;
        const isNearBottom = mouseY > viewportHeight - scrollThreshold;
        const canScrollUp = window.scrollY > 0;
        const isNearTop = mouseY < scrollThreshold;
        
        if (isNearBottom && canScrollDown) {
            shouldScrollDown = true;
        } else if (isNearTop && canScrollUp) {
            shouldScrollUp = true;
        }
        
        // Check horizontal scrolling
        const canScrollRight = (window.scrollX + window.innerWidth) < document.documentElement.scrollWidth;
        const isNearRight = mouseX > viewportWidth - scrollThreshold;
        const canScrollLeft = window.scrollX > 0;
        const isNearLeft = mouseX < scrollThreshold;
        
        if (isNearRight && canScrollRight) {
            shouldScrollRight = true;
        } else if (isNearLeft && canScrollLeft) {
            shouldScrollLeft = true;
        }
        
        // Determine the new scroll direction
        let newDirection = null;
        if (shouldScrollDown && shouldScrollRight) {
            newDirection = 'down-right';
        } else if (shouldScrollDown && shouldScrollLeft) {
            newDirection = 'down-left';
        } else if (shouldScrollUp && shouldScrollRight) {
            newDirection = 'up-right';
        } else if (shouldScrollUp && shouldScrollLeft) {
            newDirection = 'up-left';
        } else if (shouldScrollDown) {
            newDirection = 'down';
        } else if (shouldScrollUp) {
            newDirection = 'up';
        } else if (shouldScrollRight) {
            newDirection = 'right';
        } else if (shouldScrollLeft) {
            newDirection = 'left';
        }
        
        // If direction changed or we need to start scrolling
        if (newDirection !== currentScrollDirection) {
            // Clear any existing scroll interval
            if (scrollInterval) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }
            
            // If we have a new direction, start scrolling
            if (newDirection) {
                scrollInterval = setInterval(() => {
                    // Calculate scroll deltas based on direction
                    let deltaX = 0;
                    let deltaY = 0;
                    
                    if (newDirection.includes('down')) {
                        deltaY = scrollSpeed;
                    } else if (newDirection.includes('up')) {
                        deltaY = -scrollSpeed;
                    }
                    
                    if (newDirection.includes('right')) {
                        deltaX = scrollSpeed;
                    } else if (newDirection.includes('left')) {
                        deltaX = -scrollSpeed;
                    }
                    
                    // Check if we can still scroll in the current direction
                    const currentScrollY = getCurrentScrollY();
                    const currentScrollX = getCurrentScrollX();
                    const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                    const maxScrollX = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
                    
                    // Stop if we've reached the limit in any direction we're trying to scroll
                    if ((deltaY > 0 && currentScrollY >= maxScrollY) ||
                        (deltaY < 0 && currentScrollY <= 0) ||
                        (deltaX > 0 && currentScrollX >= maxScrollX) ||
                        (deltaX < 0 && currentScrollX <= 0)) {
                        clearInterval(scrollInterval);
                        scrollInterval = null;
                        currentScrollDirection = null;
                        return;
                    }
                    
                    // Use robust scroll method and check if it succeeded
                    const scrolled = performScroll(deltaX, deltaY);
                    
                    // If scroll failed, the site may be preventing scroll - stop trying
                    if (!scrolled) {
                        clearInterval(scrollInterval);
                        scrollInterval = null;
                        currentScrollDirection = null;
                        return;
                    }
                    
                    // Update selection box to reflect the new scroll position
                    updateSelectionBox();
                }, 16); // ~60fps
            }
            
            currentScrollDirection = newDirection;
        }
    }
    
    // Handle mouse up - capture selection
    function handleMouseUp(e) {
        if (!isSelecting) return;
        
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
            currentScrollDirection = null;
        }
        
        isSelecting = false;
        
        // Get current scroll positions and calculate document coordinates
        const currentScrollY = getCurrentScrollY();
        const currentScrollX = getCurrentScrollX();
        const currentDocumentX = currentMouseX + currentScrollX;
        const currentDocumentY = currentMouseY + currentScrollY;
        
        // Calculate selection in document coordinates
        const docLeft = Math.min(startDocumentX, currentDocumentX);
        const docTop = Math.min(startDocumentY, currentDocumentY);
        const docWidth = Math.abs(currentDocumentX - startDocumentX);
        const docHeight = Math.abs(currentDocumentY - startDocumentY);
        
        // Only capture if selection has some size
        if (docWidth > 5 && docHeight > 5) {
            // Calculate viewport coordinates for the selection
            // These coordinates are passed to the background script which will
            // check if the selection is visible and scroll if necessary before capture
            const viewportLeft = docLeft - currentScrollX;
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
                currentScrollY: currentScrollY,
                currentScrollX: currentScrollX
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
