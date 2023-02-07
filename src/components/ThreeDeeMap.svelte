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
      Vector3,
      WireframeGeometry,
      LineSegments,
      LineBasicMaterial
    } from "three";
    import { PointerLockControls } from "../lib/PointerLockControls";

    import { TILE_URL_JSON } from "../lib/db";

    // Props
    export let id;

    //
    let name;

    //
    let loading = true;
    let error = null;
    //

    let el: Element;
    let controls;

    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    const velocity = new Vector3();
    const direction = new Vector3();
    let prevTime = performance.now();

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
        var mat = new LineBasicMaterial({ color: 0x00aa00 });
        const line = new LineSegments(wireframe, mat);

        line.position.x = tiles[i][0];
        line.position.y = tiles[i][2];
        line.position.z = tiles[i][1];

        scene.add(line);
      }
    };

    const Render = function(tiles) {
      // Scene
      const width = 800;
      const height = 400;

      const scene = new Scene();
      const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(50, 50, 50);

      // Controls
      controls = new PointerLockControls(camera, document.body);
      scene.add(controls.getObject());

      el.addEventListener('click', function () {
        controls.lock();
      });

      const onKeyDown = function (event) {
        switch (event.code) {
          case 'ArrowUp':
          case 'KeyW':
            moveForward = true;
            break;
          case 'ArrowLeft':
          case 'KeyA':
            moveLeft = true;
            break;
          case 'ArrowDown':
          case 'KeyS':
            moveBackward = true;
            break;
          case 'ArrowRight':
          case 'KeyD':
            moveRight = true;
            break;
        }
      };

      const onKeyUp = function (event) {
        switch (event.code) {
          case 'ArrowUp':
          case 'KeyW':
            moveForward = false;
            break;
          case 'ArrowLeft':
          case 'KeyA':
            moveLeft = false;
            break;
          case 'ArrowDown':
          case 'KeyS':
            moveBackward = false;
            break;
          case 'ArrowRight':
          case 'KeyD':
            moveRight = false;
            break;
        }
      };

      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);

      // Renderer
      const renderer = new WebGLRenderer();
      renderer.setSize(width, height);
      document.querySelectorAll(".three")[0].appendChild(renderer.domElement);

      // Objects in scene
      addTiles(scene, tiles);

      function animate() {
        requestAnimationFrame(animate);

        const time = performance.now();
        if (controls.isLocked === true) {
          const delta = (time - prevTime) / 100000; // I tweaked this

          velocity.x -= velocity.x * 10.0 * delta;
          velocity.z -= velocity.z * 10.0 * delta;

          velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

          direction.z = Number(moveForward) - Number(moveBackward);
          direction.x = Number(moveRight) - Number(moveLeft);
          direction.normalize(); // this ensures consistent movements in all directions

          if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
          if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

          controls.moveRight(- velocity.x * delta);
          controls.moveForward(- velocity.z * delta);

          controls.getObject().position.y += (velocity.y * delta); // new behavior

          if (controls.getObject().position.y < 10) {
            velocity.y = 0;
            controls.getObject().position.y = 10;
          }
        }

        renderer.render(scene, camera);
      }

      animate();
    }

    onMount(async () => {
      fetch(TILE_URL_JSON(id))
        .then((res) => {
          loading = false;

          return res.json();
        })
        .then((json) => {
          const tiles = json["rows"];
          name = tiles[0][5]
          Render(tiles)
        })
        .catch((e) => {
          loading = false;
          error = `Error fetching tiles: ${e}`;
        });
    });
  </script>

{#if loading}
  <p class="loading">*portal sounds*</p>
{/if}
{#if error}
  <p class="error">{error}</p>
{/if}
{#if !loading && !error}
  <span>
    <strong>Controls:</strong> Click to enter scene and use FPS controls (arrow keys, WASD and mouse) to move
  </span>
{/if}

<div bind:this={el} class="three" />

