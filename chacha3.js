//Tech group UTC sheffield
//Version

var ardrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');

var client  = ardrone.createClient({});
var oController = new autonomy.Controller(client, {});

var temporal = require('temporal');

/*
 * EPS_LIN      = 0.1; // We are ok with 10 cm horizontal precision
EPS_ALT      = 0.1; // We are ok with 10 cm altitude precision
EPS_ANG      = 0.1; // We are ok with 0.1 rad precision (5 deg)
STABLE_DELAY = 50; // Time in ms to wait before declaring the drone on target
*/

var fs = require('fs'); //Get the node library that can do File System stuff

var FileData = fs.readFileSync("chacha2.json").toString(); //Read the File put it in a string

var DanceData =   JSON.parse(FileData); //Take the string and read the file into a big javascript array

var BeatsFileData = fs.readFileSync("beats/ccs.json").toString(); //Read the File put it in a string

var BeatsData =   JSON.parse(BeatsFileData); //Take the string and read the file into a big javascript array
var Features = JSON.parse(BeatsData.features);
//console.log("BeatsData =", JSON.parse(BeatsData.features));

//process.exit();

DanceData = DanceData.slice(0, 2);

//console.log("DanceData =", DanceData.length);

var currentBeat = 0 ;

//When a step completes whilst we a flying so we can spot the steps that don't complete
function onStepComplete(stepid, move, params, beats){
  console.log("Step",stepid,"complete", move, params, beats);
}

var Delay = 2000; 

var Moves = DanceData.map(function(step, stepid){
	var thisBeat = Features.timeline.beat[currentBeat];
	var time = Math.round(thisBeat.time*1000) + Delay;
	//console.log(thisBeat, time) 
	
	
	console.log(step);
	if(step.move == "takeoff" || step.move == "land"|| step.move == "zero") {
		 var NextStep = oController[step.move].bind(oController, onStepComplete.bind(undefined, stepid, step.move, step.param, step.beats));
	}else{
		 var NextStep = oController[step.move].bind(oController, step.param, onStepComplete.bind(undefined, stepid, step.move, step.param, step.beats));
	}
	
	currentBeat += step.beats; 
	return {
        delay: time,
        task: NextStep
      };
});

// TODO : need to kill uncompleted tasks from queue so "end" fires.

client.takeoff(function(){
	
	//play the music , maybe wait for it to recongnise that.
	temporal.queue(Moves);
});


temporal.on("end", function() {
  client.land(); 
});
