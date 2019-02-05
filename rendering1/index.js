var scene, camera, renderer;

init();
animate();

function init() {
    scene = new THREE.Scene();
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight,
        viewAngle = 75;

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(viewAngle, WIDTH / HEIGHT, 0.1, 1000);
    scene.add(camera);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 5;

    var light = new THREE.PointLight(0xFFFFFF);
    light.position.x = 0;
    light.position.y = 10;
    light.position.z = 0;
    scene.add(light);

    renderer.setClearColor(new THREE.Color(0x000000));

    var geometry = new THREE.PlaneGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial( {color: 0x800080, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh(geometry, material);
    plane.rotateX(Math.PI/2);
/*
    plane.position.x = -10;
    plane.position.y = 0;
    plane.position.z = -10;
    */

    scene.add(plane);

    geometry = new THREE.BoxGeometry(1, 1, 1);
    material = new THREE.MeshBasicMaterial( { color: "#800080" } );
    var cube = new THREE.Mesh(geometry, material);

    cube.position.x = -0.5;
    cube.position.y = 2;
    cube.position.z = -5;
    scene.add(cube);

    geometry = new THREE.CylinderGeometry(2, 2, 6, 10);
    material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var cylinder = new THREE.Mesh(geometry, material);

    cylinder.position.x = 20;
    cylinder.position.y = 0;
    cylinder.position.z = -10;
    scene.add( cylinder );

    geometry = new THREE.ConeGeometry(5, 10, 12);
    material = new THREE.MeshBasicMaterial( {color: "#FFB6C1"} );
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    var cone = new THREE.Mesh(geometry, material);

    cone.position.x = 2;
    cone.position.y = 0;
    cylinder.position.z = -20;
    scene.add( cone );
}

function animate() {
    requestAnimationFrame(animate);
	renderer.render(scene, camera);
}