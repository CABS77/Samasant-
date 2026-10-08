const { chromium } = require('playwright');
const { readFileSync, mkdtempSync, mkdirSync, symlinkSync, existsSync, rmSync, writeFileSync } = require('node:fs');
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
    const rendered = async () => {
      await page.locator('html[data-samasante-ready="true"]').waitFor();
      await page.locator('main#main-content h1').waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);
    };
    const visit = async path => {
      const response = await page.goto(base + path, { waitUntil: 'domcontentloaded' });
      if (response) assert.equal(response.status(), 200, `${path}: unexpected page response`);
      else assert.equal(page.url(),base + path,'Same-document navigation reached an unexpected URL');
      await rendered();
    };
    const reload = async () => { await page.reload({ waitUntil: 'domcontentloaded' }); await rendered(); };
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
    // Background image work must not hold the hydrated interface hostage.
    const pendingImages = [];
    const imagePattern = `${base}/_next/image?**`;
    const holdImage = route => { pendingImages.push(route); };
    await context.route(imagePattern, holdImage);
    await visit('/');
    assert.ok(pendingImages.length > 0, 'Slow-image fixture did not intercept a request');
    await context.unroute(imagePattern, holdImage);
    await Promise.all(pendingImages.map(route => route.continue()));
    pass('Hydrated interface is ready while background images remain pending');
    if (process.env.BROWSER_SCREENSHOT_DIR) {
      const screenshots = resolve(process.env.BROWSER_SCREENSHOT_DIR); mkdirSync(screenshots,{recursive:true});
      for (const [name,path] of [['accueil','/'],['assistant','/app#chat'],['rendez-vous','/appointments'],['administration','/admin']]) {
        for (const width of [390,1440]) {
          await page.setViewportSize({width,height:1000}); await visit(path);
          if (path === '/') await page.locator('.hero-art img').evaluate(img=>img.decode());
          await page.screenshot({path:join(screenshots,`${name}-${width}.png`),fullPage:true});
        }
      }
    }
    const pages = ['/','/app','/app#remedies','/app#clinics','/app#assistance','/appointments','/admin','/confidentialite','/cgu'];
    for (const path of pages) {
      for (const width of [320,360,390,768,1280]) {
        await page.setViewportSize({width,height:900}); await visit(path);
        assert.ok(await page.locator('main#main-content').count(),`${path}: missing main landmark`);
        const size=await page.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth}));
        assert.ok(size.body<=size.viewport+1,`${path} overflows at ${width}: ${size.body}`);
      }
    }
    pass('Six pages and every workspace panel fit 320, 360, 390, 768 and 1280 px');
    const axe = readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
    for (const theme of ['light','dark']) {
      await page.evaluate(value=>localStorage.setItem('theme',value),theme);
      for (const path of pages) {
        await visit(path); await page.evaluate(axe);
        const violations=await page.evaluate(async()=> (await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.filter(item=>['serious','critical'].includes(item.impact)).map(item=>({id:item.id,nodes:item.nodes.map(node=>({target:node.target,summary:node.failureSummary}))})));
        assert.deepEqual(violations,[],`${path} ${theme}: ${JSON.stringify(violations)}`);
      }
    }
    pass('No serious or critical axe violations in six pages and every workspace panel, light and dark');
    await visit('/app');
    await page.getByLabel('Langue de l’interface').selectOption('wo');
    await page.waitForFunction(()=>document.documentElement.lang==='wo');
    assert.equal(await page.locator('html').getAttribute('lang'),'wo');
    await reload(); assert.equal(await page.locator('html').getAttribute('lang'),'wo');
    pass('Wolof selection persists across navigation and reload');
    await page.setViewportSize({width:320,height:900});
    for (const path of pages) {
      await visit(path);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${path}: Wolof interface overflows at 320 px`);
      assert.ok(!(await page.locator('body').innerText()).includes('design_'),`${path}: untranslated redesign key`);
    }
    pass('Wolof interface fits 320 px in every page and workspace panel without untranslated redesign keys');
    await page.getByLabel('Làkku jëfekaay bi').selectOption('fr');
    await visit('/app#chat');
    const message = page.getByLabel('Votre message');
    await message.fill('Test de navigation uniquement.');
    await page.getByRole('tab',{name:'Catalogue',exact:true}).click();
    await page.getByLabel('Rechercher dans le catalogue').waitFor();
    assert.equal(new URL(page.url()).hash,'#remedies');
    await page.getByRole('tab',{name:'Conversation',exact:true}).click();
    assert.equal(await message.inputValue(),'Test de navigation uniquement.');
    await page.goBack();
    await page.waitForFunction(()=>document.querySelector('[role="tab"][aria-selected="true"]')?.textContent==='Catalogue');
    await visit('/app#clinics');
    assert.ok(await page.getByText('Rechercher un lieu au Sénégal',{exact:true}).isVisible());
    await page.getByRole('tab',{name:'Conversation',exact:true}).focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(()=>document.activeElement?.textContent==='Catalogue');
    await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.querySelector('[role="tab"][aria-selected="true"]')?.textContent==='Catalogue');
    assert.equal(await page.getByRole('tab',{name:'Catalogue',exact:true}).getAttribute('aria-selected'),'true');
    pass('Workspace deep links, browser back and keyboard tabs preserve the in-memory conversation');
    await visit('/app#chat');
    await page.getByText('Préférer la voix ? Options de dictée',{exact:true}).click();
    const microphone = page.getByRole('button',{name:'Démarrer la dictée'});
    assert.ok(await microphone.isDisabled());
    await page.getByLabel('J’accepte d’utiliser le service vocal du navigateur.').check();
    assert.ok(await microphone.isEnabled());
    pass('Optional dictation retains explicit consent before microphone use');
    await visit('/');
    await page.getByRole('button',{name:'Quand mon rendez-vous est-il confirmé ?'}).click();
    assert.ok(await page.getByText('L’envoi enregistre une demande avec une référence.',{exact:false}).isVisible());
    await page.setViewportSize({width:390,height:900});
    const menu = page.getByRole('button',{name:'Ouvrir le menu'});
    await menu.click();
    assert.equal(await page.getByRole('button',{name:'Fermer le menu'}).getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'),'false');
    pass('FAQ explains pending confirmation and mobile navigation closes with Escape');
    const directoryFixture = [{id:'doctor-ui-fixture',name:'Dr Fixture',specialty:'Généraliste',location:'Dakar',available:['Lun','Mar'],bio:'Fixture de test uniquement.'}];
    const directoryRoute = route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(directoryFixture)});
    await context.route(`${base}/api/doctors`,directoryRoute);
    await visit('/appointments');
    const search = page.getByLabel('Rechercher un médecin (nom, spécialité, lieu…)');
    await search.fill('Aucune correspondance fixture');
    await page.getByText('Aucun praticien à afficher',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Réinitialiser les filtres'}).click();
    await page.getByRole('heading',{name:'Dr Fixture',exact:true}).waitFor();
    await page.getByRole('button',{name:'Sélectionner',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Praticien sélectionné'}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#appointment-doctor').innerText(),'Dr Fixture — Généraliste');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'booking-form-heading');
    await context.unroute(`${base}/api/doctors`,directoryRoute);
    pass('Directory filters reset and selecting a practitioner moves focus to the request form');
    await page.keyboard.press('Tab'); await visit('/app');
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
    await visit('/appointments');
    assert.ok(await page.getByText('Les réservations sont temporairement indisponibles. Contactez directement la clinique.').count());
    assert.equal(await page.getByText('Rendez-vous confirmé',{exact:true}).count(),0);
    pass('Unconfigured reservations cannot display a confirmed appointment');
    await page.evaluate(()=>navigator.serviceWorker.ready); await reload();
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
  console.error(error.stack);
  if (process.env.GITHUB_ACTIONS === 'true') {
    const annotation = message.slice(0,6000).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A');
    console.error(`::error title=Browser verification failed::${annotation}`);
  }
  if(process.env.BROWSER_TEST_REPORT) writeFileSync(process.env.BROWSER_TEST_REPORT,JSON.stringify({checks:results.length,results,error:message},null,2)+'\n');
  if(logs.includes('Error')) console.error(logs.slice(-1500));
  process.exitCode=1;
});
