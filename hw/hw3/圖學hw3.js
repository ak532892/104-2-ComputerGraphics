var scene, renderer, camera, camera2;
var texture, mesh;
var cameraHUD, sceneHUD;
var controls;
var car;
var keyboard = new KeyboardState();
var theta = 0.0001;
var C, RC;
var RCmesh, frontMesh, rearLeftMesh, rearRightMesh;
var bodyX = 40, bodyY = 16, bodyZ = 20;
var column1Mesh, columnR = 15;
var forward = 1, stop = 0;
var overlap = false;
var stopIndex = 0;

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
	texture = THREE.ImageUtils.loadTexture('http://i.imgur.com/BRQLEdn.jpg');
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

function initHUD() {
	
	sceneHUD = new THREE.Scene();
	cameraHUD = new THREE.OrthographicCamera(-10.5, 10.5, 10.5, -10.5, -10, 10);
	cameraHUD.position.z = 5;
	sceneHUD.add(cameraHUD);

	var fframe = new THREE.Mesh(new THREE.PlaneGeometry(30, 3), new THREE.MeshBasicMaterial({
		color: 0xff0000,
		opacity: 0.8,
		transparent: true,
		depthTest: false
	}));
	var fup = fframe.clone();
	fup.position.set (0, 10.5, 0);
	var fdown = fframe.clone();
	fdown.position.set (0, -10.5, 0);
	var fframe2 = new THREE.Mesh(new THREE.PlaneGeometry(3, 30), new THREE.MeshBasicMaterial({
		color: 0x00ff88,
		opacity: 0.8,
		transparent: true,
		depthTest: false
	}));
	var fleft = fframe2.clone();
	fleft.position.set (-10.5, 0, 0);
	var fright = fframe2.clone();
	fright.position.set (10.5, 0, 0);
	
	sceneHUD.add(fup);
	sceneHUD.add(fdown);
	sceneHUD.add(fleft);
	sceneHUD.add(fright);
}

function init(){
	initHUD();
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x888888);
	document.body.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100000);
	camera.position.x = 200;
	camera.position.y = 300;
	camera.position.z = 100;
	
	camera2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100000);
	camera2.position.y = 350;
	
	/*var gridXZ = new THREE.GridHelper(500, 30);
	gridXZ.setColors(new THREE.Color(0xff0000), new THREE.Color(0xffffff));
	scene.add(gridXZ);*/
	
	///
	mesh = texturedFace();
	mesh.rotation.x = Math.PI/2;
	scene.add(mesh);
	///
	
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	var light = new THREE.PointLight(0xffffff, 1);
	light.position.set(150, 150, 150);
	scene.add(light);
	var amblight = new THREE.AmbientLight(0x404040); // soft white light
	scene.add(amblight);
	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);
	
	THREE.ImageUtils.crossOrigin = '';
	
	var bodyMesh = makeBox(bodyX, 16, bodyZ);
	var tireR = 5;
	bodyMesh.position.y = bodyY/2 + tireR;

	frontMesh = makeTire(tireR, tireR, 2);
	frontMesh.position.x = 12;
	frontMesh.position.y = tireR;
	
	rearLeftMesh = makeTire(tireR, tireR, 2);
	rearLeftMesh.position.x = -12;
	rearLeftMesh.position.y = tireR;
	rearLeftMesh.position.z = 8;
	
	rearRightMesh = makeTire(tireR, tireR, 2);
	rearRightMesh.position.x = -12;
	rearRightMesh.position.y = tireR;
	rearRightMesh.position.z = -8;
	
	car = new THREE.Object3D();
	car.add(bodyMesh);
	car.add(frontMesh);
	car.add(rearLeftMesh);
	car.add(rearRightMesh);
	scene.add(car);

	var columnHeight = 40;
	columnArray = [];
	//columnArray[];
	columnArray[0] = makeCylinder(columnR, columnR, columnHeight);
	columnArray[0].position.set(50, columnHeight/2, -50);
	
	columnArray[1] = makeCylinder(columnR, columnR, columnHeight-20);
	columnArray[1].position.set(10, columnHeight/2, -80);
	
	columnArray[2] = makeCylinder(columnR, columnR, columnHeight+30);
	columnArray[2].position.set(40, columnHeight/2, -120);
	
	
	for(var i = 0; i < columnArray.length; i++){
		scene.add(columnArray[i]);
	}
	
	RCmesh = makeSphere(5, 32, 32);
	scene.add (RCmesh);

	C = new THREE.Vector3();
}

function checkIntersect(rect, circle) {
	var rad2 = circle.r * circle.r;
	var max = rect.max.clone().sub(circle.c);
	var min = rect.min.clone().sub(circle.c);

	if (max.x < 0) {
		if (max.z < 0)
		return (max.x*max.x + max.z*max.z < rad2);
		else if (min.z > 0)
		return (max.x*max.x + min.z*min.z < rad2);
		else
		return (Math.abs(max.x) < circle.r);
	} else if (min.x > 0) {
		if (max.z < 0)
		return (min.x*min.x + max.z*max.z < rad2);
		else if (min.z > 0)
		return (min.x*min.x + min.z*min.z < rad2);
		else
		return (min.x < circle.r);
	} else {
		if (max.z < 0)
		return (Math.abs(max.z) < circle.r);
		else if (min.z > 0)
		return (min.z < circle.r);
		else
		return true;
	}
}

