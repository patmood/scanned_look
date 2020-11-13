var url = './sample.pdf'

const CONTRAST_SCALE = 10
const ROTATION_SCALE = 1

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf']
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js'

function handleFileChange(file) {
  console.log(file)
  const reader = new FileReader()
  reader.onload = function (evt) {
    var typedarray = new Uint8Array(evt.target.result)
    loadPdf(typedarray)
  }
  reader.readAsArrayBuffer(file)
}

async function loadPdf(typedarray) {
  // Loads the actual pdf
  const pdf = await pdfjsLib.getDocument(url /* TODO: used typedarray */).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 0.9 })

  const canvas = document.getElementById('pdf-canvas')
  const context = canvas.getContext('2d')
  canvas.height = viewport.height
  canvas.width = viewport.width

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  }
  await page.render(renderContext).promise
  processCanvas(canvas)
}

function processCanvas(canvas) {
  const { height, width } = canvas
  const context = canvas.getContext('2d')
  const imageData = context.getImageData(0, 0, width - 1, height - 1)
  const data = imageData.data
  const inMemoryCanvas = document.createElement('canvas')
  inMemoryCanvas.height = height
  inMemoryCanvas.width = width
  const inMemoryContext = inMemoryCanvas.getContext('2d')

  // Calculate contrast
  const contrast = CONTRAST_SCALE * (255 / 100) // scale
  const factor = (255 + contrast) / (255.01 - contrast) //add .1 to avoid /0 error

  // To grayscale the colors of an image with HTML5 Canvas, we can iterate over all of the pixels in the image, calculate the brightness of each, and then set the red, green, and blue components equal to the brightness.
  for (var i = 0; i < data.length; i += 4) {
    var brightness = factor * 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]
    data[i] = brightness // red
    data[i + 1] = brightness // green
    data[i + 2] = brightness // blue
  }

  // Overwrite original image
  inMemoryContext.putImageData(imageData, 0, 0)

  // Clear canvas (without this pages will stack)
  // context.clearRect(0, 0, width, height)

  // Rotate clockwise in radians
  const degrees = Math.random() * 2 * ROTATION_SCALE - ROTATION_SCALE
  const rotation = (degrees * Math.PI) / 180
  context.rotate(rotation)
  context.translate(degrees * 2, degrees * 2)
  context.drawImage(inMemoryCanvas, 0, 0)

  // Add border
  context.lineWidth = 1
  context.strokeStyle = '#e2e2e2'
  context.strokeRect(1, 1, width - 2, height - 2)
}

// TODO: remove
loadPdf()
