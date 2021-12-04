<script lang="ts">
  import { onMount } from "svelte";
  import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
  } from "three";

  let el: Element;

  onMount(async () => {
    const width = 400;
    const height = 300;

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);

    const renderer = new WebGLRenderer();
    renderer.setSize(width, height);
    document.querySelectorAll(".three")[0].appendChild(renderer.domElement);

    const addCubes = function (scene) {
      const material = new MeshBasicMaterial({
        color: 0x3333dd,
      });

      for (var i = 0; i < 100; i++) {
        let geometry = new BoxGeometry(1, 1, 1);
        let cube = new Mesh(geometry, material);
        cube.position.x = (i % 10) * 2;
        cube.position.y = Math.floor(i / 10) * 2;

        scene.add(cube);
      }
    };

    addCubes(scene);

    camera.position.x = 15;
    camera.position.y = 0;
    camera.position.z = 10;
    camera.rotation.x = 1.2;
    camera.rotation.y = 0.3;

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();
  });
</script>

<svelte:head>Three</svelte:head>

<div bind:this={el} class="three" />
