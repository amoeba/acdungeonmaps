'use strict';

// Your location is: 0x018A0289 [126.098854 -79.679626 0.005000] -0.459211 0.000000 0.000000 -0.888327

class Dungeon {
    constructor(blockInfo, archive) {
        console.log("new Dungeon");
        this.blockInfo = blockInfo;
        // this.game = game;
        // this.data = game.Data;
        this.archive = archive;
        this.cells = {};
        this.environments = {};
        this.envMeshes = {};
        this.cellMeshes = {};
        this.textures = {};

        this.drop = null;

        this.pendingCells = blockInfo.cellCount;

        // ignore buildings

        var block = (this.blockId << 16) >>> 0;
        for (var i = 0; i < blockInfo.cellCount; i++) {
            var cellId = block | (i + 0x100);
            console.log("posting cell", cellId);

            var cellFile = this.archive.getFile(cellId);
            var envCell = new EnvCell(cellFile.getReader());
            this.cells[cellId] = envCell;
            this.addEnvironment(envCell.environmentId);
        }
    }

    get id() { return this.blockInfo.id; }
    get blockId() { return this.blockInfo.id >>> 16; }
    get cellCount() { return this.blockInfo.cellCount; }
    get objects() { return this.blockInfo.objects; }

    addCell(cell) {
        var mmat = new BABYLON.MultiMaterial(`${cell.id.toHexStr()}-mat`, this.game.Scene);
        cell.material = mmat;
        this.cells[cell.id] = cell;
        if ((cell.environmentId >>> 0) > 0 && this.environments[cell.environmentId] === undefined) {
            this.environments[cell.environmentId] = false;

            var wait = Promise.resolve();
            cell.surfaces.forEach((val) => {
                var sid = 0x08000000 | val;
                wait = wait.then(() => this.game.textureLoader.getTexture(sid))
                .then((tx) => mmat.subMaterials.push(tx.data));
            });

            if (!this.drop) {
                for (var i = 0; i < cell.staticObjectCount; i++) {
                    var obj = cell.staticObjects[i];
                    if ((obj.id >= 0x02000C39 && obj.id <= 0x02000C48) || obj.id == 0x02000F4A) {
                        drop = {
                            cellId: cell.id,
                            placement: obj.placement
                        };
                        break;
                    }
                }
            }

            wait.then(() => this.data.postPortal('environment', cell.environmentId));
        } else {
            this.buildMesh();
        }
    }

    addEnvironment(env) {
        this.environments[env.id] = env;
        this.buildMesh();
    }

    getTexture(cellId, index) {
        var cell = this.cells[cellId];
        var txid = 0x08000000 | cell.surfaces[index]
        //console.log(`getting texture ${index} (${txid.toHexStr()}) for ${cellId}`);
        var res = this.textures[txid];

        if (!res) console.log(txid.toHexStr(), res);
        return res;
    }

    buildMesh() {
        //console.log('buildMesh', this.pendingCells);
        this.pendingCells--;
        if (this.pendingCells !== 0) return;

        // should be loaded now
        var block = (this.blockId << 16) >>> 0;
        for (var i = 0; i < this.blockInfo.cellCount; i++) {
            var cellId = block | (i + 0x100);
            var cell = this.cells[cellId];
            var env = this.environments[cell.environmentId];

            if (env) {
                var pos = cell.placement.position;
                var rot = cell.placement.rotation;

                var mesh = this.envMeshes[env.id];
                if (!mesh) {
                    // create the base mesh. we will clone this as the cellMesh
                    mesh = new EnvironmentMesh(env, this.game, cell.material);
                    this.envMeshes[env.id] = mesh;
                }

                this.cellMeshes[cellId] = mesh.clone(cell);
            }
        }

        // let's try to place the camera
        if (this.drop) {
            console.log('drop found', this.drop);
            var c = this.cellMeshes[this.drop.cellId];
            var m = c.getWorldMatrix();
            var p = this.drop.placement.position;
            var v = new BABYLON.Vector3(p.x, p.y, p.z);
            this.game.Camera.setTarget(BABYLON.Vector3.TransformCoordinates(v, m));
        } else {
            console.log('drop not found');
        }
        // var cell0 = this.cells[block | 0x100];
        // var env0 = this.environments[cell0.environmentId];
        // var cellMesh = this.cellMeshes[cell0.id];
        // //console.log(cell0, env0);
        // var sphere = env0.cellStructs[0].physicsTree.sphere;
        // if (sphere) {
        //     var matrix = cellMesh.getWorldMatrix();
        //     var o = sphere.origin;
        //     var ov = new BABYLON.Vector3(o.x, o.y, o.z);
        //     this.game.Camera.setTarget(BABYLON.Vector3.TransformCoordinates(ov, matrix));
        // }
    }
}

