var renderer, camera, controls;
var pointLight;
var scene, sceneMono, sceneColor;
var camera2;
var rtTexture;
var torus;
var gcontrols;

// blocker pass
// 1st pass: torus (colorWrite off)
// 2nd pass: column


// 
// render sceneMono to rtTexture (camera)
// render scene (rtTexture, with monochrome shader) to screen (camera2)
// render sceneMono (colorWrite off) (camera)
// render sceneColor (camera)

init();
animate();

function init()
{
	
	rtTexture = new THREE.WebGLRenderTarget( 
		1024, 1024, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat 
	});

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	renderer.setClearColor(0x888888);
	renderer.autoClear = false;

	camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 10000);
	camera.position.y = 0;
	camera.position.z = 400;
	camera.lookAt(new THREE.Vector3(0,0,0));

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	///////////////////////////////////////////////////////////////////////		
	sceneMono = new THREE.Scene();	
	pointLight = new THREE.PointLight(0xffffff, 1.0);
	pointLight.position.set(0, 300, 500);
	sceneMono.add (pointLight);

	torus = new THREE.Mesh(new THREE.TorusGeometry(10, 3, 16, 100),
	new THREE.MeshLambertMaterial({color:0x12ffee, 
		colorWrite:false
	}));
	torus.scale.set(3, 3, 3);
	torus.rotation.x = Math.PI/2;
	sceneMono.add(torus);
	
	gcontrols = {fade: 1.0};
	
	var gui = new dat.GUI();
	gui.domElement.id = 'gui';
	gui.add(gcontrols, 'fade', 0.1, 5.0);
	
	sceneColor = new THREE.Scene();
	/*
	var geometry = new THREE.ConeGeometry( 5, 20, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	var cone = new THREE.Mesh( geometry, material );
	scene.add( cone );
	*/
	var column = new THREE.Mesh(new THREE.ConeGeometry (5, 20, 32),
	new THREE.MeshLambertMaterial({color:0xff1234}));
	/*var column = new THREE.Mesh(new THREE.BoxGeometry (20, 50, 20),
	new THREE.MeshLambertMaterial({color:0xff1234}));*/
	//sceneColor.add (pointLight);  
	// same light cannot be added to two scenes
	var pointLight2 = new THREE.PointLight(0xffffff, 1.0);
	pointLight2.position.set(0, 300, 500);
	sceneColor.add(pointLight2);
	sceneColor.add(column);

	scene = new THREE.Scene();
	camera2 = new THREE.OrthographicCamera(-10, 10, 10, -10, -10, 100);
	camera2.position.z = 5;
	monochromeMat = new THREE.ShaderMaterial ({
		uniforms: {
			texture: {type: 't', value: rtTexture},
			fade:{type:'f', value: 1.0}
		},
		vertexShader: document.getElementById('monoVS').textContent,
		fragmentShader: document.getElementById('monoFS').textContent,
	});
	monochromeMat.depthWrite = false;

	var plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), monochromeMat);
	scene.add (plane);
}

window.onresize = function () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize (window.innerWidth, window.innerHeight);
}

// block does not work for r70 (r73 & r76 ok)
function animate()
{
	controls.update();
	monochromeMat.uniforms.fade.value = gcontrols.fade;

	requestAnimationFrame ( animate );
	renderer.clear();
	
	renderer.setClearColor (0x888800);
	torus.material.colorWrite = true;

	//color buffer
	renderer.render (sceneMono, camera, rtTexture, true);
	renderer.setClearColor (0x888888);
	renderer.render (scene, camera2);
	
	torus.material.colorWrite = false;
	//depth buffer
	renderer.render (sceneMono, camera);
	renderer.render (sceneColor, camera);
}