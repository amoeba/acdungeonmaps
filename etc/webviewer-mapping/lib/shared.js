'use strict';

const FaceStippling = {
    None : 0,
    Positive : 1,
    Negative : 2,
    Both : 3,
    NoPositiveUV : 4,
    NoNegativeUV : 8,
    NoUV : 20
}

const PolygonSide = {
    Single : 0,
    Double : 1,
    Both : 2
}

class Vertex {
    constructor(reader) {
        this.index = reader.getInt16();
        this.uvCount = reader.getInt16();
        this.position = reader.getVector3();
        this.normal = reader.getVector3();

        this.uvs = null;
        if (this.uvCount > 0) {
            this.uvs = reader.getMany((r) => r.getVector2(), this.uvCount);
        }
    }
}

class VertexList {
    constructor(reader, count) {
        this.positions = new Float32Array(count * 3);
        this.normals = new Float32Array(count * 3);
        this.indices = new Int16Array(count);
        this.uvs = new Array(count);

        for (var i = 0; i < count; i++) {
            this.indices[i] = reader.getInt16();
            var uvCount = reader.getInt16();

            var pi = i * 3;
            this.positions[pi] = reader.getFloat();
            this.positions[pi + 1] = reader.getFloat();
            this.positions[pi + 2] = reader.getFloat();

            this.normals[pi] = reader.getFloat();
            this.normals[pi + 1] = reader.getFloat();
            this.normals[pi + 2] = reader.getFloat();

            var iuvs = [];

            for (var j = 0; j < uvCount; j++) {
                iuvs.push(reader.getVector2());
                //iuvs.push({ u: reader.getFloat(), v: reader.getFloat() });
                // = reader.getDouble();
            }
            this.uvs[i] = iuvs;
        }
    }
}

class Polygon {
    //id = 0;
    //vertexCount = 0;
    //stippling = 0;
    //sides = 0;

    //faceTexture = -1;
    //backTexture = -1;
    //vertices = null;

    //faceTextureCoords = null;
    //backTextureCoords = null;

    constructor(reader) {
        this.id = reader.getInt16();
        this.vertexCount = reader.getUint8();
        this.stippling = reader.getUint8();
        this.sides = reader.getUint32();
        this.faceTexture = reader.getInt16();
        this.backTexture = reader.getInt16();

        this.vertices = new Int16Array(this.vertexCount);
        for (var i = 0; i < this.vertexCount; i++)
            this.vertices[i] = reader.getInt16();

        if ((this.stippling & FaceStippling.NoPositiveUV) === 0) {
            this.faceTextureCoords = new Uint8Array(this.vertexCount);
            for (var i = 0; i < this.vertexCount; i++)
                this.faceTextureCoords[i] = reader.getUint8();
        }

        if (this.sides === PolygonSide.Both && (this.stippling & FaceStippling.NoNegativeUV) === 0) {
            this.backTextureCoords = new Uint8Array(this.vertexCount);
            for (var i = 0; i < this.vertexCount; i++)
                this.backTextureCoords[i] = reader.getUint8();
        }

        if (this.sides === PolygonSide.Double) {
            this.backTexture = this.faceTexture;
            this.backTextureCoords = this.faceTextureCoords;
        }
    }
}

const BSP = {
    TreeType : {
        Drawing: 0, Physics: 1, Cell: 2
    },
    NodeType : {
        BPIN : 0x4250494e,
        BPIn : 0x4250496e,
        BPOL : 0x42504f4c,
        BPnN : 0x42506e4e,
        BPnn : 0x42506e6e,
        BpIN : 0x4270494e,
        BpIn : 0x4270496e,
        BpnN : 0x42706e4e,
        LEAF : 0x4c454146,
        PORT : 0x504f5254
    }
}

class BSPNode {
    /** @type {BSPNode|BSPLeaf|BSPPortal} */
    //positiveNode = null;
    /** @type {BSPNode|BSPLeaf|BSPPortal} */
    //negativeNode = null;
    /** @type {BSP.NodeType} */
    //type = 0;
    //plane = null;
    //sphere = null;
    //polyCount = 0;
    //polygons = null;

