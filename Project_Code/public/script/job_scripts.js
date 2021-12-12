$(document).ready(function(){
    // Start here: Search Service area via jQuery
  window.filter = function(element)
  {
    var value = $(element).val();
    console.log(value);
    $(".tilesWrap > li").each(function() 
    {
      if ($(this).text().search(value) > -1){
        $(this).show();
      }
      else {
        $(this).hide();
      }
    });
  }
});