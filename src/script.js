import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')






// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    particlesMaterial.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 18)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor('#181818')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/*
* Images
*/
const pictureTexture = textureLoader.load('/picture-5.png');



/*
* Displacement
*/
const displacement = {

    canvasCursor: new THREE.Vector2(9999, 9999),
    canvasCursorPrevious: new THREE.Vector2(9999, 9999)
}
displacement.canvas = document.createElement('canvas');
displacement.canvas.width = 128;
displacement.canvas.height = 128;


// Draw the image once it's loaded


displacement.canvas.style.position = 'fixed'
displacement.canvas.style.width = '128px'
displacement.canvas.style.height = '128px'
displacement.canvas.style.bottom = 0
displacement.canvas.style.right = 0
displacement.canvas.style.zIndex = 10
document.body.append(displacement.canvas)
displacement.context = displacement.canvas.getContext('2d')
displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

displacement.glowImage = new Image();
displacement.glowImage.src = './glow.png'; // Replace with your image path
displacement.glowImage.onload = function () {
    // Draw the image at the center of the canvas
    displacement.context.drawImage(displacement.glowImage, 20, 20, 32, 32)
};

/*
*  Plane
*/

const geometry = new THREE.PlaneGeometry(10, 10);
const material = new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide })
material.visible = false;
displacement.interactivePlane = new THREE.Mesh(geometry, material);
scene.add(displacement.interactivePlane)
displacement.mouse = new THREE.Vector2()

console.log({geometry})

/*
*  RayCaster
*/
const raycaster = new THREE.Raycaster();


window.addEventListener('pointermove', (event) => {
    // Convert mouse position to normalized device coordinates
    displacement.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    displacement.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


});


/*
* Canvas Texture
*/
const canvasTexture = new THREE.CanvasTexture(displacement.canvas);



/**
 * Particles
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);

const intensityArray = new Float32Array(particlesGeometry.attributes.position.count)
const anglesArray = new Float32Array(particlesGeometry.attributes.position.count)
for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
    intensityArray[i] = Math.random();
    anglesArray[i] = Math.random() * Math.PI * 2;
}
particlesGeometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensityArray, 1))
particlesGeometry.setAttribute('aAngle', new THREE.BufferAttribute(anglesArray, 1))

const particlesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uPictureTexture: { value: pictureTexture },
        uDisplacementTexture: new THREE.Uniform(canvasTexture),
        blending: THREE.AdditiveBlending
    }
})
particlesGeometry.setIndex(null)
particlesGeometry.deleteAttribute('normal')
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Animate
 */
const tick = () => {
    // Update controls
    controls.update()

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(displacement.mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObject(displacement.interactivePlane);

    // Change color of the plane if it was clicked
    if (intersects.length > 0) {
        // console.log({ intersects })
        // displacement.interactivePlane.material.color.set(0xff0000); // Change color to red
        const uv = intersects[0].uv;
        displacement.canvasCursor.x = uv.x * displacement.canvas.width
        displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height

    } else {
        //displacement.interactivePlane.material.color.set(0xffff00)
    }

    displacement.context.globalAlpha = 0.02;
    displacement.context.globalCompositeOperation = 'source-over';
    displacement.context.fillRect(0, 0, 128, 128)
    // displacement.context.fillRect(0, 0, displacement.context.width, displacement.context.height);


    displacement.context.globalCompositeOperation = 'lighter'
    const cursorDistance = displacement.canvasCursorPrevious.distanceTo(displacement.canvasCursor)
    displacement.canvasCursorPrevious.copy(displacement.canvasCursor)
    const alpha = Math.min(cursorDistance * 0.05, 1)
    displacement.context.globalAlpha = alpha;
    const glowSize = displacement.canvas.width / 6;
    displacement.context.drawImage(displacement.glowImage, displacement.canvasCursor.x - glowSize / 2, displacement.canvasCursor.y - glowSize / 2, glowSize, glowSize)

    canvasTexture.needsUpdate = true

    // Render
    renderer.render(scene, camera)



    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()