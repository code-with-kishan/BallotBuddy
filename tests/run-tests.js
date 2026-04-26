const fs = require('fs');
const path = require('path');
const assert = require('assert');
const https = require('https');

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

function testAsync(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`PASS ${name}`);
      return true;
    })
    .catch((error) => {
      console.error(`FAIL ${name}: ${error.message}`);
      return false;
    });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
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
  assert(indexHtml.includes('https://www.googleapis.com'));
  assert(indexHtml.includes('https://storage.googleapis.com'));
}));

checks.push(test('Google services panel exists in UI', () => {
  assert(indexHtml.includes('id="googleServicesPanel"'));
  assert(indexHtml.includes('id="googleAuthPanel"'));
  assert(indexHtml.includes('id="gsStorageApiStatus"'));
  assert(indexHtml.includes('id="gsDiscoveryApiStatus"'));
  assert(indexHtml.includes('id="gsBooksStatus"'));
  assert(indexHtml.includes('id="gsAuthStatus"'));
  assert(indexHtml.includes('name="google-api-key"'));
}));

checks.push(test('Google services module verifies Google APIs', () => {
  assert(googleServicesJs.includes('https://storage.googleapis.com/storage/v1/'));
  assert(googleServicesJs.includes('https://www.googleapis.com/discovery/v1/apis'));
  assert(googleServicesJs.includes('https://www.googleapis.com/books/v1/volumes'));
  assert(googleServicesJs.includes('getConfiguredApiKey'));
  assert(googleServicesJs.includes('apiKeyConfigured'));
  assert(googleServicesJs.includes('google-client-id'));
  assert(googleServicesJs.includes('data-google-auth-ready'));
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

async function runLiveChecks() {
  const liveChecks = [];

  liveChecks.push(await testAsync('Live Google Books API responds', async () => {
    const payload = await fetchJson('https://www.googleapis.com/books/v1/volumes?q=democracy&maxResults=1');
    assert(payload.kind === 'books#volumes');
    assert(typeof payload.totalItems === 'number');
  }));

  liveChecks.push(await testAsync('Live Google Storage API responds', async () => {
    const payload = await fetchJson('https://storage.googleapis.com/storage/v1/b/ballotbuddy01-500387404664-site/o/index.html');
    assert(payload.kind === 'storage#object');
    assert(payload.name === 'index.html');
  }));

  const passed = checks.filter(Boolean).length + liveChecks.filter(Boolean).length;
  const total = checks.length + liveChecks.length;

  if (passed !== total) {
    console.error(`\n${passed}/${total} checks passed`);
    process.exit(1);
  }

  console.log(`\n${passed}/${total} checks passed`);
}

runLiveChecks().catch((error) => {
  console.error(error);
  process.exit(1);
});
