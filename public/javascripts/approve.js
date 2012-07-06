function populate() {
  $.ajax({
    type: "GET",
    url: "/approval"
  }).done(function(langs) {
    var str = '<table width="100%" border="0" cellpadding="5"><tr>';
    str += '<td>Title</td><td>Description</td><td>Owner</td><td>Type</td><td></td><td></td></tr>';
    for(var i=0;i < langs.length; i++) {
      str += '<tr class=' + langs[i].title + '><td>' + langs[i].title + '</td><td>' + langs[i].desc + '</td><td>' + langs[0].owner + '</td><td>' + langs[0].type + '</td><td><button class="btn btn-success" onClick="javascript:approve(\'' + langs[i].title + '\');return false;" data-query="' + langs[i].title + '">Approve</button></td><td><button class="btn btn-danger" onClick="javascript:disapprove(\'' + langs[i].title + '\');return false;">Delete</button></tr>';
    }
    str += '</table>';
    $("#approval").html(str);
  });
}

function approve(title) {
  $.ajax({
    type: "PUT",
    url: "/approve/" + title,
    complete: function(result) {
      populate();
    }
  });
}

function disapprove(title) {
  $.ajax({
    type: "DELETE",
    url: "/approve/" + title,
    complete: function(result) {
      populate();
    }
  });
}

$(document).ready(function() {

  populate();

});
