varying float vDebugValue;
varying vec3 vColor;

void main() {
    vec2 uv = gl_PointCoord;

    // Calculate the center of the screen
    vec2 center = vec2(0.5, 0.5);

    // Calculate the distance from the current fragment to the center
    float distanceFromCenter = distance(uv, center);
    float radius = 0.5;

    if(distanceFromCenter > radius) {
        discard;
    }
   

    gl_FragColor = vec4(vColor, 1);
    //gl_FragColor = vec4(uv, 1.0, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}