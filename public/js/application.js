function fileSelected() {
  var file = document.getElementById('myfile').files[0];
  if (file.size > 1024 * 1024 * 10) {
    alert("10MB maximum file size");
    return false;
  }

  if (file) {
    var fileSize = 0;
    if (file.size > 1024 * 1024)
      fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
    else
      fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
  }

  if (file.type.match(/image\//g) || file.type.match(/application\/pdf/g)) {
    var oldDownload = document.getElementById('downloadBox');
    if (oldDownload) oldDownload.parentNode.removeChild(oldDownload);
    uploadFile();
  } else {
    alert("Must be PDF or Image");
  }
}

function uploadFile() {
  var xhr = new XMLHttpRequest();
  var fd = new FormData();

  document.getElementById('progress').style.display = 'block';

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
    document.getElementById('bar').style.width = percentComplete.toString() + '%';
    document.getElementById('progessNumber').innerHTML = percentComplete.toString() + '%';
    if (percentComplete >= 100) document.getElementById('processing').style.display = 'block';
  }
}

function uploadComplete(e) {
  var downloadBox = document.createElement('div');
  downloadBox.className = 'success';
  downloadBox.id = 'downloadBox'
  downloadBox.innerHTML = e.target.responseText;
  document.getElementById('scanner').appendChild(downloadBox);
  document.getElementById('processing').style.display = 'none';
  document.getElementById('progress').style.display = 'none';
}

function uploadFailed(e) {
  document.getElementById('processing').style.display = 'none';
  alert("There was an error attempting to upload the file");
}

function uploadCanceled(e) {
  document.getElementById('processing').style.display = 'none';
  alert("The upload has been canceled by the user or the browser dropped the connection");
}

