import PromiseWorker from 'promise-worker'
import * as glm from 'gl-matrix'
import vertexShaderSource from '../shaders/shader.vert.glsl'
import mandelbrotShaderSource from '../shaders/mandelbrot.frag.glsl'
import juliaShaderSource from '../shaders/julia.frag.glsl'
import { colourMapDictionary } from './colourMapData'
import { getColourMap } from './colourMaps'
import * as C from './constants'

const worker = new Worker('./web-worker.js', { type: 'module' })
const promiseWorker = new PromiseWorker(worker)

const FRACTAL_SET_ID_MANDELBROT = 0
const FRACTAL_SET_ID_JULIA = 1

let canvas
let gl

const createColormapTexture = (colourMap, textureUnit) => {
  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0 + textureUnit)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  const pixels = new Float32Array(colourMap)
  const level = 0
  const width = colourMap.length / 4
  const height = 1
  const border = 0
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    gl.RGBA32F,
    width,
    height,
    border,
    gl.RGBA,
    gl.FLOAT,
    pixels)
}

const loadColourMap = (name, textureUnit) => {
  const colourMap = getColourMap(name)
  createColormapTexture(colourMap, textureUnit)
  return {
    name,
    colourMap,
    textureUnit
  }
}

const loadColourMaps = () => {
  const colorMapNames = Array.from(Object.keys(colourMapDictionary))
  colorMapNames.forEach((colorMapName, index) => {
    colourMaps.set(index, loadColourMap(colorMapName, index))
  })
}

const fractalSets = new Map()
const colourMaps = new Map()

let currentMaxIterations = C.INITIAL_ITERATIONS
let currentFractalSetId = undefined
let currentFractalSet = undefined
let currentJuliaConstant = undefined
let currentColourMapId = undefined
let currentColourMap = undefined
let regionBottomLeft = {}
let regionTopRight = {}
let panning = false
let lastMousePt

const INITIAL_BOOKMARK = {
  fractalSetId: FRACTAL_SET_ID_MANDELBROT,
  juliaConstant: { x: 0, y: 0 },
  colourMapId: 0,
  regionBottomLeft: { x: -0.22, y: -0.7 },
  regionTopRight: { x: -0.21, y: -0.69 },
  maxIterations: C.INITIAL_ITERATIONS
}

const HOME_BOOKMARK = {
  fractalSetId: FRACTAL_SET_ID_MANDELBROT,
  juliaConstant: { x: 0, y: 0 },
  colourMapId: 0,
  regionBottomLeft: { x: -2.25, y: -1.5 },
  regionTopRight: { x: 0.75, y: 1.5 },
  maxIterations: C.INITIAL_ITERATIONS
}

let bookmarkMode = false
let nextBookmarkId = 0
let bookmarks = new Map()

const initGL = canvas => {
  try {
    gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true })
    console.dir(gl)
  }
  catch (e) {
    console.error(`canvas.getContext(webgl2) failed: ${e.message}`)
  }
  if (!gl) {
    console.error('Failed to initialise WebGL')
  }
}

const getShader = (gl, source, shaderType) => {
  const shader = gl.createShader(shaderType)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const errorMessage = gl.getShaderInfoLog(shader)
    console.error(`Failed to compile shader: ${errorMessage}`)
    return null
  }
  return shader
}

const initShadersHelper = (name, fragmentShaderSource) => {

  const vertexShader = getShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
  const fragmentShader = getShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const errorMessage = gl.getProgramInfoLog(program)
    console.error(`Could not initialise shaders: ${errorMessage}`)
    return
  }

  const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition')
  gl.enableVertexAttribArray(aVertexPosition)

  const aPlotPosition = gl.getAttribLocation(program, 'aPlotPosition')
  gl.enableVertexAttribArray(aPlotPosition)

  const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix')
  const uMaxIterations = gl.getUniformLocation(program, 'uMaxIterations')
  const uColormap = gl.getUniformLocation(program, 'uColormap')
  const uJuliaConstant = gl.getUniformLocation(program, 'uJuliaConstant')

  const vertices = [
    1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    -1.0, -1.0,
  ]
  const vertexPositionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0)

  return {
    name,
    program,
    aVertexPosition,
    aPlotPosition,
    uModelViewMatrix,
    uMaxIterations,
    uColormap,
    uJuliaConstant,
    vertexPositionBuffer
  }
}

