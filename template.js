// This IIFE (aka closure) is for style preference only; it helps to prevent
// things inside from polluting the global namespace. It is completely optional.

// The leading semicolon is also a defensive measure when concatenating several
// JavaScript files into one.
;(function () {

    // This line enables 'strict mode'. It helps you to write cleaner code,
    // like preventing you from using undeclared variables.
    "use strict";

    // Initialize the resizer
    resizer.init();

    // Grab some important values from the resizer    
    let myContainer = resizer.getContainer();

    let myCanvas = resizer.getCanvas();
    let myContext = myCanvas.getContext("2d");

    // Get the sample button element
    let myBtn = document.getElementById("sample-button");


    

    // Every time the Resizer resizes things, do some extra
    // recaculations to position the sample button in the center
    resizer.addResizeEvent(centerButton);

    // Manual resize to ensure that our resize function is executed
    resizer.resize();




    // The function for centering our sample button
    function centerButton() {

        // Get the canvas' bounding rectangle
        let canvasRect = myCanvas.getBoundingClientRect();

        // Calculate the center of the canvas
        let canvasCenterX = canvasRect.left + (resizer.getCanvasWidth()/2);
        let canvasCenterY = canvasRect.top + (resizer.getCanvasHeight()/2);
        
        // Horizontally center the button
        myBtn.style.left = ( canvasCenterX - (myBtn.clientWidth/2) ) + "px";

        // Vertically center the button
        myBtn.style.top = ( canvasCenterY - (myBtn.clientHeight/2) ) + "px";
    }





    // Example helper function to do an arbitrary thing with the canvas
    let doSomething = (function() {

        // Get the game field width/height.
        // Note that the logical ingame width/height will always be as they are in config.js
        // (in this example it is 540x960). Logical ingame pixels automatically scale to
        // physical canvas style size.
        const GAME_WIDTH = resizer.getGameWidth();
        const GAME_HEIGHT = resizer.getGameHeight();

        // 10px margin on all sides
        const margin = 10;

        // The number of frames after which to change colors
        const CHANGE_FRAME = 60;

        // The number of frames passed so far
        let frames = 0;

        // The color to fill
        let color;

        return function() {
            // 1 frame has passed
            frames = (frames+1) % CHANGE_FRAME;

            // Grab a random color every 60 frames (approx. 1 second, ideally)
            if (frames === 0) {
                color = "#" + Math.floor( Math.random()*1000000 );
            }

            // Set the color
            myContext.fillStyle = color;

            // Color within the margins
            myContext.fillRect(margin, margin, GAME_WIDTH-(margin*2), GAME_HEIGHT-(margin*2));

            // Execute this function again in the next frame
            window.requestAnimationFrame(doSomething);
        };
    })();

    // Begin the arbitrary thing example loop
    doSomething();


// Close and execute the IIFE here
})();