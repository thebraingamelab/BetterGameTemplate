let resizer = (function() {
    "use strict";

    // This is all poot if config isn't loaded
    if (!config) {
        console.log("ERROR: unable to load config.js");
        return null;
    }
    
    // Private variables

    // Figure out if user device is android or ios
    //const _ua = navigator.userAgent.toLowerCase();
    //const _android = _ua.indexOf('android') > -1;
    //const _ios = /ipad|iphone|ipod/i.test(_ua) && !window.MSStream;
    let _isInitialized = false;
    let _resizeEvents = [];
    let _numResizeEvents = 0;


    // Exposed variables
    let _container, _canvas;
    let _currentHeight, _currentWidth;
    let _sizeMode;
    let _orientation;



    // Removes an element by replacing it with the last element,
    // and then shortens the array
    function _mutableRemoveIndex(array, index) {

        if (index >= array.length) {
            console.error('ERROR: mutableRemoveIndex: index is out of range');
            return;
        }
    
        if (array.length <= 0) {
            console.error('ERROR: mutableRemoveIndex: empty array');
            return;
        }
    
        array[index] = array[array.length-1];
        array[array.length-1] = undefined;
    
        array.length = array.length-1;
    }

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
            x: x*scale,
            y: y*scale
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


    /*/ Initialize configuration object
    function _loadConfiguration(callback) {
        // Set up variables
        let filePath = "config.json";
        let xhr = new XMLHttpRequest();

        // Open a request for the JSON file
        xhr.open("GET", encodeURI(filePath), true);
        xhr.responseType = "json";

        // Oopsie doopsie, couldn't fetch the file
        xhr.addEventListener("error", function() {
            console.log("Error loading from server: " + filePath);
        }, false);

        // On successful load, do xxx
        xhr.addEventListener("load", function() {
            config = xhr.response;

            _createHTML();

            if (config.resizeDelay > 0) {
                window.addEventListener('resize', _debounce(_resize, config.resizeDelay, false), false);
            }
            else {
                window.addEventListener('resize', _resize, false);
            }

            callback();
        });

        xhr.send();
    }//*/


    // Create the HTML structure
    function _createHTML() {

        _container = document.getElementById(config.containerId);
        _currentWidth = config.gameFieldWidth;
        _currentHeight = config.gameFieldHeight;

        // Begin a document fragment to start making HTML
        //content = document.createElement("fragment");

        // Make a canvas
        if (config.usingCanvas) {
            _canvas = document.createElement("canvas");

            _canvas.width = _currentWidth;
            _canvas.height = _currentHeight;
            _canvas.style.backgroundColor = "white";
            _canvas.style.position = "absolute";

            //content.appendChild(_canvas);
        }

        /* Make other desired HTML content
        else {

        }*/

        //_container.appendChild(content);
        _container.appendChild(_canvas);
    }

    // Resize the canvas
    function _resize() {
        let ratio, i;

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
            _currentHeight = _container.clientHeight;
            _currentWidth = _container.clientWidth;
        }

        // Conform width to aspect ratio if not stretching to fit
        else {

            if (_orientation === "portrait") {
                _sizeMode = "fitWidth";
                
                // Get aspect ratio
                ratio = config.gameFieldWidth / config.gameFieldHeight;

                _currentHeight = _container.clientHeight;
                _currentWidth = _currentHeight * ratio;

                // Double check that the aspect ratio fits the container
                if ( Math.floor(_currentWidth) > _container.clientWidth ) {

                    _sizeMode = "fitHeight";

                    // Resize to fit width
                    ratio = config.gameFieldHeight / config.gameFieldWidth;

                    // Get correct  dimensions
                    _currentWidth = _container.clientWidth;
                    _currentHeight = _currentWidth * ratio;
                }
            }
            else {
                _sizeMode = "fitHeight";

                // Resize to fit width
                ratio = config.gameFieldHeight / config.gameFieldWidth;

                // Get correct  dimensions
                _currentWidth = _container.clientWidth;
                _currentHeight = _currentWidth * ratio;


                // Double check that the aspect ratio fits the container
                if ( Math.floor(_currentHeight) > _container.clientHeight ) {
                    _sizeMode = "fitWidth";
                
                    // Get aspect ratio
                    ratio = config.gameFieldWidth / config.gameFieldHeight;

                    _currentHeight = _container.clientHeight;
                    _currentWidth = _currentHeight * ratio;
                }
            }
        }

        // Adjust canvas accordingly
        _canvas.style.width = _currentWidth + "px";
        _canvas.style.height = _currentHeight + "px";

        // Position the canvas within the container according to config
        _positionCanvas();


        // Call the resize event(s)
        if (_numResizeEvents > 0) {
            for (i = 0; i < _numResizeEvents; i++) { 
                _resizeEvents[i]();
            }
        }
    }

    // Center the canvas within the container
    function _positionCanvas() {
        // Get the requested positioning
        let position = config.canvasPosition.split(" ");

        // Get container coordinates relative to page (not viewport)
        let bodyRect = document.body.getBoundingClientRect();
        let containerRect = _container.getBoundingClientRect();

        let cPageX = containerRect.left - bodyRect.left;
        let cPageY = containerRect.top - bodyRect.top;

        // Vertical positioning
        switch (position[0]) {
            default:
            case "center":
                // If parent is absolute, canvas is positioned relative to document body
                if (_container.style.position === "absolute") {

                    _canvas.style.top = cPageY + ( (_container.clientHeight/2) - (_currentHeight/2) ) + "px";
                }

                // If parent is not absolute, canvas is positioned relative to parent
                else {
                    _canvas.style.top = "50%";
                    _canvas.style.marginTop = "-" + (_currentHeight/2) + "px";
                }

                break;

            case "top":
                // If parent is absolute, canvas is positioned relative to document body
                if (_container.style.position === "absolute") {
                        
                    _canvas.style.top = cPageY + "px";
                }

                // If parent is not absolute, canvas is positioned relative to parent
                else {
                    _canvas.style.top = 0;
                }

                break;

            case "bottom":
                // If parent is absolute, canvas is positioned relative to document body
                if (_container.style.position === "absolute") {
                    
                    _canvas.style.bottom = cPageY + _container.clientHeight + "px";
                }

                // If parent is not absolute, canvas is positioned relative to parent
                else {
                    _canvas.style.bottom = 0;
                }

                break;
            
        }

        // Horizontal positioning
        switch(position[1]) {
            default:
            case "center":
                // If parent is absolute, canvas is positioned relative to document body
                if (_container.style.position === "absolute") {
                    
                    _canvas.style.left = cPageX + ( (_container.clientWidth/2) - (_currentWidth/2) ) + "px";
                }

                // If parent is not absolute, canvas is positioned relative to parent
                else {
                    _canvas.style.left = "50%";
                    _canvas.style.marginLeft = "-" + (_currentWidth/2) + "px";
                }

                break;

            case "left":
                // If parent is absolute, canvas is positioned relative to document body
                if (_container.style.position === "absolute") {
                    
                    _canvas.style.left = cPageX + "px";
                }

                // If parent is not absolute, canvas is positioned relative to parent
                else {
                    _canvas.style.left = 0;
                }

                break;

            case "right":
                // If parent is absolute, canvas is positioned relative to document body
                if (_container.style.position === "absolute") {
                    
                    _canvas.style.right = cPageX + _container.clientWidth + "px";
                }

                // If parent is not absolute, canvas is positioned relative to parent
                else {
                    _canvas.style.right = 0;
                }

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

                // Get the canvas
                _canvas = document.getElementById(config.canvasId);

                // Set canvas width and height to be ideal dimensions at first
                _currentWidth = config.gameFieldWidth;
                _currentHeight = config.gameFieldHeight;

                _canvas.width = _currentWidth;
                _canvas.height = _currentHeight;
                
                // Canvas must be absolutely positioned to position it correctly within container
                _canvas.style.position = "absolute";
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
            _mutableRemoveIndex(_resizeEvents, i);
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
        addResizeEvent: _addResizeEvent,
        removeResizeEvent: _removeResizeEvent,
        getRelativeEventCoords: _getRelativeEventCoords
    };

})();