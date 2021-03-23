'use strict';

// xxyyFFFF
class Landblock {

    get blockId() { return this.id >>> 16; }

    constructor(reader) {
        this.id = reader.getUint32();
        this.hasBlockData = reader.getInt32();
        this.topology = reader.getUint16Array(81);
        this.height = reader.getUint8Array(81);
        reader.align();
    }
}

// xxyyFFFE
class LandblockInfo {

    get blockId() { return this.id >>> 16; }

    constructor(reader) {
        this.id = reader.getInt32();
        this.cellCount = reader.getInt32();
        this.objects = reader.getMany((r) => new PlacedObject(r));
        this.buildingCount = reader.getInt16();
        this.buildingFlags = reader.getInt16();
        this.buildings = reader.getMany((r) => new BuildingInfo(r), this.buildingCount);
    }
}

// xxyyNNNN
class EnvCell {

    get blockId() { return this.id >>> 16; }

    constructor(reader) {
        //console.log('EnvCell');

        this.id = reader.getUint32();
        this.flags = reader.getUint32();
        this.id2 = reader.getUint32(); // ?
        this.surfaceCount = reader.getUint8();
        this.portalCount = reader.getUint8();
        this.visibleCellCount = reader.getInt16();

        this.surfaces = reader.getUint16Array(this.surfaceCount);

        // Surfaces = new uint[SurfaceCount];
        // for (int i = 0; i < SurfaceCount; i++)
        //     Surfaces[i] = reader.ReadUInt16() | 0x08000000u;

        this.environmentId = reader.getUint16() | 0x0D000000;
        this.cellObjectIndex = reader.getInt16();
        this.placement = new Frame(reader);

        // portals
        this.cellPortals = reader.getMany((r) => new CellPortal(r), this.portalCount);
        this.visibleCells = reader.getInt16Array(this.visibleCellCount);

        if ((this.flags & 2) !== 0) {
            this.staticObjectCount = reader.getInt32();
            this.staticObjects = reader.getMany((r) => new PlacedObject(r), this.staticObjectCount);
        }

        // // restriction
        // if (Flags.HasFlag(EnvCellFlags.HasRestriction))
        // {
        // }
    }
}

class BuildingInfo {
    constructor(reader) {
        this.id = reader.getUint32();
        this.placement = new Frame(reader);
        this.unknown = reader.getInt32();
        this.portals = reader.getMany((r) => new BuildingPortal(r));
    }
}

class BuildingPortal {
    constructor(reader) {
        this.flags = reader.getInt16()
        this.cellId = reader.getUint16();
        this.portalId = reader.getUint16();
        this.visibleCount = reader.getInt16();
        this.visibleItems = reader.getUint16Array(this.visibleCount);
        reader.align();
    }
}

class CellPortal {
    constructor(reader) {
        //console.log('CellPortal');
        this.flags = reader.getUint16();
        this.polygonId = reader.getUint16();
        this.otherCellId = reader.getUint16();
        this.otherPortalId = reader.getUint16();
    }
}
