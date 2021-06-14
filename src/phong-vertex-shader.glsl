precision mediump float;

attribute vec3 a_position;
attribute vec3 a_normal;


// Pass color as attribute and forward it
// to the fragment shader
// TODO *
attribute vec3 a_color;
varying vec3 v_color;

uniform mat4 M;
uniform mat4 V;
uniform mat4 N; // normal matrix

varying vec3 v_normal;

// Pass the vertex position in view space
// to the fragment shader
// TODO *
varying vec3 vertexPosition;


void main() {
  gl_Position = V * M * vec4(a_position, 1.0);

  // Pass the color and transformed vertex position through
  // TODO *
  v_color = a_color;
  vertexPosition = (V * M * vec4(a_position, 1.0)).xyz;
  
  v_normal = normalize((V * N * vec4(a_normal, 0)).xyz);
}
