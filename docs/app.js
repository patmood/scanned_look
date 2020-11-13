const SAMPLE_PDF_PATH = './sample.pdf'
const CONTRAST_SCALE = 10
const ROTATION_SCALE = 0.8
const NOISE_FACTOR = 200
const NOISE_RADIUS = 1

// Loaded via <script> tag, create shortcut to access PDF.js exports.
const pdfjsLib = window['pdfjs-dist/build/pdf']
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js'

function handleFileChange(file) {
  const reader = new FileReader()
  reader.onload = (evt) => {
    const typedarray = new Uint8Array(evt.target.result)
    scanner.init(typedarray)
  }
  reader.readAsArrayBuffer(file)
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

class Scanner {
  constructor() {
    this.canvas = window.pdfCanvas
    this.scanButton = window.scanButton
    this.scannedPages = []
  }

  async init(urlOrTypedarray) {
    this.pdf = await pdfjsLib.getDocument(urlOrTypedarray).promise
    this.renderPage(1)
    this.scanButton.disabled = false
  }

  async renderPage(pageNum) {
    const page = await this.pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 0.9 })

    const context = this.canvas.getContext('2d')
    this.canvas.height = viewport.height
    this.canvas.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }
    await page.render(renderContext).promise
  }

  async scanAll() {
    let delayTimeout = 500
    for (let pageNum = 1; pageNum <= this.pdf.numPages; pageNum++) {
      this.scannedPages = []
      await this.renderPage(pageNum)
      this.scannedPages.push(this.scanPage())
      await delay(delayTimeout)
      // Speed up as the pages go on
      delayTimeout = Math.max(delayTimeout - 100, 100)
    }
  }

  scanPage() {
    const { height, width } = this.canvas
    const context = this.canvas.getContext('2d')
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

    // Add noise
    inMemoryContext.fillStyle = '#eee'
    for (let i = 0; i < NOISE_FACTOR; i++) {
      inMemoryContext.beginPath()
      inMemoryContext.arc(
        Math.random() * width,
        Math.random() * height,
        NOISE_RADIUS,
        0,
        2 * Math.PI,
        true
      )
      inMemoryContext.fill()
    }

    // Clear canvas (without this pages will stack)
    context.clearRect(0, 0, width, height)

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

    // Reset rotation and translation
    context.rotate(-rotation)
    context.translate(-degrees * 2, -degrees * 2)

    const scannedImageData = context.getImageData(0, 0, width - 1, height - 1)
    return scannedImageData
  }
}

let scanner = new Scanner()

// TODO: remove
async function start() {
  await scanner.init(SAMPLE_PDF_PATH)
}
start()
