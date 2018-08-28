jQuery(function($) {
    $('.pointNow').click(function() {
      $('.pointNow').not(this).removeClass('active').html(function() {
        return $(this).html();
      });
      $(this).addClass('active').html();
    });
  });

$('.pointToStar').click(function(){
  $('.fa-star').toggleClass('checked');
});