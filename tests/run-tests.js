const fs = require('fs');
const path = require('path');
const assert = require('assert');
const https = require('https');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function fileExists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function countMatches(source, re) {
  const matches = source.match(re);
  return matches ? matches.length : 0;
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({ status: response.statusCode, body });
      });
    }).on('error', reject);
  });
}

function fetchJson(url) {
  return fetch(url).then((res) => {
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`HTTP ${res.status}`);
    }
    return JSON.parse(res.body);
  });
}

function testSync(name, fn, bucket) {
  try {
    fn();
    bucket.pass += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    bucket.fail += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function testAsync(name, fn, bucket) {
  try {
    await fn();
    bucket.pass += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    bucket.fail += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

const indexHtml = read('index.html');
const css = read('css/styles.css');
const mainJs = read('js/main.js');
const chatJs = read('js/chat.js');
const dataJs = read('js/data.js');
const googleServicesJs = read('js/google_services.js');
const firebaseServicesJs = read('js/firebase_services.js');
const selftestJs = read('js/selftest.js');

const result = { pass: 0, fail: 0 };

['js/data.js', 'js/chat.js', 'js/guide.js', 'js/timeline.js', 'js/faq.js', 'js/myths.js', 'js/map.js', 'js/google_services.js', 'js/firebase_services.js', 'js/selftest.js', 'js/main.js'].forEach((rel) => {
  testSync(`File exists: ${rel}`, () => assert(fileExists(rel)), result);
});

testSync('CI workflow exists', () => {
  assert(fileExists('.github/workflows/tests.yml'));
}, result);

testSync('npm test script configured', () => {
  const pkg = JSON.parse(read('package.json'));
  assert(pkg.scripts && pkg.scripts.test && pkg.scripts.test.includes('node tests/run-tests.js'));
}, result);

['Content-Security-Policy', "default-src 'self'", "object-src 'none'", 'https://www.googleapis.com', 'https://storage.googleapis.com'].forEach((needle) => {
  testSync(`Security marker present: ${needle}`, () => assert(indexHtml.includes(needle)), result);
});

testSync('Chat user messages are text-rendered', () => {
  assert(chatJs.includes('bubble.textContent = content'));
}, result);

testSync('No hardcoded Google Maps v1 API key embed URL remains', () => {
  assert(!indexHtml.includes('maps/embed/v1/search?key='));
}, result);

['class="skip-link"', 'aria-label="Main Navigation"', 'aria-live="polite"'].forEach((needle) => {
  testSync(`Accessibility marker present: ${needle}`, () => assert(indexHtml.includes(needle)), result);
});

testSync('Keyboard-focusable feature cards exist', () => {
  assert(countMatches(indexHtml, /class="feature-card"/g) >= 4);
  assert(countMatches(indexHtml, /tabindex="0"/g) >= 4);
}, result);

testSync('Reduced-motion support exists', () => {
  assert(css.includes('prefers-reduced-motion: reduce'));
}, result);

['navigateTo(', 'setupKeyboardShortcuts(', 'setupCardKeyboardNavigation(', 'initGoogleServices()', 'initFirebaseServices()'].forEach((needle) => {
  testSync(`Main workflow hook present: ${needle}`, () => assert(mainJs.includes(needle)), result);
});

['FAQ filter workflow executes', 'chat sanitization workflow blocks html injection', 'content security policy meta exists', 'feature cards are keyboard-focusable'].forEach((needle) => {
  testSync(`Browser self-test case present: ${needle}`, () => assert(selftestJs.includes(needle)), result);
});

['https://storage.googleapis.com/storage/v1/', 'https://www.googleapis.com/discovery/v1/apis', 'https://www.googleapis.com/books/v1/volumes', 'getConfiguredApiKey', 'apiKeyConfigured', 'app:google-services-status'].forEach((needle) => {
  testSync(`Google services implementation marker: ${needle}`, () => assert(googleServicesJs.includes(needle)), result);
});

testSync('Google Civic API integration marker present', () => {
  assert(googleServicesJs.includes('https://www.googleapis.com/civicinfo/v2/elections'));
  assert(googleServicesJs.includes('civicApiOk'));
  assert(indexHtml.includes('id="gsCivicStatus"'));
}, result);

testSync('Firebase status event hook present', () => {
  assert(firebaseServicesJs.includes('app:firebase-services-status'));
}, result);

(function runDataChecks() {
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(`${dataJs}\nthis.__testData={ELECTION_STEPS,TIMELINES,FAQS,MYTHS,POLLING_STATIONS,FAQ_CATEGORIES,AI_KB};`, sandbox);
  const d = sandbox.__testData;

  testSync('Election steps count >= 5', () => assert(d.ELECTION_STEPS.length >= 5), result);
  testSync('Timeline has India/USA/UK', () => {
    assert(Array.isArray(d.TIMELINES.India));
    assert(Array.isArray(d.TIMELINES.USA));
    assert(Array.isArray(d.TIMELINES.UK));
  }, result);
  testSync('FAQ set has at least 20 entries', () => assert(d.FAQS.length >= 20), result);
  testSync('Myths set has at least 10 entries', () => assert(d.MYTHS.length >= 10), result);
  testSync('Polling stations set has entries', () => assert(d.POLLING_STATIONS.length >= 1), result);
  testSync('FAQ categories includes Technology', () => assert(d.FAQ_CATEGORIES.includes('Technology')), result);
  testSync('AI keyword buckets include eligibility and registration', () => {
    assert(Array.isArray(d.AI_KB.age_eligible));
    assert(Array.isArray(d.AI_KB.register));
  }, result);
})();

(async () => {
  await testAsync('Live Google Books API responds', async () => {
    const payload = await fetchJson('https://www.googleapis.com/books/v1/volumes?q=democracy&maxResults=1');
    assert(payload.kind === 'books#volumes');
    assert(typeof payload.totalItems === 'number');
  }, result);

  await testAsync('Live Google Storage API responds', async () => {
    const payload = await fetchJson('https://storage.googleapis.com/storage/v1/b/ballotbuddy01-500387404664-site/o/index.html');
    assert(payload.kind === 'storage#object');
    assert(payload.name === 'index.html');
  }, result);

  await testAsync('Live Google Civic API responds', async () => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return;
    }
    const payload = await fetchJson(`https://www.googleapis.com/civicinfo/v2/elections?key=${encodeURIComponent(apiKey)}`);
    assert(payload.kind === 'civicinfo#electionsQueryResponse');
    assert(Array.isArray(payload.elections));
  }, result);

  await testAsync('Live app URL reachable', async () => {
    const res = await fetch('https://storage.googleapis.com/ballotbuddy01-500387404664-site/index.html');
    assert(res.status === 200);
    assert(res.body.includes('Google Services Status'));
  }, result);

  const total = result.pass + result.fail;
  if (result.fail > 0) {
    console.error(`\n${result.pass}/${total} checks passed`);
    process.exit(1);
  }

  console.log(`\n${result.pass}/${total} checks passed`);
})();
