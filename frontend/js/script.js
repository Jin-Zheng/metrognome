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

        // Frontend tutorial src: https://github.com/renasboy/simple-audio-sequencer/blob/master/index.html
        // Audio files stored here
        var audioFiles = {
            s0: new Audio("/file/kick1.mp3"),
            s1: new Audio("/file/snare.mp3"),
            s2: new Audio("/file/rimshot.mp3"),
            s3: new Audio("/file/cl_hihat.mp3"),
            s4: new Audio("/file/tom1.mp3"),
            s5: new Audio("/file/crashcym.mp3")
        };

        // Create a sequencer object
        var Sequencer = function () {
            var self = this; // This is needed to reference its own functions recursively
            var looping = false;
            var beat = 0;
            var tempo = 100;
            var steps = 16;

            // Draw the main sequencer element
            this.drawSequencer = function(){
                var sequencer = document.querySelector('#sequencer');
                var draw = '';
                // Draw row
                for (var i in audioFiles){
                    draw += `<div id=${i} class="row">`;
                    // Draw columns
                    // audioFile playing
                    draw += `<div id="filename" class="text-truncate btn col-1">${i}</div>`;
                    // steps
                    for (var j = 0; j < steps; j++){
                        draw += `<div id=${'step' + j} class="sequencer_step btn"></div>`;
                    }
                    draw += '</div>';
                    sequencer.innerHTML = draw;
                }

                // Add event listeners
                // Can't loop this because of closure? or something like that
                document.querySelector('#s0').addEventListener('click', function(){
                    audioFiles.s0.currentTime = 0;
                    audioFiles.s0.play();
                });
                document.querySelector('#s1').addEventListener('click', function(){
                    audioFiles.s1.currentTime = 0;
                    audioFiles.s1.play();
                });
                document.querySelector('#s2').addEventListener('click', function(){
                    audioFiles.s2.currentTime = 0;
                    audioFiles.s2.play();
                });
                document.querySelector('#s3').addEventListener('click', function(){
                    audioFiles.s3.currentTime = 0;
                    audioFiles.s3.play();
                });
                document.querySelector('#s4').addEventListener('click', function(){
                    audioFiles.s4.currentTime = 0;
                    audioFiles.s4.play();
                });
                document.querySelector('#s5').addEventListener('click', function(){
                    audioFiles.s5.currentTime = 0;
                    audioFiles.s5.play();
                });
                document.querySelectorAll('.sequencer_step').forEach(function(elmt){
                    elmt.addEventListener('click', function () {
                        this.classList.toggle('play');
                    });
                });
            }

            // Reset the sequencer
            this.reset = function(){
                document.querySelectorAll('.play').forEach(function (elmt) {
                    elmt.classList.remove('play');
                });
            }

            // Step through the sequencer
            this.step = function(){
                if (!looping) return;
                if (beat < steps - 1) beat++;
                else beat = 0;

                // Loop through rows and play if column contains class play
                for (var j in audioFiles){
                    var play = document.querySelector('#' + j + ' #step' + beat + '.play');
                    if (play) {
                        play.parentNode.click();
                    }
                };
            }

            // Draw the control panel element
            this.drawController = function(){
                var controller = document.querySelector('#controller');
                var draw = `
                    <div class="form-inline">
                      <label for="steps">Steps:</label>
                      <select id="steps" class="form-control">
                        <option>4</option>
                        <option>8</option>
                        <option>12</option>
                        <option>16</option>
                      </select>
                      <div id="rewind" class="btn btn-dark ">rewind</div>
                      <div id="play" class="btn btn-dark">play</div>
                      <div id="pause" class="btn btn-dark">pause</div>
                      <div id="reset" class="btn btn-dark">reset</div>
                      <div class="">tempo: <input id="tempo" type="range" min="1" max="300" value="" size="3"></div>
                    </div>

                `;
                controller.innerHTML = draw;


                document.querySelector('#play').addEventListener('click', function () {
                    if (looping) {
                        return;
                    }
                    // tempo calculation found online
                    looping = setInterval(self.step, 60000 / tempo / 4);
                })
                document.querySelector('#pause').addEventListener('click', function () {
                    clearInterval(looping);
                    looping = false;
                })
                document.querySelector('#reset').addEventListener('click', function () {
                    clearInterval(looping);
                    looping = false;
                    self.reset();
                    beat = 0;
                })
                document.querySelector('#rewind').addEventListener('click', function () {
                    beat = 0;
                })
                document.querySelector('#tempo').addEventListener('change', function () {
                    if (this.value > 1 && this.value < 300) {
                        tempo = this.value;
                    }
                    if (looping) {
                        clearInterval(looping);
                        looping = setInterval(self.step, 60000 / tempo / 4);
                    }
                });
                document.querySelector('#steps').addEventListener('change', function () {
                    steps = this.value;
                    self.drawSequencer();
                });
                document.querySelector('#tempo').value = tempo;
                document.querySelector('#steps').value = steps;
            }
        }

        var initSequencer = new Sequencer();
        initSequencer.drawSequencer();
        initSequencer.drawController();

        /*var uploadSoundForm = document.querySelector('#upload_form');
        if (uploadSoundForm) {
            uploadSoundForm.addEventListener('submit', function(e){
                e.preventDefault();
                var file = document.getElementById('file').files[0];
                api.upload(file, function(err, file){
                    if (err) return alert(err);
                    console.log("Stored in DB");
                });
                document.querySelector('#upload_form').reset();
            });
        }*/
    });
})();