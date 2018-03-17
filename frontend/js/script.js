// jshint esversion: 6
(function(){
    "use strict";
    window.addEventListener('load', function(){
        if (!api.getCurrentUser()){
            document.querySelector('#signout_button').classList.add("invisible");
            document.querySelector('#profileLink').classList.add("invisible");
            document.querySelector('#signin_button').classList.remove("invisible");

        } else{
            document.querySelector('#signout_button').classList.remove("invisible");
            document.querySelector('#profileLink').classList.remove("invisible");
            document.querySelector('#signin_button').classList.add("invisible");
        }

        var sequencerState = {}; // {audioFileName: [audioFile, [steps]}
        // Frontend tutorial src: https://github.com/renasboy/simple-audio-sequencer/blob/master/index.html
        // Audio Files storage and default files
        var audioFiles = {
            s0: [new Audio("/file/kick1.mp3"), 'Bass'],
            s1: [new Audio("/file/snare.mp3"), 'Snare'],
            s2: [new Audio("/file/rimshot.mp3"), 'Rim'],
            s3: [new Audio("/file/cl_hihat.mp3"), 'HiHat'],
            s4: [new Audio("/file/tom1.mp3"), 'Tom'],
            s5: [new Audio("/file/crashcym.mp3"), 'Crash']
        };
        // Key of the audioFile which is being changed.
        var currChange = '';


        //src: https://stackoverflow.com/questions/5116929/get-clicked-li-from-ul-onclick
        function getEventTarget(e) {
            e = e || window.event;
            return e.target || e.srcElement;
        }

        //Load the content of modal #choose_file
        var loadFilePicker = function(){
            api.getFiles(function(err, files){
                if (err) return alert(err);
                var draw = `<ul id="filesList" class="list-group">`;
                for (var i in files){
                    draw += `<li id=${files[i].filename} class="list-group-item list-group-item-action" data-dismiss="modal">
                        ${files[i].metadata.title}
                    </li>`
                }
                draw += `</ul>`;
                document.querySelector('#displayFiles').innerHTML = draw;

                document.querySelector('#filesList').addEventListener('click', function(e){
                    var target = getEventTarget(e);
                    audioFiles[currChange] = [new Audio('file/' + target.id), target.innerHTML]
                    initSequencer.drawSequencer();
                });
            });
        }


        // Create a sequencer object
        var Sequencer = function () {
            var self = this; // This is needed to reference its own functions recursively
            var looping = false;
            var beat = 0;
            var tempo = 120;
            var volume = 100;
            var steps = 16;

            // Draw the main sequencer element
            this.drawSequencer = function(){
                var sequencer = document.querySelector('#sequencer');
                var draw = '';
                // Draw row
                for (var i in audioFiles){
                    sequencerState[i] = [audioFiles[i], []];
                    draw += `<div id=${i} class="row">`;
                    // audioFile playing + controls
                    draw +=
                    `<div id="filename" class="text-truncate btn col-2 text-left">
                        <button type="button" class="btn btn-light controller btn-change" id=${i + "change"} data-toggle="modal" data-target="#choose_file"></button>
                        ${audioFiles[i][1]}
                    </div>`;
                    // steps
                    for (var j = 0; j < steps; j++){
                        draw += `<div id=${'step' + j} class="sequencer_step btn"></div>`;
                        sequencerState[i][1].push(false);
                    }
                    draw += '</div>';
                    sequencer.innerHTML = draw;
                }

                // Add event listeners
                // Can't loop this because of closure? or something like that
                document.querySelector('#s0').addEventListener('click', function(){
                    audioFiles.s0[0].currentTime = 0;
                    audioFiles.s0[0].play();
                });
                document.querySelector('#s1').addEventListener('click', function(){
                    audioFiles.s1[0].currentTime = 0;
                    audioFiles.s1[0].play();
                });
                document.querySelector('#s2').addEventListener('click', function(){
                    audioFiles.s2[0].currentTime = 0;
                    audioFiles.s2[0].play();
                });
                document.querySelector('#s3').addEventListener('click', function(){
                    audioFiles.s3[0].currentTime = 0;
                    audioFiles.s3[0].play();
                });
                document.querySelector('#s4').addEventListener('click', function(){
                    audioFiles.s4[0].currentTime = 0;
                    audioFiles.s4[0].play();
                });
                document.querySelector('#s5').addEventListener('click', function(){
                    audioFiles.s5[0].currentTime = 0;
                    audioFiles.s5[0].play();
                });
                document.querySelectorAll('.btn-change').forEach(function(elmt){
                    elmt.addEventListener('click', function(){
                        currChange = elmt.id.split('change')[0];
                        loadFilePicker();
                    });
                })
                document.querySelectorAll('.sequencer_step').forEach(function(elmt){
                    elmt.addEventListener('click', function () {
                        sequencerState[elmt.parentNode.id][1][elmt.id.split('step')[1]] = true;
                        this.classList.toggle('play');
                    });
                });
            }

            // Reset the sequencer
            this.reset = function(){
                document.querySelectorAll('.play').forEach(function (elmt) {
                    sequencerState[elmt.parentNode.id][1][elmt.id.split('step')[1]] = false;
                    elmt.classList.remove('play');
                });
            }

            this.setVolume = function(volume){
                var btn = document.querySelector('#volume_button');
                if(volume >= 67){
                    btn.classList.add('btn-volume2');
                    btn.classList.remove('btn-mute', 'btn-volume0', 'btn-volume1');
                }else if (volume > 33 && volume < 67){
                    btn.classList.add('btn-volume1');
                    btn.classList.remove('btn-mute', 'btn-volume0', 'btn-volume2');
                }else if (volume <= 33 && volume > 0){
                    btn.classList.add('btn-volume0');
                    btn.classList.remove('btn-mute', 'btn-volume1', 'btn-volume2');
                } else {
                    btn.classList.add('btn-mute');
                    btn.classList.remove('btn-volume0', 'btn-volume1', 'btn-volume2');
                }
                for (var i in audioFiles){
                    audioFiles[i][0].volume = parseInt(volume) / 100;
                }
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
                        <div id="reset" class="btn btn-light controller btn-reset p-1"></div>
                        <div id="previous" class="btn btn-light controller btn-previous p-1"></div>
                        <div id="playpause" class="btn btn-light controller btn-play p-1"></div>
                        <div>
                          <input id="tempo" class="slider" type="range" min="5" max="240" value="" step="5">
                          <p>Tempo: <span id="tempo_val">${tempo}</span></p>
                        </div>
                        <div id="volume_button" class="btn btn-light controller btn-volume2 p-1"></div>
                        <div>
                            <input id="volume" class="slider" type="range" min="0" max="100" value="100">
                        </div>`
                    if (api.getCurrentUser() !== null && api.getCurrentUser() !== ''){
                        draw +=`
                            <button type="button" id="upload" class="btn btn-light controller btn-upload p-1" data-toggle="modal" data-target="#upload_modal"></button>
                            <button type="button" id="save" class="btn btn-light controller btn-save p-1" data-toggle="collapse" data-target="#save_form"></button>
                            <div id="save_form" class="collapse">
                                <form>
                                    <div class="input-group">
                                      <input type="text" id="beat_title" class="form-control" placeholder="Title" required/>
                                      <input type="text" id="beat_description" class="form-control" placeholder="Description"/>
                                      <div class="row justify-content-center">
                                          <button id="beat_submit" type="submit" class="btn">Submit</button>
                                      </div>
                                    </div>
                                </form>
                            </div>
                       `
                    }
                    draw += `</div>`;
                controller.innerHTML = draw;


                document.querySelector('#playpause').addEventListener('click', function () {
                    if (this.classList.contains('btn-play')){
                        this.classList.toggle('btn-play');
                        this.classList.toggle('btn-pause');
                        if (looping) {
                            return;
                        }
                        // tempo calculation found online
                        looping = setInterval(self.step, 60000 / tempo / 4);
                    } else{
                        this.classList.toggle('btn-play');
                        this.classList.toggle('btn-pause');
                        clearInterval(looping);
                        looping = false;
                    }
                })
                document.querySelector('#reset').addEventListener('click', function () {
                    clearInterval(looping);
                    looping = false;
                    self.reset();
                    beat = 0;
                })
                document.querySelector('#previous').addEventListener('click', function () {
                    beat = 0;
                })
                document.querySelector('#tempo').addEventListener('input', function(){
                    document.querySelector('#tempo_val').innerHTML = this.value;
                    tempo = this.value;
                    if (looping) {
                        clearInterval(looping);
                        looping = setInterval(self.step, 60000 / tempo / 4);
                    }
                });
                document.querySelector('#volume_button').addEventListener('click', function(){
                    if (document.querySelector('#volume_button').classList.contains('btn-mute')){
                        self.setVolume(volume);
                    } else{
                        self.setVolume(0);
                    }

                });
                document.querySelector('#volume').addEventListener('input', function(){
                    volume = this.value;
                    self.setVolume(volume);
                });
                if (api.getCurrentUser() !== null && api.getCurrentUser() !== ''){
                    document.querySelector('#upload_form').addEventListener('submit', function(e){
                        e.preventDefault();
                        var title = document.getElementById('upload_title').value;
                        var file = document.getElementById('upload_file').files[0];
                        document.querySelector('#upload_form').reset();
                        api.upload(title, file, function(err, file){
                            if (err) return alert(err);
                            console.log("Stored in DB");
                            document.querySelector('#upload_close').click();
                        });
                    });
                    document.querySelector('#save_form').addEventListener('submit', function(e){
                        e.preventDefault();
                        var title = document.querySelector('#beat_title').value;
                        var desc = document.querySelector('#beat_description').value;
                        api.saveBeat(sequencerState, tempo, title, desc, function(err, beat){
                            if (err) return alert(err);
                            alert('saved!')
                        });
                    });
                }
            }
        }

        //----------INIT----------
        var initSequencer = new Sequencer();
        initSequencer.drawSequencer();
        initSequencer.drawController();
    });
})();