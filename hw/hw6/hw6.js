var scene, renderer;
var raycaster;
var mouse = new THREE.Vector2();
var pickables = [], pickables2 = [];
var camera, controls;
var angle = 0;
var teapots = [];
var teapotNum = 0;
var teapotMaterial;
var pointLight, lightSphere;

init();
animate();

var Teapot = function(mesh){
	this.life = 1;
	this.angle = 0;
	this.turn = true;
	this.mesh = mesh;
	this.mesh.name = 't' + teapotNum;
	teapotNum++;
	pickables.push(mesh);
};
Teapot.prototype.update = function(i) {
	if(this.turn){
		this.angle += (this.life * 0.3);
		this.life -= 0.0025;
	}
	this.mesh.rotation.y = this.angle;
	teapots[i].mesh.material.uniforms.lightpos.value.copy (pointLight.position);
	teapots[i].mesh.material.uniforms.opacity.value = teapots[i].life;
	
	if(this.life <= 0)
		Teapot.prototype.expire(i);
};
Teapot.prototype.expire = function(i) {
	scene.remove(teapots[i].mesh);
	teapots[i].mesh.geometry.dispose();
	teapots[i].mesh.material.dispose();

	teapots.splice(i, 1);
	teapotNum--;
};
function findTeapot(mesh) {
	for (var i = 0; i < teapots.length; i++) {
		if (teapots[i].mesh === mesh)
		return teapots[i];
	}
}

function init() {
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 300;
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x888888);
	document.body.appendChild(renderer.domElement);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	//pointLight
	pointLight = new THREE.PointLight(0xffffff);
	scene.add(pointLight);
	lightSphere = new THREE.Mesh(new THREE.SphereGeometry(5),
    new THREE.MeshBasicMaterial({
        color: 0xffff00,
        wireframe: true
    }));
    scene.add(lightSphere);
	
	//ground
	var ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(200, 200),
	new THREE.MeshPhongMaterial({color:0x93f1ff}));
	ground.rotation.x = -(Math.PI / 2);
	scene.add (ground);

	//platform
	var platform = makeBox(200, 40, 20, 0x0000ff);
	var platform2 = makeBox(200, 30, 20, 0x0000ff);
	var platform3 = makeBox(200, 20, 20, 0x0000ff);
	var platform4 = makeBox(200, 10, 20, 0x0000ff);
	var platform5 = makeBox(50, 10, 100, 0xff0000);
	
	platform.position.set (0, 0, -90);
	platform2.position.set (0, 0, -70);
	platform3.position.set (0, 0, -50);
	platform4.position.set (0, 0, -30);
	platform5.position.set (0, 0, 30);
	
	scene.add(platform);
	scene.add(platform2);
	scene.add(platform3);
	scene.add(platform4);
	scene.add(platform5);

	pickables2.push(ground);

	raycaster = new THREE.Raycaster();
	document.addEventListener('mousedown', onDocumentMouseDown, false);
}

function onDocumentMouseDown(event) {
	//1 === left; 3 === right
	if ((event.which !== 1) && 
		(event.which !== 3))
		return;
	// PICKING DETAILS: 
	// convert mouse.xy = [-1,1]^2 (NDC)
	// unproject (mouse.xy, 1) to a point on the far plane (in world coordinate)
	// set raycaster (origin, direction)
	// find intersection objects, (closest first) 
	// each record as
	// [ { distance, point, face, faceIndex, object }, ... ]

	event.preventDefault();
	mouse.x =  (event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	// if recursive set to true, can go deeper into object3D hierarchy 
	//  var intersects = raycaster.intersectObjects( pickables, true );
	//var intersects = raycaster.intersectObjects(pickables);
	
	var intersects;
	if (event.which === 1)
		intersects = raycaster.intersectObjects(pickables);
	else if (event.which === 3)
		intersects = raycaster.intersectObjects(pickables2);

	if (intersects.length > 0 ) {  // inside picking plane
		if (event.which === 1 && teapotNum){
			//toggle
			// [ { distance, point, face, faceIndex, indices, object }, ... ]
			teapot = findTeapot (intersects[0].object);
			teapot.turn = !teapot.turn;
		}
		else if (event.which === 3){
			//new
			var origin = new THREE.Vector3();
			
			origin.copy (intersects[0].point);
			origin.y = 30;
			raycaster.set (origin, new THREE.Vector3(0, -1, 0));
			intersects = raycaster.intersectObjects (scene.children); 
			if (intersects.length > 0){
				//teapot			
				teapotMaterial = new THREE.ShaderMaterial({
					side:THREE.DoubleSide,
					transparent:true,
					opacity:0.5,
					uniforms:{
						lightpos: {type: 'v3', value: new THREE.Vector3()},
						shading: {type: 'i', value: 0},
						coordinate: {type: 'i', value: 0},
						opacity: {type: 'f', value: 1.0}
					},
					vertexShader: document.getElementById('myVertexShader').textContent,
					fragmentShader: document.getElementById('myFragmentShader').textContent
				});
				
				var jsonLoader = new THREE.JSONLoader();
				var url = "https://ak532892.github.io/ComputerGraphics2016/hw/hw5/models/teapot.json";
				jsonLoader.load(url, function(geometry, materials) {
					teapotObj = new THREE.Mesh(geometry, teapotMaterial);
					teapotObj.scale.set(5, 5, 5);
					scene.add(teapotObj);
					teapotObj.position.copy (intersects[0].point);
					teapots.push(new Teapot(teapotObj));
				});
			}
		}
	}
}

function makeBox(x, y, z, Color) {
	var material = new THREE.MeshLambertMaterial({
		transparent:true,
		opacity:0.5,
		color: Color
	});
	var geometry = new THREE.BoxGeometry(x, y, z);
	var boxMesh = new THREE.Mesh(geometry, material);
	
	return boxMesh;
}

function animate() {
	controls.update();
	angle += 0.01;
	pointLight.position.set(80 * Math.cos(angle), 80, 80 * Math.sin(angle));
	lightSphere.position.copy(pointLight.position);
		
	for(i in teapots)
		teapots[i].update(i);
	
	document.getElementById("info").innerHTML =
	"Homework 6</br>TeapotNum = " + teapotNum;
	
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}