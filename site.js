
var sprites = [];
var money = 150;
var livesLeft = 15;
var gameStarted = false;
var gameRunning = false;

var baseDrunks = 25;
var baseDrunksMax = 50;
var drunkEscapeBonus = 15;

var btn1Clicked = false;
var btn2Clicked = false;
var btn3Clicked = false;
var btn4Clicked = false;
var clickTest = false;

var beatCounter = 0;
var lightsActivated = 0;

var musicOn = true;
var frameCounter =0;

window.onload = function() {
    
	soundmanager.init();
	soundmanager.playmusic('music');
	
	
	
	
    function Sprite (x,y,direction,speed,imgPath,w,h,action,actionStep,actionSteps,actionTimes) {
        this.x = x;
        this.y = y;
        this.x2 = x;
        this.y2 = y;
        
        this.w = w;
        this.h = h;
        this.visible = true;
        this.direction = direction; // 0 - up, 1 - up right, 2 - right ... 7 - up left
        this.speed = speed; // pixels per second
        this.action = action;
        this.actionStep = actionStep;
        
        this.status = "normal";
        this.colideable = true;
        this.solid = false;
        this.persistant = true;
        this.player = 1;
        this.numOfDirections = 8;
        this.created = frameCounter;
        this.lifeSpan = 0;
        this.accuracy = 20;
        
        this.lastSighting = 0;
        this.lastSightingEnemy = 0;
        this.lastCollision = 0;
        this.reloadTime = 90;
        this.lastAttack = 0;
        this.type = "drunk";
        this.lineOfSight = 50;
        this.path = new Array();
        
        this.actionSteps = actionSteps; // array za vsako akcijo. stevilo korakov animacije
        this.actionTimes = actionTimes; // array za vsako akcijo. trajanje frame-ov za step animacije 

        this.image = new Image();
        this.image.src = imgPath;
        
        
        this.calcDirection = function(sinA, cosA){
        	var tmpDir = 4;
			if(sinA>=0.3 && sinA<0.95 && cosA<0) { tmpDir = 1; }
			if(sinA>=0.3 && sinA<0.95 && cosA>0) { tmpDir = 3; }
			if(sinA>-0.95 && sinA<=-0.3 && cosA>0) { tmpDir = 5; }
			if(sinA>-0.95 && sinA<=-0.3 && cosA<0) { tmpDir = 7; }
			if(cosA<=-0.95) { tmpDir = 0; }
			if(sinA>=0.95) { tmpDir = 2; }
			if(cosA>=0.95) { tmpDir = 4; }
			if(sinA<=-0.95) { tmpDir = 6; }
			this.direction = tmpDir;
	    }
	    
	    
	    this.calcNextPathStep = function(){
	    	if(this.path.length==0){return;}
    		
        	if(frameCounter % this.actionTimes[this.action]==0) {
	            if(this.actionStep < this.actionSteps[this.action]){
	                this.actionStep++;
	            } else {
	                this.actionStep=0;
	            }
            }
             
            this.x=this.x2;
        	this.y=this.y2;       	
        	var a = this.path[0][0] - this.x;
        	var b = this.path[0][1] - this.y;
        	var c = Math.sqrt(a*a+b*b);
        	
        	
        	if(c <= 3){
        		// checkpoint reached
        		this.x2=this.x;
        		this.y2=this.y;
        		this.path.shift();
        		this.checkpointReached();
        		return;
        	}
        	
        	
        	var sinA = a/c;
        	var cosA = b/c;
        	var c2 = this.speed/60;
        	var a2 = c2*sinA;
        	var b2 = c2*cosA;
        	this.x2 = this.x+a2;
        	this.y2 = this.y+b2;
        	
        	this.calcDirection(sinA,cosA);
	    }
	    
	    
	    this.collision = function(collider, detectionOrder){
	    
	    	
	    	if(this.solid || !this.colideable || !collider.colideable) { return; }
	    			
    		if(detectionOrder==0) { var tmpRand = Math.random()*3 } 
    		if(detectionOrder==1) { var tmpRand = Math.random()*2 } 
    		
    		if(collider.x >= this.x) { this.x -= tmpRand; this.y += tmpRand; this.x2 -= tmpRand; this.y2 += tmpRand; }
    		if(collider.x < this.x) { this.x += tmpRand; this.y -= tmpRand; this.x2 += tmpRand; this.y2 -= tmpRand; }
    		if(collider.y <= this.y) { this.y += tmpRand; this.x += tmpRand; this.y2 += tmpRand; this.x2 += tmpRand;} 
    		if(collider.y > this.y) { this.y -= tmpRand; this.x -= tmpRand; this.y2 -= tmpRand; this.x2 -= tmpRand;}
    	 
	    }
	    
	    
	    this.checkpointReached = function(){
	    	if(this.path.length==0 && this.type=="bottle"){
	    		this.action=1;
	    		this.lifeSpan = 30;
	    		this.created = frameCounter;
	    		this.status = "exploding";
	    	}
	    
	    }
	    
	    
	    
	    this.sighting = function(target){
	    	this.lastSighting = frameCounter;
	    	if((target.player != this.player) && this.type=="drunk" && target.type!="bottle"){
	    		this.action = 2;
	    		this.actionStep = 0;
	    		this.speed = 0;
	    		if(this.lastAttack < frameCounter-this.reloadTime){
	    			addBottle(Number(this.x), Number(this.y)-this.h/2, Number(target.x)+Math.random()*this.accuracy-this.accuracy/2, Number(target.y)+Math.random()*this.accuracy-this.accuracy/2,0);
	    			this.lastAttack = frameCounter;
	    		}
	    	}
	    	
	    	
	    	
	    	if(target.player != this.player && this.type=="policeman" && target.type!="bottle"){
	    		this.speed = 0;
	    		this.actionStep = 0;
	    		this.action = 0;
	    		
	    		
	    		
	    	}
	    	
	    	if(target.player != this.player && target.type!="bottle" && this.type!="bottle") {
	    		this.lastSightingEnemy = frameCounter;
	    	}
	    	
	    }
	    
    }


    var buff=new Array(2);
	var ctx=new Array(2);
	buff[0]=document.getElementById("layer1");
	buff[1]=document.getElementById("layer2");
    buff[0].addEventListener('mouseup', doCanvasMouseUp, false);
    buff[1].addEventListener('mouseup', doCanvasMouseUp, false);
    buff[0].addEventListener("mousedown", doCanvasMouseDown, false);
    buff[1].addEventListener("mousedown", doCanvasMouseDown, false); 
	ctx[0]=buff[0].getContext("2d");
	ctx[1]=buff[1].getContext("2d");  
	var currentCanvas=0;
    
    
    var bg = new Image();
    bg.src = "http://voogy4.dev.controlplatform.com/img/background.jpg";
    var btn1 = new Image();
    btn1.src = "http://voogy4.dev.controlplatform.com/img/btn1.jpg";
    
    var btnMusic = new Image();
    btnMusic.src = "http://voogy4.dev.controlplatform.com/img/iconMusic.png";
    var btnMusicOff = new Image();
    btnMusicOff.src = "http://voogy4.dev.controlplatform.com/img/iconMusicOff.png";
    
    var lights = new Image();
    lights.src = "http://voogy4.dev.controlplatform.com/img/lucke.png";
    
	
    function enterFrameLogic(){
 
	    if(gameRunning){
	    	moveStuff();
	    	if(frameCounter % 6 == 0) { checkCollisions(); }
	    	if(frameCounter % 20 == 0) { checkLinesOfSight(); console.log(sprites);}
	    	if(frameCounter % 300 == 0) { updateBase(); }
	    	if(frameCounter % 20 == 0) { addPolice(); }
	    	if(frameCounter % 10 == 0) { systemCleaner(); }
	    }
	    
    	draw();
    }
    
 
	function moveStuff(){
		var tmpSpr;
        for(var i=0; i<sprites.length; i++){
        	if(!sprites[i].solid){
            	//sprites[i].calcNextPathStep();
            	tmpSpr = sprites[i]
            	tmpSpr.calcNextPathStep();
            	sprites[i] = tmpSpr;
        	}
        }
    }
 
    
    function addBottle(x,y,x2,y2,action){
    	
    	var tmpSpr = new Sprite(x,y,0,80,'/img/bottle.png',20,20,action,0,[7,5],[2,5]); 
    	tmpSpr.path.push([x2,y2,0]);
    	tmpSpr.type = "bottle";
    	tmpSpr.colideable = false;
    	tmpSpr.persistant = false;
    	tmpSpr.numOfDirections = 1;
    	sprites.push(tmpSpr);
    	console.log(sprites);
    	
    }

    
    
    
    function addPolice(){
    	
    	var tmpSpr = new Sprite(650,180,0,40,'/img/sprite2.png',16,24,1,0,[0,4,1],[10,8,10]); 
    	tmpSpr.type = "policeman";
    	tmpSpr.path = generatePolicePath();
    	tmpSpr.player = 2;
    	
    	sprites.push(tmpSpr);
    }
    
    
    
    
    function checkCollisions(){
    	
    	for(var i=0; i<sprites.length; i++){
    		for(var j=i; j<sprites.length; j++){
    			if(i==j){continue;}
    			if((sprites[j].x >= sprites[i].x - (sprites[j].w*0.3)) &&
    				(sprites[j].x <= sprites[i].x + (sprites[i].w*0.3)) && 
    				(sprites[j].y >= sprites[i].y - (sprites[j].h*0.3)) &&
    				(sprites[j].y <= sprites[i].y + (sprites[i].h*0.3)))
    				{
    					sprites[j].collision(sprites[i],0);
    					sprites[i].collision(sprites[j],1);
    				}   			
    		}
    	}
	}
    
    
    
    
    function checkLinesOfSight(){
    	
    	for(var i=0; i<sprites.length; i++){
    		for(var j=i; j<sprites.length; j++){
    			if(i==j){continue;}
    			var tmpDist = Math.sqrt((sprites[i].x - sprites[j].x)*(sprites[i].x - sprites[j].x) + (sprites[i].y - sprites[j].y)*(sprites[i].y - sprites[j].y));
    			if( tmpDist < sprites[i].lineOfSight){
    				sprites[i].sighting(sprites[j]);
    			}
    			if( tmpDist < sprites[j].lineOfSight){
    				sprites[j].sighting(sprites[i]);
    			}
    		}
    	}
    }
    
    
    
    function updateBase(){
    	if(baseDrunks<baseDrunksMax) {
    		baseDrunks += 1;
    	}
    	money += Math.floor(baseDrunks/3) + Math.floor(frameCounter/1800);
    }
    
    
    function systemCleaner(){
    	
    	for(var i=0; i<sprites.length; i++){
    		var tmpSpr = sprites[i];
    		if(tmpSpr.y<-25 || tmpSpr.x>770){
    			sprites.splice(i, 1);
    			money += drunkEscapeBonus;
    		}
    		if(tmpSpr.path.length==0 && tmpSpr.type=="bottle"){
    			sprites.splice(i, 1);
    			for(var j=0; j<sprites.length; j++){
    				var chkSpr = sprites[j];
    				if(tmpSpr.x > chkSpr.x-10 && tmpSpr.x < chkSpr.x+10 && tmpSpr.y > chkSpr.y-10 && tmpSpr.y < chkSpr.y+10){
    					sprites.splice(j, 1);
    					money+=5;
    				}
    			}
    		}
   			if(tmpSpr.lastSightingEnemy<frameCounter-60 && tmpSpr.type != "bottle"){
   				tmpSpr.speed = 60;
   				tmpSpr.action = 1;
   			}

    	}
    	
    }
    
    
    function drawHUD(ctx){
    	ctx.fillStyle = '#f7cf9c';
    	ctx.font = 'bold 17pt Calibri';
    	ctx.fillText(livesLeft,340,36);
    	ctx.fillText(money,417,36);
    	
    	if(btn1Clicked == 1) {
    		ctx.drawImage(btn1,34,532);
    		setTimeout("btn1Clicked = false;",100);
    	}
    	
    	ctx.font = 'bold 12pt Calibri';
    	ctx.fillText(baseDrunks,49,559);
    	
    	if(musicOn){
    		ctx.drawImage(btnMusic,700,20);
    	} else {
    		ctx.drawImage(btnMusicOff,700,20);
    	}
    }
    
    
    function drawPause(ctx){
    	
    	ctx.fillStyle="#000000";
		ctx.fillRect(196,96,358,258);
		
    	ctx.fillStyle="#985a1e";
		ctx.fillRect(200,100,350,250);
		
		ctx.font = 'bold 24pt Calibri';
		ctx.fillStyle="#000";
		ctx.fillText("Defenders Of The Bar",230,140);
		
		ctx.font = '12pt Calibri';
		ctx.fillStyle="#dddddd";
		
		if(gameStarted) {
			ctx.fillText("Game is paused.",265,200);
		} else {
			ctx.fillText("Wellcome to the thirst games...",250,200);
		}
		
		ctx.fillStyle="#532a02";
		ctx.fillRect(250,250,200,30);
		
		ctx.font = 'bold 12pt Calibri';
		ctx.fillStyle="#dddddd";
		if(gameStarted){
			ctx.fillText("CONTINUE",265,270);
		} else {
			ctx.fillText("START GAME",265,270);
		}
		
		if(gameStarted){
			ctx.fillStyle="#532a02";
			ctx.fillRect(250,300,200,30);
			ctx.fillStyle="#dddddd";
			ctx.fillText("RESTART",270,320);
		}
    }
    
    
    function doCanvasMouseUp(ev){
        if(clickTest==false) return false;
        clickTest = false;
    }
    function doCanvasMouseDown(ev){
        if (clickTest == true) { return false}
        clickTest = true; 
    	var x = ev.clientX - this.offsetLeft;
        var y = ev.clientY - this.offsetTop; 
        
        if(x>650 && x<730 && y>100 && y<175){
    		addPolice(600,200);
    	}
        
        if(x>285 && x<510 && y>5 && y<50){
    		gameRunning = false;
    	}
    	if(x>37 && x<78 && y>535 && y<575){
    		btn1Clicked = true;
    	}
    	if(x>700 && x<732 && y>20 && y<52){
    		if(musicOn){ musicOn = false; soundmanager.stopmusic(); } else { musicOn = true; soundmanager.playmusic('music');}
    	}
    	
        if(gameRunning){
        	if(baseDrunks > 0 && btn1Clicked){
		        var tmpSpr = new Sprite(80,395,0,40,'/img/sprite1_2.png',16,24,1,0,[0,4,1],[10,8,30]); 
		        tmpSpr.path = generateDrunkPath();
		        sprites.push(tmpSpr);
	        	buttonClicked = 1;
		    	soundmanager.playeffect(7);
		    	baseDrunks--;
        	}
        } else {
        	
        	if(x>250 && x<450 && y>250 && y<280){
        		gameRunning = true;
        		gameStarted = true;
        	}
        
        	if(x>250 && x<450 && y>300 && y<330 && gameStarted){
        		gameRunning = true;
        		frameCounter = 0;
        		sprites = new Array();
        		money = 150;
        		livesLeft = 15;
        	}
        }
    
    }
    
    
    function lightshow(ctx){
    	
    	if(frameCounter%25 < 10){
    		if(gameRunning && musicOn)
    		ctx.drawImage(lights,35,320);
    	}
    	
    }
    
    
    
    function draw(){
    	ctx[currentCanvas].drawImage(bg,0,0,750,580);
    	
        var tmpSpr;
        for(var i=0; i<sprites.length; i++){
            tmpSpr = sprites[i];
            if(!tmpSpr.visible) { continue; }
            
            if(tmpSpr.numOfDirections > 1){
            	
	            ctx[currentCanvas].drawImage(
	                tmpSpr.image,
	                tmpSpr.w * tmpSpr.actionStep,
	                (tmpSpr.h * (tmpSpr.action) * tmpSpr.numOfDirections) + (tmpSpr.direction * tmpSpr.h),
	                tmpSpr.w,
	                tmpSpr.h,
	                Math.floor(tmpSpr.x),
	                Math.floor(tmpSpr.y),
	                tmpSpr.w,
	                tmpSpr.h
	            );
            }
            if(tmpSpr.numOfDirections == 1){
	            
	            ctx[currentCanvas].drawImage(
	                tmpSpr.image,
	                tmpSpr.w * tmpSpr.actionStep,
	                tmpSpr.h * tmpSpr.action,
	                tmpSpr.w,
	                tmpSpr.h,
	                Math.floor(tmpSpr.x),
	                Math.floor(tmpSpr.y),
	                tmpSpr.w,
	                tmpSpr.h 
	            );
            }
            
        }
        
        drawHUD(ctx[currentCanvas]);
        
    	if(!gameRunning){
    		drawPause(ctx[currentCanvas]);
    	}
    	
        lightshow(ctx[currentCanvas]);
        
        buff[1- currentCanvas].style.visibility='hidden';
		buff[currentCanvas].style.visibility='visible';
		ctx[1-currentCanvas].clearRect(0,0,750,600);
		currentCanvas =1-currentCanvas;
    }
    
    
    function enterFrame() {
        frameCounter++;
		requestAnimationFrame(enterFrame);
		enterFrameLogic();
	}
    enterFrame();
    
    
}

