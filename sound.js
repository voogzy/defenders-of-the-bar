var maxchannels = 10;
var loadedSounds = 1;

function soundmanager()
{
  this.sounds = new Array();
  this.music = 0;
      
  this.init = function ()
    {
        var audio = document.getElementsByClassName('sfx');
        //console.log(audio);
        for(var i=0;i<audio.length;i++)
        {
          this.sounds[i] = new Array();
          for(var j=0; j<maxchannels; j++)
          {
            this.sounds[i][j] = new Audio(audio[i].src);
            this.sounds[i][j].oncanplaythrough=loadedSounds++;
          }
        }
    } 
    
  this.playeffect = function(effectname)
    {
         for(var i=0; i < maxchannels; i++)
        {
          if(this.sounds[effectname][i].ended == true || this.sounds[effectname][i].currentTime == 0)
          {
            this.sounds[effectname][i].play();
            return;
          }
        }
    }
    
  this.playmusic = function(musicname)
    {
        this.music = document.getElementById(musicname);
        this.currentTime = 0;
        this.music.addEventListener('ended', function(){this.currentTime = 0; this.play();},false);
        this.music.play();
    }
	
  this.playsound = function(soundname)
    {
        this.sound = clone(document.getElementById(soundname));
        this.currentTime = 0;
        //this.sound.addEventListener('ended', function(){   },false);
        this.sound.play();
    }
    
  this.stopmusic = function()
    {
        this.music.pause();
    }
}

	
var soundmanager = new soundmanager();
//soundmanager.init();

