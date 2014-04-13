var fs = require('fs')
  , formidable = require('formidable')
  , path = require('path')
  , mime = require('mime')
  , exec = require('child_process').exec

exports.index = function(req, res){
  res.render('index', { title: 'Scanned Look' })
}

exports.upload = function(req, res){
  var form = new formidable.IncomingForm()
  form.parse(req, function(err, fields, files) {
    if (err) throw err
    
    var file = files.scanMe
      , filename = files.scanMe.name.replace(/\.\w+$/i, '')
      , mimetype = files.scanMe.type 

    console.log('File Path:', file.path)
    console.log('File Type:', mimetype)

    if (!mimetype === 'application/pdf') {
      console.log('MUST BE PDF!')
      return
    }

    // Callback Hell
    numPages(file, function(pageCount) {
      var scannedPages = []

      !function loop(i) {
        if (i < pageCount) {
          scan(file, i, function(result) {
            scannedPages.push(result)
            loop(++i)
          })
        } else {
          console.log(scannedPages)
          res.send('woo')
        }
      }(0)

//      res.setHeader('Content-disposition', 'attachment; filename=' + path.basename(result))
//      res.setHeader('Content-type', 'application/pdf')
//      fs.createReadStream(file.path).pipe(res)    
    })
  })
}

var numPages = function(file, next){
  exec('pdftk ' + file.path + ' dump_data | grep NumberOfPages | sed "s/[^0-9]*//"'
  , function(err, stdout, stderr){
    if (err) throw err
    if (stderr) console.log("Error counting pages:", stderr)
    console.log("Number of Pages:", stdout)
    if (next) next(stdout)
    return stdout
  })
}

var scan = function(file, i, next){
  var result = file.name.replace(/\.\w+$/i, '') + '_' + i + '_scan.pdf'
  console.log('RESULT:',result)
  exec('convert ' 
    + file.path + '[' + i + ']'
    + ' -mattecolor gray99 -frame 1x1+1 -colorspace gray '
    + '\\( +clone -blur 0x1 \\) +swap -compose divide '
    + '-resize 800 -composite -contrast-stretch 5%,0% -rotate '
    + (Math.random() - 0.5)
    + ' ' 
    + result
  , function(err, stout, sterr){
    if (err) throw err
    if (next) next(result)
    return result
  })
}
