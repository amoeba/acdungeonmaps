import { COMMIT_REF } from "$env/static/private";

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
  return {
    COMMIT_REF: COMMIT_REF,
  };
}
