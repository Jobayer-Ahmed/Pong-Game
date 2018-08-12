const width = Math.max(document.documentElement.clientHeight, window.innerHeight || 0), height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0), pi = Math.PI, upArrow = 38, downArrow = 40;
let canvas, ctx, keystate, player, ai, ball, playerScore = aiScore = 0;

var ar=new Array(33,34,35,36,37,38,39,40);

$(document).keydown(function(e) {
     var key = e.which;
      //console.log(key);
      //if(key==35 || key == 36 || key == 37 || key == 39)
      if($.inArray(key,ar) > -1) {
          e.preventDefault();
          return false;
      }
      return true;
});


player = {
	x: null,
	y: null,
	width: 20,
	height: 100,
	update: function() {
		if (keystate[upArrow]) this.y -= 10;
		if (keystate[downArrow]) this.y += 10;
	},
	draw: function() {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
};

ai = {
	x: null,
	y: null,
	width: 20,
	height: 100,
	update: function() {
		let aiPaddle = ball.y - (this.height - ball.side)*.5;
		this.y += (aiPaddle - this.y)*.1;
	},
	draw: function() {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
};

ball = {
	x: null,
	y: null,
	side: 20,
	vel: null,
	speed: 0,
	update: function() {
		this.x += this.vel.x,
		this.y += this.vel.y
		if (0 > this.y || this.y+this.side > height) {
			let offset = this.vel.y < 0 ? 0 - this.y : height - (this.y+this.side);
			this.y += 2*offset
			this.vel.y *= -1;
		}
		const intersect = function(ax, ay, aw, ah, bx, by, bw, bh) {
			return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah;
		}
		let paddle = this.vel.x < 0 ? player : ai;
		if (intersect(paddle.x, paddle.y, paddle.width, paddle.height, this.x, this.y, this.side, this.side)) {
			this.x = paddle === player ? player.x+player.width : ai.x - this.side;
			let n = (this.y+this.side - paddle.y)/(paddle.height+this.side);
			let phi = .25*pi*(2*n - 1);
			let smash = Math.abs(phi) > .2*pi ? 1.5 : 1;
			this.vel.x = smash*(paddle === player ? 1 : -1)*this.speed*Math.cos(phi);
			this.vel.y = smash*this.speed*Math.sin(phi);
		}
		if (this.x > width) {
			ball.x = (width - ball.side)/2;
			ball.y = (height - ball.side)/2;
			ball.vel = {
				x: (paddle === player ? 1 : -1)*ball.speed,
				y: 0
			}
			playerScore++;
			let playerScoreBoard = document.querySelector('.player');
			playerScoreBoard.innerHTML = playerScore;
		} else if(0 > this.x+this.side) {
			ball.x = (width - ball.side)/2;
			ball.y = (height - ball.side)/2;
			ball.vel = {
				x: (paddle === player ? 1 : -1)*ball.speed,
				y: 0
			}
			aiScore++;
			let aiScoreBoard = document.querySelector('.ai');
			aiScoreBoard.innerHTML = aiScore;
			console.log(aiScore);
		}
	},
	draw: function() {
		ctx.fillRect(this.x, this.y, this.side, this.side);
	}
}

function main() {
	canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	ctx = canvas.getContext("2d");
	let wrapper = document.querySelector('.canvas');
	wrapper.appendChild(canvas);
	keystate = {};
	document.addEventListener("keydown", function(e) {
		keystate[e.keyCode] = true
	});
	document.addEventListener("keyup", function(e) {
		delete keystate[e.keyCode];
	});
	init();
	const loop = () => {
		update();
		draw();
		window.requestAnimationFrame(loop, canvas);
	}
	window.requestAnimationFrame(loop, canvas);
};

function init() {
	player.x = player.width;
	player.y = (height - player.height)/2;
	ai.x = width - (player.width+ai.width);
	ai.y = (height - ai.height)/2;
	ball.x = (width - ball.side)/2;
	ball.y = (height - ball.side)/2;
	ball.vel = {
		x: ball.speed,
		y: 0
	}
}

function update() {
	ball.update();
	player.update();
	ai.update(); 
}

function draw() {
	ctx.fillRect(2, 2, width, height);
	ctx.save();
	ctx.fillStyle = "white"
	ball.draw();
	player.draw();
	ai.draw();
	let w = 4, x = (width - w)*0.5, y = 0, step = height/5;
	while(y < height) {
		ctx.fillRect(x, y+step*0.25, w, step*.5);
		y+=step;
	}
	ctx.restore();
}

main();

$(".play").click(() => {
	$(".play").addClass("hide");
	$(".push").removeClass("hide");
	ball.speed = 15;
	init();
})

$(".push").click(() => {
	$(".push").addClass("hide");
	$(".play").removeClass("hide");
	ball.speed = 0;
	init();
})