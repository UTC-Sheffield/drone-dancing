//Tech group UTC sheffield
//Version


var autonomy = require('ardrone-autonomy');
var mission  = autonomy.createMission();
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
console.log("BeatsData =", BeatsData);

process.exit();

DanceData = DanceData.slice(0, 3);
DanceData.push({ move: 'land', param: null, beats: 1 });


console.log("DanceData =", DanceData.length);

var currentBeat = 0 ;

//When a step completes whilst we a flying so we can spot the steps that don't complete
function onStepComplete(stepid, move, params, beats){
  console,log("Step",stepid,"complete", move, params, beats);
}


var Moves = DanceData.map(function(step, i){
	var thisBeat = BeatsData.features.timeline.beat[currentBeat]
	//{"strength": 0.078141179248255532, "time": 110.95700836}
	
	console.log(step);
	if(step.move == "takeoff" || step.move == "land"|| step.move == "zero") {
		 var NextStep = oController[move].bind(oController, onStepComplete.bind(undefined, stepid, move, params, beats));
	}else{
		 var NextStep = oController[move].bind(oController, param, onStepComplete.bind(undefined, stepid, move, params, beats));
	}
	
	return {
        delay: 500,
        task: NextStep
      };
});



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

