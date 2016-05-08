var scene, renderer, camera;
var controls;
var car, headMesh;
var bumpMap;
var clock;
var turn = 1;
var angle = 0;
var floorMesh;

init();
animate();

function texturedFace() {
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(-500, 500, 0),
		new THREE.Vector3(-500, -500, 0),
		new THREE.Vector3(500, -500, 0),
		new THREE.Vector3(500, 500, 0)
	);

	var face;
	face = new THREE.Face3(0, 1, 2);
	face.materialIndex = 0;
	geometry.faces.push(face);
	face = new THREE.Face3(0, 2, 3);
	face.materialIndex = 0;
	geometry.faces.push(face);

	geometry.faceVertexUvs[0].push([new THREE.Vector2(0, 1), new THREE.Vector2(0, 0), new THREE.Vector2(1, 0)]);
	geometry.faceVertexUvs[0].push([new THREE.Vector2(0, 1), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1)]);

	geometry.computeBoundingSphere();
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	// CORS:
	// http://stackoverflow.com/questions/24087757/three-js-and-loading-a-cross-domain-image
	THREE.ImageUtils.crossOrigin = '';
	texture = THREE.ImageUtils.loadTexture('models/Bottom.png');
	texture.repeat.set(1, 1);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	//texture.minFilter = THREE.LinearMipMapLinearFilter;
	texture.minFilter = THREE.LinearFilter;
	//texture.minFilter = THREE.LinearMipMapLinearFilter;
	
	return new THREE.Mesh(geometry,
	new THREE.MeshBasicMaterial({
		map: texture,
		side: THREE.DoubleSide
	}));
}

function init()
{
	clock = new THREE.Clock(true);

	var width = window.innerWidth;
	var height = window.innerHeight;
	
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize (width, height);
	renderer.setClearColor (0x888888);
	document.body.appendChild (renderer.domElement);

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera (45, width/height, 1, 10000);
	camera.position.y = 48;
	camera.position.z = 120;
	camera.lookAt (new THREE.Vector3(0,0,0));

	controls = new THREE.OrbitControls (camera, renderer.domElement);

	floorMesh = texturedFace();
	floorMesh.rotation.x = Math.PI/2;
	scene.add(floorMesh);
	
	////////////////////////////////////////////////////////////////////
	// load the clara.io Nissan GT-R NISMO
	THREE.ImageUtils.crossOrigin = '';  // no space between a pair of single quotes

	var loader = new THREE.ObjectLoader();
	loader.load ('models/nissan-gt-r-nismo.json', 
	function ( obj ) {
		obj.scale.set (10, 10, 10);
		scene.add( obj );
		obj.traverse (
		function (mesh) {
			if (mesh instanceof THREE.Mesh) {
				mesh.material.bumpScale = 0.2;
			}
		});
		car = obj;
	});
	
	headMesh = makeBoxSix(30, 30, 15);
	headMesh.position.y = 15;
	scene.add(headMesh);
	light1 = new THREE.SpotLight(0xffffff, 1.5);
	light1.position.set(0, 150, 0);
	light1.angle = Math.PI/4;
	light1.exponent = 10;
	light1.target = headMesh;
	scene.add(light1);

	// shadow map settings
	light1.castShadow = true;
	light1.shadowMapWidth = 1024;
	light1.shadowMapHeight = 1024;
	light1.shadowCameraNear = 10;
	light1.shadowCameraFar = 4000;
	light1.shadowCameraFov = light1.angle / Math.PI * 180;

	light2 = new THREE.DirectionalLight(0xffffff);
	light2.position.set(200, 100, 0);
	light2.castShadow = true;
	light2.shadowCameraLeft = -80;
	light2.shadowCameraTop = -80;
	light2.shadowCameraRight = 80;
	light2.shadowCameraBottom = 80;
	light2.shadowCameraNear = 1;
	light2.shadowCameraFar = 1000;
	light2.shadowBias = -.0001
	light2.shadowMapWidth = light2.shadowMapHeight = 1024;
	light2.shadowDarkness = .7;
	scene.add(light2);

	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFShadowMap;

	floorMesh.receiveShadow = true;
	headMesh.castShadow = true;
	headMesh.receiveShadow = true; // self shadow
}

function animate()
{
	controls.update();
	var dt = clock.getDelta();
	
	if (car !== undefined && turn) { 
		//plane.position.set (50*Math.cos(angle)+20,5,-50*Math.sin(angle)+20);
		car.position.set (50*Math.cos(angle),5,-50*Math.sin(angle));
		headMesh.position.set (50*Math.cos(angle),25,-50*Math.sin(angle));
		headMesh.rotation.y = car.rotation.y = angle + Math.PI;
		angle -= dt;
	}
	

	requestAnimationFrame ( animate ); 
	renderer.render (scene, camera);
}

function makeBoxSix(x, y, z) {
	var materials = [], material;
	// must give 6 materials for box geometry
	THREE.ImageUtils.crossOrigin = '';
	materials.push(new THREE.MeshLambertMaterial({visible:false}));
	materials.push(new THREE.MeshLambertMaterial({visible:false}));
	materials.push(new THREE.MeshLambertMaterial({visible:false}));
	materials.push(new THREE.MeshLambertMaterial({visible:false}));
	materials.push(new THREE.MeshLambertMaterial({color:0x00ffff}));
	materials.push(new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture('images/410105130.jpg')}));
	
	var material = new THREE.MeshFaceMaterial(materials);
	var geometry = new THREE.BoxGeometry(x, y, z);
	var boxMesh = new THREE.Mesh(geometry, material);
	
	return boxMesh;
}