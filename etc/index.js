window.state = {
  PortalDAT: null,
  CellDAT: null,
  Dungeon: null,
};

window.load = function (e) {
  var cellInput = document.querySelectorAll("#cellfile")[0];
  var cellFile = cellInput.files[0];

  var cellReader = new FileReader();

  cellReader.onload = function (e) {
    window.state.CellDAT = new DatArchive(e.target.result);

    console.log("DAT loaded");
  };

  cellReader.readAsArrayBuffer(cellFile);
};

window.work = function (e) {
  console.log(window.state);

  // Drudge Hideout 0x019efffe
  var landblockId = 0x0007fffe;
  var landblockFile = window.state.CellDAT.getFile(landblockId);

  // Load the landblock info
  var blockInfo = new LandblockInfo(landblockFile.getReader());

  // Create a dungeon
  var dungeon = new Dungeon(blockInfo, window.state.CellDAT);

  window.state.Dungeon = dungeon;

  console.log("Done loading dungeon", dungeon);
};

window.draw = function (e) {
  console.log(e);

  var dungeon = window.state.Dungeon;
  console.log(JSON.stringify(dungeon.cells));
};
