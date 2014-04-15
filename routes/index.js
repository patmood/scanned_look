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
      , filename = files.scanMe.name.replace(/\.\w+$/i, '') + '_scan.pdf'
      , mimetype = files.scanMe.type 

    console.log('File Path:', file.path)
    console.log('File Type:', mimetype)

    if (!mimetype === 'application/pdf') {
      console.log('MUST BE PDF!')
      return
    }

    var scannedPages = []
      , maxPages = 50

    // Self invoking recursion FTW
    !function loop(i) {
      if (i < maxPages) {
        scan(file, i, function(result) {
          if(result === 'done') {
            console.log(scannedPages)
            i = maxPages
            var cmd = 'gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite '
            + '-sOutputFile=./tmp/'
            + filename
            + ' '
            + scannedPages.join(' ')
            
            console.log(cmd)

            exec(cmd
            , function(){
              res.setHeader('Content-disposition'
              , 'attachment; filename=' + path.basename(filename))
              res.setHeader('Content-type', 'application/pdf')
              fs.createReadStream('./tmp/' + filename).pipe(res)   
            })

            return

          } else {
            scannedPages.push(result)
            loop(++i)
          }
        })
      }
    }(0)
  })
}

// NOT USED - This doesnt work for all PDF types :(
var numPages = function(file, next){
  exec('strings ' + file.path + ' | grep Count | grep -o "[0-9]\\+"'
  , function(err, stdout, stderr){
    if (err) throw err 
    if (stderr) console.log("Error counting pages:", stderr)
    console.log("Number of Pages:", stdout)
    if (next) next(stdout)
    return stdout
  })
}

var scan = function(file, i, next){
  var result = './tmp/' 
  + file.name.replace(/\.\w+$/i, '') 
  + '_scan' + '_part' + i + '.pdf' 

  exec('convert ' 
    + file.path + '[' + i + ']'
    + ' -mattecolor gray99 -frame 1x1+1 -colorspace gray '
    + '\\( +clone -blur 0x1 \\) +swap -compose divide '
    + '-resize 800 -composite -contrast-stretch 5%,0% -rotate '
    + (Math.random() - 0.5)
    + ' ' 
    + result
  , function(err, stout, sterr){
    console.log(result)

    // When an error is raised, it means we're done converting
    // Not very tidy but avoids dependencies to count the number of pages
    if (err) next('done')
    if (next) next(result)
    return result
  })
}
