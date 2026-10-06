// Dependency-free behavior checks. This is a mock DOM, not a rendering test.
const fs=require('fs'),path=require('path'),vm=require('vm'),nativeAssert=require('assert/strict');
let checks=0;const assert=new Proxy(nativeAssert,{get(target,key){const value=target[key];return typeof value==='function'?(...args)=>{checks++;return value(...args)}:value}});
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const state={activeElement:null},events={},nodes={};
function node(){return {value:'',hidden:false,textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=String(v)},focus(){state.activeElement=this}}}
for(const id of ['search','record-count','record-list','reset-record','more-records'])nodes['#'+id]=node();
let rendered=[],markup='';
Object.defineProperty(nodes['#record-list'],'innerHTML',{get:()=>markup,set:s=>{markup=s;rendered=[...s.matchAll(/<article class="record-item" data-entry="(\d+)">[\s\S]*?<h3 tabindex="-1">([\s\S]*?)<\/h3>[\s\S]*?<details( open)?>/g)].map(m=>({id:m[1],heading:Object.assign(node(),{textContent:m[2]}),open:!!m[3]}))}});
nodes['#record-list'].querySelectorAll=s=>s==='h3'?rendered.map(r=>r.heading):[];
const filters=['all','stage','screen','else'].map(f=>Object.assign(node(),{dataset:{filter:f}}));
const context={URL,URLSearchParams,console,location:new URL('http://localhost/media-log/?keep=1'),window:{MEDIA_ENTRIES:[],addEventListener(k,f){events[k]=f}},document:{querySelectorAll(s){if(s==='[data-filter]')return filters;if(s==='.record-item details[open]')return rendered.filter(r=>r.open).map(r=>({closest:()=>({dataset:{entry:r.id}})}));throw Error('Unmocked query '+s)}},$:s=>nodes[s],escapeHTML:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
context.history={state:null,replaceState(_s,_t,url){context.location=new URL(url)}};
vm.createContext(context);vm.runInContext(read('media-data.js'),context);
const source=read('site.js');vm.runInContext(source.slice(source.indexOf('// The record can'),source.indexOf('\nlet toast;')),context);
const q=nodes['#search'],reset=nodes['#reset-record'],more=nodes['#more-records'];const search=s=>{q.value=s;q.oninput()};
assert.equal(rendered.length,8);assert.equal(reset.hidden,true);
search('2020 Madden');assert.equal(rendered.length,2);assert.ok(rendered.some(r=>r.heading.textContent.includes('High Score')));assert.equal(context.location.searchParams.get('q'),'2020 Madden');assert.equal(context.location.searchParams.get('keep'),'1');assert.equal(context.location.hash,'#record');
search('gAmInG  everyone');assert.equal(rendered.length,1);assert.ok(rendered[0].heading.textContent.includes('Gaming for Everyone'));
search('Valuéd  Cívics');assert.equal(rendered.length,1);
search('not-a-real-entry-999999');assert.equal(rendered.length,0);assert.ok(markup.includes('Clear search &amp; filters')||markup.includes('Clear search & filters'));assert.equal(more.hidden,true);assert.equal(reset.hidden,false);
reset.onclick();assert.equal(q.value,'');assert.equal(state.activeElement,q);assert.equal(rendered.length,8);assert.equal(reset.hidden,true);assert.equal(context.location.searchParams.has('q'),false);
filters.find(f=>f.dataset.filter==='screen').onclick();assert.equal(rendered.length,7);assert.equal(more.hidden,true);assert.equal(context.location.searchParams.get('media'),'screen');assert.equal(filters[2].attrs['aria-pressed'],'true');
reset.onclick();rendered[0].open=true;more.onclick();assert.equal(rendered.length,16);assert.ok(rendered[0].open);assert.equal(state.activeElement,rendered[8].heading);assert.ok(markup.includes('(opens in a new tab)'));
for(let i=0;i<5;i++)more.onclick();assert.equal(rendered.length,49);assert.equal(more.hidden,true);assert.equal(more.textContent,'Show 0 more appearances');
context.location=new URL('http://localhost/?media=screen&q=Netflix');events.popstate();assert.equal(rendered.length,1);assert.ok(rendered[0].heading.textContent.includes('High Score'));
context.location=new URL('http://localhost/?media=invalid&q=%3Cscript%3E');events.popstate();assert.equal(filters[0].attrs['aria-pressed'],'true');assert.equal(rendered.length,0);assert.equal(markup.includes('<script>'),false);
context.location=new URL('http://localhost/?media=screen&q=Netflix');events.popstate();q.value='';q.oninput();assert.equal(rendered.length,7);
for(const file of ['index.html','archive.html']){const html=read(file),ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));for(const m of html.matchAll(/<a\b[^>]*href="#([^"]+)"/g))assert.ok(ids.has(m[1]),`${file}: missing #${m[1]}`);for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!m[1].includes('application/ld+json'))new vm.Script(m[2]);}
assert.ok(read('index.html').includes('href="#record">Media record'));
assert.ok(read('archive.html').includes('id="record"'));assert.ok(read('archive.html').includes('id="archive-reset"'));
console.log(`PASS: ${checks} dependency-free assertions for record search (year, multi-word, accents, case), empty recovery, category filters, URL restore and parameter preservation, pagination focus model, open context preservation, source labels, all internal anchors, and inline JavaScript syntax. Mock DOM only; browser rendering and assistive-technology behavior are not verified.`);
