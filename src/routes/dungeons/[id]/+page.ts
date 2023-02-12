import { error } from "@sveltejs/kit";
import { LANDBLOCK_NAME_URL } from "../../../lib/db";

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const res = await fetch(LANDBLOCK_NAME_URL(params.id));
  const data = await res.json();

  // Handle tiles not found with a 404
  if (!data || data["rows"] || data["rows"] <= 0) {
    throw error(404, {
      message: `No tiles found for dungeon with id 0x${params.id}`,
    });
  }

  return {
    id: params.id,
    name: data["rows"][0][0],
  };
}
