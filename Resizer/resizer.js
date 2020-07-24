let resizer = (function() {
    "use strict";

    // This is all poot if config isn't loaded
    if (!config) {
        console.log("ERROR: unable to load config.js");
        return null;
    }
    
    // Private variables

    // Figure out if user device is android or ios
    let _isInitialized = false;
    let _resizeEvents = [];
    let _numResizeEvents = 0;

    let _canvasBoundingRect;
    let _context;


    let _heightPlusPadding, _widthPlusPadding;
    let _paddingLeft, _paddingRight, _paddingTop, _paddingBottom;


    // Private (exposed) variables
    let _container, _canvas, _wrapper;
    let _currentHeight, _currentWidth;
    let _sizeMode;
    let _orientation;



    // Get left offset of element
    function _getOffsetLeft(elem) {
        let offsetLeft = 0;

        // Add px to left offset...
        do {
            if( !isNaN(elem.offsetLeft) ) {
                offsetLeft += elem.offsetLeft;
            }

            // for each elem until there's no more parent element
            elem = elem.offsetParent;
        } while(elem !== null);

        // Return left offset
        return offsetLeft;
    }

    // Get top offset of element
    function _getOffsetTop(elem) {
        let offsetTop = 0;

        do {
            if( !isNaN(elem.offsetTop) ) {
                offsetTop += elem.offsetTop;
            }

            elem = elem.offsetParent;
        } while(elem !== null);

        return offsetTop;
    }

    // Because events give coords in terms of the page,
    // this function converts those in terms of the actual game's
    // coordinate system.
    function _getRelativeEventCoords(event) {
        // Scale coords correctly
        let scale = _currentWidth / config.gameFieldWidth;

        // Get x and y values
        let x = event.pageX - _getOffsetLeft(_canvas);
        let y = event.pageY - _getOffsetTop(_canvas);

        return {
            x: x/scale,
            y: y/scale
        };
    }


    // Optimizes certain event listeners by only executing the callback
    // a certain amount of time after the event *stops* firing (useful for resize)
    function _debounce(func, delay, immediate) {
        let timeout;

        return function() {
            let context = this, args = arguments;

            let later = function() {
                timeout = null;
                if (!immediate)
                    func.apply(context, args);
            };

            let callNow = immediate && !timeout;

            clearTimeout(timeout);
            timeout = window.setTimeout(later, delay);

            if (callNow) 
                func.apply(context, args);
        };
    }

    // Resize the canvas
    function _resize() {
        const DPR = window.devicePixelRatio || 1;
        let ratio, i;

        if (_canvas) {

            // Get container's padding values
            _paddingLeft = parseFloat(window.getComputedStyle(_container).getPropertyValue('padding-left'));
            _paddingRight = parseFloat(window.getComputedStyle(_container).getPropertyValue('padding-right'));
            _paddingTop = parseFloat(window.getComputedStyle(_container).getPropertyValue('padding-top'));
            _paddingBottom = parseFloat(window.getComputedStyle(_container).getPropertyValue('padding-bottom'));

            // Calculate the inner dimensions with padding taken into account
            _heightPlusPadding = _container.clientHeight - (_paddingTop+_paddingBottom);
            _widthPlusPadding = _container.clientWidth - (_paddingLeft+_paddingRight);

            // Figure out orientation
            if (config.orientation === "both") {
                if (window.innerWidth >= window.innerHeight) {
                    _orientation = "landscape";
                }
                else {
                    _orientation = "portrait";
                }
            }
            else {
                _orientation = config.orientation;
            }

            // Stretch to fit?
            if (config.stretchToFit) {
                _currentHeight = _heightPlusPadding;
                _currentWidth = _widthPlusPadding;
            }

            // Conform width to aspect ratio if not stretching to fit
            else {

                if (_orientation === "portrait") {
                    _sizeMode = "fitWidth";
                    
                    // Get aspect ratio
                    ratio = config.gameFieldWidth / config.gameFieldHeight;

                    _currentHeight = _heightPlusPadding;
                    _currentWidth = _currentHeight * ratio;

                    // Double check that the aspect ratio fits the container
                    if ( Math.floor(_currentWidth) > _widthPlusPadding ) {

                        _sizeMode = "fitHeight";

                        // Resize to fit width
                        ratio = config.gameFieldHeight / config.gameFieldWidth;

                        // Get correct  dimensions
                        _currentWidth = _widthPlusPadding;
                        _currentHeight = _currentWidth * ratio;
                    }
                }
                else {
                    _sizeMode = "fitHeight";

                    // Resize to fit width
                    ratio = config.gameFieldHeight / config.gameFieldWidth;

                    // Get correct  dimensions
                    _currentWidth = _widthPlusPadding;
                    _currentHeight = _currentWidth * ratio;


                    // Double check that the aspect ratio fits the container
                    if ( Math.floor(_currentHeight) > _heightPlusPadding ) {
                        _sizeMode = "fitWidth";
                    
                        // Get aspect ratio
                        ratio = config.gameFieldWidth / config.gameFieldHeight;

                        _currentHeight = _heightPlusPadding;
                        _currentWidth = _currentHeight * ratio;
                    }
                }
            }

            // For high-DPI display, increase the actual size of the canvas
            // THIS WAS CAUSING SLOW PERFORMANCE ON DEVICES WITH HIGH DPR VALUES

            if (config.scaleByDPR) {
                _canvas.width = Math.round(config.gameFieldWidth * DPR);
                _canvas.height = Math.round(config.gameFieldHeight * DPR);

                // Ensure all drawing operations are scaled
                _context.scale(DPR, DPR);
            }

            // Scale everything down using CSS
            _wrapper.style.width = Math.round(_currentWidth) + "px";
            _wrapper.style.height = Math.round(_currentHeight) + "px";

            // Position the canvas within the container according to config
            _positionCanvas();

            // Update bounding rect
            _canvasBoundingRect = _canvas.getBoundingClientRect();
        }

        // Call the resize event(s)
        for (i = 0; i < _numResizeEvents; i++) { 
            _resizeEvents[i]();
        }
    }

    // Center the canvas within the container
    function _positionCanvas() {
        let bodyRect, containerRect, cPageX, cPageY;

        // Get the requested positioning
        let position = config.canvasPosition.split(" ");

        // Determine container position style
        let containerPosition = window.getComputedStyle(_container).getPropertyValue("position");


        // If the container is absolute, canvas is positioned relative to document body
        if (containerPosition === "absolute") {

            // Get container coordinates relative to page (not viewport)
            bodyRect = document.body.getBoundingClientRect();
            containerRect = _container.getBoundingClientRect();

            cPageX = containerRect.left - bodyRect.left;
            cPageY = containerRect.top - bodyRect.top;
        }

        // If container is not absolute, canvas is positioned relative to parent
        else {
            cPageX = 0;
            cPageY = 0;
        }

        // Vertical positioning
        switch (position[0]) {
            default:
            case "center":
                _wrapper.style.top = Math.round(cPageY + _paddingTop + ( (_heightPlusPadding/2) - (_currentHeight/2) )) + "px";
                break;

            case "top":
                _wrapper.style.top = Math.round(cPageY + _paddingTop) + "px";
                break;

            case "bottom":
                _wrapper.style.top = Math.round(cPageY + _container.clientHeight - _currentHeight - _paddingBottom) + "px";
                break;
            
        }

        // Horizontal positioning
        switch(position[1]) {
            default:
            case "center":
                _wrapper.style.left = Math.round(cPageX + _paddingLeft + ( (_widthPlusPadding/2) - (_currentWidth/2) )) + "px";
                break;

            case "left":
                _wrapper.style.left = Math.round(cPageX + _paddingLeft) + "px";
                break;

            case "right":
                _wrapper.style.left = Math.round(cPageX + _container.clientWidth - _currentWidth - _paddingRight) + "px";
                break;
        }
    }

    // Initialize the resizer
    function _init() {
        // Begin loading once window is loaded
        if(!_isInitialized) {
            _isInitialized = true;

            // Get container
            _container = document.getElementById(config.containerId);

            if (config.canvasId !== "") {

                // Get the canvas/wrapper info
                _canvas = document.getElementById(config.canvasId);
                _context = _canvas.getContext("2d");

                // Set canvas width and height
                _currentWidth = config.gameFieldWidth;
                _currentHeight = config.gameFieldHeight;

                _canvas.width = _currentWidth;
                _canvas.height = _currentHeight;


                // Check if wrapper is being used
                if (config.wrapperId !== "") {
                    _wrapper = document.getElementById(config.wrapperId);

                    // The wrapper is resized while the canvas just fits to the wrapper
                    _canvas.style.width = "100%";
                    _canvas.style.height = "100%";
                }
                else {
                    _wrapper = _canvas;
                }
                
                // Wrapper must be absolutely positioned to position it correctly within container
                _wrapper.style.position = "absolute";
            }

            // Set resize events
            if (config.resizeDelay > 0) {
                window.addEventListener('resize', _debounce(_resize, config.resizeDelay, false), false);
            }
            else {
                window.addEventListener('resize', _resize, false);
            }

            // Do the first resize immediately
            _resize();

        }
        else {
            console.log("ERROR: resizer already initialized.");
        }
    }
    

    // Accessors

    function _getCanvasBoundingRect() {
        return _canvasBoundingRect;
    }

    function _getOrientation() {
        return _orientation;
    }

    function _getSizeMode() {
        return _sizeMode;
    }

    function _getCanvas() {
        if (_canvas) {
            return _canvas;
        }

        else {
            console.log("ERROR: canvas has been set to false in config.js");
            return null;
        }
    }

    function _getContainer() {
        return _container;
    }

    function _getGameWidth() {
        return config.gameFieldWidth;
    }

    function _getGameHeight() {
        return config.gameFieldHeight;
    }

    function _getCanvasWidth() {
        return _currentWidth;
    }

    function _getCanvasHeight() {
        return _currentHeight;
    }

    // Mutators

    function _addResizeEvent(func) {
        _resizeEvents.push(func);
        _numResizeEvents++;
    }

    function _removeResizeEvent(func) {
        let i = 0;
        
        // Look for the function in the array
        while (_resizeEvents[i] !== func && i < _numResizeEvents) {
            i++;
        }

        // If i is within the array length, we found the function to remove
        if (i < _numResizeEvents) {
            _resizeEvents[i] = _resizeEvents[_resizeEvents.length-1];
            _resizeEvents[_resizeEvents.length-1] = undefined;
        
            _resizeEvents.length = _resizeEvents.length-1;
        }
    }

    return {
        init: _init,
        resize: _resize,
        getOrientation: _getOrientation,
        getSizeMode: _getSizeMode,
        getCanvas: _getCanvas,
        getContainer: _getContainer,
        getGameHeight: _getGameHeight,
        getGameWidth: _getGameWidth,
        getCanvasWidth: _getCanvasWidth,
        getCanvasHeight: _getCanvasHeight,
        getCanvasBoundingRect: _getCanvasBoundingRect,
        addResizeEvent: _addResizeEvent,
        removeResizeEvent: _removeResizeEvent,
        getRelativeEventCoords: _getRelativeEventCoords
    };

})();