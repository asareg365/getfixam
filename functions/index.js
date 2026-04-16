const functions = require("firebase-functions");
const next = require("next");
const { defineJsonSecret } = require("firebase-functions/params");

const config = defineJsonSecret("CONFIG");

const isDev = process.env.NODE_ENV !== "production";

// We need to initialize the Next.js server inside the request handler to access secrets at runtime.
let server;

const regionalFunctions = functions.region('us-central1');

exports.nextServer = regionalFunctions.runWith({ secrets: [config] }).https.onRequest((req, res) => {
  // Initialize the server on the first request.
  if (!server) {
    const nextConfig = {
      distDir: "../.next",
      env: {
        NEXT_PUBLIC_FIREBASE_API_KEY: config.value().next.public_firebase_api_key,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: config.value().next.public_firebase_auth_domain,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: config.value().next.public_firebase_project_id,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: config.value().next.public_firebase_storage_bucket,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: config.value().next.public_firebase_messaging_sender_id,
        NEXT_PUBLIC_FIREBASE_APP_ID: config.value().next.public_firebase_app_id,
      },
    };

    server = next({
      dev: isDev,
      conf: nextConfig,
    });
  }

  const nextjsHandle = server.getRequestHandler();
  return server.prepare().then(() => nextjsHandle(req, res));
});
