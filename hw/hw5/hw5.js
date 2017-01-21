var scene, renderer, camera;
var controls;
var jsonModel, jsonModel2;
var angle = 0;

init();
animate();

function init() {
	var width = window.innerWidth;
	var height = window.innerHeight;

	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(width, height);
	renderer.setClearColor(0x888888);
	document.body.appendChild(renderer.domElement);
	
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
	camera.position.z = 200;//200
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	controls = new THREE.OrbitControls(camera, renderer.domElement);

	///
	THREE.ImageUtils.crossOrigin = '';
	var ppTexture = THREE.ImageUtils.loadTexture("images/floor_wood.jpg");
	//change
	var floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({
		map:ppTexture,
		side:THREE.DoubleSide
	}));
	floorMesh.rotation.x = Math.PI / 2;
	scene.add(floorMesh);
	///

	light1 = new THREE.SpotLight(0xffffff, 1.5);
	light1.position.set(0, 150, 0);
	light1.angle = Math.PI/2;
	light1.exponent = 10;
		
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

	/////////////////////////////////////////////
	gcontrols = new function() {
		this.shading = 'per-vertex';
		this.coordinate = 'object';
	}

	var gui = new dat.GUI();
	gui.domElement.id = 'gui';

	var f1 = gui.addFolder("Coordinate System");
	f1.add (gcontrols, 'coordinate', ['object', 'world', 'eye']);
	var f2 = gui.addFolder('Shading Computation');
	f2.add (gcontrols, 'shading', ['per-vertex', 'per-pixel']);

	/////////////////////////////////////////////////////////////////
	
	teapotMaterial = new THREE.ShaderMaterial({
		side:THREE.DoubleSide,
		uniforms: {
			lightpos: {value: new THREE.Vector3(0, 30, 20) },
			shading: {type: 'i', value: 0},
			coordinate: {type: 'i', value: 0},
		},
		vertexShader: document.getElementById('myVertexShader').textContent,
		fragmentShader: document.getElementById('myFragmentShader').textContent
	});

	var jsonLoader = new THREE.JSONLoader();
	var url = "models/teapot.json";
	jsonLoader.load(url, function(geometry, materials) {
		//var material = new THREE.MeshFaceMaterial(materials);
		jsonModel = new THREE.Mesh(geometry, teapotMaterial);
		jsonModel.scale.set(10, 10, 10);
		scene.add(jsonModel);

		jsonModel2 = jsonModel.clone();
		jsonModel2.position.set(70, 0, 0);
		//jsonModel.material = new THREE.MeshLambertMaterial();
		jsonModel.material = new THREE.MeshPhongMaterial();
		scene.add(jsonModel2);

	});
	
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFShadowMap;
	floorMesh.receiveShadow = true;
}

function animate() {
	angle += 0.01;

	if (jsonModel2 !== undefined) {
		light1.target = jsonModel;
		
		jsonModel.castShadow = true;
		jsonModel.receiveShadow = true; // self shadow
		jsonModel2.castShadow = true;
		jsonModel2.receiveShadow = true; // self shadow
		
		jsonModel2.position.set (70 * Math.cos(angle), 0, 70 * Math.sin(angle));
		light2.position.set(200 * Math.cos(angle), 100, 1 * Math.sin(angle));
		light1.position.set(1 * Math.cos(angle), 150, 1 * Math.sin(angle));
		// update the uniform variable
		if (gcontrols.shading === 'per-vertex')
			teapotMaterial.uniforms.shading.value = 0;
		else
			teapotMaterial.uniforms.shading.value = 1;
		
		if (gcontrols.coordinate === 'object')
			teapotMaterial.uniforms.coordinate.value = 0;
		else if (gcontrols.coordinate === 'world')
			teapotMaterial.uniforms.coordinate.value = 1;
		else
			teapotMaterial.uniforms.coordinate.value = 2;
	}
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
