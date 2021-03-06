var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;

var tics = 0;
var _timeToBeAlive = 30;

//Canvas
var divArena;
var canArena;
var canScore;
var conArena;
var conScore;
var ArenaWidth = 500;
var ArenaHeight = 300;

//Background
var imgBackground;
var xBackgroundOffset = 0;
var xBackgroundSpeed = 1;
var backgroundWidth = 1782;
var backgroundHeight = 600;
//une modification

///////////////////////////////////
//Keys
var keys = {
    UP: 38,
    DOWN: 40,
    SPACE: 32,
    ENTER: 13
};

var keyStatus = {};

function keyDownHandler(event) {
    "use strict"; 
    var keycode = event.keyCode, 
        key; 
    for (key in keys) {
        if (keys[key] === keycode) {
            keyStatus[keycode] = true;
            event.preventDefault();
        }
    }
}
function keyUpHandler(event) {
   var keycode = event.keyCode,
            key;
    for (key in keys) 
        if (keys[key] == keycode) {
            keyStatus[keycode] = false;
        }
        
    }
///////////////////////////////////


///////////////////
// une collection de projectiles
function ProjectileSet(tabTarget){
  this.tabTarget = tabTarget;
  this.score = 0;
  this.tabProjectiles = new Array();
  this.add = function (projectile) {
    this.tabProjectiles.push(projectile);  
  };
  this.remove = function () {  

       this.tabProjectiles.map(function(obj,index,array){
            if(obj.exists == false ||obj.x >ArenaWidth || obj.x<0){
                  delete array[index];
            }
        });

  };


 this.update = function(){
        this.remove();
        var score = 0;
        this.tabProjectiles.map(function(obj){
            obj.update();
            if(obj.exists == false) {//hit
                score = score +1;
            }
        });
        this.score = this.score + score;
    };
 this.clear = function(){
    this.tabProjectiles.map(function(obj){
         obj.clear();
    });
 };
 this.draw = function(){
    this.tabProjectiles.map(function(obj){
        obj.draw();
    });
     //console.log(this.tabProjectiles.length);
 };
    
};

////////////////////
// un objet Projectile
function Projectile(x,y,speed,width,height,color){
    this.x = x;
    this.y = y;
    this.xSpeed = speed;
    this.width = width;
    this.height = height;
    this.color = color;
    this.exists = true;
    this.collision_ennemy = function(tabOfObjects){
        var hits = null;
        var index;
        for(index in tabOfObjects){
            if ((tabOfObjects[index].cptExplosion ==0) && this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    hits = tabOfObjects[index];
                    break;
            }
        }
        return hits;  
    };
	this.collision_player = function(tabOfObjects){
        var hits = null;
        var index;
        for(index in tabOfObjects){
            if (this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    hits = tabOfObjects[index];
                    break;
            }
        }
        return hits;  
    };
    this.draw = function(){
        if(this.exists){
            conArena.fillStyle = this.color;
            conArena.fillRect(this.x,this.y,this.width,this.height);
        }
    };
    this.clear = function(){
        if(this.exists){
            conArena.clearRect(this.x-1,this.y-1,this.width+2,this.height+2);
        }
    };
    this.update = function(){
        if(this.exists){
            this.x +=   this.xSpeed ;
			if(this.color==="rgb(0,200,0)"){
				var tmp = this.collision_player([player]);
				if(tmp != null){
					tmp.explodes();
					this.exists = false;
				}
			}
            else{
				var tmp = this.collision_ennemy(enemies.tabEnemies);
				if(tmp != null){
					tmp.explodes();
					this.exists = false;
				}
			}
        }
    };
}
/////////////////////////////////

