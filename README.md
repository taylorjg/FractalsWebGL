[![CI/CD](https://github.com/taylorjg/FractalsWebGL/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/taylorjg/FractalsWebGL/actions/workflows/ci-cd.yml)

## Description

Playing around with fractals in a web browser using WebGL.

## Try It Out

I have deployed this web app to `gh-pages`. Use one of these links to launch it:

- [Manual Mode](https://taylorjg.github.io/FractalsWebGL?mode=manual)
  - _Allows you to pan and zoom around manually_
  - _See below for details of the keyboard controls_
- [Auto Mode](https://taylorjg.github.io/FractalsWebGL)
  - _Shows a different random region every 10 seconds_

## Keyboard Controls (Manual Mode)

- Meta + Left Click
  - _Select a region_
- Shift + Left Click
  - _Re-centre on the clicked point (maintain current zoom level)._
- Alt + Left Click
  - _Toggle between the Mandelbrot Set and the Julia Set (initally, Mandelbrot Set). When switching to the Julia Set, the clicked point provides the value for `c`._
  - _From any IFS fractal (Barnsley fern, Sierpiński gasket, Twindragon), Alt + Left Click switches back to the Mandelbrot Set._
- Left Click and drag around
  - _Pan around the region._
- `+`
  - _Increase the zoom level._
- `-`
  - _Decrease the zoom level._
- `f`
  - _Cycle fractal type: Mandelbrot Set → Julia Set → Barnsley fern → Sierpiński gasket → Twindragon → Mandelbrot Set._
  - _Each cycle switches to that fractal's home view._
- `h`
  - _Home - reset to the home view for the current fractal type._
  - _Mandelbrot home: bottom left `(-2.25, -1.5)`, top right `(0.75, 1.5)`, default colour map ('jet')._
  - _Julia home: `c = (-0.7, 0.27015)`, region `(-1.5, -1.5)` to `(1.5, 1.5)`._
  - _Barnsley fern home: bottom left `(-3.0, -0.75)`, top right `(3.0, 10.75)`, 16384 IFS steps (default)._
  - _Sierpiński gasket home: bottom left `(-0.05, -0.05)`, top right `(1.05, 0.95)`, 16384 IFS steps (default)._
  - _Twindragon home: bottom left `(-0.5, -0.8)`, top right `(1.5, 0.8)`, 16384 IFS steps (default)._
- `c`
  - _Cycle forwards through the colour maps._
- SHIFT + `c`
  - _Cycle backwards through the colour maps._
- `i`
  - _Increase max iterations (Mandelbrot/Julia, up to 4096) or IFS steps per pixel (Barnsley fern, Sierpiński gasket, Twindragon — up to 65536; high values are very GPU-heavy)._
- SHIFT + `i`
  - _Decrease max iterations / IFS steps (step size 16 for escape-time fractals, 4096 for IFS fractals)._
- `s`
  - _Toggle on/off smooth colouring (Mandelbrot and Julia only)_
  - _See [Renormalizing the Mandelbrot Escape](http://linas.org/art-gallery/escape/escape.html)_
- `v`
  - _Toggle on/off a summary of the current configuration at the bottom of the screen_
  - _Even when toggled off, the summary will be shown for 5 seconds each time an action is taken_
- `b` followed by `n`
  - _Display a modal dialog to create a new bookmark_
- `b` followed by `l`
  - _Display a modal dialog to manage bookmarks_

## Touchscreen Controls (Manual Mode)

I'm still thinking about how to do this.

## TODO

These are the main areas of focus for future improvements/additions:

- [ ] Logging
- [ ] Double emulation
- [ ] UI (react/MUI)
- [ ] Refactoring/splitting up the code into modules/classes
- [ ] Gestures/touchscreen support/responsive UI
- [x] Find random interesting regions using WebGL/UI thread instead of CPU/web worker
- [x] Support for other fractal sets (Barnsley fern, Sierpiński gasket, Twindragon — manual mode)
