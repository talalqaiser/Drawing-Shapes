// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute float a_size;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +  
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +  
  'uniform mat4 transform_mat;\n' +
  'uniform vec3 u_LightColor;\n' +     
  'uniform vec3 u_LightPosition;\n' + 
  'uniform vec3 u_AmbientLight;\n' +  
  'varying vec4 v_Color;\n' + 
  'void main() {\n' +
  'gl_Position = u_MvpMatrix* a_Position;\n' +
  'gl_PointSize = a_size;\n' +  
  'vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +  
  'vec4 vertexPosition = transform_mat * a_Position;\n' + 
  'vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +  
  'float nDotL = max(dot(normal, lightDirection), 0.0);\n' +  
  'vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' + 
  'vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
  'v_Color = vec4(diffuse + ambient, a_Color.a);\n' +
  '}\n';

// Fragmant Shader Program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  'gl_FragColor = v_Color;\n' +
  '}\n';

var canvas = document.getElementById('webgl');

var gl = getWebGLContext(canvas);
if (!gl) {
  console.log('Failed to get the rendering context for WebGL');
}

// Initialize shaders
if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  console.log('Failed to intialize shaders.');
}

var transform_mat_loc = gl.getUniformLocation(gl.program, 'transform_mat');
if (transform_mat_loc < 0) {
  console.log('Failed to get the storage location of a_Color');
}

var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
if (!u_MvpMatrix) {
  console.log('Failed to get the storage location of u_MvpMatrix');
}

var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');

if (!u_LightColor || !u_LightPosition || !u_AmbientLight || !u_NormalMatrix) {
  console.log('Failed to get the storage location');
}

gl.uniform3f(u_LightColor, 1, 1, 1);
gl.uniform3f(u_LightPosition, 2.0, 3.0, 5.0);
gl.uniform3f(u_AmbientLight, 0.25, 0.25, 0.25);

var mvpMatrix = new Matrix4();
var normalMatrix = new Matrix4();

mvpMatrix.setPerspective(35, 1, 1, 100);
mvpMatrix.lookAt(4,3, 7, 0, 0, 0, 0, 1, 0);

gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

gl.clearColor(0, 0.0, 0.0, 0.55);
gl.enable(gl.DEPTH_TEST);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

var scene_objects = []

//Sphere
function initVertexBuffers_sphere(gl, obj_color) {

  var r = obj_color[0]
  var g = obj_color[1]
  var b = obj_color[2]

  var SPHERE_DIV = 36;

  var positions = [];
  var indices = [];
  var color_array = [];

  var color_array = []
  for (var i = 0; i < 520; i++) {

    color_array.push(r, g, b)
  }
  var colors = new Float32Array(color_array)

  for (var j = 0; j <= SPHERE_DIV; j++) {
    var aj = j * Math.PI / SPHERE_DIV;
    var sj = Math.sin(aj);
    var cj = Math.cos(aj);
    for (var i = 0; i <= SPHERE_DIV; i++) {
      var ai = i * 2 * Math.PI / SPHERE_DIV;
      var si = Math.sin(ai);
      var ci = Math.cos(ai);

      positions.push(si * sj);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj);  // Z

    }
  }

  for (var j = 0; j < SPHERE_DIV; j++) {
    for (var i = 0; i < SPHERE_DIV; i++) {
      var p1 = j * (SPHERE_DIV + 1) + i;
      var p2 = p1 + (SPHERE_DIV + 1);

      indices.push(p1); indices.push(p2); indices.push(p1 + 1); indices.push(p1 + 1); indices.push(p2); indices.push(p2 + 1);
    }
  }

  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', new Float32Array(colors), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3)) return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;

  function initArrayBuffer(gl, attribute, data, type, num) {
  
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
  }
}