class EnvironmentMesh {
    constructor(env, game, material) {
        this.game = game;
        this.material = material;
        this.root = new BABYLON.TransformNode(env.id.toHexStr(), game.Scene);
        this.root.setEnabled(false);
        this.root.freezeWorldMatrix();

        for (var ci = 0; ci < env.cellStructs.length; ci++) {
            var cs = env.cellStructs[ci];
            if (cs.hasDrawingTree === 0) continue;

            var mesh = new BABYLON.Mesh(`${env.id.toHexStr()}-${ci}`, this.game.Scene);
            mesh.parent = this.root;
            mesh.subMeshes = [];
            mesh.material = this.material;

            var v = cs.vertices.positions;
            var n = cs.vertices.normals;
            var t = cs.vertices.uvs;

            var verts = [];
            var norms = [];
            var uvs = [];
            var idx = [];

            try {
                var subs = [];
                var index = 0;

                for (var i = 0; i < cs.polyCount; i++) {
                    var p = cs.polys[i];
                    var puvs = p.faceTextureCoords || p.backTextureCoords;
                    var txid = p.faceTexture;

                    if (txid === -1) continue;
                    if (!puvs) continue;

                    var idx0 = idx.length;

                    for (var pi = 2; pi < p.vertexCount; pi++) {
                        var vi0 = p.vertices[0] * 3;
                        var vi1 = p.vertices[pi-1] * 3;
                        var vi2 = p.vertices[pi] * 3;
                        var tc0 = puvs[0];
                        var tc1 = puvs[pi-1];
                        var tc2 = puvs[pi];

                        verts.push( v[vi0], v[vi0 + 1], v[vi0 + 2] );
                        verts.push( v[vi1], v[vi1 + 1], v[vi1 + 2] );
                        verts.push( v[vi2], v[vi2 + 1], v[vi2 + 2] );

                        norms.push( n[vi0], n[vi0 + 1], n[vi0 + 2] );
                        norms.push( n[vi1], n[vi1 + 1], n[vi1 + 2] );
                        norms.push( n[vi2], n[vi2 + 1], n[vi2 + 2] );

                        if (t.length > 0) {
                            var uv0 = t[p.vertices[0]][tc0];
                            var uv1 = t[p.vertices[pi - 1]][tc1];
                            var uv2 = t[p.vertices[pi]][tc2];

                            uvs.push( uv0.x, uv0.y );
                            uvs.push( uv1.x, uv1.y );
                            uvs.push( uv2.x, uv2.y );
                        } else {
                            uvs.push( 0, 0, 0, 0, 0, 0 );
                        }

                        idx.push(index++);
                        idx.push(index++);
                        idx.push(index++);
                    }

                    subs.push({
                        tx: txid,
                        start: idx0,
                        len: idx.length - idx0,
                    });

                    //new BABYLON.SubMesh(p.faceTexture, 0, verts.length, idx0, idx.length - idx0, mesh);
                }

                var vd = new BABYLON.VertexData();
                vd.positions = verts;//e.data.positions;
                vd.normals = norms;//e.data.normals;
                vd.indices = idx;
                vd.uvs = uvs;
                vd.applyToMesh(mesh, true);

                //console.log(vd);

                for (var i = 0; i < subs.length; i++) {
                    var s = subs[i];
                    new BABYLON.SubMesh(s.tx, 0, verts.length, s.start, s.len, mesh);
                }

            } catch (error) {
                console.log(error);
            }

            // var pt = cs.physicsTree;
            // if (pt) {
            //     var sphere = pt.sphere;
            //     if (sphere) {
            //         var o = sphere.origin;
            //         var mesh = BABYLON.MeshBuilder.CreateSphere(
            //             `${env.id.toHexStr()}-${ci}`,
            //             { diameter : sphere.radius * 2 },
            //             this.game.Scene);
            //         mesh.position = new BABYLON.Vector3(o.x, o.y, o.z);
            //         mesh.parent = this.root;
            //         mesh.material = this.game.Materials.Default;
            //     }
            // }
        }
    }

    clone(cell) {
        var result = this.root.clone(cell.id.toHexStr(), null, true);

        this.root.getChildMeshes(true).forEach((mesh) => {
            var meshClone = mesh.createInstance();
            meshClone.parent = result;
        })
        //var result = this.root.createInstance(`${this.root.name}_${++this.instanceCount}`);

        var pos = cell.placement.position;
        var rot = cell.placement.rotation;
        result.unfreezeWorldMatrix();
        result.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);
        result.rotationQuaternion = new BABYLON.Quaternion(rot.x, rot.y, rot.z, rot.w);
        result.setEnabled(true);
        result.freezeWorldMatrix();

        return result;
    }
}
