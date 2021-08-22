attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_normalCoord;
varying vec2 v_texCoord;
varying vec2 v_normalCoord;
varying vec3 vertexPosition;

uniform mat4 M;
uniform mat4 V;
uniform mat4 P;

void main() {
  gl_Position = P * V * M * vec4(a_position, 1.0);
  v_texCoord = a_texCoord;
  v_normalCoord = a_normalCoord;
  vertexPosition = (V * M * vec4(a_position, 1.0)).xyz;
}
