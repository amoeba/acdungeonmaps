'use strict';

// 0D000000
class Environment {
    constructor(reader) {
        try {
            this.id = reader.getUint32();
            this.cellStructs = reader.getMany((r) => new CellStruct(r));
        } catch (error) {
            //console.log(error, this, error.stack);
            throw error;
        }
    }
}

class CellStruct {
    constructor(reader) {
        try {
            this.id = reader.getUint32();
            this.polyCount = reader.getInt32();
            this.physicsPolyCount = reader.getInt32();
            this.portalCount = reader.getInt32();
            this.vertexType = reader.getInt32();
            this.vertexCount = reader.getInt32();

            //console.log('CellStruct', this.id, this.polyCount, this.physicsPolyCount, this.portalCount, this.vertexType, this.vertexCount);

            //Debug.Print("VertexType: {0:X8}", VertexType);
            if ((this.vertexType & 1) !== 0)
                this.vertices = new VertexList(reader, this.vertexCount);
            // if ((this.vertexType & 1) !== 0)
            //     this.vertices = reader.getMany((r) => new Vertex(r), this.vertexCount);

            this.polys = reader.getMany((r) => new Polygon(r), this.polyCount);
            this.portals = reader.getInt16Array(this.portalCount);

            reader.align();

            this.cellTree = BSPNode.build(reader, BSP.TreeType.Cell);

            this.physicsPolys = reader.getMany((r) => new Polygon(r), this.physicsPolyCount);
            this.physicsTree = BSPNode.build(reader, BSP.TreeType.Physics);

            this.hasDrawingTree = reader.getInt32();
            if (this.hasDrawingTree !== 0)
                this.drawingTree = BSPNode.build(reader, BSP.TreeType.Drawing);

            reader.align();

        } catch (error) {
            //console.log(error, this, error.stack);
            throw error;
        }
    }
}
