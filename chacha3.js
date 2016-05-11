//Tech group UTC sheffield
//Version


var autonomy = require('ardrone-autonomy');
var mission  = autonomy.createMission();



var fs = require('fs'); //Get the node library that can do File System stuff

var FileData = fs.readFileSync("chacha2.json").toString(); //Read the File put it in a string

var DanceData =   JSON.parse(FileData); //Take the string and read the file into a big javascript array


DanceData = DanceData.slice(0, 3);
DanceData.push({ move: 'land', param: null, beats: 1 });


console.log("DanceData =", DanceData.length);


for(var i=0; i< DanceData.length; i++){
	var step = DanceData[i];
	console.log(step);
	if(step.move == "takeoff" || step.move == "land"|| step.move == "zero") {
		mission[step.move]();
	}else{
		mission[step.move](step.param);
	}
	
};




mission.run(function (err, result) {
    if (err) {
        console.trace("Oops, something bad happened: %s", err.message);
        mission.client().stop();
        mission.client().land();
    } else {
        console.log("Mission success!");
        process.exit(0);
    }
});

