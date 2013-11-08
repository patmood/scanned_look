$(document).ready( function(){

  $('#select').click(function(){
    $('#uploader input').click();
  })

  $('#uploader input').change(function() {
    $('.processing').show();
    $('#uploader').submit();
  })

})