// Plane
function initVertexBuffers_plane(gl, colors) {

  var r = obj_color[0]
  var g = obj_color[1]
  var b = obj_color[2]

  var vertices = new Float32Array([  
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 
  ]);

  var colors = new Float32Array([
    r, g, b, r, g, b, r, g, b, r, g, b,     
  ]);

  var normals = new Float32Array([    
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  
  ]);
  
  var indices = new Uint8Array([
      0, 1, 2, 0, 2, 3,    
  ]);

  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
      console.log('Failed to create the buffer object');
      return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

// CUBE
function initVertexBuffers_cube(gl, colors) {
  var r = obj_color[0]
  var g = obj_color[1]
  var b = obj_color[2]

  var vertices = new Float32Array([
    0.8, 0.8, 0.8, -0.8, 0.8, 0.8, -0.8, -0.8, 0.8, 0.8, -0.8, 0.8, // v0-v1-v2-v3 front
    0.8, 0.8, 0.8, 0.8, -0.8, 0.8, 0.8, -0.8, -0.8, 0.8, 0.8, -0.8, // v0-v3-v4-v5 right
    0.8, 0.8, 0.8, 0.8, 0.8, -0.8, -0.8, 0.8, -0.8, -0.8, 0.8, 0.8, // v0-v5-v6-v1 up
    -0.8, 0.8, 0.8, -0.8, 0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, 0.8, // v1-v6-v7-v2 left
    -0.8, -0.8, -0.8, 0.8, -0.8, -0.8, 0.8, -0.8, 0.8, -0.8, -0.8, 0.8, // v7-v4-v3-v2 down
    0.8, -0.8, -0.8, -0.8, -0.8, -0.8, -0.8, 0.8, -0.8, 0.8, 0.8, -0.8  // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([
    r, g, b, r, g, b, r, g, b, r, g, b,     // v0-v1-v2-v3 front
    r, g, b, r, g, b, r, g, b, r, g, b,      // v0-v3-v4-v5 right
    r, g, b, r, g, b, r, g, b, r, g, b,      // v0-v5-v6-v1 up
    r, g, b, r, g, b, r, g, b, r, g, b,     // v0-v1-v2-v3 front
    r, g, b, r, g, b, r, g, b, r, g, b,      // v0-v3-v4-v5 right
    r, g, b, r, g, b, r, g, b, r, g, b    // v4-v7-v6-v5 back
  ]);

  var normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,   
    4, 5, 6, 4, 6, 7,   
    8, 9, 10, 8, 10, 11,   
    12, 13, 14, 12, 14, 15,    
    16, 17, 18, 16, 18, 19,    
    20, 21, 22, 20, 22, 23     
  ]);

  if (!initArrayBuffer(gl, 'a_Position', vertices, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3)) return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

// QUAD
function initVertexBuffers_quad(gl, obj_color) {

  var r = obj_color[0]
  var g = obj_color[1]
  var b = obj_color[2]
  var verticesColors = new Float32Array([
    -1, 1, 0.0, r, g, b,
    -1, -1, 0.0, r, g, b,
    1, 1, 0.0, r, g, b,
    1, -1, 0.0, r, g, b,
  ]);
  var n = 4;  

  var normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 
  ]);

  var vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3)) return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  

  var a_size_loc = gl.getAttribLocation(gl.program, 'a_size');
  if (a_size_loc < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_size_loc, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);
  gl.enableVertexAttribArray(a_size_loc); 

  return n;
}

// CONE
function initVertexBuffers_cone(gl, colors) {

  var vertices_arr = []
  vertices_arr.push(0, 0, 0)
  for (var i = 0; i < 10; i++) {
    var x = Math.cos((i * Math.PI / 5))
    var z = Math.sin((i * Math.PI / 5))
    vertices_arr.push(x, 0, z)
  }

  i_end = vertices_arr.length
  for (var i = 3; i < i_end - 3; i += 3) {
    vertices_arr.push(vertices_arr[i], vertices_arr[i + 1], vertices_arr[i + 2])
    vertices_arr.push(vertices_arr[i + 3], vertices_arr[i + 4], vertices_arr[i + 5])
    vertices_arr.push(0, 3, 0)
  }
  vertices = new Float32Array(vertices_arr)

  var color_array = []
  var r = obj_color[0]
  var g = obj_color[1]
  var b = obj_color[2]

  for (var i = 0; i < vertices_arr.length; i += 3) {
    color_array.push(r, g, b)
  }

  colors = new Float32Array(color_array)

  var indices = new Uint8Array([      
    0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 
    0, 5, 6, 0, 6, 7, 0, 7, 8, 0, 8, 9, 
    0, 9, 10, 0, 10, 1, 11, 12, 13, 14, 
    15, 16, 17, 18, 19, 20, 21, 22, 23, 
    24, 25, 26, 27, 28, 29, 30, 31, 32, 
    33, 34, 35, 36, 37, 38, 39, 40 
  ]);

  var normal_list = []
  normal_list.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0)
  for (var i = 33; i < vertices_arr.length; i += 9) {
    var p1 = [vertices_arr[i], vertices_arr[i + 1], vertices_arr[i + 2]]
    var p2 = [vertices_arr[i + 3], vertices_arr[i + 4], vertices_arr[i + 5]]
    var p3 = [vertices_arr[i + 6], vertices_arr[i + 7], vertices_arr[i + 8]]
    var v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]]
    var v2 = [p3[0] - p2[0], p3[1] - p2[1], p3[2] - p2[2]]
    var cross = crossProduct(v1, v2)
    normal_list.push(-1 * cross[0], -1 * cross[1], -1 * cross[2], -1 * cross[0], -1 * cross[1], -1 * cross[2], -1 * cross[0], -1 * cross[1], -1 * cross[2])
  }

  function crossProduct(p1, p2) {
    var cross_P = []
    cross_P[0] = p1[1] * p2[2] - p1[2] * p2[1];
    cross_P[1] = p1[2] * p2[0] - p1[0] * p2[2];
    cross_P[2] = p1[0] * p2[1] - p1[1] * p2[0];
    return cross_P
  }

  var normals = new Float32Array(normal_list)

  var indexBuffer = gl.createBuffer();
  if (!indexBuffer)
    return -1;

  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;

  if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal'))
    return -1;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  return indices.length;

  function initArrayBuffer(gl, data, num, type, attribute) {
    var buffer = gl.createBuffer(); 
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
  }
}