const initShaders = () => {
  const mandelbrotSet = initShadersHelper('Mandelbrot', mandelbrotShaderSource)
  const juliaSet = initShadersHelper('Julia', juliaShaderSource)
  fractalSets.set(FRACTAL_SET_ID_MANDELBROT, mandelbrotSet)
  fractalSets.set(FRACTAL_SET_ID_JULIA, juliaSet)
}

const setCurrentFractalSet = (fractalSetId, juliaConstant, colourMapId) => {

  if (Number.isInteger(fractalSetId)) {
    currentFractalSetId = fractalSetId
    currentFractalSet = fractalSets.get(fractalSetId)
  }

  if (juliaConstant) {
    currentJuliaConstant = juliaConstant
  }
  if (!currentJuliaConstant) {
    currentJuliaConstant = { x: 0, y: 0 }
  }

  if (Number.isInteger(colourMapId)) {
    currentColourMapId = colourMapId
    currentColourMap = colourMaps.get(colourMapId)
  }

  gl.useProgram(currentFractalSet.program)

  const modelViewMatrix = glm.mat4.create()
  glm.mat4.fromScaling(modelViewMatrix, [1, -1, 1])
  gl.uniformMatrix4fv(currentFractalSet.uModelViewMatrix, false, modelViewMatrix)

  gl.uniform1i(currentFractalSet.uColormap, currentColourMap.textureUnit)
  gl.uniform2f(currentFractalSet.uJuliaConstant, currentJuliaConstant.x, currentJuliaConstant.y)

  setCanvasAndViewportSize()

  render()
}

const render = () => {
  const baseCorners = [
    [regionTopRight.x, regionTopRight.y],
    [regionBottomLeft.x, regionTopRight.y],
    [regionTopRight.x, regionBottomLeft.y],
    [regionBottomLeft.x, regionBottomLeft.y]
  ]
  const corners = []
  for (const index in baseCorners) {
    const x = baseCorners[index][0]
    const y = baseCorners[index][1]
    corners.push(x)
    corners.push(y)
  }
  const plotPositionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, plotPositionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW)
  gl.vertexAttribPointer(currentFractalSet.aPlotPosition, 2, gl.FLOAT, false, 0, 0)
  gl.uniform1i(currentFractalSet.uMaxIterations, currentMaxIterations)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  gl.deleteBuffer(plotPositionBuffer)
}

const displayConfiguration = async configuration => {
  switchToBookmark(configuration)
  const message = {
    type: 'chooseConfiguration',
    fractalSetIds: [FRACTAL_SET_ID_MANDELBROT, FRACTAL_SET_ID_JULIA],
    colorMapIds: Array.from(colourMaps.keys())
  }
  const newConfiguration = await promiseWorker.postMessage(message)
  setTimeout(displayConfiguration, 5000, newConfiguration)
}

const start = async manualMode => {

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('service-worker.js')
      console.log('Successfully registered service worker', registration)
    } catch (error) {
      console.error(`Failed to register service worker: ${error.message}`)
    }
  }

  canvas = document.getElementById('canvas')
  window.addEventListener('resize', onWindowResize)

  initGL(canvas)
  initShaders()
  loadColourMaps()

  if (manualMode) {
    canvas.addEventListener('mousedown', onCanvasMouseDownHandler)
    canvas.addEventListener('mousemove', onCanvasMouseMoveHandler)
    canvas.addEventListener('mouseup', onCanvasMouseUpHandler)
    canvas.addEventListener('mouseleave', onCanvasMouseLeaveHandler)
    document.addEventListener('keydown', onDocumentKeyDownHandler)
    bookmarks = loadBookmarks()
    nextBookmarkId = bookmarks.size ? Math.max(...bookmarks.keys()) + 1 : 0
    switchToBookmark(INITIAL_BOOKMARK)
  } else {
    displayConfiguration(INITIAL_BOOKMARK)
  }
}

