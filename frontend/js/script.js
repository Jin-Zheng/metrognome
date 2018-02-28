// jshint esversion: 6
(function(){
    "use strict";
    window.addEventListener('load', function(){

        if (!api.getCurrentUser()){
            document.querySelector('#signout_button').style.visibility = 'hidden';
            document.querySelector('#signin_button').style.visibility = 'visible';
            document.querySelector('#signin_button').style.position = 'absolute';
        } else{
            document.querySelector('#signout_button').style.visibility = 'visible';
            document.querySelector('#signin_button').style.visibility = 'hidden';
            document.querySelector('#signout_button').style.position = 'absolute';
        }

        // Show login modal when clicked.
        var modal = document.querySelector('#loginButton');
        if (modal) {
            modal.addEventListener('click', function() {
                modal.setAttribute('data-toggle', 'modal');
                modal.setAttribute('data-target', '#myModal');
            });
        }
    });
    // Extremely useful source
    //https://stackoverflow.com/questions/31060642/preload-multiple-audio-files

    var audioFiles = [
        new Audio("/file/808bd01.mp3"),
        new Audio("/file/808bd09.mp3"),
        new Audio("/file/808sd02.mp3")
    ];

    /*// How to loop but hardcoded
    audioFiles[0].addEventListener('ended', function(){
        audioFiles[1].play();
    });
    audioFiles[1].addEventListener('ended', function(){
        audioFiles[2].play();
    });
    audioFiles[2].addEventListener('ended', function(){
        audioFiles[0].play();
    });*/

    document.getElementById('test').addEventListener('click', function(e){
        /*// This plays all sounds at once.
        for (var i in audioFiles) {
            audioFiles[i].play();
        }*/

        audioFiles[0].play();
    });

    document.querySelector('#upload_form').addEventListener('submit', function(e){
        e.preventDefault();
        var file = document.getElementById('file').files[0];
        api.upload(file, function(err, file){
            if (err) return alert(err);
            console.log("Stored in DB");
        });
        document.querySelector('#upload_form').reset();
    });

})();