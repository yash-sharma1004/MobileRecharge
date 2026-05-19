import dotenv from 'dotenv';
dotenv.config();

console.log('--- FIREBASE CONFIG VERIFICATION ---');
console.log(`FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? '✅ LOADED' : '❌ MISSING'}`);
console.log(`VITE_FIREBASE_API_KEY: ${process.env.VITE_FIREBASE_API_KEY ? '✅ LOADED' : '❌ MISSING'}`);
console.log(`VITE_FIREBASE_APP_ID: ${process.env.VITE_FIREBASE_APP_ID ? '✅ LOADED' : '❌ MISSING'}`);

import fs from 'fs';
const keyExists = fs.existsSync('./serviceAccountKey.json');
console.log(`serviceAccountKey.json: ${keyExists ? '✅ FOUND' : '❌ MISSING'}`);
console.log('------------------------------------');

if (!process.env.FIREBASE_PROJECT_ID || !keyExists) {
  console.log('\nERROR: Firebase setup is incomplete.');
} else {
  console.log('\nSUCCESS: Firebase credentials and service account are ready.');
}
