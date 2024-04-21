uniform vec3 color;
uniform sampler2D mytex;
varying vec2 vUv;

void main() {
    vec4 scol = texture2D(mytex, vUv);
    gl_FragColor = vec4(scol.xyz + (1.0f - color), scol.w);
}