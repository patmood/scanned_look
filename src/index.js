var url =
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf'

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
  const pdf = await pdfjsLib.getDocument(typedarray).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 1 })
  console.log({ page, viewport })

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

  // To grayscale the colors of an image with HTML5 Canvas, we can iterate over all of the pixels in the image, calculate the brightness of each, and then set the red, green, and blue components equal to the brightness.
  for (var i = 0; i < data.length; i += 4) {
    var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]
    // red
    data[i] = brightness
    // green
    data[i + 1] = brightness
    // blue
    data[i + 2] = brightness
  }

  // Add border
  // context.globalCompositeOperation = 'source-over'
  context.lineWidth = 1
  context.strokeStyle = '#e2e2e2'
  context.strokeRect(1, 1, width - 2, height - 2)

  // Clockwise angle in radians
  context.rotate(Math.random * 300 - 100)

  // overwrite original image
  context.putImageData(imageData, 0, 0)
}
