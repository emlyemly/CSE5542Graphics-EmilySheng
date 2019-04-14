var cubeRotation;


// This function adds the all of the necessary elements for the scene
function init() {

    const canvas = document.getElementById('glCanvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Initialize shaders
    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexNormal;
        attribute vec4 aVertexColor;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform vec4 uLightPosition;
        uniform vec4 uLightColor;

        varying lowp vec4 vColor;
        varying lowp vec4 vVertexPosition;
        varying lowp vec4 vVertexNormal;

        void main(void) {
            vVertexPosition = aVertexPosition;
            vVertexNormal = aVertexNormal;
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    `;

    const fsSource = `
        precision highp float;
        uniform mat4 uModelViewMatrix;
        uniform vec4 uLightPosition;
        uniform vec4 uLightColor;

        varying lowp vec4 vColor;
        varying lowp vec4 vVertexPosition;
        varying lowp vec4 vVertexNormal;


        vec4 phong(vec4 vertex, vec4 normal) {
            vec4 surface = normalize(vec4(uLightPosition - vertex));
            float surfaceToLight = max(dot(normal, surface), 0.0);
            vec4 reflection = reflect(-surface, normal);
            vec4 surfaceToCamera = normalize(-vertex);

            vec4 ambient = 1.0 * vec4(0.1, 0.1, 0.1, 0.0);
            vec4 diffuse = uLightColor * vec4(0.8, 0.8, 0.8, 8.0) * surfaceToLight;
            vec4 specular = uLightColor * vec4(0.6, 0.6, 0.6, 0.0);

            if (surfaceToLight > 0.0) {
                specular = specular * pow(max(dot(reflection, surfaceToCamera), 0.0), 5.0);
            }

            return vec4(ambient + diffuse + specular);
        }

        void main(void) {
            vec4 vertex = uModelViewMatrix * vVertexPosition;
            vec4 normal = vVertexNormal;
            vec4 vLightIntensity = phong(vertex, normal);
            gl_FragColor = vec4(vec4(vColor * vLightIntensity).rgb, vColor.a);
        }
    `;

    // Initialize shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            lightPosition: gl.getUniformLocation(shaderProgram, 'uLightPosition'),
            lightColor: gl.getUniformLocation(shaderProgram, 'uLightColor'),
        }
    };

    cubeRotation = 0.0;

    var cube = cubeBuffers(gl);
    var sphere = sphereBuffers(gl);
    const buffers = [cube, sphere];

    // Draw surface
    var then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, deltaTime);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}


// Returns the buffers for generating the sphere
function sphereBuffers(gl) {

    var latitudeBands = 50;
    var longitudeBands = 50;
    var radius = 2;

    const vertices = [];
    const normals = [];

    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    // Calculate sphere vertices
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;

            vertices.push(radius * x);
            vertices.push(radius * y);
            vertices.push(radius * z);

            normals.push(x);
            normals.push(y);
            normals.push(z);
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const indices = [];

    // Calculate sphere indices
    for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
        for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
            let first = (latNumber * (longitudeBands + 1)) + longNumber;
            let second = first + longitudeBands + 1;

            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const colors = [];

    for (var i=0; i < vertices.length/3; i++) {
        colors.push(1.0,  0.0,  1.0,  1.0);
    }

    const colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return {
        vertices: verticesBuffer,
        normals: normalsBuffer,
        colors: colorsBuffer,
        indices: indexBuffer
    };
}


// Returns the buffers for generating the cube
function cubeBuffers(gl) {

    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    const vertices = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);

    const normals = [];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(indices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    const faceColors = [
        [1.0,  0.0,  1.0,  1.0],
        [1.0,  0.0,  1.0,  1.0],
        [1.0,  0.0,  1.0,  1.0],
        [1.0,  0.0,  1.0,  1.0],
        [1.0,  0.0,  1.0,  1.0],
        [1.0,  0.0,  1.0,  1.0],
    ];

    var colors = [];

    for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];

        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return {vertices: verticesBuffer,
            normals: normalsBuffer,
            colors: colorBuffer,
            indices: indexBuffer
    };
}


function drawScene(gl, programInfo, buffers, deltaTime) {

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set frustum values
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    // Set projection and model matrices
    const projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projectionMatrix,
                       fieldOfView,
                       aspect,
                       zNear,
                       zFar);

    // set viewpoint to (5, 4.5, 4) and viewdir to (5, -3.5, -4)
    const cameraMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(cameraMatrix, [5.0, 8.0, 8.0], [5.0, 4.5, 4.0], [0.0, 1.0, 0.0]);

    const viewMatrix = glMatrix.mat4.clone(cameraMatrix);
    glMatrix.mat4.copy(viewMatrix, cameraMatrix);

    var cubeMatrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(cubeMatrix,
                 cubeMatrix,
                 [0.0, 0.0, -5.0]);
    cubeMatrix = glMatrix.mat4.multiply(cubeMatrix, cubeMatrix, viewMatrix);

    var sphereMatrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(sphereMatrix,
                     sphereMatrix,
                     [10.0, 0.0, -8.0]);
    sphereMatrix = glMatrix.mat4.multiply(sphereMatrix, sphereMatrix, viewMatrix);

/*
    glMatrix.mat4.rotate(modelViewMatrix,
                  modelViewMatrix,
                  cubeRotation,
                  [0, 0, 1]);
    glMatrix.mat4.rotate(modelViewMatrix,
                  modelViewMatrix,
                  cubeRotation * .7,
                  [0, 1, 0]);
*/

    gl.useProgram(programInfo.program);
    setShapeInfo(buffers[0], 36, gl, programInfo, projectionMatrix, cubeMatrix);
    setShapeInfo(buffers[1], 15000, gl, programInfo, projectionMatrix, sphereMatrix);
    cubeRotation += deltaTime;
}


// Sets attributes from buffer data and uniforms
function setShapeInfo(buffer, vertexCount, gl, programInfo, projectionMatrix, modelViewMatrix) {

    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertices);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normals);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal);
    }

    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.colors);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indices);

    // Set the shader uniforms
    gl.uniform4fv(programInfo.uniformLocations.lightPosition, [5.0, 5.0, -4.0, 0.0]);
    gl.uniform4fv(programInfo.uniformLocations.lightColor, [1.0, 0.3, 0.2, 1.0]);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const offset = 0;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}


function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}


function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


init();