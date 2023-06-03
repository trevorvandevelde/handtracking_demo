import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { Hands } from '@mediapipe/hands';

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
//const canvasCtx = canvasElement.getContext('2d');

let detections = {};

const cubeLeft = new THREE.Mesh( new THREE.SphereGeometry(.3, 8, 8) , new THREE.MeshBasicMaterial( {color: 0x00ff00} )); 
cubeLeft.position.set(.5, .8, 0);
cubeLeft.visible = false;




const cubeRight = new THREE.Mesh( new THREE.SphereGeometry(.3, 8, 8) , new THREE.MeshBasicMaterial( {color: 0xff0000} )); 
cubeRight.position.set(-.5, .8, 0);
cubeRight.visible = false;

const pointLight = new THREE.PointLight( 0xff0000, 1, 100 );
pointLight.position.set(0, 0, 0 );

pointLight.visible = false;
    
const sphereSize = 2;
const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );





function onResults(results) {
  detections = results;
  cubeLeft.visible = false;
  cubeRight.visible = false;

  pointLight.visible = false;
  if (results.multiHandedness){
    for (const handednessLandmarks of results.multiHandedness){
        //console.log(handednessLandmarks.label);
        if (handednessLandmarks.label == 'Right' ){

            cubeLeft.visible = true;
            pointLight.visible = true;
            //if right hand add red light bulb
        } else {

            cubeRight.visible = true;
            //cubeLeft.visible = false;
            //if left hand add green light bulb
        }
    }
  }
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 2,
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
//let gui = new GUI();


var renderer, scene, camera;

navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(function(stream){
    rawVideoStream = stream;
    videoSettings=stream.getVideoTracks()[0].getSettings();
    console.log("videoSettings: width=%d, height=%d, frameRate=%d", videoSettings.width, videoSettings.height, videoSettings.frameRate);
    //audioTrack = stream.getAudioTracks()[0];
    
    //making a sperate pure video stream is a workaround
    //let videoStream = new MediaStream(stream.getVideoTracks());

    videoTexture = new THREE.VideoTexture(videoElement);
    //videoTexture.minFilter = THREE.LinearFilter;
    init();

}).catch(function(error){console.error(error);});


function init() {
	let w = videoSettings.width;
	let h = videoSettings.height;

	//Renderer setup
	document.body.style = "overflow: hidden;";
	var container = document.createElement("div");
  
	document.body.appendChild(container);
	renderer = new THREE.WebGLRenderer({antialias: false});
	renderer.setSize(w, h);
   
	container.appendChild(renderer.domElement);

    var instructions = document.createTextNode("Raise Right Hand for Red. Raise Left Hand for Green");
    document.body.appendChild(instructions);


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

    //const camera = new THREE.PerspectiveCamera(
       // 75,
       // window.innerWidth / window.innerHeight,
       // 0.1,
       // 1000
    //)
    //camera.position.z = 7
    
    scene.add( cubeLeft );
    scene.add( cubeRight);


	
	videoStream = renderer.domElement.captureStream(videoSettings.frameRate);
    console.log("something should have happened");

    setInterval(function() {
        

        renderer.render(scene, camera);
    
    }, 500./videoSettings.frameRate);

    
}


