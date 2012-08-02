function check_votes() {
  return 0;
}

function vote(title) {

  $.ajax({
    url: '/vote/project/' + title,
    type: 'PUT',
    success: function(result) {
      console.log(JSON.stringify(result));
      var n = $('.badge.no-voter').text();
      n = Number(n);
      n++;
      $('.badge.no-voter').removeClass('no-voter').addClass('badge-success').text(n);
    }
  });

}

$(document).ready(function() {

  check_votes();

  $('.badge.no-voter').click(function() {
    vote($('#langstore').val());
  });

});
