[![CircleCI](https://circleci.com/gh/taylorjg/FractalsWebGL.svg?style=svg)](https://circleci.com/gh/taylorjg/FractalsWebGL)

## Description

Playing around with fractals in a web browser using WebGL.

## Try it out

[Try it on Heroku](http://fractalswebgl.herokuapp.com/)
(_it may take 10s to re-activate_)

## Controls

* Shift + Left Click
    * <i>Re-centre on the clicked point (maintain current zoom level).</i>
* Alt + Left Click
    * <i>Switch between the Mandelbrot Set and the Julia Set (initally, Mandelbrot Set). When switching to the Julia Set, the clicked point provides the value for `c`.</i>
* `+`
    * <i>Increase the zoom level.</i>
* `-`
    * <i>Decrease the zoom level.</i>
* CTRL + `h`
    * <i>Home - switch to the Mandelbrot Set and reset the region to bottom left `(-2.25, -1.5)` and top right `(0.75, 1.5)`.</i>

## TODO

* Implement panning
* Use `double`s in the shaders ? Would this allow us to zoom in further before we start to get bad pixellation ?
* Add a panel on the side (that slides in/out) to do various things e.g.:
    * Switch colour maps
    * Switch fractals
    * Bookmark interesting fractal regions
    * etc.
* Implement the [Barnsley fern](https://en.wikipedia.org/wiki/Barnsley_fern) ?
* Play around with [Iterated Function Systems](https://en.wikipedia.org/wiki/Iterated_function_system) ?
* Play around with [Fractal Flames](https://en.wikipedia.org/wiki/Fractal_flame) ?
