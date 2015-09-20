document.getElementById("saveButton").onclick = registerPlayer;

var myname, mycolor, myposition, charList, game_context;
var bestname, bestcolor, bestposition, bestxloc, bestyloc;
var fbleader = new Firebase("https://vivid-heat-4757.firebaseio.com/");

function registerPlayer() {
    myname = document.getElementById("nameInput").value;

    var r = Math.floor((Math.random() * 255) + 1);
    var g = Math.floor((Math.random() * 255) + 1);
    var b = Math.floor((Math.random() * 255) + 1);
    var a = 0.2;
    mycolor = "rgba".concat("(", r, ", ", g, ", ", b, ", ", a, ")");

    myposition = 0;

    document.getElementById("nameInput").disabled = true;
    document.getElementById("saveButton").disabled = true;

    document.getElementById("status").innerHTML = "Game has started! Type type type!!!";

    boardInit();
}

function boardInit() {   
    fbleader.once("value", function(snapshot){
        var val =  snapshot.val();

        bestname = val.bestname;
        bestcolor = val.bestcolor;
        bestposition = val.bestposition;
        bestxloc = val.bestxloc;
        bestyloc = val.bestyloc;

        charList = val.text000.substring(0, 320);

        game_context = document.getElementById("game_canvas").getContext("2d");
        game_grid_generate();
        game_grid_fill_text();
    });

}

function game_grid_generate() {        
    for(var x = 0.5; x <= 801; x += 25) {
        game_context.moveTo(x, 0);
        game_context.lineTo(x, 500);
    }
    for(var y = 0.5; y <= 501; y += 25) {
        game_context.moveTo(0, y);
        game_context.lineTo(800, y);
    }
    game_context.strokeStyle = "#D4D4D4";
    game_context.stroke();
}

function game_grid_fill_text() {
    game_context.font = "16px Monospace";
    game_context.textAlign = "center";
    var index = 0;
    for(var y = 18; y < 501; y += 50) {
        for(var x = 13; x < 801; x += 25) {
            game_context.fillText(charList[index], x, y);
            index++;
            if(index == charList.length)
                return;
        }
    }
}

// To keep track of where we are
var xloc = 1, yloc = 1;

// Gets keypress event from window
window.addEventListener("keypress", function(e) {
    // Do nothing if canvas is not set up
    if(!charList)
        return;

    // Checks what user typed
    // If correct key is pressed
    if(e.charCode == charList.charCodeAt(myposition)) {

        // Fill the current block
        game_context.fillStyle = mycolor;
        game_context.fillRect(xloc, yloc, 24, 24);

        myposition++;

        // Add to best if really the best
        if(myposition > bestposition) {
            fbleader.update({
                bestcolor: mycolor,
                bestname: myname,
                bestposition: myposition,
                bestxloc: xloc,
                bestyloc: yloc
            });
        }

        if(myposition == charList.length) {
            fbleader.update({
                bestcolor: mycolor,
                bestname: myname,
                bestposition: myposition,
                bestxloc: xloc,
                bestyloc: yloc,
                won: true
            });
            return;
        }

        // Position to next block
        xloc = xloc + 25;
        if(xloc > 800) {
            xloc = 1;
            yloc = yloc + 50;
        }
    }

    // Else do nothing
}, false);

// Update our board as leaders change
fbleader.on("value", function(snapshot) {
    var val = snapshot.val();

    if(val.won == true) {
        alert(val.bestname.concat(" wins!"));
        game_stop();
    }

    if(val.bestposition > 0) {
        bestcolor = val.bestcolor;
        bestname = val.bestname;
        bestposition = val.bestposition;
        bestxloc = val.bestxloc;
        bestyloc = val.bestyloc;

        document.getElementById("status").innerHTML = bestname.concat(" is leading!");

        if(!(bestname === myname) && game_context != null) {
            game_context.fillStyle = bestcolor;
            game_context.fillRect(bestxloc, bestyloc, 24, 24);
        }
    }

});

function game_stop() {
    // Major snafu here! You need a human moderator for now. :)

    fbleader.update({
        bestcolor: "",
        bestname: "",
        bestposition: 0,
        bestxloc: 0,
        bestyloc: 0,
        won: false
    });

    bestcolor = "";
    bestname= "";
    bestposition = "";
    bestxloc = "";
    bestyloc = "";

    location.reload(true);
}

