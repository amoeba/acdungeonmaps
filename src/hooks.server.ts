import { SENTRY_DSN } from "$env/static/private";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
});

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
  // example integration with https://sentry.io/
  Sentry.captureException(error);

  return {
    message: "Whoops!",
    code: error?.code ?? "UNKNOWN",
  };
}
