// Re-deploying function to apply latest build (v4)
const functions = require("firebase-functions");
const next = require("next");

const dev = false; // always production on Firebase
const app = next({
  dev,
  conf: { distDir: "../.next" }, // point to your built Next.js app
});

const handle = app.getRequestHandler();

exports.nextApp = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});
