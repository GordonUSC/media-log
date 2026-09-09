const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {JSDOM}=require('/tmp/gordtopia-engine-test/node_modules/jsdom');
const root=path.join(__dirname,'..');const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dom=new JSDOM(html,{url:'http://localhost/media-log/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window,d=w.document;let copied='',printed=0;
Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async t=>{copied=t}}});w.print=()=>printed++;
for(const f of ['media-data.js','site.js'])w.eval(fs.readFileSync(path.join(root,f),'utf8'));
assert.equal(w.MEDIA_ENTRIES.length,49);assert.equal(d.querySelectorAll('.record-item').length,8);
d.querySelector('[data-filter="screen"]').click();assert.ok([...d.querySelectorAll('.record-item h3')].some(x=>x.textContent.includes('High Score')));
const q=d.querySelector('#search');q.value='nothing matches 123456';q.dispatchEvent(new w.Event('input'));assert.ok(d.querySelector('.empty'));assert.ok(d.querySelector('#more-records').hidden);
q.value='';q.dispatchEvent(new w.Event('input'));d.querySelector('[data-filter="all"]').click();d.querySelector('#more-records').click();assert.equal(d.querySelectorAll('.record-item').length,16);
d.querySelector('#tab-ai').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(d.querySelector('#tab-belonging').getAttribute('aria-selected'),'true');assert.ok(d.querySelector('#topic-title').textContent.includes('default player'));
d.querySelector('[data-inquiry="board"]').click();assert.equal(d.querySelector('#inquiry').value,'board');assert.ok(d.querySelector('#next-contact').href.startsWith('mailto:gbellamy@gmail.com?'));
d.querySelector('#organization').value='Company <script>unsafe</script>';d.querySelector('#need').value='Build an ethical creative product';d.querySelector('#brief-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.ok(d.querySelector('#brief-text').value.includes('ethical'));assert.ok(decodeURIComponent(d.querySelector('#next-contact').href).includes('ethical'));
d.querySelector('#brief-text').value='My revised brief';d.querySelector('#brief-text').dispatchEvent(new w.Event('input'));assert.ok(decodeURIComponent(d.querySelector('#next-contact').href).endsWith('My revised brief'));
d.querySelector('#copy-brief').click();assert.equal(copied,'My revised brief');d.querySelector('#print-kit').click();assert.equal(printed,1);assert.ok(d.querySelector('#print-content').textContent.includes('My revised brief'));assert.equal(d.querySelectorAll('#print-content script').length,0);
d.querySelector('#play-video').click();assert.equal(d.querySelectorAll('iframe').length,1);assert.ok(d.querySelector('iframe').src.startsWith('https://www.youtube-nocookie.com/embed/Lb8ZcOXPQ-I'));
for(const a of d.querySelectorAll('a[href^="#"]'))assert.ok(d.getElementById(a.getAttribute('href').slice(1)),a.outerHTML);
assert.equal(d.querySelectorAll('h1').length,2); // includes the generated print introduction
console.log('PASS: archive filtering, empty state, pagination, keyboard themes, board inquiry routing, editable/copyable draft, print content, video opt-in, and page anchors.');setTimeout(()=>dom.window.close(),0);
