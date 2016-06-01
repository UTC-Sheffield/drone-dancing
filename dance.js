//Tech group UTC sheffield
//Version

var ardrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');
var client  = ardrone.createClient({});
var temporal = require('temporal');


/* Adds a dummy distance and a callback to fit all the other moves
 * Sets the goal to the current state and attempt to hover on top.
 */
autonomy.Controller.prototype.hover = function(dist, callback) {
    this._go({x: this._state.x, y: this._state.y, z: this._state.z, yaw: this._state.yaw}, callback);
}

// Adds extra command that I hope returns us to our 0 point but it doesn't seem to work
autonomy.Controller.prototype.return = function(dist, callback) {
    this._go({x: 0, y: 0, z: 1, yaw: 0}, callback);
}

//Our version of Controller which executes the callback of a move as it is replaced
autonomy.Controller.prototype._go = function(goal, callback) {
    // Since we are going to modify goal settings, we
    // disable the controller, just in case.
    this.disable();

    //Call the previous call back (which will get the this._goal.reached) if bound correctly 
    if (this._callback != null) {
		//setTimeout(this._callback, 10);
		this._callback.call();
		this._callback = null;
	}

    // If no goal given, assume an empty goal
    goal = goal || {};

    // Normalize the yaw, to make sure we don't spin 360deg for
    // nothing :-)
    if (goal.yaw != undefined) {
        var yaw = goal.yaw;
        goal.yaw = Math.atan2(Math.sin(yaw),Math.cos(yaw));
    }

    // Make sure we don't attempt to go too low
    if (goal.z != undefined) {
        goal.z = Math.max(goal.z, 0.5);
    }

    // Update our goal
    this._goal = goal;
    this._goal.reached = false;
	//console.log("Setting goal", this._goal);
    // Keep track of the callback to trigger when we reach the goal
    this._callback = callback;

    // (Re)-Enable the controller
    this.enable();
}

var oController = new autonomy.Controller(client, {});

temporal.on("idle", function() {
	console.log("Temporal is idle : Landing");
	client.land(function(){
		process.exit();
	});
});

temporal.on("end", function() {
	console.log("Temporal end"); 
	 
});

process.on("exit", function() {
	client.land(function(){
	  process.exit();
	});
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
  console.log("Step",stepid, "Complete", this._goal.reached, move, params, beats);
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
        delay: BeatDelay,
        task: NextStep
        };
});

console.log("Song Beats", Beats.length);
console.log("next beat",currentBeat);

client.takeoff(function(){	
	//play the music , maybe wait for it to recongnise that.
	temporal.queue(Moves);
});
