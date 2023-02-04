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
    Vector2,
    WireframeGeometry,
    LineSegments,
    LineBasicMaterial
  } from "three";
  import {OrbitControls} from "../lib/OrbitControls"

  let el: Element;
  let showWireframe = true;

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
      const material = new MeshBasicMaterial({ map: texture });

      // Geometry and Mesh
      const geometry = new BoxGeometry(10, 1, 10);
      let cube = new Mesh(geometry, material);

      cube.position.x = tiles[i][0];
      cube.position.y = tiles[i][2];
      cube.position.z = tiles[i][1];

      // I needed this to get tiles to look right
      cube.scale.x = -1;

      scene.add(cube);
    }

  };


  const addDebugCubes = function (scene, tiles) {
    for (var i = 0; i < tiles.length; i++) {
      const geometry = new BoxGeometry(10, 10, 10);
      const wireframe = new WireframeGeometry(geometry);
      var mat = new LineBasicMaterial( { color: 0x00aa00 } );
      const line = new LineSegments(wireframe, mat);

      line.position.x = tiles[i][0];
      line.position.y = tiles[i][2];
      line.position.z = tiles[i][1];

      scene.add(line);
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
    const width = 800;
    const height = 800;

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);

    // Look down
    camera.position.set(0, 200, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new WebGLRenderer();
    renderer.setSize(width, height);
    document.querySelectorAll(".three")[0].appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.update();

    addTiles(scene, tiles);
    // addDebugCubes(scene, tiles);


    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  });
</script>

<svelte:head><title>3D Tiles Demo</title></svelte:head>

<h2>3D Tiles Demo</h2>

<!-- <label>Show Cell Wireframes<input type="checkbox" bind:checked={showWireframe} /></label> -->
<div bind:this={el} class="three" />