const adjustRegionAspectRatio = (canvasWidth, canvasHeight) => {

  const regionWidth = regionTopRight.x - regionBottomLeft.x
  const regionHeight = regionTopRight.y - regionBottomLeft.y

  if (canvasWidth > canvasHeight) {
    const widthDelta = canvasWidth / canvasHeight * regionHeight - regionWidth
    const widthDeltaHalf = widthDelta / 2
    regionBottomLeft.x -= widthDeltaHalf
    regionTopRight.x += widthDeltaHalf
  }

  if (canvasWidth < canvasHeight) {
    const heightDelta = canvasHeight / canvasWidth * regionWidth - regionHeight
    const heightDeltaHalf = heightDelta / 2
    regionBottomLeft.y -= heightDeltaHalf
    regionTopRight.y += heightDeltaHalf
  }
}

const panRegion = percent => {
  const regionWidth = regionTopRight.x - regionBottomLeft.x
  const regionHeight = regionTopRight.y - regionBottomLeft.y
  const widthDelta = regionWidth / 100 * percent
  const heightDelta = regionHeight / 100 * percent
  regionBottomLeft.x -= widthDelta
  regionBottomLeft.y -= heightDelta
  regionTopRight.x -= widthDelta
  regionTopRight.y -= heightDelta
}

const zoomRegion = percent => {
  const regionWidth = regionTopRight.x - regionBottomLeft.x
  const regionHeight = regionTopRight.y - regionBottomLeft.y
  const widthDelta = regionWidth / 100 * percent
  const widthDeltaHalf = widthDelta / 2
  const heightDelta = regionHeight / 100 * percent
  const heightDeltaHalf = heightDelta / 2
  regionBottomLeft.x += widthDeltaHalf
  regionBottomLeft.y += heightDeltaHalf
  regionTopRight.x -= widthDeltaHalf
  regionTopRight.y -= heightDeltaHalf
}

const setCanvasAndViewportSize = () => {
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  gl.viewport(0, 0, canvas.width, canvas.height)
  adjustRegionAspectRatio(canvas.width, canvas.height)
}

const onWindowResize = () => {
  setCanvasAndViewportSize()
  render()
}

const mouseToRegion = (mouseX, mouseY) => {
  const regionWidth = regionTopRight.x - regionBottomLeft.x
  const regionHeight = regionTopRight.y - regionBottomLeft.y
  return {
    regionMouseX: regionBottomLeft.x + mouseX * regionWidth / canvas.width,
    regionMouseY: regionBottomLeft.y + mouseY * regionHeight / canvas.height
  }
}

const onCanvasMouseDownHandler = e => {

  const mouseX = e.offsetX
  const mouseY = e.offsetY
  const { regionMouseX, regionMouseY } = mouseToRegion(mouseX, mouseY)

  if (e.shiftKey) {
    const regionWidth = regionTopRight.x - regionBottomLeft.x
    const regionHeight = regionTopRight.y - regionBottomLeft.y
    const regionCentreX = regionBottomLeft.x + regionWidth / 2
    const regionCentreY = regionBottomLeft.y + regionHeight / 2
    const translationX = regionMouseX - regionCentreX
    const translationY = regionMouseY - regionCentreY
    regionBottomLeft.x += translationX
    regionBottomLeft.y += translationY
    regionTopRight.x += translationX
    regionTopRight.y += translationY
    return render()
  }

  if (e.altKey) {
    switch (currentFractalSetId) {
      case FRACTAL_SET_ID_MANDELBROT:
        return setCurrentFractalSet(FRACTAL_SET_ID_JULIA, { x: regionMouseX, y: regionMouseY })

      case FRACTAL_SET_ID_JULIA:
        return setCurrentFractalSet(FRACTAL_SET_ID_MANDELBROT)

      default:
        return
    }
  }

  panning = true
  lastMousePt = { mouseX, mouseY }
}

const onCanvasMouseMoveHandler = e => {

  if (!panning) {
    return
  }

  const mouseX = e.offsetX
  const mouseY = e.offsetY
  const mouseDeltaX = mouseX - lastMousePt.mouseX
  const mouseDeltaY = mouseY - lastMousePt.mouseY
  const regionWidth = regionTopRight.x - regionBottomLeft.x
  const regionHeight = regionTopRight.y - regionBottomLeft.y
  const regionDeltaX = mouseDeltaX * regionWidth / canvas.width
  const regionDeltaY = mouseDeltaY * regionHeight / canvas.height
  regionBottomLeft.x -= regionDeltaX
  regionBottomLeft.y -= regionDeltaY
  regionTopRight.x -= regionDeltaX
  regionTopRight.y -= regionDeltaY

  render()

  lastMousePt = { mouseX, mouseY }
}

