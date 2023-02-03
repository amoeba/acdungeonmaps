<script lang="ts">
  import { onMount } from "svelte";
  import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    TextureLoader,
    Vector2
  } from "three";
  import {OrbitControls} from "../lib/OrbitControls"

  let el: Element;
  const tl  = new TextureLoader();

  const getRotation = function(w : number): number {
    if (w == 1) {
      return 0;
    } else if (w < -0.70 && w > -0.8) {
      return 90;
    } else if (w > 0.70 && w < 0.8) {
      return -90;
    } else {
      return 180;
    }
  }

  const addTiles = function (scene, tiles) {
    for (var i = 0; i < tiles.length; i++) {
      const w = tiles[i][3];
      // Note: Extra +180 here was needed to get tiles right
      const rot = getRotation(w) + 180;

      // Texture
      let texture = tl.load(`/tiles/${tiles[i][4]}.bmp`);

      // Important to center, I think?
      texture.center = new Vector2(0.5, 0.5);
      texture.rotation = rot * (Math.PI / 180);

      // Material
      let material = new MeshBasicMaterial({ map: texture });

      // Geometry and Mesh
      let geometry = new BoxGeometry(10, 1, 10);
      let cube = new Mesh(geometry, material);

      cube.position.x = tiles[i][0];
      cube.position.y = tiles[i][2];
      cube.position.z = tiles[i][1];

      // I needed this to get tiles to look right
      cube.scale.x = -1;

      scene.add(cube);
    }

  };

  onMount(async () => {
    // Fetch
    const id = "0012";
    const url = `https://dungeonmapsdb.treestats.net/dungeonmaps.json?sql=select+x%2C+y%2C+z%2C+rotation%2C+environment_id+%2Cname+from+tiles+left+join+dungeons+on+dungeons.landblock_id+%3D%3D+tiles.landblock_id+where+tiles.landblock_id+%3D+%27${id}%27+%3B&_size=max`;
		const response = await fetch(url);
    const json = await response.json();
    const tiles = json["rows"];

    // Scene
    const width = 600;
    const height = 600;

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);

    // Renderer
    const renderer = new WebGLRenderer();
    renderer.setSize(width, height);
    document.querySelectorAll(".three")[0].appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls( camera, renderer.domElement );
    camera.position.set( 0, 100, 0 );
    controls.update();

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