/////////////////////////////////
// Enemy
var enemies = {
    init : function(){
        this.tabEnemies = new Array();
    },
    add : function (enemy) {
        this.tabEnemies.push(enemy);  
    },
    remove : function () {  
        this.tabEnemies.map(function(obj,index,array){
            if(obj.exists == false ||obj.x >ArenaWidth || obj.x<0){
                  delete array[index];
            }
        });
    },
    draw : function(){ 
        this.tabEnemies.map(function(obj){
            obj.draw();
        });
    },
    clear : function(){
       this.tabEnemies.map(function(obj){
            obj.clear();
        });
    },
    update : function(){

        this.tabEnemies.map(function(obj){
            obj.update();
        });
         this.remove();
    },
	del : function(){
		this.tabEnemies.map(function(obj){
            obj.del();
        });
		this.remove();
	}
};
//test
function Enemy(x,y,speed,type){
    this.x = x;
    this.yOrigine = y;
    this.y = this.yOrigine;
    this.xSpeed = speed;
	this.type = type;
    this.exists = true;
	this.nblives = 1;	//default number of lives
	if(this.type==="boss"){
		this.height = 128;
		this.width = 128;
		this.img = new Image();
		this.img.src = "./assets/Boss/head_sheet.png";
		this.nblives = 40;
		this.up =true;
	}
	else{
		this.height = 30;
		this.width = 40;
		this.img = new Image();
		if(this.type==="normal"){
			this.img.src = "./assets/Enemy/eSpritesheet_40x30.png";
		}
		else if(this.type==="orange"){
			this.img.src = "./assets/Enemy/eSpritesheet_40x30_hue1.png";
			this.nblives = 3;
		}
		else if(this.type==="vert"){
			this.img.src = "./assets/Enemy/eSpritesheet_40x30_hue4.png";
			this.nblives = 2;
		}
	}
	this.cpt = 0;

    this.cptExplosion =  0;//10 images
    this.imgExplosion = new Image();
    this.imgExplosionHeight = 128;
    this.imgExplosionWidth = 128;
    this.imgExplosion.src = "./assets/Explosion/explosionSpritesheet_1280x128.png";

    this.projectileSet = new ProjectileSet();
    this.explodes = function(){
		this.nblives--;
		if(this.nblives<=0){
			this.cptExplosion = 1;
		}
    };
    this.collision = function(tabOfObjects){
        var hits = null;
        var index;
        for(index in tabOfObjects){
            if (this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    hits = tabOfObjects[index];
                    break;
            }
        }
        return hits;
    };
    this.fire = function (){
        var tmp = new Projectile(this.x-10,this.y+this.height/2,-4,10,5,"rgb(0,200,0)");
        this.projectileSet.add(tmp);
    };
    this.draw = function(){ 

        this.projectileSet.draw();

        if(this.cptExplosion!=0){
                conArena.drawImage(this.imgExplosion, this.cptExplosion*this.imgExplosionWidth, 0, this.imgExplosionWidth,this.imgExplosionHeight, this.x,this.y,this.width,this.height);
        }else{
            conArena.drawImage(this.img,  0,this.cpt*this.height,this.width,this.height, this.x,this.y,this.width,this.height);
        }
    };
    this.clear = function(){
        if(this.exists){
            conArena.clearRect(this.x,this.y,this.width,this.height);
        }
        this.projectileSet.clear();
    };
	this.del = function(){
		this.exists = false;
	}
    this.update = function(){
       if(this.cptExplosion==0){//is not exploding
            if(this.type==="boss"){
				if(this.y<=0 || this.y>=ArenaHeight-128){
					this.up = !this.up;
				}
				if(this.up){
					this.y -= 1;
				}
				else{
					this.y +=1;
				}
			}
			else{
				this.x +=   this.xSpeed ;
				if(this.type==="normal"){
					this.y = this.yOrigine+ ArenaHeight/3 * Math.sin(this.x / 100);
				}
				else if(this.type==="orange"){
					this.y = this.yOrigine+ ArenaHeight/2.5 * Math.cos(this.x / 50);
				}
				else if(this.type==="vert"){
					this.y = this.yOrigine+ ArenaHeight/12 * Math.sin(this.x / 50);
				}
			}
            var tmp = this.collision([player]);
                if(tmp != null){
					tmp.explodes();
					this.exists = false;
                }

            if(tics % 5 == 1) {
                    this.cpt = (this.cpt + 1) % 6;
            }
			if(this.type==="boss"){
				if(tics % 50 == 1) {
					this.fire();
				}
			}
       }else{
            if(tics % 3 == 1) {
                this.cptExplosion++;
            }
            if(this.cptExplosion>10){//end of animation
                this.cptExplosion=0;
                this.exists = false;
				if(this.type === "boss"){
					alert("Congratulations ! You won ! :) ");
					player.nbOfLives=2;
					player.projectileSet.score=0;
					player.fighting_boss=false;
					enemies.del();
					tics = 0;
				}
            }
        }
        this.projectileSet.update();
    };
}
/////////////////////////////////