const onCanvasMouseUpHandler = () => {
  panning = false
}

const onCanvasMouseLeaveHandler = () => {
  panning = false
}

const onDocumentKeyDownHandler = e => {

  if (bookmarkMode) {
    return handleBookmarkKeys(e)
  }

  if (!bookmarkMode && e.key === 'b' && e.ctrlKey) {
    bookmarkMode = true
    return
  }

  if (e.key === '+') {
    zoomRegion(50)
    return render()
  }

  if (e.key === '-') {
    zoomRegion(-100)
    return render()
  }

  if (e.key === 'h' && e.ctrlKey) {
    return switchToBookmark(HOME_BOOKMARK)
  }

  if ((e.key === 'c' || e.key === 'C') && e.ctrlKey) {
    const keys = Array.from(colourMaps.keys())
    const maxIndex = keys.length
    const oldIndex = keys.indexOf(currentColourMapId)
    const newIndex = (oldIndex + (e.shiftKey ? maxIndex - 1 : 1)) % maxIndex
    const newColourMapId = keys[newIndex]
    return setCurrentFractalSet(undefined, undefined, newColourMapId)
  }

  if ((e.key === 'i' || e.key === 'I')) {
    const delta = C.DELTA_ITERATIONS * (e.shiftKey ? -1 : +1)
    currentMaxIterations = currentMaxIterations + delta
    currentMaxIterations = Math.min(currentMaxIterations, C.MAX_ITERATIONS)
    currentMaxIterations = Math.max(currentMaxIterations, C.MIN_ITERATIONS)
    return render()
  }

  if ((e.key === 'r' || e.key === 'R')) {
    // TODO: choose a random region
  }
}

const handleBookmarkKeys = e => {

  bookmarkMode = false

  if (e.key === 'n') {
    const bookmark = createBookmark()
    return presentBookmarkModal(bookmark)
  }

  if (e.key === 'l') {
    return presentManageBookmarksModal()
  }
}

const presentBookmarkModal = bookmark => {

  const hasId = Number.isInteger(bookmark.id)

  const modal = $('#bookmarkModal')

  const title = hasId ? 'Edit Bookmark' : 'New Bookmark'
  $('.modal-title', modal).text(title)

  $('input[type="submit"]', modal)
    .off('click')
    .on('click', e => {
      e.preventDefault()
      bookmark.name = $('#name', modal).val()
      if (!hasId) {
        bookmark.id = nextBookmarkId++
        bookmarks.set(bookmark.id, bookmark)
      }
      saveBookmarks(bookmarks)
      modal.modal('hide')
    })

  modal
    .modal()
    .off('shown.bs.modal')
    .on('shown.bs.modal', () => {

      const thumbnailImg = $('img.thumbnail', modal)
      const thumbnailCanvas = $('canvas.thumbnail', modal)
      if (hasId) {
        thumbnailCanvas.hide()
        thumbnailImg.show()
        thumbnailImg[0].src = bookmark.thumbnail
      } else {
        thumbnailImg.hide()
        thumbnailCanvas.show()
        const thumbnailCanvasElement = thumbnailCanvas[0]
        const thumbnailCtx = thumbnailCanvasElement.getContext('2d')
        const swidth = Math.min(canvas.width, canvas.height)
        const sheight = Math.min(canvas.width, canvas.height)
        const sx = (canvas.width - swidth) / 2
        const sy = (canvas.height - sheight) / 2
        const dwidth = thumbnailCanvasElement.width
        const dheight = thumbnailCanvasElement.height
        thumbnailCtx.drawImage(canvas, sx, sy, swidth, sheight, 0, 0, dwidth, dheight)
        bookmark.thumbnail = thumbnailCanvasElement.toDataURL('image/jpeg', 1.0)
      }

      $('#name', modal).val(bookmark.name).focus()
      $('.fractal-set', modal).text(fractalSets.get(bookmark.fractalSetId).name)
      $('.colour-map', modal).text(colourMaps.get(bookmark.colourMapId).name)
      $('.max-iterations', modal).text(bookmark.maxIterations)
      $('.region-bottom-left', modal).text(`(${bookmark.regionBottomLeft.x}, ${bookmark.regionBottomLeft.y})`)
      $('.region-top-right', modal).text(`(${bookmark.regionTopRight.x}, ${bookmark.regionTopRight.y})`)
      const juliaConstantP = $('.julia-constant', modal)
      const juliaConstantDiv = juliaConstantP.closest('div')
      if (bookmark.fractalSetId === FRACTAL_SET_ID_JULIA) {
        juliaConstantP.text(`(${bookmark.juliaConstant.x}, ${bookmark.juliaConstant.y})`)
        juliaConstantDiv.show()
      } else {
        juliaConstantDiv.hide()
      }
    })
}

