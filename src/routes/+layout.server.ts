import { VERCEL_COMMIT_REF } from "$env/static/private";

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
  return {
    VERCEL_COMMIT_REF: VERCEL_COMMIT_REF,
  };
}
