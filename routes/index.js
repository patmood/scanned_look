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
    console.log(files)

    var file = files.scanMe.path
      , filename = path.basename(file)
      , mimetype = mime.lookup(file)
      , result = file + '_scan.pdf'

    exec('convert ' 
      + file 
      + ' -mattecolor gray99 -frame 1x1+1 -colorspace gray \\( +clone -blur 0x1 \\) +swap -compose divide -resize 800 -composite -contrast-stretch 5%,0% -rotate '
      + (Math.random() - 0.5)
      + ' ' 
      + result
    , function(err, stout, sterr){
      res.setHeader('Content-disposition', 'attachment; filename=' + filename)
      res.setHeader('Content-type', mimetype)
      fs.createReadStream(result).pipe(res)    
    })
  })
}