const presentManageBookmarksModal = () => {

  const modal = $('#manageBookmarksModal')

  modal
    .modal()
    .off('shown.bs.modal')
    .on('shown.bs.modal', () => {
      const tbody = $('tbody', modal).empty()
      bookmarks.forEach(bookmark => {
        const thumbnail = $('<img>', {
          'class': 'thumbnail',
          src: bookmark.thumbnail,
          'style': 'cursor: pointer;'
        })
        const editButton = $('<i>', {
          'class': 'fa fa-pencil',
          'aria-hidden': 'true',
          'style': 'cursor: pointer;'
        })
        const deleteButton = $('<i>', {
          'class': 'fa fa-trash',
          'aria-hidden': 'true',
          'style': 'cursor: pointer;'
        })
        thumbnail.on('click', invokeWithBookmark(onSwitchTo))
        editButton.on('click', invokeWithBookmark(onEdit))
        deleteButton.on('click', invokeWithBookmark(onDelete))
        const tr = $('<tr>', { 'data-id': bookmark.id })
        tr.append($('<td>', { html: thumbnail, style: 'width: 1px;' }))
        tr.append($('<td>', { html: bookmark.name, style: 'vertical-align: middle; text-align: left;' }))
        tr.append($('<td>', { html: editButton, style: 'vertical-align: middle; text-align: center;' }))
        tr.append($('<td>', { html: deleteButton, style: 'vertical-align: middle; text-align: center;' }))
        tbody.append(tr)
      })
    })

  function invokeWithBookmark(fn) {
    return function () {
      modal.modal('hide')
      const tr = $(this).closest('tr')
      const id = Number(tr.attr('data-id'))
      const bookmark = bookmarks.get(id)
      fn(bookmark)
    }
  }

  const onSwitchTo = bookmark => switchToBookmark(bookmark)
  const onEdit = bookmark => presentBookmarkModal(bookmark)
  const onDelete = bookmark => {
    bookmarks.delete(bookmark.id)
    saveBookmarks(bookmarks)
  }
}

const createBookmark = name => ({
  name: name || `Bookmark${nextBookmarkId}`,
  fractalSetId: currentFractalSetId,
  juliaConstant: { ...currentJuliaConstant },
  colourMapId: currentColourMapId,
  regionBottomLeft: { ...regionBottomLeft },
  regionTopRight: { ...regionTopRight },
  maxIterations: currentMaxIterations
})

const switchToBookmark = bookmark => {
  regionBottomLeft.x = bookmark.regionBottomLeft.x
  regionBottomLeft.y = bookmark.regionBottomLeft.y
  regionTopRight.x = bookmark.regionTopRight.x
  regionTopRight.y = bookmark.regionTopRight.y
  currentMaxIterations = bookmark.maxIterations
  setCurrentFractalSet(bookmark.fractalSetId, bookmark.juliaConstant, bookmark.colourMapId)
}

const loadBookmarks = () => {
  return new Map(JSON.parse(localStorage.bookmarks || '[]'))
}

const saveBookmarks = bookmarks => {
  localStorage.bookmarks = JSON.stringify(Array.from(bookmarks.entries()))
}

const url = new URL(document.location)
const manualMode = url.searchParams.get('mode') === 'manual'

start(manualMode)
