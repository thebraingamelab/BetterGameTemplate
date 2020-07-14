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



    //////////////////////////
    // Variable declarations
    //////////////////////////

    // Grab some important values from the resizer    
    let myContainer = resizer.getContainer();

    let myCanvas = resizer.getCanvas();
    let myContext = myCanvas.getContext("2d");

    // Get the top bar elements
    let topBar = document.getElementById("top-bar");
    let pauseBox = document.getElementById("pause-box");
    let helpBox = document.getElementById("help-box");

    let pauseBtn = document.getElementById("pause");
    let helpBtn = document.getElementById("help");

    // Menu elements
    let pauseMenu = document.getElementById("pause-menu");
    let resumeBtn = document.getElementById("resume");
    let miniHelpBtn = document.getElementById("help-mini");

    let helpMenu = document.getElementById("help-menu");
    let backBtn = document.getElementById("back");

    // Dimension value for top bar buttons
    let boxSize;




    //////////////////////////
    // Resize events
    //////////////////////////

    // Every time the Resizer resizes things, do some extra
    // recaculations to position the sample button in the center
    resizer.addResizeEvent(resizeBarButtons);

    // Manual resize to ensure that our resize functions are executed
    // (could have also just called resizerBarButtons() but this will do for demonstration purposes)
    resizer.resize();


    //////////////////////////
    // Button events
    //////////////////////////

    function showMenu(menuElement) {

        // Show the menu
        menuElement.classList.remove("center-popin");
        menuElement.classList.add("center-popout");

        // Hide the top bar
        topBar.style.display = "none";
    }

    function hideMenu(menuElement) {
        // Hide the menu
        menuElement.classList.remove("center-popout");
        menuElement.classList.add("center-popin");


        // Show the top bar
        topBar.style.display = "";
    }

    pauseBtn.addEventListener("click", function() { showMenu(pauseMenu); }, false);

    resumeBtn.addEventListener("click", function() { hideMenu(pauseMenu); }, false);


    helpBtn.addEventListener("click", function() { showMenu(helpMenu); }, false);

    backBtn.addEventListener("click", function() { hideMenu(helpMenu); }, false);


    /////////////////////////////////////
    // Resizing function definitions
    /////////////////////////////////////


    // The function for sizing the top bar buttons
    function resizeBarButtons() {
        let barHeight, originalDisplay;

        // Store display setting
        originalDisplay = topBar.style.display;

        // In case top bar isn't visible (which means clientHeight === 0),
        // temporarily make it visible to calculate true height
        topBar.style.display = "";
        barHeight = topBar.clientHeight;
        topBar.style.display = originalDisplay;

        // Box size is slightly larger than the bar (120% of height)
        boxSize = barHeight * 1.20;

        // Set styles
        pauseBox.style.height = boxSize + "px";
        pauseBox.style.width = boxSize + "px";

        helpBox.style.height = boxSize + "px";
        helpBox.style.width = boxSize + "px";
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
        const CHANGE_FRAME = 120;

        // The number of frames passed so far
        let frames = 0;

        // The color to fill
        let color;

        return function() {
            // 1 frame has passed
            frames = (frames+1) % CHANGE_FRAME;

            // Grab a random color every 120 frames (approx. 2 seconds, ideally)
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