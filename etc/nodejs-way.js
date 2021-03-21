const fs = require("fs");

const cell_path = "/Users/bryce/tmp/client_cell_1.dat";

console.log("!!!");

fs.readFile(cell_path, function(err, data) {
  if (err) {
    throw err;
  }

  console.log(data);

  var offset = 256;
  offset += 64;

  var bufferSlice = data.slice(0, offset);

  var preamble = data.slice(0, 256);
  var transactions = data.slice(256, 64);
  var rest = data.slice(320);

  for (var i = 0; i < 10; i++) {
    console.log(i, ": ", rest[i]);
  }

  var magic = rest.readUInt32LE();
  var blockSize = rest.readUInt32LE();
  var fileSize = rest.readUInt32LE();
  var type = rest.readUInt32LE();
  var subType = rest.readUInt32LE();
  var freeStart = rest.readUInt32LE();
  var freeEnd = rest.readUInt32LE();
  var freeCount = rest.readUInt32LE();
  var root = rest.readUInt32LE();

  var newLRU = rest.readUInt32LE();
  var oldLRU = rest.readUInt32LE();
  var useLRU = rest.readUInt32LE();

  var masterMap = rest.readUInt32LE();

  var versionEngine = rest.readUInt32LE();
  var versionGame = rest.readUInt32LE();
  // var versionMajor = rest.getUint8Array(16);
  // var versionMinor = rest.readUInt32LE();



});
