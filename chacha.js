var autonomy = require('ardrone-autonomy');
var mission  = autonomy.createMission();

mission.takeoff()
       .zero()
       .altitude(1)
       .left(1)
       .right(1)
       .backward(1)
       .up(1)
       .down(1)
       .go({x:-0.5,y:0,z:-0.5})
       .go({x:0.5,y:0,z:0.5})
       .go({x:0.5,y:0,z:0.5})
       .go({x:-0.5,y:0,z:-0.5})
       .land(); 
      
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