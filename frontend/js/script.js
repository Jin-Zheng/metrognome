// jshint esversion: 6
(function(){
    "use strict";
    if (!api.getCurrentUser()){
        document.querySelector('#signout_button').style.visibility = 'hidden';
        document.querySelector('#signin_button').style.visibility = 'visible';
        document.querySelector('#signin_button').style.position = 'absolute';
    } else{
        document.querySelector('#signout_button').style.visibility = 'visible';
        document.querySelector('#signin_button').style.visibility = 'hidden';
        document.querySelector('#signout_button').style.position = 'absolute';
    }
    // Extremely useful source
    //https://stackoverflow.com/questions/31060642/preload-multiple-audio-files
    /*var audio;
    var i = 0;

    var words = ["nua","ag","dul","freisin"];

    function play()
    {
        audio.src = "http://www.teanglann.ie/CanC/"+words[i]+".mp3";
        audio.load();
        audio.play();
        i = i + 1;
    }

    function aud_play_pause()
    {
        if (audio.paused) {
            play();
            audio.onended = play;
            $('#button1').html("Pause");
        } else {
            audio.pause();
            $('#button1').html("Play");
        }
    }

    $(document).on("pagebeforeshow","#pageone",function(event)
    {
        audio = document.getElementById("audio");
    }); */

    // Looping and playback example

    /*var audioFiles = [
        "http://www.teanglann.ie/CanC/nua.mp3",
        "http://www.teanglann.ie/CanC/ag.mp3",
        "http://www.teanglann.ie/CanC/dul.mp3",
        "http://www.teanglann.ie/CanC/freisin.mp3"
    ];

    function preloadAudio(url) {
        var audio = new Audio();
        // once this file loads, it will call loadedAudio()
        // the file will be kept by the browser as cache
        audio.addEventListener('canplaythrough', loadedAudio, false);
        audio.src = url;
    }
    var loaded = 0;
    function loadedAudio() {
        // this will be called every time an audio file is loaded
        // we keep track of the loaded files vs the requested files
        loaded++;
        if (loaded == audioFiles.length){
        	// all have loaded
        	init();
        }
    }
    var player = document.getElementById('test');
    function play(index) {
        player.src = audioFiles[index];
        player.play();
    }
    function init() {
        // do your stuff here, audio has been loaded
        // for example, play all files one after the other
        var i = 0;
        // once the player ends, play the next one
        player.onended = function() {
        	i++;
            if (i >= audioFiles.length) {
                // end
                return;
            }
        	play(i);
        };
        // play the first file
        play(i);
    }

    // we start preloading all the audio files
    for (var i in audioFiles) {
        preloadAudio(audioFiles[i]);
    }*/

    /* My hosted audio files
    "https://vocaroo.com/i/s13GeqTGZJqg",
    "https://vocaroo.com/i/s0ChLDfqZolp",
    "https://vocaroo.com/i/s0yPWeS2yt4r"*/
    var audio = new Audio('https://drive.google.com/uc?export=download&id=1LH3GpjiHEg_H9E3ywaNyHpEwQfliuZLi');
    audio.load();
    document.getElementById('test').addEventListener('click', function(e){
        audio.play();
    });

})();