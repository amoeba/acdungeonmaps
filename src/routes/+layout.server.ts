import { VERCEL_GIT_COMMIT_SHA } from "$env/static/private";

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
  return {
    VERCEL_GIT_COMMIT_SHA: VERCEL_GIT_COMMIT_SHA,
  };
}
