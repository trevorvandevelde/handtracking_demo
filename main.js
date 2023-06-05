import * as THREE from 'https://unpkg.com/three/build/three.module.js';

const videoElement = document.getElementsByClassName('input_video')[0];

var red_light = document.getElementById("red_light");
var green_light = document.getElementById("green_light");
red_light.opacity = .1;
green_light.opacity = .1;


let detections = {};

//if you wanted to use three.js objects
const cubeLeft = new THREE.Mesh( new THREE.SphereGeometry(.3, 8, 8) , new THREE.MeshBasicMaterial( {color: 0x00ff00} )); 
cubeLeft.position.set(.5, .8, 0);
cubeLeft.visible = false;

const cubeRight = new THREE.Mesh( new THREE.SphereGeometry(.3, 8, 8) , new THREE.MeshBasicMaterial( {color: 0xff0000} )); 
cubeRight.position.set(-.5, .8, 0);
cubeRight.visible = false;





function onResults(results) {
  detections = results;
  cubeLeft.visible = false;
  cubeRight.visible = false;
  red_light.style.opacity = .1;
  green_light.style.opacity = .1;

  if (results.multiHandedness){
    for (const handednessLandmarks of results.multiHandedness){

        if (handednessLandmarks.label == 'Right' ){
            //cubeLeft.visible = true;
            green_light.style.opacity = 1; //show green light.
        } else {
            //cubeRight.visible = true;
            red_light.style.opacity = 1; // show red light.
        }
    }
  }
}

//mediapipes hand tracking

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 4, //set for 4 hands max
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResults);


const cameraHand = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480
});
cameraHand.start();


/////////////////////////Video Stream

var videoTexture,videoSettings, rawVideoStream, videoStream, audioTrack;
var renderer, scene, camera;

navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(function(stream){
    rawVideoStream = stream;
    videoSettings=stream.getVideoTracks()[0].getSettings();

    videoTexture = new THREE.VideoTexture(videoElement);

    init();

}).catch(function(error){console.error(error);});


function init() {
	let w = videoSettings.width;
	let h = videoSettings.height;

    //renderer setup
	renderer = new THREE.WebGLRenderer({antialias: false});
	renderer.setSize(w, h);

    var container = document.getElementsByClassName("container")[0];
	container.appendChild(renderer.domElement);

	//Scene setup:
	scene = new THREE.Scene();
	
	let display = new THREE.Mesh(
		new THREE.PlaneGeometry(2, 2),
		new THREE.MeshBasicMaterial({map: videoTexture})
	);
	scene.add(display);
	
	//Camera setup:
	camera = new THREE.OrthographicCamera(-1,1,1,-1);
	camera.position.z = 10;
	scene.add(camera);
    

    //scene.add( cubeLeft );
    //scene.add( cubeRight );

	videoStream = renderer.domElement.captureStream(videoSettings.frameRate);

    setInterval(function() {

        renderer.render(scene, camera);
    
    }, 500./videoSettings.frameRate);

    
}


