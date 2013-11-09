function fileSelected() {
  var file = document.getElementById('myfile').files[0];
  if (file) {
    var fileSize = 0;
    if (file.size > 1024 * 1024)
      fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
    else
      fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

    document.getElementById('fileName').innerHTML = 'Name:' + file.name;
    document.getElementById('fileSize').innerHTML = 'Size:' + fileSize;
    document.getElementById('fileType').innerHTML = 'Type:' + file.type;
  }
}

function uploadFile() {
  var xhr = new XMLHttpRequest();
  var fd = new FormData();

  fd.append("myfile", document.getElementById('myfile').files[0]);

  xhr.upload.addEventListener("progress", uploadProgress, false);
  xhr.addEventListener("load", uploadComplete, false);
  xhr.addEventListener("error", uploadFailed, false);
  xhr.addEventListener("abort", uploadCanceled, false);

  xhr.open("POST", "/upload");
  xhr.send(fd);
}

function uploadProgress(e) {
  if (e.lengthComputable) {
    var percentComplete = Math.round(e.loaded * 100 / e.total);
    document.getElementById('progessNumber').innerHTML = percentComplete.toString() + '%';
  }
  else {
    document.getElementById('progressNumber').innerHTML = 'unable to compute';
  }
}

function uploadComplete(e) {
  alert(e.target.responseText);
}

function uploadFailed(e) {
  alert("There was an error attempting to upload the file");
}

function uploadCanceled(e) {
  alert("The upload has been canceled by the user or the browser dropped the connection");
}

