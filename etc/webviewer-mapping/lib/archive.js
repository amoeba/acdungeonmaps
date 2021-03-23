'use strict';

Number.prototype.toHexStr = function () {
    return ('00000000' + this.toString(16)).substr(-8);
};

class DatArchive {
    constructor(buffer) {
        console.log("DatArchive");

        this.buffer = buffer;
        this.fileCache = {};
        this.readHeader();
    }

    readHeader() {
        console.log("readHeader");

        var offset = 256;
        var view = new DataView(this.buffer, 0, 0x400);
        this.transactions = new Uint8Array(this.buffer, offset, 64);
        offset += 64;

        var reader = new DatReader(this.buffer);
        reader.position = offset;

        this.magic = reader.getUint32();
        this.blockSize = reader.getUint32();
        this.fileSize = reader.getUint32();
        this.type = reader.getUint32();
        this.subType = reader.getUint32();
        this.freeStart = reader.getUint32();
        this.freeEnd = reader.getUint32();
        this.freeCount = reader.getUint32();
        this.root = reader.getUint32();

        this.newLRU = reader.getUint32();
        this.oldLRU = reader.getUint32();
        this.useLRU = reader.getUint32();

        this.masterMap = reader.getUint32();

        this.versionEngine = reader.getUint32();
        this.versionGame = reader.getUint32();
        this.versionMajor = reader.getUint8Array(16);
        this.versionMinor = reader.getUint32();
    }

    findFile(id) {
        console.log("findFile", id);

        var current = this.root;
        while (current !== 0 && current !== 0xcdcdcdcd) {
            var entry = new DatDirectory(this, current);
            this._cacheFiles(entry);

            var l = 0;
            var r = entry.fileCount - 1;
            var i = 0;

            while (l <= r) {
                i = ((l + r) / 2) | 0;
                var fe = null;
                try {
                    fe = entry.files[i];
                } catch (error) {
                    console.log('failed to get fileEntry', current, i, entry.fileCount);
                }
                if (!fe) {
                    console.log('failed to get fileEntry', current, i, entry.fileCount);
                }

                if (id === fe.id) {
                    return fe;
                } else if (id < fe.id) {
                    r = i - 1;
                } else {
                    l = i + 1;
                }
            }

            if (entry.isLeaf)
                break;

            if (id > entry.files[i].id)
                i++;

            current = entry.folders[i];
        }
        return null;
    }

    getFile(id) {
        console.log("archive::getFile", id);

        //console.log('fc', id.toHexStr(), this.fileCache);
        var fe = this.fileCache[id];
        if (!fe) {
            fe = this.findFile(id);
        }
        if (fe) {
            return new DatFile(this, fe.offset, fe.size);
        }
        return null;
    }

    _cacheFiles(node) {
        for (var i = 0; i < node.fileCount; i++) {
            var f = node.files[i];
            if (!f) {
                console.log('bad file', node.offset.toHexStr(), i);
                continue;
            }
            this.fileCache[f.id] = f;
            //console.log('adding file', f.id);
        }
    }

    loadFileCache() {
        this._loadDirectoryFiles(new DatDirectory(this, this.root));
    }

    _loadDirectoryFiles(node) {
        this._cacheFiles(node);
        if (!node.isLeaf) {
            for (var i = 0; i < 62; i++) {
                var offset = node.folders[i];
                //if (offset > this.fileSize) console.log('node offset', offset.toHexStr());
                if (offset != 0 && offset != 0xcdcdcd && offset < this.fileSize) {
                    this._loadDirectoryFiles(new DatDirectory(this, offset));
                }
            }
        }
    }
}

class DatReader {
    constructor(buffer) {
        console.log("DatReader");

        this.buffer = buffer;
        this.view = new DataView(buffer);
        this.position = 0;
        this.encoder = new TextDecoder();
    }

    _incRead(fn, cnt) {
        //var tmp =
        try {
            var args = [ this.position ];
            if (cnt > 1) args.push(true);
            var res = fn.apply(this.view, args);
            this.position += cnt;
            return res;
        } catch (error) {
            console.log('read fail', this, error, error.stack);
            throw error;
        }
    }

    align() {
        var offset = this.position % 4;
        if (offset !== 0)
            this.position += 4 - offset;
    }

    getString() {
        var len = this.getInt16();
        var res = this.encoder.decode(new Uint8Array(this.buffer, this.position, len));
        this.position += len;
        return res;
    }

    getInt8() { return this._incRead(DataView.prototype.getInt8, 1); }
    getUint8() { return this._incRead(DataView.prototype.getUint8, 1); }
    getInt16() { return this._incRead(DataView.prototype.getInt16, 2); }
    getUint16() { return this._incRead(DataView.prototype.getUint16, 2); }
    getInt32() { return this._incRead(DataView.prototype.getInt32, 4); }
    getUint32() { return this._incRead(DataView.prototype.getUint32, 4); }
    getFloat() { return this._incRead(DataView.prototype.getFloat32, 4); }
    getDouble() { return this._incRead(DataView.prototype.getFloat64, 8); }

    getSingle() { return this.getFloat(); }

    getPackedInt16() {
        var tmp = this.getUint8();
        if ((tmp & 0x80) !== 0) {
            tmp = (tmp & 0x7f) << 8;
            tmp |= this.getUint8();
        }
        return tmp;
    }