/////////////////////////////////
// Bonus
var bonuses = {
    init : function(){
        this.tabBonuses = new Array();
    },
    add : function (bonus) {
        this.tabBonuses.push(bonus);  
    },
    remove : function () {  
        this.tabBonuses.map(function(obj,index,array){
            if(obj.exists == false ||obj.x >ArenaWidth || obj.x<0){
                  delete array[index];
            }
        });
    },
    draw : function(){ 
        this.tabBonuses.map(function(obj){
            obj.draw();
        });
    },
    clear : function(){
       this.tabBonuses.map(function(obj){
            obj.clear();
        });
    },
    update : function(){

        this.tabBonuses.map(function(obj){
            obj.update();
        });
         this.remove();
    },
	del : function(){
		this.tabBonuses.map(function(obj){
            obj.del();
        });
		this.remove();
	}
};
//test
function Bonus(x,y,speed,type){
    this.x = x;
    this.yOrigine = y;
    this.y = this.yOrigine;
    this.xSpeed = speed;
	this.type = type;
    this.exists = true;
	if(this.type==="lifeplus"){
		this.height = 32;
		this.width = 32;
		this.img = new Image();
		this.img.src = "assets/Bonus/lifeplus.png";
	}

	this.cpt = 0;

    this.cptExplosion =  0;//10 images
    this.imgExplosion = new Image();
    this.imgExplosionHeight = 128;
    this.imgExplosionWidth = 128;
    this.imgExplosion.src = "./assets/Explosion/explosionSpritesheet_1280x128.png";

    this.explodes = function(){
		this.cptExplosion = 1
    };
    this.collision = function(tabOfObjects){
        var hits = null;
        var index;
        for(index in tabOfObjects){
            if (this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    hits = tabOfObjects[index];
                    break;
            }
        }
        return hits;
    };
	
    this.draw = function(){ 

        if(this.cptExplosion!=0){
                conArena.drawImage(this.imgExplosion, this.cptExplosion*this.imgExplosionWidth, 0, this.imgExplosionWidth,this.imgExplosionHeight, this.x,this.y,this.width,this.height);
        }else{
            conArena.drawImage(this.img, this.cpt*this.width,0,this.width,this.height, this.x,this.y,this.width,this.height);
        }
    };
	
    this.clear = function(){
        if(this.exists){
            conArena.clearRect(this.x,this.y,this.width,this.height);
        }
    };
	this.del = function(){
		this.exists = false;
	};
    this.update = function(){
       if(this.cptExplosion==0){//is not exploding
			this.x +=   this.xSpeed ;
			if(this.type==="lifeplus"){
				this.y = this.yOrigine+ ArenaHeight/4 * Math.sin(this.x / 100);
			}
            var tmp = this.collision([player]);
			if(tmp != null){
				this.explodes();
			}

            if(tics % 7 == 1) {
                this.cpt = (this.cpt + 1) % 8;
            }
       }else{
            if(tics % 3 == 1) {
                this.cptExplosion++;
            }
            if(this.cptExplosion>10){//end of animation
                this.cptExplosion=0;
                this.exists = false;
				if(this.type === "lifeplus"){
					player.nbOfLives++;
				}
            }
        }
    };
}
/////////////////////////////////

/////////////////////////////////
// Hero Player
var player = {
    init : function(){
        this.img = new Image();
        this.img.src = "./assets/Ship/Spritesheet_64x29.png";
        this.cpt = 0;
        this.cptExplosion =  10;//10 images
        this.imgExplosion = new Image();
        this.imgExplosionHeight = 128;
        this.imgExplosionWidth = 128;
        this.imgExplosion.src = "./assets/Explosion/explosionSpritesheet_1280x128.png";
        this.projectileSet = new ProjectileSet();
    },
    x : 20,
    ySpeed : 10,
    y : 100,
    height : 29,
    width : 64,
    nbOfLives : 2,
    timeToBeAlive : 0,
	fighting_boss : false,
    fires : function(){
        var tmp = new Projectile(this.x+this.width,this.y+this.height/2,4,10,3,"rgb(200,0,0)");
        this.projectileSet.add(tmp);
    },
    explodes : function(){
        if(this.timeToBeAlive == 0) {
            this.nbOfLives--;
            if(this.nbOfLives>0){
                this.timeToBeAlive = _timeToBeAlive;
                this.cptExplosion = 1;
            }else{
                //Game Over
				alert("GAME OVER !");
				this.nbOfLives=2;
				this.projectileSet.score=0;
				this.fighting_boss=false;
				enemies.del();
				tics = 0;
            }
        }
    },
    clear : function(){
        conArena.clearRect(this.x,this.y,this.width,this.height);
        this.projectileSet.clear();
    },
    update :  function(){
        var keycode;
        if(tics % 10 == 1) {
                this.cpt = (this.cpt + 1) % 4;
            }
        if(this.timeToBeAlive>0) {
            this.timeToBeAlive --;
        }else{
            for (keycode in keyStatus) {
                if(keyStatus[keycode] == true){
                    if(keycode == keys.UP) {
                        this.y -= this.ySpeed;
                        if(this.y<0) this.y=0;
                    }
                    if(keycode == keys.DOWN) {
                        this.y += this.ySpeed;
                        if(this.y>ArenaHeight-this.height) this.y=ArenaHeight-this.height;
                    }
                    if(keycode == keys.SPACE) {
                        //shoot
                        this.fires();
                    }
                }
             keyStatus[keycode] = false;
            }
        }
        this.projectileSet.update();
    },
    draw : function(){
        if(this.timeToBeAlive == 0) {

            conArena.drawImage(this.img, 0,this.cpt*this.height,this.width,this.height, this.x,this.y,this.width,this.height);
        }else{
            //exploding
            if(this.cptExplosion!=0){
                conArena.drawImage(this.imgExplosion, this.cptExplosion*this.imgExplosionWidth, 0, this.imgExplosionWidth,this.imgExplosionHeight, this.x,this.y,this.width,this.height);
               if(tics % 3 == 1) {this.cptExplosion++;}
                if(this.cptExplosion>10) this.cptExplosion=0;
            }
        }
        this.projectileSet.draw();
    }
};



