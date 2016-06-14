#! /usr/bin/env node

//Tech group UTC sheffield
//Version

var ardrone = require('ar-drone');
var autonomy = require('ardrone-autonomy-withsim');
var client  = ardrone.createClient({});
var temporal = require('temporal');

var iSpeedUp = 10;
var iWarningDistance = 0;


// TODO : make zero work
// TODO : work out absolute position if everything worked so we can visualise the choerography 
// TODO : measure the bounding box of the dance if eveything goes well
// TODO : Beable to use named sequences of moves in the choreography )choruses etc)
// TODO : Command line or nwjs


// TODO : move these to an overloaded file
/* Adds a dummy distance and a callback to fit all the other moves
 * Sets the goal to the current state and attempt to hover on top.
 * conditionally add the code for simulation
 * Add move() which is  a relative go()
 * Conditionally make the relative moves relative to the goal not the current state()
 */

var CtrlOptions = {
		"alwayscallback":true,
		"simulation":true,
		"relativetogoal":true,
	};
var oController = new autonomy.Controller(client, CtrlOptions);


temporal.on("idle", function() {
	console.log("Temporal is idle : Landing");
	// TODO : save aLog
		process.exit();
});

temporal.on("end", function() {
	console.log("Temporal end"); 
	 
});

process.on("exit", function() {
	/*client.land(function(){
	  process.exit();
	});*/
});


oController.EPS_LIN      = 0.2; // We are ok with 10 cm horizontal precision
oController.EPS_ALT      = 0.2; // We are ok with 10 cm altitude precision
oController.EPS_ANG      = 0.2; // We are ok with 0.1 rad precision (5 deg)
oController.STABLE_DELAY = 30; // Time in ms to wait before declaring the drone on target


var fs = require('fs'); //Get the node library that can do File System stuff

var FileData = fs.readFileSync("dances/ccs.json").toString(); //Read the File put it in a string
//var FileData = fs.readFileSync("dances/test.json").toString(); //Read the File put it in a string

var BeatsFileData = fs.readFileSync("beats/ccs.json").toString(); //Read the File put it in a string


var DanceData = JSON.parse(FileData); //Take the string and read the file into a big javascript array
var BeatsData = JSON.parse(BeatsFileData); //Take the string and read the file into a big javascript array
var Features = JSON.parse(BeatsData.features);
console.log("DanceData", DanceData.length);

/*DanceData = DanceData.map(function(step, stepid){
	if (step.move == "down" || step.move =="up" || step.move =="forward" || step.move == "backward"){
		if(step.param != null && typeof step.param != "object"){ 
			step.param = step.param / 2;
		} 
	}
	return step;
});*/

//When a logs when a step ends so we can spot the steps that don't complete
function onStepEnd(stepid, move, params, beats){
  //aLog.push({"stepid":stepid, move:move, params:params, beats:beats, "goal":this._goal});
  if(this._goal.x <= -iWarningDistance || this._goal.x >= iWarningDistance 
    || this._goal.y <= -iWarningDistance || this._goal.y >= iWarningDistance
	|| this._goal.z <= -iWarningDistance || this._goal.z >= iWarningDistance){
	//console.log("Step",stepid, move, "params",params, "beats",beats, "goal", this._goal);
	console.log("Step",stepid, 
	 "x", Math.round(this._goal.x *10) /10,
	"y", Math.round(this._goal.y *10) /10,
	"z", Math.round(this._goal.z *10) /10,
	"yaw", this._goal.yaw?Math.round(this._goal.yaw.toDeg()):0,
	"move", move, "params",params, "beats",beats);
  }
}

var Beats = Features.timeline.beat.map(function(Beat){
	return Beat;
});

var currentBeat = 0;
var LastBeatTime = 0;
var Moves = DanceData.map(function(step, stepid){
	//What is the next beat
	var thisBeat = Features.timeline.beat[currentBeat];
	//What tine is it and how long since the last beat we used in milliseconds
	var time = Math.round(thisBeat.time*1000);
	var BeatDelay = time - LastBeatTime;
	LastBeatTime = time;
	
	var thisBeat = Beats[currentBeat];
	
	//The next step is a oController function with the same name as the move set to run with a  function that calls onStepEnd with the info of this step
	var NextStep = oController[step.move].bind(oController, step.param, onStepEnd.bind(oController, stepid, step.move, step.param, step.beats));
	//console.log(BeatDelay, step);
	
	//How many beats should this move take
	currentBeat += step.beats; 
	
	//Each step starts at a fixed time from the start of the last move 
	return {
        delay: Math.round(BeatDelay / iSpeedUp),
        task: NextStep
        };
});

console.log("Song Beats", Beats.length);
console.log("next beat",currentBeat);

//client.takeoff(function(){	
	//play the music , maybe wait for it to recongnise that.
	temporal.queue(Moves);
//});
