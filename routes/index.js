var fs = require('fs')
  , formidable = require('formidable')
  , path = require('path')
  , mime = require('mime')

exports.index = function(req, res){
  res.render('index', { title: 'Scanned Look' })
}

exports.upload = function(req, res){
  var form = new formidable.IncomingForm()

  form.parse(req, function(err, fields, files) {
    if (err) throw err
    console.log(files)

    var file = files.scanMe.path
      , filename = path.basename(file)
      , mimetype = mime.lookup(file)
      , filestream = fs.createReadStream(file)

    res.setHeader('Content-disposition', 'attachment; filename=' + filename)
    res.setHeader('Content-type', mimetype)

    filestream.pipe(res)    

  })
}

