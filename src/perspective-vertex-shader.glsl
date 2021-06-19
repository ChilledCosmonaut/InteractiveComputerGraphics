attribute vec3 a_position;
attribute vec4 color;
varying vec4 f_color;
// TODO *
uniform mat4 M;
uniform mat4 V;
uniform mat4 P;

void main() {
  gl_Position = P * V * M * vec4(a_position, 1.0);
  // TODO *
  f_color = color;
}
