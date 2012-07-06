function populate() {
  $.ajax({
    url: '/projects/list',
    type: 'PUT',
    success: function(data) {
      var str = "";
      str += "<ul>";
      for(var i = 0; i < data.length; i++) {
        str += "<li>" + data[i].title + " [" + data[i].votes + "] <button onClick=\"javascript:vote(\'" + data[i].title + "\');return false;\">Vote</button></li>";
      }
      str += "</ul>";
      $('#projects').html(str);
    }
  });
}

function vote(title) {
  $.ajax({
    url: '/vote/project/' + title,
    type: 'PUT',
    success: function(data) {
      console.log(data);
      if(data.notice) {
        $('div#alert').addClass('alert alert-notice flash').text(data.notice);        
      } else {
        populate();
      }
    }
  });
}

$(document).ready(function() {

  populate();

});