    getPackedInt32() {
        var b0 = this.getUint8();
        var result = b0;
        if ((b0 & 0x80) !== 0) {
            var b1 = this.getUint8();
            result = ((b0 & 0x7f) << 8) | b1;

            if ((b0 & 0x40) !== 0) {
                var s1 = this.getUint16();
                result = ((b0 & 0x3f) << 24) | (b1 << 16) | s1;
            }
        }

        return result;
    }

    getVector2() {
        return {
            x: this.getFloat(),
            y: this.getFloat()
        }
    }

    getVector3() {
        return {
            x: this.getFloat(),
            y: this.getFloat(),
            z: this.getFloat()
        }
    }

    getQuaternion() {
        return {
            w: this.getFloat(),
            x: this.getFloat(),
            y: this.getFloat(),
            z: this.getFloat()
        }
    }

    getMany(ctor, cnt) {
        var res = null;
        try {
            cnt = cnt !== undefined ? cnt : this.getInt32();
            res = new Array(cnt);
            for (var i = 0; i < cnt; i++)
                res[i] = ctor(this);

            return res;

        } catch (error) {
            //console.log(res);
            throw error;
        }
    }

    getInt8Array(cnt) {
        cnt = cnt !== undefined ? cnt : this.getInt32();
        var res = new Int8Array(this.buffer, this.position, cnt);
        this.position += res.byteLength;
        return res;
    }
    getUint8Array(cnt) {
        cnt = cnt !== undefined ? cnt : this.getInt32();
        var res = new Uint8Array(this.buffer, this.position, cnt);
        this.position += res.byteLength;
        return res;
    }

    getInt16Array(cnt) {
        var cntp = cnt;
        cnt = cnt !== undefined ? cnt : this.getInt32();
        try {
            var tmp = new Uint8Array(this.buffer, this.position, cnt * 2);
            var res = new Int16Array(tmp.buffer, 0, cnt);
            this.position += tmp.byteLength;
            return res;
        } catch (error) {
            console.log('getInt16Array', cntp, cnt, error, this);
        }
    }
    getUint16Array(cnt) {
        cnt = cnt !== undefined ? cnt : this.getInt32();
        var res = new Uint16Array(this.buffer, this.position, cnt);
        this.position += res.byteLength;
        return res;
    }

    getInt32Array(cnt) {
        cnt = cnt !== undefined ? cnt : this.getInt32();
        var res = new Int32Array(this.buffer, this.position, cnt);
        this.position += res.byteLength;
        return res;
    }
    getUint32Array(cnt) {
        cnt = cnt !== undefined ? cnt : this.getInt32();
        var res = new Uint32Array(this.buffer, this.position, cnt);
        this.position += res.byteLength;
        return res;
    }
}

class DatFile {
    constructor(dat, offset, size) {
        console.log("DatFile()");

        this.dat = dat;
        this.offset = offset;
        this.size = size;
        this.data = new Uint8Array(size);
        this.load();
    }

    get buffer() { return this.data.buffer; }

    getReader() { return new DatReader(this.data.buffer); }

    load() {
        var read = this.size;
        var blk_offset = this.offset;
        var data_offset = 0;
        while (read > 0) {
            var cnt = Math.min(this.dat.blockSize - 4, read);
            var block = new DataView(this.dat.buffer, blk_offset, this.dat.blockSize);
            this.data.set(new Uint8Array(this.dat.buffer, blk_offset + 4, cnt), data_offset);
            data_offset += cnt;
            read -= cnt;
            blk_offset = block.getInt32(0, true);
        }
    }
}

class DatDirectory {
    constructor(dat, offset) {
        this.dat = dat;
        this.offset = offset;
        this.folders = null;
        this.files = [];
        this.fileCount = -1;
        this.isLeaf = true;
        //this.loaded = false;
        this.load();
    }

    load() {
        var blk_offset = this.offset;
        var data_offset = 4;

        var dat = this.dat;

        var block = new DataView(this.dat.buffer, blk_offset, this.dat.blockSize);

        this.folders = new Uint32Array(this.dat.buffer, blk_offset + data_offset, 62);
        data_offset += 248; //62 * 4;

        this.isLeaf = !Boolean(this.folders[0]);
        this.fileCount = block.getInt32(data_offset, true);
        if (this.fileCount > 61)
            console.log('node entry count', this.offset.toHexStr(), data_offset.toHexStr(), this.fileCount);
        data_offset += 4;

        var getEntryChunk = function() {
            var need = 6;
            var chunk = new Uint32Array(need);
            var left = Math.min(dat.blockSize - data_offset, need * 4);
            var idx = 0;

            while (need > 0) {
                var cnt = (left / 4) | 0;
                if (cnt > 0) {
                    var tmp = new Uint32Array(dat.buffer, blk_offset + data_offset, cnt);
                    chunk.set(tmp, idx);
                    need -= cnt;
                    idx += cnt;

                    if (need === 0) {
                        data_offset += cnt * 4;
                        break;
                    }
                }

                blk_offset = block.getInt32(0, true);
                data_offset = 4;
                block = new DataView(dat.buffer, blk_offset, dat.blockSize);
                left = Math.min(dat.blockSize - data_offset, need * 4);
            }

            return chunk;
        };

        for (var i = 0; i < 61; i++) {
            var chunk = getEntryChunk();
            var fe = {
                flag : chunk[0],
                id : chunk[1],
                offset : chunk[2],
                size : chunk[3],
                time : chunk[4],
                version : chunk[5]
            };
            this.files.push(fe);
        }
    }
}
