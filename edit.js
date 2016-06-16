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
	
	var FileData = fs.readFileSync(""+sSong+"_lyrics.json").toString(); //Read the File put it in a string
	var Data = JSON.parse(FileData); //Take the string and read the file into a big javascript array
	
	loadBeats(sSong)
	
	viewModel = new LyricModel(MovesData, Data);
	ko.applyBindings(viewModel);
	
	ePlayer.play();
}

function loadBeats(sSong){
	var BeatsFileData = fs.readFileSync("beats/"+sSong+".json").toString(); //Read the File put it in a string
	var BeatsData = JSON.parse(BeatsFileData); //Take the string and read the file into a big javascript array
	var Features = JSON.parse(BeatsData.features);
	
	Beats = Features.timeline.beat.map(function(Beat){
		return Beat;
	});
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

var LyricModel = function(Moves, lines) {
    var self = this;
    self.moves = ko.observableArray(Moves);
    self.lines = ko.observableArray(lines);
 
	self.availableMoves = ko.observableArray(["up", "down", "forward", "backward",""]);
 
    self.addLyric = function() {
		var iTime = Math.round(ePlayer.currentTime * 1000);
		
		do {
			iCurrentBeat ++;
			iBeatTime = Math.round(Beats[iCurrentBeat].time * 1000);
		} while (iBeatTime < iTime)
		
		iCurrentBeat --;
		iBeatTime = Math.round(Beats[iCurrentBeat].time * 1000);
        
        self.lines.push({
            lyric: aLyrics[iLine],
            beat: iCurrentBeat
        });			
		iLine++;
		showNextLine();
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
