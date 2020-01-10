// var fs = require('fs');


var myGamePiece;
var myObstacles = [];
var myScore;

$(document).ready(function(){
	startGame();
	// var pauseButton = jQuery("#pauseButton");
	// pauseButton.attr("myTextColor", "black");
	// pauseButton.click(function(){
	// 	pauseGame();
	// 	var color = pauseButton.attr("myTextColor");
	// 	if(pauseButton.attr("myTextColor") == "red"){
	// 		pauseButton.css("color", "black");
	// 		pauseButton.attr("myTextColor", "black");
	// 	}else{ 
	// 		pauseButton.css("color", "red");
	// 		pauseButton.attr("myTextColor", "red");
	// 	}
	// });
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

	// mainContainer.css({ });

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
	$("a").click(function(){
		$("a").removeClass("active");
		$(this).addClass("active");
	});
	
	$(window).scroll(function(){
		
		$("section").each(function() {
	
			var bb= $(this).attr("id"); 
			console.log("bb", bb);
			var hei = $(this).outerHeight();
			var grttop = $(this).offset().top -70;
			
			if($(window).scrollTop() > grttop && $(window).scrollTop() < grttop + hei) {
				
				$(".topnav a[href='#" + bb + "']").addClass("active");
				
			} else {
				$(".topnav a[href='#" + bb + "']").removeClass("active");
			}
			
		});
	
	});
			
	
});


function startGame(){
	var firsttime = true;
	var state = "pause";
	myGamePiece = new component(60, 60, "red", 10, 120, "piece");
	myGamePiece.gravity = 0.05;
	myScore = new component("2em", "Arial", "white", 200, 50, "text");
	myGameArea.start();
	state = pauseGame(state);
	document.body.onkeydown = function (e){
		if(e.keyCode == 32){
			if(firsttime){
				state = pauseGame(state);
				firsttime = false;
			}else{
				accelerate(-0.2);
			}
		}
		if(e.keyCode == 32 && e.target == document.body) {
			e.preventDefault();
		}
		if(e.keyCode == 80){
			state = pauseGame(state);
		}
	};
	document.body.onkeyup = function (e){
		if(e.keyCode == 32){
		  accelerate(0.05);
		}
	};
}

function restartGame(){
	document.getElementById("overlay").style.display = "none";
	clearInterval(myGameArea.interval);
	myObstacles = [];
	startGame();
}

var myGameArea = {
	canvas : document.createElement("canvas"),
	start : function(){
		this.canvas.width = 580;
		this.canvas.height = 470;
		jQuery(this.canvas).css(
			"background-image", 'url(./Assets/Background.jpg)'
		);
		jQuery(this.canvas).css(
			"background-size", 'cover'
		);
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

function pauseGame(state){
	if(state == 'play'){
		myGameArea.interval = setInterval(updateGameArea, 20);
		return 'pause';
	}else{
		clearInterval(myGameArea.interval);
		return 'play';

	}
	// var button = document.getElementById("pauseButton");
	// if(button.innerHTML == "Pause"){
	// 	clearInterval(myGameArea.interval);
	// 	button.innerHTML = "Resume";
	// 	// jQuery("#restartButton").hide();
	// }else{
	// 	myGameArea.interval = setInterval(updateGameArea, 20);
	// 	button.innerHTML = "Pause";
	// 	// jQuery("#restartButton").show();
	// }
	// button.blur();
	// jQuery("#restartButton").toggle();
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
		}else if(this.type == "piece"){
			const image = new Image();
			image.src = './Assets/ufo.png';
			ctx.drawImage(image,this.x, this.y, this.width, this.height);
		}else if(this.type == 'rock'){
			var img = new Image();
			img.src = './Assets/moons.png';
			ctx.drawImage(img,this.x, this.y, this.width, this.height);
			// ctx.drawImage(img, 0, 0, img.width,    img.height,     // source rectangle
			// 0, 0, canvas.width, canvas.height);
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
        if ((mybottom < othertop + 12) || (mytop > otherbottom - 12) || (myright < otherleft + 18) || (myleft > otherright -18)) {
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
        minGap = 80;
        maxGap = myGameArea.canvas.height / 3;
		gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);


        myObstacles.push(new component(70, height, "#7cbca4", x, 0, "rock"));
        myObstacles.push(new component(70, x - height - gap, "#7cbca4", x, height + gap, "rock"));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }
    myScore.text="Score: " + myScore.score;
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


// Populate the table

document.addEventListener( "DOMContentLoaded", get_json_data, false );

function get_json_data(){
	var json_url = 'boardData.json';
	// AJAX Request
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() { 
		if (this.readyState == 4 && this.status == 200) {
			// If response is ok --> parse json then call appendJson
			var data = JSON.parse(this.responseText);
			console.log("append data", data);

			append_json(data);
		}
	}
	xmlhttp.open("GET", json_url, true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send();
}

function append_json(data){
	var table = document.getElementById('ScoreBoard');
	console.log(data)
	data.forEach(function(object) {
		var tr = document.createElement('tr');
		tr.innerHTML = '<td>' + object.Name + '</td>' +
		'<td>' + object.Email + '</td>' +
		'<td>' + object.Country + '</td>' +
		'<td>' + object.Score + '</td>';
		table.appendChild(tr);
	});
}