//Disk
function initVertexBuffers_disk(gl, obj_color) {

  var n = 30;
  var r
  var g
  var b
  r = obj_color[0]
  g = obj_color[1]
  b = obj_color[2]

  var verticesColors = new Float32Array((n + 2) * 6)

  verticesColors[0] = 0.0
  verticesColors[1] = 0.0
  verticesColors[2] = 10.0
  verticesColors[3] = r
  verticesColors[4] = g
  verticesColors[5] = b

  for (var i = 1; i < n + 2; i++) {
    verticesColors[i * 6] = 1 * Math.cos(2 * Math.PI * i / n)
    verticesColors[i * 6 + 1] = 1 * Math.sin(2 * Math.PI * i / n)
    verticesColors[i * 6 + 2] = 10.0 + Math.random() * 20.0
    verticesColors[i * 6 + 3] = r
    verticesColors[i * 6 + 4] = g
    verticesColors[i * 6 + 5] = b
  }

  var normal = [];
  for (i = 0; i < 32; i++) {
    normal.push(0)
    normal.push(0)
    normal.push(1)
  }
  var normals = new Float32Array(normal);

  if (!initArrayBuffer(gl, 'a_Normal', normals, 3)) return -1;

  var vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position); 

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color); 

  var a_size_loc = gl.getAttribLocation(gl.program, 'a_size');
  if (a_size_loc < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_size_loc, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);
  gl.enableVertexAttribArray(a_size_loc);  

  return n;
}

