
## Description

Playing around with fractals in a web browser using WebGL.

## Controls

* Shift + Left Click
    * <i>Re-centre on the clicked point (maintain current zoom level).</i>
* Alt + Left Click
    * <i>Switch between Mandelbrot Set and Julia Set (initally, Mandelbrot Set). When switching to Julia Set, the clicked point provide the value for `c`.</i>
* `+`
    * <i>Increase zoom level.</i>
* `-`
    * <i>Decrease zoom level.</i>

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