function makeBox(x, y, z){
	var geometry = new THREE.BoxGeometry(x, y, z);
	var material = new THREE.MeshBasicMaterial({
side: THREE.DoubleSide,
transparent: true, // key to cutout texture
map: THREE.ImageUtils.loadTexture('http://i.imgur.com/ArDUeSy.png')
	});

	var boxMesh = new THREE.Mesh(geometry, material);

	return boxMesh;
}

function makeCylinder(rtop, rbottom, height){
	var geometry = new THREE.CylinderGeometry(rtop, rbottom, height);
	var material = new THREE.MeshBasicMaterial({
side: THREE.DoubleSide,
map: THREE.ImageUtils.loadTexture('http://i.imgur.com/9bDYoGq.png')
	});
	var cylinderMesh = new THREE.Mesh(geometry, material);
	
	return cylinderMesh;
}

function makeTire(rtop, rbottom, height){
	var geometry = new THREE.CylinderGeometry(rtop, rbottom, height);
	var material = new THREE.MeshBasicMaterial({
side: THREE.DoubleSide,
map: THREE.ImageUtils.loadTexture('http://i.imgur.com/zEvHWXx.png')
	});
	var cylinderMesh = new THREE.Mesh(geometry, material);
	
	cylinderMesh.rotation.x = Math.PI/2;
	
	return cylinderMesh;
}

function makeSphere(r, width, height){
	var geometry = new THREE.SphereGeometry(r, width, height);
	var material = new THREE.MeshBasicMaterial();
	var sphereMesh = new THREE.Mesh(geometry, material);

	return sphereMesh;
}

function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(){
	keyboard.update();
	if (keyboard.pressed ("left"))
	theta += 0.01;
	else if (keyboard.pressed("right"))
	theta -= 0.01;
	else if (keyboard.pressed ("down"))
	forward = 0;
	else if (keyboard.pressed ("up"))
	forward = 1;
	if (keyboard.down('space')) {
		overlap = !overlap;
	}
	
	RC = car.localToWorld(new THREE.Vector3(-12, 0, -24 / Math.tan(theta)));
	RCmesh.position.copy(RC);

	var v = 15, l = 24 / Math.tan(theta);
	var omega = v * Math.tan(theta)/24;
	
	if(forward == 0)	
	omega = -omega;
	
	var deltaT = 0.05;
	var vv = C.clone().sub(RC).applyAxisAngle(new THREE.Vector3(0,1,0), omega * deltaT);
	var r = Math.sqrt(12*12 + l*l);
	if(theta < 0) r = -r;
	
	
	
	////////
	C = vv.add(RC);
	for(var i = stopIndex; i < columnArray.length; i++){
		var hit = 1;
		
		if(stop == 0){

			var carWorld = car.clone();
			carWorld.position.copy(C);
			
			if(forward == 0)
				carWorld.rotation.y -= omega * deltaT;
			else
				carWorld.rotation.y += omega * deltaT;
			
			var carTmp = carWorld.worldToLocal(carWorld.position.clone());
			
			var circ = {};
			circ.c = carWorld.worldToLocal(columnArray[i].position.clone());;
			circ.r = columnR;
			
			var rect = {};
			rect.max = carTmp.clone().add (new THREE.Vector3(bodyX/2, 0, bodyZ/2));
			rect.min = carTmp.clone().sub (new THREE.Vector3(bodyX/2, 0, bodyZ/2));
			
			hit = checkIntersect (rect, circ);
		}
		if (hit){
			columnArray[i].material.wireframe = true;
			stopIndex = i;
			stop = 1;
			if(forward == 0){
				
				car.position.copy(C);
				frontMesh.rotation.z = -v / (r * Math.cos(theta));

				car.rotation.y -= omega * deltaT;

				controls.update();
				camera.lookAt (C);
				stop = 0;
				columnArray[i].material.wireframe = false;
				stopIndex = 0;
			}
			break;
		}
		else{
			stop = 0;
			columnArray[i].material.wireframe = false;
			
			car.position.copy(C);
			frontMesh.rotation.z = -v / (r * Math.cos(theta));
			
			car.rotation.y += omega * deltaT;

			controls.update();
			camera.lookAt (C);
		}
	}
	////////
	
	requestAnimationFrame(animate);
	render();
}
function render() {
	var WW = window.innerWidth;
	var HH = window.innerHeight;

	renderer.autoClear = false;
	if (!overlap) {
		renderer.setViewport(0, 0, WW, HH);
		renderer.clear();
		renderer.render(scene, camera);
	} else {
		renderer.enableScissorTest(true);
		renderer.setViewport(0, 0, WW, HH);
		renderer.setScissor(0, 0, WW, HH);
		
		renderer.clear();
		renderer.render(scene, camera);

		
		renderer.setViewport(WW / 3 * 2, HH / 3 * 2, WW / 3, HH / 3);
		renderer.setScissor(WW / 3 * 2, HH / 3 * 2, WW / 3, HH / 3);
		
		renderer.clear();
		var carLocal = car.localToWorld(new THREE.Vector3(0, 0, 0));
		camera2.position.set(carLocal.x, 350, carLocal.z);
		camera2.lookAt (carLocal);
		
		renderer.render(scene, camera2);
		renderer.render(sceneHUD, cameraHUD);
		renderer.enableScissorTest(false);
	}
}