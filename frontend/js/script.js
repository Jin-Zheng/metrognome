// jshint esversion: 6
(function(){
    "use strict";
    window.addEventListener('load', function(){
        var audio = new Crunker();
        var sequencerState = {};
        // Frontend tutorial src: https://github.com/renasboy/simple-audio-sequencer/blob/master/index.html
        // Audio Files storage and default files
        var audioFiles = {
            s0: [new Audio("/file/kick1.mp3"), 'Bass', "/file/kick1.mp3"], // IM SURE STORING THIS IN LOCALSTORAGE IS A SECURITY HAZARD
            s1: [new Audio("/file/snare.mp3"), 'Snare', "/file/snare.mp3"],
            s2: [new Audio("/file/rimshot.mp3"), 'Rim', "/file/rimshot.mp3"],
            s3: [new Audio("/file/cl_hihat.mp3"), 'HiHat', "/file/cl_hihat.mp3"],
            s4: [new Audio("/file/tom1.mp3"), 'Tom', "/file/tom1.mp3"],
            s5: [new Audio("/file/crashcym.mp3"), 'Crash', "/file/crashcym.mp3"]
        };

        // Key of the audioFile which is being changed.
        var currChange = '';

        //src: https://stackoverflow.com/questions/5116929/get-clicked-li-from-ul-onclick
        function getEventTarget(e) {
            e = e || window.event;
            return e.target || e.srcElement;
        }

        // Create a sequencer object
        var Sequencer = function () {
            var size = 'xl';
            var self = this; // This is needed to reference its own functions recursively
            var looping = false;
            var beat = 0;
            var tempo = 120;
            var volume = 100;
            var steps = 16;

            this.stateInit = function(){ // ADD SAVING TEMPO AND VOLUME TO LOCAL STORAGE TOO ******* REMIND ME IF SOMEONE SEES THIS
                var storageState = JSON.parse(localStorage.getItem("seqState"));
                if (storageState == null){
                    for (var i in audioFiles){
                        sequencerState[i] = [audioFiles[i], {}];
                        for (var j = 0; j < steps; j++){
                            sequencerState[i][1]['step' + j] = false;
                        }
                    }
                    localStorage.setItem("seqState", JSON.stringify(sequencerState));
                }
                else {
                    sequencerState = storageState;
                }
            }

            //Load the content of modal #choose_file
            this.loadFilePicker = function(){
                api.getFiles(function(err, files){
                    if (err) return alert(err);
                    var draw = `<ul id="filesList" class="list-group">`;
                    for (var i in files){
                        draw += `<li id=${files[i].filename} class="list-group-item list-group-item-action" data-dismiss="modal">${files[i].metadata.title}</li>`
                    }
                    draw += `</ul>`;
                    document.querySelector('#displayFiles').innerHTML = draw;

                    document.querySelector('#filesList').addEventListener('click', function(e){
                        var target = getEventTarget(e);
                        audioFiles[currChange] = [new Audio('file/' + target.id), target.innerHTML, 'file/' + target.id]
                        sequencerState[currChange][0] = audioFiles[currChange];
                        localStorage.setItem("seqState", JSON.stringify(sequencerState));
                        self.stateInit();
                        self.drawSequencer(sequencerState);
                    });
                });
            }

            //Load the content of modal #delete_file
            this.loadDeleteFilePicker = function(){
                api.getFiles(function(err, files){
                    if (err) return alert(err);
                    var draw = `<ul id="deleteFilesList" class="list-group">`;
                    for (var i in files){
                        draw += `<li id=${files[i].filename} class="list-group-item list-group-item-action" data-dismiss="modal">${files[i].metadata.title}</li>`
                    }
                    draw += `</ul>`;
                    document.querySelector('#displayUserFiles').innerHTML = draw;

                    document.querySelector('#deleteFilesList').addEventListener('click', function(e){
                        var target = getEventTarget(e);
                        console.log(target) // Shit, cant work on this rn, need to account for if a beat is using one of the deleted sound files
                    });
                });
            }

            // Draw the main sequencer element
            this.drawSequencer = function(ss){
                // Set this sequencer's audioFiles
                for (var i in audioFiles){
                    audioFiles[i] = [new Audio(ss[i][0][2]), ss[i][0][1], ss[i][0][2]]
                }

                var sequencer = document.querySelector('#sequencer');
                var draw = ``;
                // Draw row
                for (var i in audioFiles){
                    draw += `<div id=${i} class="row m-1">`;
                    // audioFile playing + controls
                    draw +=`<button type="button" class="btn btn-custom change btn-change" id=${i + "change"} data-toggle="modal" data-target="#choose_file"></button>
                    <div id="filename" class="text-truncate btn btn-custom col-2 text-left mr-2">
                        ${audioFiles[i][1]}
                    </div>`;
                    // steps
                    for (var j = 0; j < steps; j++){
                        draw += `<div id=${'step' + j} class="sequencer_step-xl btn col-auto color-4"></div>`;
                    }
                    draw += '</div>';
                    sequencer.innerHTML = draw;
                }

                // load existing sequencerState
                for (var i in ss){
                    for (var j in ss[i][1]){
                        if (ss[i][1][j]){
                            document.querySelector('#' + i + ' #' + j).classList.toggle('play')
                        }
                    }
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
                        self.loadFilePicker();
                    });
                })
                document.querySelectorAll('.sequencer_step-xl').forEach(function(elmt){
                    elmt.onmouseenter = function(e){
                        if(e.buttons ==1){
                            if(!this.classList.contains('play')){
                                sequencerState[elmt.parentNode.id][1][elmt.id] = !sequencerState[elmt.parentNode.id][1][elmt.id];
                                this.classList.add('play');
                            }
                            else{
                                sequencerState[elmt.parentNode.id][1][elmt.id] = !sequencerState[elmt.parentNode.id][1][elmt.id];
                                this.classList.remove('play');
                            }
                        }
                    }
                    elmt.addEventListener('click', function () {
                        sequencerState[elmt.parentNode.id][1][elmt.id] = !ss[elmt.parentNode.id][1][elmt.id];
                        this.classList.toggle('play');
                        localStorage.setItem('seqState', JSON.stringify(sequencerState));
                    });
                });
            }

            // Reset the sequencer
            this.reset = function(){
                // visualizer
                for (var i in audioFiles){
                    for (var j = 0 ; j < steps; j++){
                        document.querySelector('#' + i + ' #step' + j).classList.remove('playing');
                    }
                }

                if (document.querySelector('#playpause').classList.contains('btn-pause')){
                    document.querySelector('#playpause').classList.toggle('btn-play');
                    document.querySelector('#playpause').classList.toggle('btn-pause');
                }

                document.querySelectorAll('.play').forEach(function (elmt) {
                    sequencerState[elmt.parentNode.id][1][elmt.id] = false;
                    elmt.classList.remove('play');
                    localStorage.setItem('seqState', JSON.stringify(sequencerState));
                });
            }

            this.setVolume = function(volume){
                var btn = document.querySelector('#volume_button');
                if (volume > 50 && volume <= 100){
                    btn.classList.add('btn-volume1');
                    btn.classList.remove('btn-mute', 'btn-volume0');
                }else if (volume <= 50 && volume > 0){
                    btn.classList.add('btn-volume0');
                    btn.classList.remove('btn-mute', 'btn-volume1');
                } else {
                    btn.classList.add('btn-mute');
                    btn.classList.remove('btn-volume0', 'btn-volume1');
                }
                for (var i in audioFiles){
                    audioFiles[i][0].volume = parseInt(volume) / 100;
                }
            }

            // Step through the sequencer
            this.step = function(){
                if (!looping) return;

                // Loop through rows and play if column contains class play
                for (var j in audioFiles){
                    // visualizer
                    var playing = document.querySelector('#' + j + ' #step' + beat);
                    var prev;
                    if (beat > 0) {
                        prev = document.querySelector('#' + j + ' #step' + (beat - 1));
                        if (prev){
                            prev.classList.toggle('playing');
                        }
                    }
                    if (beat <= steps - 1) {
                        document.querySelector('#' + j + ' #step' + (steps - 1)).classList.remove('playing');
                    }
                    playing.classList.toggle('playing');


                    var play = document.querySelector('#' + j + ' #step' + beat + '.play');
                    if (play) {
                        play.parentNode.click();
                    }
                };

                if (beat < steps - 1) beat++;
                else beat = 0;
            }

            // Draw the control panel element
            this.drawController = function(){
                var controller = document.querySelector('#controller');
                var draw = `
                    <div class="form-inline col-12">
                        <div class="color-1-text col-1 mr-4">Tempo:<span id="tempo_val">${tempo}</span></div>
                        <input id="tempo" class="slider mr-2" type="range" min="5" max="240" value="" step="5">
                        <div id="previous" class="btn btn-custom controller btn-previous mr-1"></div>
                        <div id="playpause" class="btn btn-custom controller btn-play mr-1"></div>
                        <div id="volume_button" class="btn btn-custom controller btn-volume1 mr-2"></div>
                        <div>
                            <input id="volume" class="slider mr-2" type="range" min="0" max="100" value="100">
                        </div>
                        <div id="clear" class="btn btn-custom offset-5 p-1">Clear</div>
                    </div>`;
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
                document.querySelector('#clear').addEventListener('click', function () {
                    clearInterval(looping);
                    looping = false;
                    self.reset();
                    beat = 0;
                })
                document.querySelector('#previous').addEventListener('click', function () {
                    beat = 0;

                    // visualizer
                    for (var j in audioFiles){
                        for (var i = 0; i < steps; i++){
                            document.querySelector('#' + j + ' #step' + i).classList.remove('playing');
                        }
                    }
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
            }

            // User options
            this.drawUserDeck = function(){
                var userDeck = document.querySelector('#userdeck'); // dropdown load beats | delete soundfiles | delete beat
                var draw = '<div class="form-inline col-12">';
                draw += `<div class="dropdown">
                    <button class="btn btn-custom dropdown-toggle" type="button" data-toggle="dropdown">Load your beats
                    <span class="caret"></span></button>
                <ul id="loadBeats" class="dropdown-menu"></ul>
                </div>`
                //draw +=`<button type="button" id="deleteSound" class="btn btn-custom mr-2" data-toggle="modal" data-target="#delete_file">delete</button>`
                draw +=`
                    <button type="button" id="upload" class="btn btn-custom controller btn-upload mr-2 offset-8" data-toggle="modal" data-target="#upload_modal"></button>
                    <button type="button" id="save" class="btn btn-custom controller btn-save mr-2" data-toggle="collapse" data-target="#save_form"></button>
                    <button type="button" id="postBeat" class="btn btn-custom controller btn-post"></button>

                    <div id="save_form" class="collapse offset-8 col-4">
                        <form>
                            <div class="input-group">
                              <input type="text" id="beat_title" class="form-control" placeholder="Title" required/>
                              <input type="text" id="beat_description" class="form-control mr-1" placeholder="Description"/>
                              <div class="row justify-content-center">
                                  <button id="beat_submit" type="submit" class="btn input-group-append btn-custom">Submit</button>
                              </div>
                            </div>
                        </form>
                    </div>
                `
                    //<button type="button" id="download" class="btn btn-custom mr-2">Download</button>
                draw += '</div>';
                userDeck.innerHTML = draw;

                // load user beats
                api.getPrivateBeats(function(err, beats){
                    if (err) return alert(err);
                    var loadBeats ='';
                    for (var i in beats){
                        loadBeats += `<li id=${beats[i][0]} class="list-group-item list-group-item-action">${beats[i][1]}</li>`
                    }
                    document.querySelector('#loadBeats').innerHTML = loadBeats;

                    document.querySelector('#loadBeats').addEventListener('click', function(e) {
                        api.getBeat(e.target.id, function(err, beat){
                            if (err) return alert(err);
                            sequencerState = beat.beatSequence;
                            self.tempo = beat.tempo;
                            self.drawSequencer(sequencerState);
                            self.drawController();
                        })
                    });
                });

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
                document.querySelector('#postBeat').addEventListener('click',function(e){
                    e.preventDefault();
                    api.postBeat(sequencerState,tempo,function(err,result){
                        if(err) return alert(err);
                        else{
                            alert('posted!');
                        }
                    });
                });
                /*document.querySelector('#download').addEventListener('click',function(e){
                    e.preventDefault();
                    var exportFile;
                    var stepsToExport = [];
                    var stepFiles = [];
                    for (var i = 0; i < steps - 1; i ++){
                        stepFiles = [];
                        for (var j in sequencerState){
                            if (sequencerState[j][1]['step' + i]){
                                stepFiles.push(sequencerState[j][0][2]);
                            }
                        }
                        if (stepFiles.length != 0 && stepFiles !== undefined){
                            audio.fetchAudio(stepFiles)
                            .then(buffers => audio.mergeAudio(buffers))
                            .then(merged => audio.export(merged, 'audio/mp3'))
                            .then(output => {
                                stepsToExport.push(output.element)
                            })
                            .catch (error =>
                                alert(error)
                            )
                        }
                    }
                    setTimeout(function(){
                        audio.concatAudio(stepsToExport)
                        .then (output => {
                            document.body.append(output.element)
                        })
                    }, 5000);

                });*/

                /*document.querySelector('#deleteSound').addEventListener('click', function(){
                    self.loadDeleteFilePicker();
                })*/
            }
        }

        //----------INIT----------
        var initSequencer = new Sequencer();
        initSequencer.stateInit();
        initSequencer.drawSequencer(sequencerState);
        initSequencer.drawController();
        if ((api.getCookie("username") !== null && api.getCookie("username") !== '') || (api.getCookie("facebookID") !== null && api.getCookie("facebookID") !== '')){
            initSequencer.drawUserDeck();
        }

    });
})();