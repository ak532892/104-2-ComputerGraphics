var scene, renderer, camera;
var controls;
var angle = 0, turn = false, butVal = 0, timeSum = 0, firstTime = 1;
var mesh, meshBackplane, meshArrow, meshSector, meshSector2;
var frame, frame2;
var clock = new THREE.Clock();
var sectorGeometry, sectorMaterial; 
init();
animate();

$("#toggle").click(function() {
  turn = !turn;
});
$("#analog").click(function() {
  if (butVal == 0){
    if(firstTime == 1){
    	$(this).text('Quartz');
      firstTime = 0;
    }
    else{
    	$(this).text('Sector');
    	butVal = 1;
    }
  }
  else if (butVal == 1){
		$(this).text('Analog');
    butVal = 2;
  }
  else if (butVal == 2){
    $(this).text('Quartz');
    butVal = 0;
  }
});
function init() {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x888888);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 500;
  controls = new THREE.OrbitControls(camera, renderer.domElement);

	var geoHeight = 120, geoWidth = 10;
  var geometry = new THREE.CylinderGeometry(geoWidth, geoWidth, geoHeight);
  var material = new THREE.MeshBasicMaterial({
  	color:0xAA4A29
  });
	mesh = new THREE.Mesh(geometry, material);
  mesh.position.setY(geoHeight/2);
  
  var backplaneGeometry = new THREE.CircleGeometry( 160, 32 );
  var backplaneMaterial = new THREE.MeshBasicMaterial({
  	color:0xC9FFC1
  });
  meshBackplane = new THREE.Mesh(backplaneGeometry, backplaneMaterial);
  
  var arrowHeight = 20;
  var arrowGeometry = new THREE.CylinderGeometry(0, geoWidth+3, arrowHeight);
  var arrowMaterial = new THREE.MeshBasicMaterial({
  	color:0xF89060
  });
  meshArrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
  meshArrow.position.setY(geoHeight+arrowHeight/2);
  
  frame = new THREE.Object3D();
  frame2 = new THREE.Object3D();
  
  frame.add(mesh);
  frame.add(meshArrow);
  scene.add(meshBackplane);
  scene.add(frame);
  
  /*var gridXZ = new THREE.GridHelper(100, 10);
  gridXZ.setColors(new THREE.Color(0xff0000), new THREE.Color(0xffffff));
  scene.add(gridXZ);*/

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  controls.update();
  var dt = clock.getDelta();
  
  if (turn){
    timeSum += dt;
    if(butVal == 0){
      scene.add(frame);
      scene.remove(frame2);

      angle += dt * Math.PI/30;
    }
    if(butVal == 1){
			angle = Math.floor(timeSum) * Math.PI/30;
    }
    if(butVal == 2){
    	angle += dt * Math.PI/30;
    	sectorGeometry = new THREE.CircleGeometry( 160, 32, Math.PI/2 - angle, angle);
  		sectorMaterial = new THREE.MeshBasicMaterial({
				color: 0xffff88
			})
      meshSector = new THREE.Mesh(sectorGeometry, sectorMaterial);
      frame2.add(meshSector);
      scene.add(frame2);
      scene.remove(frame);
    }
  }
  frame.rotation.z = -angle;

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}