function initArrayBuffer(gl, attribute, data, num) {
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

class GameObject {    
  constructor(name, shape, obj_color, scaling, position, rotation) {
    this.name = name;
    this.shape = shape;
    this.obj_color = obj_color;
    this.scaling = scaling;
    this.position = position;
    this.rotation = rotation;
    this.default_obj = [position, scaling, rotation, obj_color]
    this.tm = this.calculate_tm()  
  } 
   
  calculate_tm() {
    var tranform_mat = new Matrix4();
    tranform_mat.setTranslate(this.position[0] / 100, this.position[1] / 100, this.position[2] / 100, 1);
    tranform_mat.scale(this.scaling[0] / 100, this.scaling[1] / 100, this.scaling[2] / 100, 1);
    tranform_mat.rotate(this.rotation, 0, 0, 1);
    return tranform_mat;
  }
}

function addingObject() {

  obj_color = document.getElementById("colorControl").value

  var go = new GameObject('obj_'.concat(document.getElementById("shape").value).concat(String(Date.now())),
    document.getElementById("shape").value, hexTorgb(obj_color),
    [parseFloat(document.getElementById("Sx").value), parseFloat(document.getElementById("Sy").value), parseFloat(document.getElementById("Sz").value)],
    [parseFloat(document.getElementById("Tx").value), parseFloat(document.getElementById("Ty").value), parseFloat(document.getElementById("Ty").value)],
    parseFloat(document.getElementById("Rz").value))

    

  scene_objects.push(go);

  gl.clear(gl.COLOR_BUFFER_BIT);

  document.getElementById("GameObjects").innerHTML = ""
  scene_objects.forEach(my_go => {
    var go_opt = document.createElement("option")
    go_opt.innerHTML = my_go.name
    document.getElementById("GameObjects").appendChild(go_opt)
    draw(gl, my_go)
  });
}

function removingObject() {
  my_go = document.getElementById("GameObjects").value
  for (var i = 0; i < scene_objects.length; i++) {
    if (scene_objects[i].name == my_go) {
      scene_objects.splice(i, 1)
    }
  }

  gl.clear(gl.COLOR_BUFFER_BIT);

  document.getElementById("GameObjects").innerHTML = ""
  scene_objects.forEach(my_go => {
    var go_opt = document.createElement("option")
    go_opt.innerHTML = my_go.name
    document.getElementById("GameObjects").appendChild(go_opt)
    draw(gl, my_go)
  });
}

function rotatingObject() {
  for (var i = 0; i < scene_objects.length; i++) {
    if (scene_objects[i].name == my_go) {
      scene_objects[i].rotation = parseFloat(document.getElementById("Rz").value)
    }
    scene_objects[i].tm = scene_objects[i].calculate_tm()
  }

  gl.clear(gl.COLOR_BUFFER_BIT);

  document.getElementById("GameObjects").innerHTML = ""
  scene_objects.forEach(my_go => {
    var go_opt = document.createElement("option")
    go_opt.innerHTML = my_go.name
    document.getElementById("GameObjects").appendChild(go_opt)
    draw(gl, my_go)
  });
}

function positioningObject() {
  for (var i = 0; i < scene_objects.length; i++) {
      if (scene_objects[i].name == my_go) {
          scene_objects[i].position = [parseFloat(document.getElementById("Tx").value), parseFloat(document.getElementById("Ty").value), parseFloat(document.getElementById("Tz").value)]
          scene_objects[i].tm = scene_objects[i].calculate_tm();
      }
  }

  gl.clear(gl.COLOR_BUFFER_BIT);


  document.getElementById("GameObjects").innerHTML = ""
  scene_objects.forEach(my_go => {
      var go_opt = document.createElement("option")
      go_opt.innerHTML = my_go.name
      document.getElementById("GameObjects").appendChild(go_opt)
      draw(gl, my_go)
  });
}

function scalingObject() {
  my_go = document.getElementById("GameObjects").value
  var def_scale = []
  for (var i = 0; i < scene_objects.length; i++) {
    if (scene_objects[i].name == selectedObject) {
      scene_objects[i].scaling = [parseFloat(document.getElementById("Sx").value), parseFloat(document.getElementById("Sy").value), parseFloat(document.getElementById("Sz").value)]
      scene_objects[i].tm = scene_objects[i].calculate_tm();
    }
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
  document.getElementById("GameObjects").innerHTML = ""
  scene_objects.forEach(my_go => {
    var go_opt = document.createElement("option")
    go_opt.innerHTML = my_go.name
    document.getElementById("GameObjects").appendChild(go_opt)
    draw(gl, my_go)
  });
}

var selectedObject = "";

function SaveSelection() {
    my_go = document.getElementById("GameObjects").value;
    if (my_go != "") {
        selectedObject = my_go;
    }
}

function color_object() {
  for (var i = 0; i < scene_objects.length; i++) {
      if (scene_objects[i].name == selectedObject) {
          scene_objects[i].color = hexTorgb(document.getElementById("colorControl").value);
      }
  }

  gl.clear(gl.COLOR_BUFFER_BIT);

  document.getElementById("GameObjects").innerHTML = ""
  scene_objects.forEach(my_go => {
      var go_opt = document.createElement("option")
      go_opt.innerHTML = my_go.name
      document.getElementById("GameObjects").appendChild(go_opt)
      draw(gl, my_go)
  });

}

hexTorgb = hex => {
  var res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return res
      ? {
          r: parseInt(res[1], 16) / 255,
          g: parseInt(res[2], 16) / 255,
          b: parseInt(res[3], 16) / 255
      }
      : null;
};

function default_object() {

  gl.clear(gl.COLOR_BUFFER_BIT);
    document.getElementById("GameObjects").innerHTML = ""
    scene_objects.forEach(go => {

    go.position = go.default_obj[0]
    go.scaling = go.default_obj[1]
    go.rotation = go.default_obj[2]
    go.obj_color = go.default_obj[3]

    go.tm = go.calculate_tm()
    var go_opt = document.createElement("option")
    go_opt.innerHTML = go.name
    document.getElementById("GameObjects").appendChild(go_opt)
    draw(gl, go)
  })
}

function draw(gl, go) {
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(transform_mat_loc, false, go.tm.elements);
  var mvp = new Matrix4() 

  mvp.set(mvpMatrix).multiply(go.tm);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvp.elements);


  normalMatrix.setInverseOf(go.tm);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);


  if (go.shape == 'Sphere') {
    var n = initVertexBuffers_sphere(gl, go);
    if (n < 0) {
      console.log('Failed to set the vertex information');
    }
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
  }

  else if (go.shape == 'Plane') {
    var n = initVertexBuffers_plane(gl, go);
    if (n < 0) {
      console.log('Failed to set the vertex information');
    }
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }

  else if (go.shape == 'Cube') {
    var n = initVertexBuffers_cube(gl, go.obj_color);
    if (n < 0) {
      console.log('Failed to set the vertex information');
    }
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }

  else if (go.shape == 'Quad') {
    var n = initVertexBuffers_quad(gl, go.obj_color);
    if (n < 0) {
      console.log('Failed to set the vertex information');
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  }  
  
  else if (go.shape == 'Cone') {
    var n = initVertexBuffers_cone(gl, go.obj_color);
    if (n < 0) {
      console.log('Failed to set the vertex information');
    }
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }   
  
  else if (go.shape == 'Disk') {
    var n = initVertexBuffers_disk(gl, go.obj_color);
    if (n < 0) {
      console.log('Failed to set the vertex information');
    }
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n + 2);
  }
}

