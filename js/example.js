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


    // Initialize the template
    template.init();


    //////////////////////////
    // Variable declarations
    //////////////////////////

    // Grab some important values from the resizer
    let myCanvas = resizer.getCanvas();
    let myContext = myCanvas.getContext("2d");

    // Is the game volume muted?
    let volumeMuted = false;



    //////////////////////////
    // Resize events
    //////////////////////////

    // Every time the Resizer resizes things, do some extra
    // recaculations to position the sample button in the center
    resizer.addResizeEvent(template.resizeBarButtons);

    // Manual resize to ensure that our resize functions are executed
    // (could have also just called resizerBarButtons() but this will do for demonstration purposes)
    resizer.resize();


    //////////////////////////
    // Button events
    //////////////////////////

    // Remove not implemented menus for those buttons we are implementing
    template.removeNotImplemented(template.menuButtons.restart);
    template.removeNotImplemented(template.menuButtons.exit);
    template.removeNotImplemented(template.menuButtons.volume);

    // Confirm the user wants to restart the game
    // (restart not yet implemented, so show "not implemented" menu)
    template.addConfirm(template.menuButtons.restart, "RESTART", function() {
        template.showMenu(template.menus.notImplemented);
    });

    // Confirm if the user wants to exit the game (takes user to main website)
    template.addConfirm(template.menuButtons.exit, "EXIT", template.goToBGL);

    // Change icon of volume button on click
    template.menuButtons.volume.addEventListener("click", function () {
        volumeMuted = !volumeMuted;

        if (volumeMuted) {
            template.setIcon(template.menuButtons.volume, "no-volume-icon");
        }
        else {
            template.setIcon(template.menuButtons.volume, "volume-icon");
        }
    }, false);

    

    /////////////////////////////////////
    // Function definitions
    /////////////////////////////////////

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




    /////////////////////////////////////
    // Mainline logic
    /////////////////////////////////////

    // Begin the arbitrary thing example loop
    doSomething();


// Close and execute the IIFE here
})();