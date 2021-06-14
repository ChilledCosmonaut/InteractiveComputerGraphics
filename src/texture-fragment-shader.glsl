precision mediump float;

uniform sampler2D sampler;
varying vec2 v_texCoord;

void main(void) {
  //gl_FragColor = vec4(0.0, 0.0, 0.5, 1.0);
  gl_FragColor = texture2D(sampler, v_texCoord);
  gl_FragColor.a = 1.0;
  // Read fragment color from texture
  // TODO
}
