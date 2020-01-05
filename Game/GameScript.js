var myGamePiece;
var myObstacles = [];
var myScore;


$(document).ready(function(){
	startGame();
	var pauseButton = jQuery("#pauseButton");
	pauseButton.attr("myTextColor", "black");
	pauseButton.click(function(){
		pauseGame();
		var color = pauseButton.attr("myTextColor");
		if(pauseButton.attr("myTextColor") == "red"){
			pauseButton.css("color", "black");
			pauseButton.attr("myTextColor", "black");
		}else{
			pauseButton.css("color", "red");
			pauseButton.attr("myTextColor", "red");
		}
	});
	// pauseButton.animate({
	// 	opacity: "0.5",
	// 	top: "20px",
	// }, 2000);

	// $("canvas").animate(
	// 	{
	// 		marginLeft: '500px',
	// 		marginTop: '100px'
	// 	}, 1000
	// );
	let mainContainer = jQuery("#mainContainer");
	let x = jQuery(window).width()/2 - mainContainer.width()/2;
	let y = jQuery(window).height()/2 - mainContainer.height()/2;
	mainContainer.css({"opacity" : 0});
	mainContainer.animate({
		left: x,
		top: y,
		opacity: 1,
	}, 1000);

	$.ajax({
		url: "https://restcountries.eu/rest/v2/all",
		type: "GET",
		dataType: "json",
		success: function(result){
			for(countryObj of result){
				let countryName = countryObj.name;
				$("#countrySelector").append("<option>" + countryName + "</option>");
			}
		}
	});

});
	

function startGame(){
	var firsttime = true;
	myGamePiece = new component(30,30, "red", 10, 120);
	myGamePiece.gravity = 0.05;
	myScore = new component("30px", "Consolas", "black", 280, 40, "text");
	myGameArea.start();
	clearInterval(myGameArea.interval);
	document.body.onkeydown = function (e){
		if(e.keyCode == 32){
			if(firsttime){
				this.interval = setInterval(updateGameArea, 20);
				firsttime = false;
			}else{
				accelerate(-0.2);
			}
		}
	};
	document.body.onkeyup = function (e){
		if(e.keyCode == 32){
		  accelerate(0.05);
		}
	};
}

function restartGame(){
	clearInterval(myGameArea.interval);
	myObstacles = [];
	startGame();
}


var myGameArea = {
	canvas : document.createElement("canvas"),
	start : function(){
		this.canvas.width = 580;
		this.canvas.height = 470;
		this.context = this.canvas.getContext("2d");
		jQuery("#canvasContainer").append(this.canvas);
		// document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.frameNo = 0;
		this.interval = setInterval(updateGameArea, 20);
	},
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

function pauseGame(){
	var button = document.getElementById("pauseButton");
	if(button.innerHTML == "Pause"){
		clearInterval(myGameArea.interval);
		button.innerHTML = "Resume";
		// jQuery("#restartButton").hide();
	}else{
		myGameArea.interval = setInterval(updateGameArea, 20);
		button.innerHTML = "Pause";
		// jQuery("#restartButton").show();
	}
	button.blur();
	jQuery("#restartButton").toggle();
}

function component(width, height, color, x, y, type){
	this.type = type;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
	this.countedScore = false;
	this.hitTopOrBottom = false;
	
    this.update = function() {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        }else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
		this.hitTop();
    }
    this.hitBottom = function() {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
			this.hitTopOrBottom = true;
        }
    }
	this.hitTop = function() {
		var rockTop = 0;
		if(this.y < 0){
			this.y = rockTop;
			this.gravitySpeed = 0;
			this.hitTopOrBottom = true;
		}
	}
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
		if(myleft > otherright && !otherobj.countedScore){
			myScore.score += 0.5;
			otherobj.countedScore = true;
		}
        return crash;
    }
}

function getInfo() {
	var name = document.forms["myForm"]["name"].value;
	var email = document.forms["myForm"]["email"].value;
	var country = document.getElementById("countrySelector").value;
	if (name == "" || email == "" || country == "") {
	  alert("Name must be filled out");
	  return false;
	}else{
		const obj = {
			"Name": name, 
			"Email": email, 
			"Country": country, 
			"Score": myScore.score
		};
	}
  }

function youShallLoose(){
	// alert("You lost:( ! your score is:" + myScore.score);
	document.getElementById("overlay").style.display = "block";
	var button = document.getElementById("score");
	button.innerHTML = "Your score is : " + myScore.score;
	// restartGame();
	return;
}

function updateGameArea() {
	var x, height, gap, minHeight, maxHeight, minGap, maxGap;
 	if(myGamePiece.hitTopOrBottom){
		youShallLoose();
		return;
	}
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
			if(myObstacles[i].x<0){
				myObstacles.splice(i,1);
			}
			youShallLoose();
			return;
        }
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(250)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = myGameArea.canvas.height / 2;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        minGap = 50;
        maxGap = myGameArea.canvas.height / 3;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        myObstacles.push(new component(10, height, "green", x, 0));
        myObstacles.push(new component(10, x - height - gap, "green", x, height + gap));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }
    myScore.text="SCORE: " + myScore.score;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
}
function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function accelerate(n) {
    myGamePiece.gravity = n;
}