document.getElementById("add_button").onclick = addingObject
document.getElementById("remove_button").onclick = removingObject
document.getElementById("clear").onclick = default_object
document.getElementById("Sx").onchange = scalingObject
document.getElementById("Sy").onchange = scalingObject
document.getElementById("Sz").onchange = scalingObject
document.getElementById("Rz").onchange = rotatingObject
document.getElementById("Tx").onchange = positioningObject
document.getElementById("Ty").onchange = positioningObject
document.getElementById("Tz").onchange = positioningObject
document.getElementById("html5colorpicker").onchange = color_object

function addValue(id) {
  // console.log("it is caled");
  return parseFloat(document.getElementById(id).value) + 10;
}

function reduceValue(id) {
  // console.log("it is caled");
  return parseFloat(document.getElementById(id).value) - 10;
}

document.addEventListener("keydown", function (e) {
  //console.log(e);
  switch (e.key) {
      // Translate
      case "w":
          document.getElementById("Ty").value = addValue("Ty");
          translate_object();

          break;

      case "s":
          document.getElementById("Ty").value = reduceValue("Ty");
          translate_object();
          break;

      case "a":
          document.getElementById("Tx").value = reduceValue("Tx");
          translate_object();
          break;

      case "d":
          document.getElementById("Tx").value = addValue("Tx");
          translate_object();
          break;

      case "q":
          document.getElementById("Tz").value = addValue("Tz");
          translate_object();
          break;

      case "e":
          document.getElementById("Tz").value = reduceValue("Tz");
          translate_object();
          break;

      // Rotation
      case "i":
          document.getElementById("Rx").value = reduceValue("Rx");
          rotate_object();
          break;

      case "k":
          document.getElementById("Rx").value = addValue("Rx");
          rotate_object();
          break;

      case "j":
          document.getElementById("Ry").value = reduceValue("Ry");
          rotate_object();
          break;

      case "l":
          document.getElementById("Ry").value = addValue("Ry");
          rotate_object();
          break;

      case "u":
          document.getElementById("Rz").value = reduceValue("Rz");
          rotate_object();
          break;

      case "o":
          document.getElementById("Rz").value = addValue("Rz");
          rotate_object();
          break;

      // Scaling
      case "t":
          document.getElementById("Sy").value = addValue("Sy");
          scale_object();
          break;

      case "g":
          document.getElementById("Sy").value = reduceValue("Sy");
          scale_object();
          break;

      case "f":
          document.getElementById("Sz").value = addValue("Sz");
          scale_object();
          break;

      case "h":
          document.getElementById("Sz").value = reduceValue("Sz");
          scale_object();
          break;

      case "r":
          document.getElementById("Sx").value = addValue("Sx");
          scale_object();
          break;

      case "y":
          document.getElementById("Sx").value = reduceValue("Sx");
          scale_object();
          break;
  }
});