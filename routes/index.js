var fs = require('fs')
  , path = require('path')
  , mime = require('mime')

exports.index = function(req, res){
  res.render('index', { title: 'Scanned Look' })
}

exports.upload = function(req, res){
  console.log(req.files)

  var file = req.files.scanMe.path
    , filename = path.basename(file)
    , mimetype = mime.lookup(file)
    , filestream = fs.createReadStream(file)

  res.setHeader('Content-disposition', 'attachment; filename=' + filename)
  res.setHeader('Content-type', mimetype)

  filestream.pipe(res)
}

// Be careful allowing uploads
// https://groups.google.com/forum/#!msg/express-js/iP2VyhkypHo/5AXQiYN3RPcJ
