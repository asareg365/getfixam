// Reads from .env in development, from GitHub secret in CI/CD
export const firebaseConfig = {
  "projectId": "studio-1004537855-178e0",
  "appId": "1:38469851703:web:51c25e3dafdaed0743bdb2",
  "apiKey": process.env.REACT_APP_API_KEY || process.env.API_KEY,  // ✅ Flexible
  "authDomain": "studio-1004537855-178e0.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "38469851703"
};
