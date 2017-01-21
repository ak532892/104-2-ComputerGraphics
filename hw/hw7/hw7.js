var renderer, camera, controls;
var pointLight;
var scene, sceneMono, sceneColor;
var camera2;
var rtTexture;
var torus, skybox, torus2;
var gcontrols;
var teapots = [];

init();
animate();
var Teapot = function(mesh){
	this.mesh = mesh;
};
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
	pointLight.position.set(0, 100, 500);
	sceneMono.add (pointLight);
	
	gcontrols = {fade: 0.1};
	
	var gui = new dat.GUI();
	gui.domElement.id = 'gui';
	gui.add(gcontrols, 'fade', 0.1, 5.0);
	
	sceneColor = new THREE.Scene();
	THREE.ImageUtils.crossOrigin = '';

	var material = new THREE.MeshLambertMaterial({
		side: THREE.BackSide,
		colorWrite:false
	});
	skybox = new THREE.Mesh( new THREE.BoxGeometry( 500, 500, 500 ), material );
	sceneMono.add (skybox);
	
	var bumpMap = THREE.TextureLoader('models/dragon_C.jpg');
	var loader = new THREE.ObjectLoader();
	loader.crossOrigin = '';
	loader.setCrossOrigin('');
	loader.load (
		'models/dragon.json', 
		function ( obj ) {
			obj.scale.set (12, 12, 12);
			obj.rotation.y = Math.PI;
			obj.traverse (
				function (mesh) {
					if (mesh instanceof THREE.Mesh) {
						mesh.material.bumpMap = bumpMap;
						mesh.material.bumpScale = 0.2;
					}
				}
			);
			sceneColor.add( obj );
		}
	);
	//////////
	var jsonLoader = new THREE.JSONLoader();
	teapotMaterial = new THREE.MeshLambertMaterial({color:		0x0000ff, 
		colorWrite:false
	})
	var url = "../hw/hw5/models/teapot.json";
	jsonLoader.load(url, function(geometry, materials) {
		teapotObj = new THREE.Mesh(geometry, teapotMaterial);
		teapotObj.scale.set(40, 40, 40);
		teapots.push(new Teapot(teapotObj));
		teapotObj.position.y = 100;
		teapotObj.rotation.y = -Math.PI/2;
		sceneMono.add(teapotObj);
	});
	//////////////
	torus = new THREE.Mesh(new THREE.TorusGeometry(10, 3, 16, 100),
	new THREE.MeshLambertMaterial({color:0xcccc00, 
		colorWrite:false
	}));
	torus.scale.set(22, 18, 6);
	torus.rotation.x = Math.PI/2;
	torus2 = torus.clone();
	torus2.rotation.y = -Math.PI/4;
	torus.rotation.y = Math.PI/4;
	sceneMono.add(torus);
	sceneMono.add(torus2);
	
	// same light cannot be added to two scenes
	var pointLight2 = new THREE.PointLight(0xffffff, 1.0);
	pointLight2.position.set(0, 100, 500);
	sceneColor.add(pointLight2);

	scene = new THREE.Scene();
	camera2 = new THREE.OrthographicCamera(-10, 10, 10, -10, -10, 100);
	camera2.position.z = 5;
	monochromeMat = new THREE.ShaderMaterial ({
		uniforms: {
			texture: {type: 't', value: rtTexture},
			fade:{type:'f', value: 0.1}
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
	
	renderer.setClearColor (0xff4422);
	torus.material.colorWrite = true;
	torus2.material.colorWrite = true;
	skybox.material.colorWrite = true;
	for(i in teapots)
		teapots[i].mesh.material.colorWrite = true;
	//color buffer
	renderer.render (sceneMono, camera, rtTexture, true);
	renderer.setClearColor (0x444444);
	renderer.render (scene, camera2);
	
	torus.material.colorWrite = false;
	torus2.material.colorWrite = false;
	skybox.material.colorWrite = false;
	for(i in teapots)
		teapots[i].mesh.material.colorWrite = false;
	
	//depth buffer
	renderer.render (sceneMono, camera);
	renderer.render (sceneColor, camera);
}
