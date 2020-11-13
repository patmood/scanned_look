var url =
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf'

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf']
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js'

async function init() {
  // Loads the actual pdf
  const pdf = await pdfjsLib.getDocument(url).promise

  // Opens page 1?
  const page = await pdf.getPage(1)

  // Creates or gets a viewport?
  const viewport = page.getViewport({ scale: 1 })

  const canvas = document.getElementById('pdf-canvas')
  const context = canvas.getContext('2d')
  canvas.height = viewport.height
  canvas.width = viewport.width

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  }
  await page.render(renderContext).promise
}

init()
