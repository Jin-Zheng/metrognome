// jshint esversion: 6
(function(){
	"use strict";

	//function to trigger animation of the dots when the arrows are clicked
	function animateDot(increment) {
		var dots = [].slice.call(document.querySelectorAll( '.dotstyle > ul > li' ));
		var currentDot = document.querySelector('li.current');
		var old = dots.indexOf(currentDot);
		var current = Math.min(dots.length-1, Math.max(0, old + increment));
		if (old !== current) {
			dots[old].className="";
			if (old > current) {
				dots[current].className += " current-from-right";
			}
			setTimeout( function() {
				dots[current].className += " current";
			}, 25);
		}
	}
	
	
		
	var Sequencer = function () {
			
		var sequencerState = {};
			//use beat sequencer to load the beats here
		var audioFiles = {
		s0: [new Audio("/file/kick1.mp3"), 'Bass', "/file/kick1.mp3"],
		s1: [new Audio("/file/snare.mp3"), 'Snare',"/file/snare.mp3"],
		s2: [new Audio("/file/rimshot.mp3"), 'Rim',"/file/rimshot.mp3"],
		s3: [new Audio("/file/cl_hihat.mp3"), 'HiHat',"/file/cl_hihat.mp3"],
		s4: [new Audio("/file/tom1.mp3"), 'Tom',"/file/tom1.mp3"],
		s5: [new Audio("/file/crashcym.mp3"), 'Crash',"/file/crashcym.mp3"]
		};			           
			
			
		var size = 'xl';
		var self = this; // This is needed to reference its own functions recursively
		var looping = false;
		var beat = 0;
		var tempo = 120;
		var volume = 100;
		var steps = 16;

			// Draw the main sequencer element
		this.drawSequencer = function(){
			var sequencer = document.querySelector('#sequencer');
			var draw = ``;
			// Draw row
			for (var i in audioFiles){
				sequencerState[i] = [audioFiles[i], {}];
				draw += `<div id=${i} class="row m-1">`;
				// audioFile playing + controls
				draw +=`
				<div id="filename" class="text-truncate btn btn-custom col-2 text-left mr-2">
					${audioFiles[i][1]}
				</div>`;
				// steps
				for (var j = 0; j < steps; j++){
					draw += `<div id=${'step' + j} class="sequencer_step-xl btn col-auto color-4"></div>`;
					sequencerState[i][1]['step'+j]= false;
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
					sequencerState[elmt.parentNode.id][1][elmt.id] = !sequencerState[elmt.parentNode.id][1][elmt.id];
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
				<div class="form-inline col-12">
					<div class="color-1-text mr-2">Tempo: <span id="tempo_val">${tempo}</span></div>
					<input id="tempo" class="slider mr-2" type="range" min="5" max="240" value="" step="5">
					<div id="previous" class="btn btn-custom controller btn-previous"></div>
					<div id="playpause" class="btn btn-custom controller btn-play mr-1"></div>
					<div id="volume_button" class="btn btn-custom controller btn-volume1 mr-2"></div>
					<div>
						<input id="volume" class="slider" type="range" min="0" max="100" value="100">
					</div>
					<div class="col-5"></div>`
				if ((api.getCookie("facebookID") !== null && api.getCookie("facebookID") !== '' || (api.getCookie("username") !== null && api.getCookie("username") !== ''))){
					draw +=`
						<button type="button" id="save" class="btn btn-custom controller btn-save p-1" data-toggle="collapse" data-target="#save_form"></button>
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
			draw += `<div id="reset" class="btn btn-custom p-1">Clear</div></div>`;
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
			});
			document.querySelector('#reset').addEventListener('click', function () {
				clearInterval(looping);
				looping = false;
				self.reset();
				beat = 0;
			});
			document.querySelector('#previous').addEventListener('click', function () {
				beat = 0;
			});
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
			if ((api.getCookie("facebookID") !== null && api.getCookie("facebookID") !== '' || (api.getCookie("username") !== null && api.getCookie("username") !== ''))){
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
			
		this.playBeat = function(beatInfo){
			//self.drawSequencer();
			document.querySelector('#reset').click();
			//reset the audioFiles with saved sound
			audioFiles = {
				s0: [new Audio(beatInfo.beatSequence['s0'][0][2]),beatInfo.beatSequence['s0'][0][1],beatInfo.beatSequence['s0'][0][2]],
				s1: [new Audio(beatInfo.beatSequence['s1'][0][2]),beatInfo.beatSequence['s1'][0][1],beatInfo.beatSequence['s0'][0][2]],
				s2: [new Audio(beatInfo.beatSequence['s2'][0][2]),beatInfo.beatSequence['s2'][0][1],beatInfo.beatSequence['s0'][0][2]],
				s3: [new Audio(beatInfo.beatSequence['s3'][0][2]),beatInfo.beatSequence['s3'][0][1],beatInfo.beatSequence['s0'][0][2]],
				s4: [new Audio(beatInfo.beatSequence['s4'][0][2]),beatInfo.beatSequence['s4'][0][1],beatInfo.beatSequence['s0'][0][2]],
				s5: [new Audio(beatInfo.beatSequence['s5'][0][2]),beatInfo.beatSequence['s5'][0][1],beatInfo.beatSequence['s0'][0][2]]
			};
			self.drawController();
			self.drawSequencer();
			tempo = beatInfo.tempo;
			if(looping){
				clearInterval(looping);
				looping = setInterval(self.step, 60000/tempo/4);
			}
			document.querySelector('#tempo_val').innerHTML =tempo;
			var playButton = document.querySelector('#playpause');
			//if play button shows just clear the beat selection
			if(playButton.classList.contains('btn-play')){
				document.querySelector('#reset').click();
			}
			if(playButton.classList.contains('btn-pause')){
				playButton.click();
				document.querySelector('#reset').click();
			}
			
				
			//loop through sequenced beats and update html
			for(var i in beatInfo.beatSequence){
				for(var j in beatInfo.beatSequence[i][1]){
					//console.log(beatInfo.beatSequence[i][1][j]);
					if(beatInfo.beatSequence[i][1][j]){
						document.querySelector('#'+i).querySelector('#'+j).classList.add('play');
					}
				
				}
			}
			playButton.click();
		
		};

	};
	
		var app = angular.module("popBeats", []);
		var initSequencer = new Sequencer();
		initSequencer.drawSequencer();
		initSequencer.drawController();

		
		app.controller("beatController", function($scope, $location) {
			
			api.getPublicBeats(function(err,data){
				if(err) console.log(err);
				else{ 
					$scope.$apply(function(){
						$scope.superBeats = data;
						$scope.beats = [];
						$scope.currentPage = 0;
						$scope.numOfDots = [];//using this array to create the dot pagination
									
			
						$scope.Dots = Math.min(Math.ceil($scope.superBeats.length / 4),6);
						
						for(var i = 1;i<$scope.Dots;i++){
							$scope.numOfDots.push(i);
						} 
						$scope.$watch('currentPage', function() {  
							$scope.beats = $scope.superBeats.slice($scope.currentPage*4,$scope.currentPage*4+4);
						});
						
						
						//using this for left button pagination
						$scope.goBack = function () {
							$scope.currentPage = Math.max(0, $scope.currentPage - 1);
							animateDot(-1);
						};
						
						//using this for right button pagination
						$scope.goForward = function () {
							$scope.currentPage = Math.min($scope.Dots-1, $scope.currentPage +1);
							animateDot(1);
						};
			
						//using this for dots pagination i.e. when they click on the dots themselves for pagination
						$scope.goToPage = function(dot) {
							$scope.currentPage = dot;
						};
						
						//used to update what beats are shown on the page currently
						
						$scope.sendLike = function(id){
							api.upvote(id, function(err,data){
								if(err) console.log(err);
							});
							alert('Liked!');
						};
						
						$scope.playBeat = function(id){
							//based on the the beat clicked, update the sequencer with the correct buttons pressed and allow user to playBeat
							//here we will re-use the function in script.js file to draw/sequences the beats.
							api.getBeat(id, function(err,results){
								if(err) return console.log(err);
								else{
									
									var beatInfo = results;
									var initSequencer = new Sequencer();
									initSequencer.playBeat(beatInfo);
			
			
								}
							});
						
						};
						$scope.goToComments = function(id) {
							var url =$location.absUrl().split("popular")[0] + "comments.html?id=" + id; 
							window.location = url;
							
						};
					});
				}
			});
		});
})();