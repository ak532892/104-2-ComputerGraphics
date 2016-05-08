var scene, renderer, camera;
var controls;
var car;
var bumpMap;
var clock;
var turn = 1;
var angle = 0;

init();
animate();

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

	var gridXZ = new THREE.GridHelper(100, 10);
	gridXZ.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
	scene.add(gridXZ);

	var pointLight = new THREE.PointLight (0xffffff);
	pointLight.position.set (0,300,200);
	scene.add (pointLight);

	var ambientLight = new THREE.AmbientLight (0x111111);
	scene.add(ambientLight);

	////////////////////////////////////////////////////////////////////
	// load the clara.io Nissan GT-R NISMO
	THREE.ImageUtils.crossOrigin = '';  // no space between a pair of single quotes

	var loader = new THREE.ObjectLoader();
	loader.load ('https://ak532892.github.io/ComputerGraphics2016/hw/hw4/models/nissan-gt-r-nismo.json', 
	function ( obj ) {
		obj.scale.set (10,10,10);
		scene.add( obj );
		obj.traverse (
		function (mesh) {
			if (mesh instanceof THREE.Mesh) {
				mesh.material.bumpScale = 0.2;
			}
		});
		car = obj;
	});
	var headMesh = makeBoxSix(52.5, 40, 37.5, 0x884400);
	headMesh.position.y = 20 + 10;
	scene.add(headMesh);
}

function animate()
{
	controls.update();
	var dt = clock.getDelta();
	
	if (car !== undefined && turn) { 
		car.position.set (50*Math.cos(angle),0,-50*Math.sin(angle));
		//headMesh.position.set (50*Math.cos(angle),0,-50*Math.sin(angle));
		//headMesh.rotation.y = angle + Math.PI;
		car.rotation.y = angle + Math.PI;
		angle -= dt;
	}
	

	requestAnimationFrame ( animate ); 
	renderer.render (scene, camera);
}

function makeBoxSix(x, y, z, color) {
	var materials = [], material;
	// must give 6 materials for box geometry
	THREE.ImageUtils.crossOrigin = '';
	materials.push(new THREE.MeshLambertMaterial());
	materials.push(new THREE.MeshLambertMaterial());
	materials.push(new THREE.MeshLambertMaterial());
	materials.push(new THREE.MeshLambertMaterial({visible:false}));
	materials.push(new THREE.MeshLambertMaterial({side:THREE.DoubleSide, map:THREE.ImageUtils.loadTexture('images/410105130.jpg')}));
	materials.push(new THREE.MeshLambertMaterial());
	
	var material = new THREE.MeshFaceMaterial(materials);
	var geometry = new THREE.BoxGeometry(x, y, z);
	var boxMesh = new THREE.Mesh(geometry, material);
	
	return boxMesh;
}