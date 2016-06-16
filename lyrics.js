var fs = require('fs'); //Get the node library that can do File System stuff
var ePlayer = document.getElementById("audioplayer");

//.currentTime

var iLine = 0;
var aLyrics =[];
var eNextLine = document.getElementById("nextline");
var Beats = [];
var iCurrentBeat = 0 ;

var viewModel = {};

function showNextLine(){
	eNextLine.innerHTML = aLyrics[iLine];
}

function Load(){
	var sSong = document.getElementById("song").value; //ccs /test
	var FileData = fs.readFileSync(""+sSong+"_lyrics.json").toString(); //Read the File put it in a string
	var Data = JSON.parse(FileData); //Take the string and read the file into a big javascript array
	
	loadBeats(sSong)
	
	viewModel = new LyricModel(Data);
	ko.applyBindings(viewModel);
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
function Start(){
	viewModel = new LyricModel([]);
	ko.applyBindings(viewModel);

	var sSong = document.getElementById("song").value; //ccs /test
	
	var LyricText = fs.readFileSync("./"+sSong+"_lyrics.txt").toString(); //Read the File put it in a string
	aLyrics = LyricText.split(/\n|,/).map(function(sLine){ 
			return sLine.trim();
		}).filter(function(sLine){
			return sLine.length;
		});
	//console.log(aLyrics);
	showNextLine();
	ePlayer.play();
}

function Pause(){
	ePlayer.pause();
}

function Stop(){
	ePlayer.pause();
	ePlayer.currentTime = 0;
}

var iBeatTime = 0;

var LyricModel = function(lines) {
    var self = this;
    self.lines = ko.observableArray(lines);
 
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
