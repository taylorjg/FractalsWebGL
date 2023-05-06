## Description

Playing around with fractals in a web browser using WebGL.

## Try It Out

Deployed to `gh-pages` here:

* [Manual Mode](https://taylorjg.github.io/FractalsWebGL?mode=manual)
  * _Allows you to pan and zoom around manually_
  * _See below for details of the keyboard controls_
* [Auto Mode](https://taylorjg.github.io/FractalsWebGL)
  * _Shows a different random region every 10 seconds_

## Controls (Manual Mode)

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
* CTRL + `h`
    * _Home - switch to the Mandelbrot Set, reset the region (bottom left: `(-2.25, -1.5)`, top right: `(0.75, 1.5)`) and restore the default colour map ('jet')._
* CTRL + `c`
    * _Cycle forwards through the colour maps._
* SHIFT + CTRL + `c`
    * _Cycle backwards through the colour maps._

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
