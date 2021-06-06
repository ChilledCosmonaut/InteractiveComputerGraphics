attribute vec3 a_position;
// TODO *
attribute vec4 color;
varying vec4 f_color;
uniform mat4 M;

void main() {
  gl_Position = M*vec4(a_position, 1.0);
  // TODO *
  f_color = color;
}
