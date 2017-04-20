[![CircleCI](https://circleci.com/gh/taylorjg/FractalsWebGL.svg?style=svg)](https://circleci.com/gh/taylorjg/FractalsWebGL)

## Description

Playing around with fractals in a web browser using WebGL.

## Try it out

[Try it on Heroku](http://fractalswebgl.herokuapp.com/)
(_it may take 10s to re-activate_)

## Controls

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

## Colourmaps

* jet
* gist_stern
* ocean
* rainbow
* monochrome

## TODO

* ~~Implement panning~~
* ~~Add more colour maps~~
* Doesn't work on some browsers (e.g. iPad/Safari) - need to investigate and fix
* Use `double`s in the shaders ? Would this allow us to zoom in further before we start to get bad pixellation ? Does WebGL support `double`s ?
* Provide a way to change the number of iterations (currently hardcoded to 120).
* Add a panel on the side (that slides in/out) to do various things e.g.:
    * Switch colour maps
    * Switch fractals
    * Bookmark interesting fractal regions
    * etc.
* Implement the [Barnsley fern](https://en.wikipedia.org/wiki/Barnsley_fern) ?
* Play around with [Iterated Function Systems](https://en.wikipedia.org/wiki/Iterated_function_system) ?
* Play around with [Fractal Flames](https://en.wikipedia.org/wiki/Fractal_flame) ?
