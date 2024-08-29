import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
declare var $:any;

@Component({
  selector: 'app-model-viewer',
  templateUrl: './model-viewer.component.html',
  styleUrl: './model-viewer.component.scss'
})
export class ModelViewerComponent {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private model!: THREE.Group | undefined;

  private initialModelScale: THREE.Vector3 = new THREE.Vector3();
  private isDragging: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };
  private autoRotateSpeed: number = 0.005;
  private autoRotateInterval: any;
  firstPart!: string;
  secondPart!: string;

  constructor() { }

  ngOnInit(): void {


    // Initialize Three.js environment
    this.initThreeJS();

    // Load 3D model
    this.loadModel();

    // Setup mouse listeners for interaction
    this.setupMouseListeners();

    // Start auto-rotation of the model
    this.startAutoRotate();

    // Begin animation loop
    this.animate();
    $('#HomeBackground').particleground({
      dotColor: '#fff',
      lineColor: 'transparent',
      parallax:false,
      particleRadius: 2,
      parallaxFactor: 100,
      density: 10000,
      proximity:110
  });
  }


  private initThreeJS(): void {
    // Initialize WebGL renderer
    const width = this.rendererContainer.nativeElement.clientWidth;
    const height = this.rendererContainer.nativeElement.clientHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Create a scene
    this.scene = new THREE.Scene();

    // Create a camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 5); // Adjust this as necessary
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add directional light to the scene
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
  }

  private loadModel(): void {
    // Load 3D model using GLTFLoader
    const loader = new GLTFLoader();
    loader.load(
      'assets/backpack.glb',
      (gltf) => {
        if (gltf.scene && gltf.scene instanceof THREE.Group) {
          // Store loaded model and add it to the scene
          this.model = gltf.scene;
          this.scene.add(this.model);

          // Center the model in the scene
          const box = new THREE.Box3().setFromObject(this.model);
          const center = box.getCenter(new THREE.Vector3());
          this.model.position.sub(center);

          // Store initial scale of the model for reference
          this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              this.initialModelScale.copy(child.scale);
              // Set initial material color (optional)
              (child.material as THREE.MeshStandardMaterial).color.set(0xffffff);
            }
          });
        } else {
          console.error('Loaded model is not a THREE.Group.');
        }
      },
      undefined,
      (error) => {
        console.error('Error loading 3D model', error);
      }
    );
  }


  private setupMouseListeners(): void {
    // Setup mouse event listeners for interaction
    this.renderer.domElement.addEventListener('mousedown', (event: MouseEvent) => this.onMouseDown(event), false);
    this.renderer.domElement.addEventListener('mousemove', (event: MouseEvent) => this.onMouseMove(event), false);
    this.renderer.domElement.addEventListener('mouseup', () => this.onMouseUp(), false);
    this.renderer.domElement.addEventListener('wheel', (event: WheelEvent) => this.onMouseWheel(event), false);
  }

  private onMouseDown(event: MouseEvent): void {
    // Handle mouse down event for starting dragging
    this.isDragging = true;
    this.stopAutoRotate(); // Stop auto-rotation when interacting with the model
    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  private onMouseMove(event: MouseEvent): void {
    // Handle mouse move event for model rotation
    if (this.isDragging) {
      const deltaX = event.clientX - this.previousMousePosition.x;
      const deltaY = event.clientY - this.previousMousePosition.y;

      // Adjust model rotation based on mouse movement
      if (this.model) {
        this.model.rotation.y += deltaX * 0.01; // Adjust sensitivity as needed
        this.model.rotation.x += deltaY * 0.01;
      }

      this.previousMousePosition = { x: event.clientX, y: event.clientY };

      // Render the updated scene
      this.renderScene();
    }
  }

  private onMouseUp(): void {
    // Handle mouse up event to stop dragging
    this.isDragging = false;
  }

  private onMouseWheel(event: WheelEvent): void {
    // Handle mouse wheel event for model scaling
    if (this.model) {
      const delta = event.deltaY;
      const scaleFactor = delta > 0 ? 0.9 : 1.1; // Adjust scale speed as needed

      // Apply scale to the entire model
      this.model.scale.multiplyScalar(scaleFactor);

      // Clamp model scale to avoid extreme values
      this.model.scale.clamp(
        this.initialModelScale.clone().multiplyScalar(0.5),
        this.initialModelScale.clone().multiplyScalar(2)
      );

      // Render the updated scene
      this.renderScene();
    }
  }

  private startAutoRotate(): void {
    // Start auto-rotation of the model
    this.autoRotateInterval = setInterval(() => {
      if (this.model) {
        this.model.rotation.y += this.autoRotateSpeed; // Adjust rotation speed as needed
        this.renderScene();
      }
    }, 16);
  }

  private stopAutoRotate(): void {
    // Stop auto-rotation of the model
    clearInterval(this.autoRotateInterval);
  }

  private animate(): void {
    // Animation loop using requestAnimationFrame
    requestAnimationFrame(() => this.animate());
    this.renderScene();
  }

  private renderScene(): void {
    // Render the scene using WebGLRenderer
    this.renderer.render(this.scene, this.camera);
  }
}
