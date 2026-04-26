const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
    return true;
  } catch (err) {
    console.error(`FAIL ${name}: ${err.message}`);
    return false;
  }
}

const indexHtml = read('index.html');
const mainJs = read('js/main.js');
const googleServicesJs = read('js/google_services.js');
const firebaseServicesJs = read('js/firebase_services.js');
const selftestJs = read('js/selftest.js');

const checks = [];

checks.push(test('CSP meta exists in index', () => {
  assert(indexHtml.includes('Content-Security-Policy'));
  assert(indexHtml.includes("default-src 'self'"));
  assert(indexHtml.includes("object-src 'none'"));
}));

checks.push(test('Google services panel exists in UI', () => {
  assert(indexHtml.includes('id="googleServicesPanel"'));
  assert(indexHtml.includes('id="gsStorageApiStatus"'));
  assert(indexHtml.includes('id="gsDiscoveryApiStatus"'));
  assert(indexHtml.includes('id="gsBooksStatus"'));
}));

checks.push(test('Google services module verifies Google APIs', () => {
  assert(googleServicesJs.includes('https://storage.googleapis.com/storage/v1/'));
  assert(googleServicesJs.includes('https://www.googleapis.com/discovery/v1/apis'));
  assert(googleServicesJs.includes('https://www.googleapis.com/books/v1/volumes'));
  assert(googleServicesJs.includes('app:google-services-status'));
}));

checks.push(test('Firebase module emits status events', () => {
  assert(firebaseServicesJs.includes('app:firebase-services-status'));
  assert(firebaseServicesJs.includes('firebase-app.js'));
}));

checks.push(test('Main module renders service statuses', () => {
  assert(mainJs.includes('applyGoogleServicesStatus'));
  assert(mainJs.includes('applyFirebaseStatus'));
  assert(mainJs.includes('app:google-services-status'));
}));

checks.push(test('Automated self-tests include workflow breadth', () => {
  assert(selftestJs.includes('FAQ filter workflow executes'));
  assert(selftestJs.includes('chat sanitization workflow blocks html injection'));
  assert(selftestJs.includes('content security policy meta exists'));
}));

const passed = checks.filter(Boolean).length;
const total = checks.length;

if (passed !== total) {
  console.error(`\n${passed}/${total} checks passed`);
  process.exit(1);
}

console.log(`\n${passed}/${total} checks passed`);
