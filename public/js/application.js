$(document).ready( function(){

  $('#select').click(function(){
    $('#uploader input').click();
  })

  $('#uploader input').change(function() {
    $('#uploader').submit();
  })

})
