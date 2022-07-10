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
  import {OrbitControls} from "../lib/OrbitControls"

  let el: Element;

  const addDummyCubes = function (scene) {
    const material = new MeshBasicMaterial({
      color: 0x3333dd,
    });

    for (var i = 0; i < 100; i++) {
      let geometry = new BoxGeometry(1, 1, 0.1);
      let cube = new Mesh(geometry, material);
      cube.position.x = (i % 10) * 2;
      cube.position.y = Math.floor(i / 10) * 2;

      scene.add(cube);
    }
  };

  const addTiles = function (scene, tiles) {
    const material = new MeshBasicMaterial({
      color: 0x3333dd,
      opacity: 0.5,
    });
    material.transparent = true;

    for (var i = 0; i < tiles.length; i++) {
      let geometry = new BoxGeometry(10, 1, 10);
      let cube = new Mesh(geometry, material);
      cube.position.x = tiles[i][0];
      cube.position.y = tiles[i][2];
      cube.position.z = tiles[i][1];

      scene.add(cube);
    }
  };

  onMount(async () => {
    // Fetch
    const id = "011B";
    const url = `https://dungeonmapsdb.treestats.net/dungeonmaps.json?sql=select+x%2C+y%2C+z%2C+rotation%2C+environment_id+%2Cname+from+tiles+left+join+dungeons+on+dungeons.landblock_id+%3D%3D+tiles.landblock_id+where+tiles.landblock_id+%3D+%27${id}%27+%3B&_size=max`;
		const response = await fetch(url);
    const json = await response.json();
    const tiles = json["rows"];

    // Scene
    const width = 1024;
    const height = 768;

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);

    // Renderer
    const renderer = new WebGLRenderer();
    renderer.setSize(width, height);
    document.querySelectorAll(".three")[0].appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls( camera, renderer.domElement );
    camera.position.set( 0, 20, 100 );
    controls.update();

    // addDummyCubes(scene);
    addTiles(scene, tiles);


    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  });
</script>

<svelte:head><title>ThreeJS Demo</title></svelte:head>

<h2>ThreeJS Demo</h2>

<p>WIP</p>

<div bind:this={el} class="three" />
