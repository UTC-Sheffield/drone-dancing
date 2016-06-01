//Tech group UTC sheffield
//Version

var ardrone = require('ar-drone');
var client  = ardrone.createClient({});

//var oController = new autonomy.Controller(client, {});
	client.land(function(){
	  process.exit();
	});

