varying float vDebugValue;

uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;
varying vec3 vColor;
attribute float aIntensity;
attribute float aAngle;

void main() {

    vec3 newPosition = position;
    float displacementIntensity = texture(uDisplacementTexture, uv).r;
    vec3 displacement = vec3(cos(aAngle), sin(aAngle), 0);
    displacement *= smoothstep(0.1, 0.2, displacementIntensity) * 1.0;
    //vec3 normalizedDisplacement = normalize(displacement);

    newPosition += displacement * 0.8 * aIntensity;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    float radiusIntensity = texture(uPictureTexture, uv).r;

    vec3 color1 = vec3(0.0); // Red
    vec3 color2 = vec3(0.0, 0.33, 1.0); // Blue
    vec3 color = mix(color1, color2, uv.x);

    vColor = color;
    // if(radiusIntensity < 0.5) {
    //     vColor = vec3(0.17, 0.75, 0.88);
    // }
    // if(radiusIntensity > 0.5) {
    //     vColor = vec3(0.91, 0.07, 0.13);
    // }

    if(radiusIntensity < 0.03) {
        vColor = vec3(0., 0., 0.);
    }

    // vColor = vec3(pow(radiusIntensity, 2.0));

    gl_PointSize = 0.15 * uResolution.y * radiusIntensity;
    gl_PointSize *= (1.0 / -viewPosition.z);
}