## Description

Playing around with fractals in a web browser using WebGL.

## Try It Out

I have deployed this web app to `gh-pages`. Use one of these links to launch it:

* [Manual Mode](https://taylorjg.github.io/FractalsWebGL?mode=manual)
  * _Allows you to pan and zoom around manually_
  * _See below for details of the keyboard controls_
* [Auto Mode](https://taylorjg.github.io/FractalsWebGL)
  * _Shows a different random region every 10 seconds_

## Keyboard Controls (Manual Mode)

* Meta + Left Click
  * _Select a region_
* Shift + Left Click
  * _Re-centre on the clicked point (maintain current zoom level)._
* Alt + Left Click
  * _Toggle between the Mandelbrot Set and the Julia Set (initally, Mandelbrot Set). When switching to the Julia Set, the clicked point provides the value for `c`._
* Left Click and drag around
  * _Pan around the region._
* `+`
  * _Increase the zoom level._
* `-`
  * _Decrease the zoom level._
* `h`
  * _Home - switch to the Mandelbrot Set, reset the region (bottom left: `(-2.25, -1.5)`, top right: `(0.75, 1.5)`) and restore the default colour map ('jet')._
* `c`
  * _Cycle forwards through the colour maps._
* SHIFT + `c`
  * _Cycle backwards through the colour maps._
* `s`
  * _Toggle on/off the use of smooth colouring_
  * _See [Renormalizing the Mandelbrot Escape](http://linas.org/art-gallery/escape/escape.html)_
* `v`
  * _Toggle on/off a summary of the current configuration at the bottom of the screen_
  * _Even when toggled off, the summary will be shown for 5 seconds each time an action is taken_

## Touchscreen Controls (Manual Mode)

I'm still thinking about how to do this.

## TODO

These are the main areas of focus for future improvements/additions:

* [ ] Error handling
* [ ] Logging
* [ ] Double emulation
* [ ] UI (react/MUI)
* [ ] Refactoring/splitting up the code into modules/classes
* [ ] Gestures/touchscreen support/responsive UI
* [ ] Finding random interesting regions (using WebGL/UI thread instead of CPU/web worker)
* [ ] Support for other fractal sets
