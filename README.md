# Better Game Template
Includes game UI and responsive canvas resizing library
<br/><br/><br/>


# Resizer Documentation - Useful Functions

### `resizer.init()`
Initializes the Resizer for use. It also performs one execution of resizing code if necessary, and begins the DOM 'resize' event listener.
<br/>

### `resizer.resize()`
Executes the Resizer's default resize code as well as any user-defined resize events.
<br/>

### `resizer.addResizeEvent(func)`
Adds the passed function to a list of functions that are each executed each time the Resizer's resize code fires. Use this instead of adding your own event listeners to take advantage of the Resizer's performance optimizations.
<br/>

### `resizer.removeResizeEvent(func)`
Remove the specified function from the list of functions that are executed each time the Resizer's resize code fires.
<br/>

### `resizer.getRelativeEventCoords(event)`
Only applicable if using a canvas. Returns an object containing the x- and y-coordinates of the event object in terms of the game field within the canvas. Events such as the click and touch events give you coordinates relative to the page, so use this function to get coordinates relative to the game.
<br/><br/><br/>


## Accessors (Getters)

### `resizer.getOrientation()`
Only applicable if using a canvas. Returns the orientation as specified in `config.js` unless it is specified as `"both"`. If `"both"`, returns the Resizer-decided orientation between `"portrait"` and `"landscape"`. 
<br/>

### `resizer.getSizeMode()`
Only applicable if using a canvas and `stretchToFit: false`. Returns the mode used when resizing the canvas. This provides information about if the height fits to the screen first and then the width is scaled, or vice versa.
<br/>

### `resizer.getCanvas()`
Only applicable if using a canvas. Returns the canvas element as specified by its id in `config.js`.
<br/>

### `resizer.getContainer()`
Returns the container element as specified by its id in `config.js`.
<br/>

### `resizer.getGameHeight()`
Only applicable if using a canvas. Returns the game height as specified in `config.js`.
<br/>

### `resizer.getGameWidth()`
Only applicable if using a canvas. Returns the game width as specified in `config.js`.
<br/>

### `resizer.getCanvasWidth()`
Only applicable if using a canvas. Returns the actual canvas width after it has been resized.
<br/>

### `resizer.getCanvasHeight()`
Only applicable if using a canvas. Returns the actual canvas height after it has been resized.
<br/><br/><br/>


# Template Documentation - Useful Properties

### `template.menus`
An object containing references to the following menu elements:
```
{
    paused,
    help,
    notImplemented,
    confirm
}
```
<br/>

### `template.menuButtons`
An object containing references to the following menu button elements (not including top bar buttons):
```
{
    restart,
    resume,
    exit,
    music,
    volume,
    help,
    
    tutorial,
    report,
    back
}
```
<br/><br/><br/>


# Template Documentation - Useful Functions

### `template.init()`
Initializes the template for use by sizing the top bar buttons and setting the necessary event listeners for each button.
<br/>

### `template.resizeBarButtons()`
Calculates and applies style changes to resize the top bar buttons to their correct size.
<br/>

### `template.addConfirm(button, confirmText, callback)`
Shows a confirmation menu whenever the button in question is clicked. The menu will show up with two options: a button that says "YES, [confirmText goes here]", and a button that allows the user to go back to the previous menu. Upon clicking the "YES" button, the callback will be executed.
<br/>

### `template.removeNotImplemented(button)`
By default, most buttons show a menu that says "SORRY! This button has not yet been implemented." Use this function to remove that menu, for when it is time to implement the button.
<br/>

### `template.goToBGL()`
Redirects the user to [thebraingamelab.org](https://thebraingamelab.org/).
<br/>

### `template.showMenu(menuElement)`
Dims the background, hides the top bar, and shows the menu given.
<br/>

### `template.hideMenu(menuElement)`
Undims the background, shows the top bar, and hides the menu given.
<br/>

### `template.switchMenu(currentMenu, nextMenu)`
Switches from one menu to another. In other words, hides the `currentMenu`, and shows `nextMenu`. The background remains dimmed, and the top bar remains hidden.
<br/>

### `template.resizeBarButtons()`
Calculates and applies style changes to resize the top bar buttons to their correct size.
<br/>

### `template.setIcon(button, svgId)`
Sets the SVG icon of the button element given to the SVG icon with an id of `svgId`.
<br/>

### `template.pause()`
Sets the template's `paused` boolean to true.
<br/>

### `template.unpause()`
Sets the template's `paused` boolean to false.
<br/>

### `template.isPaused()`
Returns the boolean value of the template's `paused` variable.
<br/>