$(function(){
	$("button").click(function(evt){
	  var target = $(evt.target).data("target");
	  if(target) {
		  show(target);
	  }
	})

	function show(sectionid){
	  $("section").hide();
		$("#"+sectionid).show();

	}

	show("mainmenu")  
});
