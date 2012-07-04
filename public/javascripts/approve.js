function populate() {
  $.ajax({
    type: "GET",
    url: "/approval"
  }).done(function(langs) {
    $("#approval").append(JSON.stringify(langs));
  });
}

$(document).ready(function() {

  console.log("here we are");
  populate();
  

});
