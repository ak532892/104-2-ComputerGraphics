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

	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
	camera.position.z = 200;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	controls = new THREE.OrbitControls(camera, renderer.domElement);

	var gridXZ = new THREE.GridHelper(100, 10);
	gridXZ.setColors(new THREE.Color(0xff0000), new THREE.Color(0xffffff));
	scene.add(gridXZ);

	pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(200, 300, 200);
	scene.add(pointLight);
	var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);

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
		//    jsonModel.position.set(70, 0, 0);

		jsonModel2 = jsonModel.clone();
		jsonModel2.position.set(70, 0, 0);
		jsonModel.material = new THREE.MeshLambertMaterial();
		scene.add(jsonModel2);

	});
}

function animate() {
	angle += 0.01;

	console.log(teapotMaterial.uniforms.shading.value);
	if (jsonModel2 !== undefined) {
		jsonModel2.position.set (70*Math.cos(angle), 0, 70*Math.sin(angle));
		// update the uniform variable
		if (gcontrols.shading === 'per-vertex'){
			teapotMaterial.uniforms.shading.value = 0;
		}
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
