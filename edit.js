var fs = require('fs'); //Get the node library that can do File System stuff
var ePlayer = document.getElementById("audioplayer");

var iLine = 0;
var aLyrics =[];
var eNextLine = document.getElementById("nextline");
var Beats = [];
var iCurrentBeat = 0 ;

var viewModel = {};

function showNextLine(){
	eNextLine.innerHTML = aLyrics[iLine];
}

function Start(){
	var sSong = document.getElementById("song").value; //ccs /test
	var MovesFileData = fs.readFileSync("dances/"+sSong+".json").toString(); //Read the File put it in a string
	var MovesData = JSON.parse(MovesFileData); //Take the string and read the file into a big javascript array
	
	var iBeat = iStep =0;
	var Steps = MovesData.map(function(move) { 
		move.step = iStep;
		move.beat = iBeat;
		iBeat += move.beats;
		iStep ++;
		return move; 
	});
	
	var FileData = fs.readFileSync(""+sSong+"_lyrics.json").toString(); //Read the File put it in a string
	var LyricData = JSON.parse(FileData); //Take the string and read the file into a big javascript array
	
	var BeatsFileData = fs.readFileSync("beats/"+sSong+".json").toString(); //Read the File put it in a string
	var BeatsData = JSON.parse(BeatsFileData); //Take the string and read the file into a big javascript array
	var Features = JSON.parse(BeatsData.features);
	LyricData.reverse();
	 
	Beats = Features.timeline.beat.map(function(Beat, iBeat){
		var PossibleLyrics = LyricData.filter(function(oLyric){
			return oLyric.beat <= iBeat;
		});
		
		//console.log("Beat",Beat, "iBeat", iBeat, "PossibleLyrics[0]", PossibleLyrics[0]);
		Beat.beat = iBeat;
		Beat.lyric = PossibleLyrics[0].lyric;
		Beat.lyricbeat = PossibleLyrics[0].beat;
		return Beat;
	});
	
	//console.log(Beats);
	
	viewModel = new StepsModel(Steps, Beats);
	ko.applyBindings(viewModel);
	
	//ePlayer.play();
}

function loadBeats(sSong){
	return Beats;
}

function Pause(){
	ePlayer.pause();
}

function Stop(){
	ePlayer.pause();
	ePlayer.currentTime = 0;
}

var iBeatTime = 0;

var StepsModel = function(Steps, LyricBeats) {
    var self = this;
    self.moves = ko.observableArray(Steps);
    
    self.moveslyrics = self.moves.map(function(move) { 
		console.log(move);
		move.time = LyricBeats[move.beat].time;
		move.lyric = LyricBeats[move.beat].lyric;
		move.lyricbeat = LyricBeats[move.beat].lyricbeat;
		
		return move; 
	});
	
	
    self.availableMoves = ko.observableArray([
		"up", 
		"down", 
		"forward", 
		"backward",
		"left",
		"right",
		"hover",
		"cw",
		"ccw",
		"altitude",
		"go",
		"move"]);
 
    self.addMove = function() {
	};
	
    self.playFrom = function(Lyric) {
		var iNewTime = Beats[Lyric.beat].time;
		//console.log(iNewTime);
		ePlayer.currentTime = iNewTime;
        ePlayer.play();
        setTimeout(function(){ePlayer.pause();}, 4000);
    };
 
	
    self.save = function(form) {
		var sSong = document.getElementById("song").value; //ccs /test
	
        fs.writeFileSync(sSong+"_lyrics.json", ko.utils.stringifyJson(self.lines, null, 2));
        // To actually transmit to server as a regular form post, write this: ko.utils.postJson($("form")[0], self.lines);
    };
};
