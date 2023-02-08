const DB_NAME = "dungeonmaps";
const TILES_TBL_NAME = "tiles";
const DUNGEONS_TBL_NAME = "dungeons";

export const DB_HOST = import.meta.env.VITE_DB_URI || `http://127.0.01:8001`;

const LANDBLOCK_NAME_QUERY = function (id: string): string {
  return `SELECT%20name%20FROM%20dungeons%20WHERE%20landblock_id%20=%20%22${id}%22%20LIMIT%201;`;
};

export const LANDBLOCK_NAME_URL = function (id: string): string {
  return `${DB_HOST}/${DB_NAME}.json?sql=${LANDBLOCK_NAME_QUERY(id)}`;
};

const TILES_QUERY = function (id: string): string {
  return `select+x%2C+y%2C+z%2C+rotation%2C+environment_id+%2Cname+from+${TILES_TBL_NAME}+left+join+${DUNGEONS_TBL_NAME}+on+${DUNGEONS_TBL_NAME}.landblock_id+%3D%3D+${TILES_TBL_NAME}.landblock_id+where+${TILES_TBL_NAME}.landblock_id+%3D+%27${id}%27+%3B`;
};

export const TILE_URL = function (id: string): string {
  return `${DB_HOST}/${DB_NAME}.csv?sql=${TILES_QUERY(id)}&_size=max`;
};

export const TILE_URL_JSON = function (id: string): string {
  return `${DB_HOST}/${DB_NAME}.json?sql=${TILES_QUERY(id)}&_size=max`;
};

export const LANDBLOCKS_URL = `${DB_HOST}/${DB_NAME}.json?sql=select%20*%20from%20${DUNGEONS_TBL_NAME}%20limit%201000;`;
