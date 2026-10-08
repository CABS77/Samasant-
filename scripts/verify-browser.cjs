const { chromium } = require('playwright');
const { readFileSync, mkdtempSync, symlinkSync, existsSync, rmSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const root = resolve(__dirname, '..');
const dir = mkdtempSync('/tmp/samasante-browser-');
for (const name of ['.next','node_modules','next.config.ts','package.json','public']) if (existsSync(join(root,name))) symlinkSync(join(root,name),join(dir,name));
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
for (const key of Object.keys(env)) if (/^(ADMIN_|AI_|DEEPSEEK_|ANTHROPIC_|CLAUDE_|TWILIO_|SUPABASE_|NEXT_PUBLIC_|MAPBOX_|EMERGENCY_|SMS_|CRON_|APPOINTMENT_)/.test(key)) delete env[key];
const port = Number(process.env.BROWSER_TEST_PORT || 9013);
const base = `http://localhost:${port}`;
const server = spawn(process.execPath,[join(root,'node_modules/next/dist/bin/next'),'start','-p',String(port),'-H','localhost'],{ cwd:dir, env, stdio:['ignore','pipe','pipe'] });
let logs = ''; server.stdout.on('data',data => { logs += data; }); server.stderr.on('data',data => { logs += data; });
const results = [];
const pass = name => { results.push(name); console.log(`PASS: ${name}`); };
async function main() {
  let browser;
  try {
    let ready = false;
    for (let i=0;i<100;i++) { try { if ((await fetch(base)).ok) { ready=true; break; } } catch {} await new Promise(done=>setTimeout(done,200)); }
    assert.ok(ready,'Production test server did not start');
    browser = await chromium.launch({ headless:true, ...(process.env.CHROMIUM_PATH ? { executablePath:process.env.CHROMIUM_PATH } : {}), args:['--no-sandbox'] });
    const context = await browser.newContext(); const page = await context.newPage();
    await context.route('https://**',route=>route.abort()); // No provider, patient or real SMS contacted.
    const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    for (const method of ['POST','PUT','DELETE']) {
      const route = method === 'POST' ? '/api/doctors' : '/api/doctors/dr-1';
      const response=await context.request.fetch(`${base}${route}`,{method,data:{name:'Dr Fixture',specialty:'Gen',available:['Lun']}});
      assert.equal(response.status(),401);
    }
    pass('Anonymous doctor mutations denied');
    assert.equal((await context.request.get(`${base}/api/admin/appointments`)).status(),401);
    assert.equal((await context.request.get(`${base}/api/admin/notifications`)).status(),401);
    const audit = await context.request.get(`${base}/api/admin/audit`);
    assert.equal(audit.status(),401); assert.ok(audit.headers()['cache-control'].includes('private, no-store'));
    assert.equal((await context.request.post(`${base}/api/appointments`,{data:{}})).status(),401);
    assert.equal((await context.request.get(`${base}/api/patient/data`)).status(),401);
    assert.equal((await context.request.get(`${base}/api/operations/maintenance`)).status(),401);
    pass('Patient records, operator queue and maintenance protected');
    for (const path of ['/','/app','/appointments','/admin','/confidentialite']) {
      for (const width of [320,360,390,768]) {
        await page.setViewportSize({width,height:900}); await page.goto(base+path,{waitUntil:'networkidle'});
        assert.ok(await page.locator('main#main-content').count(),`${path}: missing main landmark`);
        const size=await page.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth}));
        assert.ok(size.body<=size.viewport+1,`${path} overflows at ${width}: ${size.body}`);
      }
    }
    pass('Five pages fit 320, 360, 390 and 768 px');
    const axe = readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
    for (const theme of ['light','dark']) {
      await page.evaluate(value=>localStorage.setItem('theme',value),theme);
      for (const path of ['/','/app','/appointments','/admin','/confidentialite']) {
        await page.goto(base+path,{waitUntil:'networkidle'}); await page.evaluate(axe);
        const violations=await page.evaluate(async()=> (await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.filter(item=>['serious','critical'].includes(item.impact)).map(item=>({id:item.id,nodes:item.nodes.map(node=>({target:node.target,summary:node.failureSummary}))})));
        assert.deepEqual(violations,[],`${path} ${theme}: ${JSON.stringify(violations)}`);
      }
    }
    pass('No serious or critical axe violations in five pages, light and dark');
    await page.goto(base+'/app',{waitUntil:'networkidle'});
    await page.getByLabel('Langue de l’interface').selectOption('wo');
    await page.waitForFunction(()=>document.documentElement.lang==='wo');
    assert.equal(await page.locator('html').getAttribute('lang'),'wo');
    await page.reload({waitUntil:'networkidle'}); assert.equal(await page.locator('html').getAttribute('lang'),'wo');
    pass('Wolof selection persists across navigation and reload');
    await page.getByLabel('Làkku jëfekaay bi').selectOption('fr');
    await page.keyboard.press('Tab'); await page.goto(base+'/app',{waitUntil:'networkidle'});
    await page.keyboard.press('Tab');
    await page.getByRole('link',{name:'Aller au contenu'}).focus(); await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'main-content');
    assert.equal(await page.locator('a[href="tel:1515"]').count(),1);
    pass('Keyboard skip link and direct human emergency call remain available');
    const headers=(await context.request.get(base+'/app')).headers(); const csp=headers['content-security-policy'];
    assert.ok(csp.includes("'nonce-") && !csp.includes("'unsafe-eval'")); assert.ok(!/script-src[^;]*unsafe-inline/.test(csp));
    assert.equal(headers['x-frame-options'],'DENY');
    assert.ok((await context.request.get(base+'/admin')).headers()['x-robots-tag'].includes('noindex'));
    assert.equal((await context.request.get(base+'/og')).headers()['content-type'],'image/png');
    const sitemap=await (await context.request.get(base+'/sitemap.xml')).text(); assert.ok(sitemap.includes('/confidentialite') && !sitemap.includes('/admin'));
    pass('Nonce CSP, denied framing, private noindex, real OG image and public sitemap');
    await page.goto(base+'/appointments',{waitUntil:'networkidle'});
    assert.ok(await page.getByText('Les réservations sont temporairement indisponibles. Contactez directement la clinique.').count());
    assert.equal(await page.getByText('Rendez-vous confirmé',{exact:true}).count(),0);
    pass('Unconfigured reservations cannot display a confirmed appointment');
    await page.evaluate(()=>navigator.serviceWorker.ready); await page.reload({waitUntil:'networkidle'});
    await page.evaluate(async()=> { const cache=await caches.open('samasante-cache-v1'); await cache.put('/api/private-fixture',new Response('private')); });
    await page.evaluate(()=>navigator.serviceWorker.controller.postMessage({type:'CLEAR_PRIVATE_DATA'}));
    await page.waitForFunction(async()=>!(await caches.keys()).includes('samasante-cache-v1'));
    const cached=await page.evaluate(async()=>{ const keys=[]; for(const name of await caches.keys()) { const cache=await caches.open(name); for(const req of await cache.keys()) keys.push(new URL(req.url).pathname); } return keys; });
    assert.ok(cached.every(path=>path.startsWith('/_next/static/') || ['/offline.html','/manifest.json','/icon-192x192.png','/icon-512x512.png','/favicon.ico'].includes(path)),`Private cache entry: ${JSON.stringify(cached)}`);
    await context.setOffline(true); await page.goto(base+'/never-visited-before',{waitUntil:'domcontentloaded'});
    assert.ok(await page.getByText('Vous êtes hors ligne').count()); assert.equal(await page.locator('a[href="tel:1515"]').count(),2);
    pass('Offline first navigation uses the public fallback; private caches purged');
    assert.deepEqual(errors,[],'Browser runtime errors'); pass('No browser runtime or hydration errors');
    if(process.env.BROWSER_TEST_REPORT) writeFileSync(process.env.BROWSER_TEST_REPORT,JSON.stringify({checks:results.length,results},null,2)+'\n');
  } finally { if(browser) await browser.close(); server.kill('SIGTERM'); rmSync(dir,{recursive:true,force:true}); }
}
main().catch(error=>{
  const message = `Browser check ${results.length + 1} failed: ${error.message}`;
  console.error(message);
  if (process.env.GITHUB_ACTIONS === 'true') {
    const annotation = message.slice(0,6000).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A');
    console.error(`::error title=Browser verification failed::${annotation}`);
  }
  if(process.env.BROWSER_TEST_REPORT) writeFileSync(process.env.BROWSER_TEST_REPORT,JSON.stringify({checks:results.length,results,error:message},null,2)+'\n');
  if(logs.includes('Error')) console.error(logs.slice(-1500));
  process.exitCode=1;
});