function updateScene() {
    "use strict"; 
    xBackgroundOffset = (xBackgroundOffset - xBackgroundSpeed) % backgroundWidth;
}
function updateItems() {
    "use strict"; 
    player.update();
    tics++;
	//Enemy creation
     if(tics % 80 == 1) {
        var rand = Math.floor(Math.random() * ArenaHeight);
		var rand1 = Math.floor(Math.random() * 10);
		if(rand1<2){
			enemies.add(new Enemy(ArenaWidth, rand,-1,"orange"));
		}
		else if(rand1<5){
			enemies.add(new Enemy(ArenaWidth, rand,-3,"vert"));
		}
		else{
			enemies.add(new Enemy(ArenaWidth, rand,-2,"normal"));
		}
    }
	//Bonus creation
	if(tics % 800 == 1) {
		var rand2 = Math.floor(Math.random() * ArenaHeight);
		var rand3 = Math.floor(Math.random() * 10);
		bonuses.add(new Bonus(ArenaWidth, rand2,-1,"lifeplus"));
	}
	if(player.projectileSet.score>50 && player.fighting_boss==false){	//if the player's score is high enough, summons the boss
		player.fighting_boss = true;
		enemies.add(new Enemy(ArenaWidth-128, ArenaHeight/2,-2,"boss"));
	}
    enemies.update();
	bonuses.update();
}
function drawScene() {
    "use strict"; 
    canArena.style.backgroundPosition = xBackgroundOffset + "px 0px" ;
}
function drawItems() {
    "use strict"; 
    player.draw();
    enemies.draw();
	bonuses.draw();
}
function clearItems() {
    "use strict"; 
    player.clear(); 
    enemies.clear();
	bonuses.clear();
}

function clearScore() {
    conScore.clearRect(0,0,300,50);
}
function drawScore() {
    conScore.fillText("life : "+player.nbOfLives, 10, 25);
    conScore.fillText("score : "+player.projectileSet.score, 150,25);
}
function updateGame() {
    "use strict"; 
    updateScene();
    updateItems();
}
function clearGame() {
    "use strict"; 
    clearItems();
    clearScore();
}

function drawGame() {
    "use strict"; 
    drawScene();
    drawScore();
    drawItems();    
}


function mainloop () {
    "use strict"; 
    clearGame();
    updateGame();
    drawGame();
}

function recursiveAnim () {
    "use strict"; 
    mainloop();
    animFrame( recursiveAnim );
}
 
function init() {
    "use strict";
    divArena = document.getElementById("arena");
    canArena = document.createElement("canvas");
    canArena.setAttribute("id", "canArena");
    canArena.setAttribute("height", ArenaHeight);
    canArena.setAttribute("width", ArenaWidth);
    conArena = canArena.getContext("2d");
    divArena.appendChild(canArena);

    canScore = document.createElement("canvas");
    canScore.setAttribute("id","canScore");
    canScore.setAttribute("height", ArenaHeight);
    canScore.setAttribute("width", ArenaWidth);
    conScore = canScore.getContext("2d");
    conScore.fillStyle = "rgb(200,0,0)";
    conScore.font = 'bold 12pt Courier';
    divArena.appendChild(canScore);

 
    player.init();
    enemies.init();
	bonuses.init();
    
window.addEventListener("keydown", keyDownHandler, false);
window.addEventListener("keyup", keyUpHandler, false);
    
    animFrame( recursiveAnim );
    
}

window.addEventListener("load", init, false);
