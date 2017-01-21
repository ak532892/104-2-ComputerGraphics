var scene, renderer, camera, controls;
var material_shh;
var width, height;
var scene2, camera2, rtTexture;
var tex1;
var pointLight, lightSphere;
var angle = 0;

init();
animate();

function init() {
	width = window.innerWidth;
	height = window.innerHeight;

	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);
	renderer.setClearColor(0x888888);
	renderer.autoClear = false;

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100000);
	camera.position.y = 80;
	camera.position.z = 300;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	// add control here (after the camera is defined)
	controls = new THREE.OrbitControls(camera, renderer.domElement);

	var gridXZ = new THREE.GridHelper(100, 10);
	gridXZ.setColors(new THREE.Color(0xff0000), new THREE.Color(0xffffff));
	scene.add(gridXZ);

	pointLight = new THREE.PointLight(0xffffff);
	scene.add(pointLight);
	
	lightSphere = new THREE.Mesh(new THREE.SphereGeometry(5),
    new THREE.MeshBasicMaterial({
        color: 0xffff00,
        wireframe: true
    }));
    scene.add(lightSphere);
	
	var ambientLight = new THREE.AmbientLight(0x555555);
	scene.add(ambientLight);

	window.addEventListener('resize', onWindowResize, false);

	var vertShader = document.getElementById('myVertexShader').innerHTML;
	var fragShader = document.getElementById('myFragmentShader').innerHTML;
	THREE.ImageUtils.crossOrigin = '';
	tex1 = THREE.ImageUtils.loadTexture('../hw/hw4/images/410105130.jpg');

	var uniforms = {
		imageSize: {
			type: 'i',
			value: 256
		},
		texture: {
			type: 't',
			value: tex1
		} ,
	};

	material_shh = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertShader,
		fragmentShader: fragShader
	});

	// all face uses the same material; 
	// no need for MeshFaceMaterial (materialArray)
	material_shh.side = THREE.DoubleSide;
	var geometry = new THREE.PlaneGeometry(100,100);
	var bs = new THREE.Mesh(geometry, material_shh);

	scene2 = new THREE.Scene();
	camera2 = new THREE.OrthographicCamera(-50, 50, 50, -50, -10, 10);
	scene2.add(bs);

	//////////////////////////////////////////////////////////////////////
	rtTexture = new THREE.WebGLRenderTarget( 
		1024,1024,//256,256,  // size of the FBO
		{ minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } 
	);

	var rttmaterial = new THREE.ShaderMaterial({
		uniforms: {
			texture: {
				type: "t",
				value: rtTexture
			},
		},
		vertexShader: document.getElementById('myVertexShader-rtt').textContent,
		fragmentShader: document.getElementById('myFragmentShader-rtt').textContent
	});
	var bs0 = new THREE.Mesh(geometry, rttmaterial);
	scene.add(bs0)
	bs0.position.y = 50;
	rttmaterial.side = THREE.DoubleSide;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	controls.update();
	angle += 0.1;
	pointLight.position.set(60 * Math.cos(angle), 80, 60 * Math.sin(angle));
	lightSphere.position.copy(pointLight.position);
	
	material_shh.uniforms.texture.value = tex1;
	var thisImageSize = 256;
	material_shh.uniforms.imageSize.value = thisImageSize;
	//rtTexture.setSize (thisImageSize, thisImageSize); // FBO size cannot be dynamically adjusted ...
	
	
	renderer.clear(true);
	requestAnimationFrame(animate);
	
	//renderer.setViewport (200,200,100,100);
	// it seems that the viewport setting has no effect
	// on renderTarget
	// https://github.com/mrdoob/three.js/blob/master/src/renderers/WebGLRenderTarget.js#L51
	renderer.render (scene2, camera2, rtTexture, true);

	renderer.setViewport(0, 0, width, height);
	renderer.render(scene, camera);
}
