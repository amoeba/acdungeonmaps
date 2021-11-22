export const DB_URL_BASE = import.meta.env.DB_URI || "http://localhost:8001/landblocks"
const LANDBLOCKS_QUERY = (id: string): string => { return `select+*+from+landblocks+where+landblock_id+%3D+'${id}'%3B`; }
export const TILE_URL = (id: string): string => { return `${DB_URL_BASE}.csv?sql=${LANDBLOCKS_QUERY(id)}&_size=max`; }
