import registerPromiseWorker from 'promise-worker/register'
import * as C from './constants'

const evaluatePoint = (configuration, point) => {
  let z = { x: 0, y: 0 }
  const c = point
  let iteration = 0
  while (iteration < configuration.maxIterations) {
    if (z.x * z.x + z.y * z.y >= 4) break
    const zSquared = { x: z.x * z.x - z.y * z.y, y: 2.0 * z.x * z.y }
    z = { x: zSquared.x + c.x, y: zSquared.y + c.y }
    iteration += 1
  }
  return iteration
}

const evaluatePoints = (configuration, gridSize) => {
  const w = configuration.regionTopRight.x - configuration.regionBottomLeft.x
  const h = configuration.regionTopRight.y - configuration.regionBottomLeft.y
  const dx = w / (gridSize + 1)
  const dy = h / (gridSize + 1)
  const values = []
  for (let row = 1; row <= gridSize; row++) {
    const y = configuration.regionBottomLeft.y + row * dy
    for (let col = 1; col <= gridSize; col++) {
      const x = configuration.regionBottomLeft.x + col * dx
      const point = { x, y }
      const value = evaluatePoint(configuration, point)
      values.push(value)
    }
  }
  return values
}

const isInteresting = configuration => {
  const gridSize = 8
  const values = evaluatePoints(configuration, gridSize)
  const factor = randomFloat(0.4, 0.7)
  return new Set(values).size >= values.length * factor
}

const randomFloat = (min, max) => {
  return Math.random() * (max - min) + min
}

const randomInt = (min, max) => {
  return Math.trunc(randomFloat(min, max))
}

const randomElement = elements => {
  const randomIndex = Math.trunc(Math.random() * elements.length)
  return elements[randomIndex]
}

const createRandomConfiguration = (fractalSetIds, colorMapIds) => {
  const fractalSetId = randomElement(fractalSetIds)
  const colourMapId = randomElement(colorMapIds)
  const cx = randomFloat(-2, 0.75)
  const cy = randomFloat(-1.5, 1.5)
  const sz = randomFloat(0.005, 0.05)
  return {
    fractalSetId,
    juliaConstant: { x: cx, y: cy },
    colourMapId,
    regionBottomLeft: { x: cx - sz, y: cy - sz },
    regionTopRight: { x: cx + sz, y: cy + sz },
    maxIterations: randomInt(C.MIN_ITERATIONS, C.MAX_ITERATIONS)
  }
}

const onChooseConfiguration = (fractalSetIds, colorMapIds) => {
  for (; ;) {
    const configuration = createRandomConfiguration(fractalSetIds, colorMapIds)
    if (isInteresting(configuration)) {
      return configuration
    }
  }
}

const onUnknownMessage = message => {
  console.log(`Unknown message: ${JSON.stringify(message)}`)
}

const processMessage = message => {
  switch (message.type) {
    case 'chooseConfiguration': return onChooseConfiguration(
      message.fractalSetIds,
      message.colorMapIds)
    default: return onUnknownMessage(message)
  }
}

registerPromiseWorker(processMessage)
