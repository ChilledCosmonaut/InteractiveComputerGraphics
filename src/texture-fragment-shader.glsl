precision mediump float;

uniform sampler2D sampler;
uniform sampler2D u_normal;

varying vec2 v_texCoord;
varying vec2 v_normalCoord;
varying vec3 vertexPosition;

uniform float ambientFactor;
uniform float diffuseFactor;
uniform float specularFactor;

const vec3 lightPos = vec3(1.0, 1.0, 1.0);
const float shininess = 16.0;
const float kA = 0.3;
const float kD = 0.6;
const float kS = 0.7;

void main(void) {
  //gl_FragColor = vec4(0.0, 0.0, 0.5, 1.0);
  vec3 color = texture2D(sampler, v_texCoord).xyz;

  vec3 normal = texture2D(u_normal, v_normalCoord).xyz;
  // Read fragment color from texture
  // TODO

  vec3 ambientColor = color * ambientFactor;

  vec3 toLightVector = normalize(lightPos - vertexPosition);
  vec3 diffuseColor = color * diffuseFactor * max ( 0.0, dot ( normal ,toLightVector ));

  vec3 toEyeVector = normalize(vertexPosition - vec3 (0,0,0));
  vec3 reflectionDirection = normalize(reflect (toLightVector.xyz, normal));
  float factor2 = pow( max ( 0.0, dot (reflectionDirection, toEyeVector)), shininess);
  vec3 specular = color * (factor2 * specularFactor);

  vec3 accumulatedColor = ambientColor + diffuseColor + specular;
  gl_FragColor = vec4(accumulatedColor, 1.0);
}
