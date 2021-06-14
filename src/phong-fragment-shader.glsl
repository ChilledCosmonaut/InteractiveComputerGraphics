precision mediump float;

// Receive color and position values
// TODO
varying vec3 v_color;
varying vec3 vertexPosition;

varying vec3 v_normal;

const vec3 lightPos = vec3(1.0, 1.0, 1.0);
const float shininess = 16.0;
const float kA = 0.3;
const float kD = 0.6;
const float kS = 0.7;

void main(void) {
  //gl_FragColor = vec4(0.0, 0.0, 0.5, 1.0);
  // Phong lighting calculation
  // TODO
  vec3 lightColor = vec3(1.0, 1.0, 1.0);

  vec3 ambientColor = v_color * kA;

  vec3 toLightVector = normalize(lightPos - vertexPosition);
  vec3 diffuseColor = v_color * kD * max ( 0.0, dot ( v_normal ,toLightVector ));

  vec3 toEyeVector = normalize(vertexPosition - vec3 (0,0,0));
  vec3 reflectionDirection = normalize(reflect (toLightVector.xyz, v_normal));
  float factor2 = pow( max ( 0.0, dot (reflectionDirection, toEyeVector)), shininess);
  vec3 specular = v_color * (factor2 * kS);

  vec3 accumulatedColor = ambientColor + diffuseColor + specular;
  gl_FragColor = vec4(accumulatedColor, 1.0);
}

// r = d - 2(d ⋅ n)n
// Where ‘r’ is  resultant reflection normal,
// ‘d’ is the normal of our ray, (der Vector vom Licht zum Schnittpunkt muss umgedreht werden/negiert werden)
// and ‘n’ is the surface normal that our ray hit
// Der Parameter n muss normiert sein
//vec3 reflectionVector(vec3 n, vec3 d){
//  d = d * -1;
//  return r = d - (n * (2 * dot (d, n)));
//}
