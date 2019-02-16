var scene, camera, stereoCamera, renderer, mouseX, mouseY, WIDTH, HEIGHT;


// This function adds the all of the necessary elements for a scene
function init() {

    container = document.createElement('div');
    document.body.appendChild(container);
    scene = new THREE.Scene();
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025);

    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(0, 1, 5);
    scene.add(camera);

    stereoCamera = new THREE.StereoCamera();
    stereoCamera.aspect = 0.5;

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(25, 50, 25);
    scene.add(pointLight);

/*
    var axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);
*/

    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);
}


// All of the objects in the scene are added with this function
function addObjects() {

    var material = new THREE.MeshBasicMaterial({ color: 0x101018 })
    var geometry = new THREE.PlaneGeometry( 2000, 2000 )
    var plane = new THREE.Mesh( geometry, material );
    plane.rotation.x= - 90 * Math.PI / 180;
    plane.position.y = -3;
    scene.add(plane);

    geometry = new THREE.SphereGeometry(1, 32, 32);
    material = new THREE.MeshStandardMaterial({ color: 0xff0051 });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.name = "head";
    scene.add(sphere);
    sphere.position.z = -10;
    sphere.scale.set(0.75, 0.75, 0.75);

    geometry = new THREE.CylinderGeometry(0.5, 3, 8);
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.name = "body";
    scene.add(cylinder);
    cylinder.scale.set(0.5, 0.5, 0.5);
    cylinder.position.z = -10;
    cylinder.position.y = -2.5;

    var geom = new THREE.Geometry();
    var v1 = new THREE.Vector3(-1,0,0);
    var v2 = new THREE.Vector3(1,0,0);
    var v3 = new THREE.Vector3(0,1,0);

    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);

    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
    geom.computeFaceNormals();

    var triangle = new THREE.Mesh(geom, material);
    triangle.name = "left ear";
    scene.add(triangle);
    triangle.scale.set(0.25, 0.5, 0.25);
    triangle.position.set(-0.5, 0.5, -10);
    triangle.rotateZ(Math.PI / 4);

    geom = new THREE.Geometry();
    v1 = new THREE.Vector3(-1,0,0);
    v2 = new THREE.Vector3(1,0,0);
    v3 = new THREE.Vector3(0,1,0);

    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);

    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
    geom.computeFaceNormals();

    triangle = new THREE.Mesh(geom, material);
    triangle.name = "right ear";
    scene.add(triangle);
    triangle.scale.set(0.25, 0.5, 0.25);
    triangle.position.set(0.5, 0.5, -10);
    triangle.rotateZ(-Math.PI / 4);
}


function animate() {
    requestAnimationFrame(animate);
	renderer.render(scene, camera);
	render();
}


function render() {
    var size = renderer.getSize();
    var sceneL = scene;
    var sceneR = scene;

    // Change the camera's position based on mouse drags
    camera.position.x = mouseX;
    camera.position.z = mouseY;
    sphere = scene.getObjectByName('head');
    camera.lookAt(sphere.position);

    scene.updateMatrixWorld();
    stereoCamera.update(camera);
    renderer.clear();

    // Sets the stereo effect
    renderer.setScissorTest(true);
    renderer.setScissor(0, 0, size.width/2, size.height);
    renderer.setViewport(0, 0, size.width/2, size.height);
    renderer.render(sceneL, stereoCamera.cameraL);

    renderer.setScissor(size.width/2, 0, size.width/2, size.height);
    renderer.setViewport(size.width/2, 0, size.width/2, size.height);
    renderer.render(sceneR, stereoCamera.cameraR);
    renderer.setScissorTest(false);
}


function onMouseDown(event) {
    // Calculate the mouse's beginning position
    event.preventDefault();
    mouseX = (event.clientX - WIDTH/2)*0.05;
    mouseY = (event.clientY - HEIGHT/2)*0.05;
    console.log("x: " + mouseX);
    console.log("y: " + mouseY);
}


function onMouseUp(event) {
    // Calculate the mouse's ending position
    event.preventDefault();
    mouseX += (event.clientX - WIDTH/2)*0.05;
    mouseY += (event.clientY - HEIGHT/2)*0.05;
    console.log("x: " + mouseX);
    console.log("y: " + mouseY);
}


init();
addObjects();
animate();