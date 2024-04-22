uniform vec3 color;
uniform sampler2D mytex;
uniform float intensity;
varying vec2 vUv;

void main() {
    vec4 scol = texture2D(mytex, vUv);
    gl_FragColor = vec4((1.0f - intensity) * scol.xyz + intensity * color, scol.w);
}