    /**
     * @constructor
     * @param {DatReader} reader
     * @param {BSP.TreeType} treeType
     * @param {BSP.NodeType} nodeType
     */
    constructor(reader, treeType, nodeType) {
        if (arguments.length !== 3) return;

        this.type = nodeType;
        this.readPlane(reader);

        switch (nodeType) {
            case BSP.NodeType.BPnn:
            case BSP.NodeType.BPIn:
                this.positiveNode = BSPNode.build(reader, treeType);
                break;

            case BSP.NodeType.BpIN:
            case BSP.NodeType.BpnN:
                this.negativeNode = BSPNode.build(reader, treeType);
                break;

            case BSP.NodeType.BPnN:
            case BSP.NodeType.BPIN:
                this.positiveNode = BSPNode.build(reader, treeType);
                this.negativeNode = BSPNode.build(reader, treeType);
                break;
        }

        if (treeType === BSP.TreeType.Cell)
            return;

        this.readSphere(reader);

        if (treeType === BSP.TreeType.Drawing)
        {
            this.polyCount = reader.getInt32();
            this.readPolys(reader);
        }
    }

    readPolys(reader) {
        this.polygons = new Int16Array(this.polyCount);
        for (var i = 0; i < this.polyCount; i++)
            this.polygons[i] = reader.getInt16();
    }

    readPlane(reader) {
        var x = reader.getFloat();
        var y = reader.getFloat();
        var z = reader.getFloat();
        var d = reader.getFloat();
        this.plane = {
            normal : { x: x, y: y, z: z },
            distance : d
        }
    }

    readSphere(reader) {
        var x = reader.getFloat();
        var y = reader.getFloat();
        var z = reader.getFloat();
        var r = reader.getFloat();
        this.sphere = {
            origin : { x: x, y: y, z: z },
            radius : r
        }
    }

    /**
     * Build BSP tree node
     * @param {DatReader} reader
     * @param {BSP.TreeType} treeType
     */
    static build(reader, treeType) {
        /** @type {BSP.NodeType} */
        var nodeType = reader.getInt32();
        switch (nodeType) {
            case BSP.NodeType.PORT:
                return new BSPPortal(reader, treeType, nodeType);

            case BSP.NodeType.LEAF:
                return new BSPLeaf(reader, treeType, nodeType);

            default:
                return new BSPNode(reader, treeType, nodeType);
        }
    }
}

class BSPPortal extends BSPNode {
    //portalCount = 0;
    //portalPolygons = null;

    /**
     * @constructor
     * @param {DatReader} reader
     * @param {BSP.TreeType} treeType
     * @param {BSP.NodeType} nodeType
     */
    constructor(reader, treeType, nodeType) {
        super();
        this.type = nodeType;
        this.readPlane(reader);
        this.positiveNode = BSPNode.build(reader, treeType);
        this.negativeNode = BSPNode.build(reader, treeType);

        if (treeType === BSP.TreeType.Drawing) {
            this.readSphere(reader)

            this.polyCount = reader.getInt32();
            this.portalCount = reader.getInt32();

            this.readPolys(reader);

            this.portalPolygons = [];
            for (var i = 0; i < this.portalCount; i++)
                this.portalPolygons.push({
                    polyId : reader.getInt16(),
                    portalIndex : reader.getInt16()
                });
        }
    }
}

class BSPLeaf extends BSPNode {
    //index = -1;
    //solid = false;

    /**
     * @constructor
     * @param {DatReader} reader
     * @param {BSP.TreeType} treeType
     * @param {BSP.NodeType} nodeType
     */
    constructor(reader, treeType, nodeType) {
        super();
        this.type = nodeType;
        this.index = reader.getInt32();

        if (treeType === BSP.TreeType.Physics) {
            this.solid = reader.getInt32() !== 0;
            this.readSphere(reader);

            this.polyCount = reader.getInt32();
            this.readPolys(reader);
        }
    }
}

class Frame {
    constructor(reader) {
        this.position = reader.getVector3();
        this.rotation = reader.getQuaternion();
    }
}

class PlacedObject {
    constructor(reader) {
        this.id = reader.getUint32();
        this.placement = new Frame(reader);
    }
}
