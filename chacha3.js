//Lauren Hopkins
//Version

/*
var autonomy = require('ardrone-autonomy');
var mission  = autonomy.createMission();
*/


var fs = require('fs'); //Get the node library that can do File System stuff

var FileData = fs.readFileSync("chacha2.json").toString(); //Read the File put it in a string

var DanceData =   JSON.parse(FileData); //Take the string and read the file into a big javascript array

console.log("DanceData =", DanceData);


/*
mission.run(function (err, result) {
    if (err) {
        console.trace("Oops, something bad happened: %s", err.message);
        mission.client().stop();
        mission.client().land();
    } else {
        console.log(2Mission success!");
        process.exit(0);
    }
});
*/
