precision mediump float;

// Receive color and position values
// TODO
varying vec3 v_color;
varying vec4 vertexPosition;

varying vec3 v_normal;

const vec4 lightPos = vec4(1.0, 1.0, 1.0, 1.0);
const float shininess = 16.0;
const float kA = 0.3;
const float kD = 0.6;
const float kS = 0.7;

void main(void) {
  gl_FragColor = vec4(0.0, 0.0, 0.5, 1.0);
  // Phong lighting calculation
  // TODO
  vec3 lightColor = vec3(1.0,1.0,1.0);

  vec3 ambientColor = v_color * kA;

  //vec4 toLightVector = lightPos - vertexPosition;
  //vec3 diffuseColor = lightColor * kD * /*max*/ (0, v_normal * toLightVector);

  //vec4 toEyeVector = vertexPosition - vec4 (0,0,0,1);
  //vec3 reflectionDirection = reflect (v_normal, toLightVector);
  //float factor2 = pow( /*max*/ (0, dot (reflectionDirection, toEyeVector)), shininess);
  //vec3 specular = lightColor * (factor2 * kS);
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
