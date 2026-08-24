(()=>{(()=>{if(window.__dshTaskboardLoaded)return;window.__dshTaskboardLoaded=!0;let tt="/taskboard/api",f={todo:{label:"\u5F85\u529E",color:"#8b949e"},in_progress:{label:"\u8FDB\u884C\u4E2D",color:"#3478f6"},in_review:{label:"\u8BC4\u5BA1\u4E2D",color:"#bc8cff"},blocked:{label:"\u5DF2\u963B\u585E",color:"#f85149"},done:{label:"\u5DF2\u5B8C\u6210",color:"#3fb950"}},_=["todo","in_progress","in_review","blocked","done"],k={low:{label:"\u4F4E",color:"#8b949e"},medium:{label:"\u4E2D",color:"#d29922"},high:{label:"\u9AD8",color:"#e3862e"},urgent:{label:"\u7D27\u6025",color:"#f85149"}},V={none:"\u2014",pending:"\u8BC4\u5BA1\u5F85\u5904\u7406",approved:"\u8BC4\u5BA1\u901A\u8FC7",rejected:"\u8BC4\u5BA1\u9A73\u56DE"},B={none:"\u2014",pending:"\u6D4B\u8BD5\u5F85\u5904\u7406",passed:"\u6D4B\u8BD5\u901A\u8FC7",failed:"\u6D4B\u8BD5\u5931\u8D25"},U=["#79c0ff","#d2a8ff","#7ee787","#ffa657","#ff7b72","#f2cc60","#a5d6ff","#ffd7a8"],E="data-dsh-taskboard-active",g="data-dsh-taskboard-entry",L="data-dsh-taskboard-view",z="data-dsh-ssh-active",et='<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2.5" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M6.5 6.5v7"/></svg>',i=(t,e=document)=>e.querySelector(t),y=(t,e=document)=>[...e.querySelectorAll(t)],l=t=>String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),st=t=>{let e=0;for(let a of String(t))e=e*31+a.charCodeAt(0)>>>0;return U[e%U.length]},H=t=>{if(!t)return"";let e=new Date(t),a=Date.now()-t;return a<6e4?"\u521A\u521A":a<36e5?`${Math.floor(a/6e4)} \u5206\u949F\u524D`:a<864e5?`${Math.floor(a/36e5)} \u5C0F\u65F6\u524D`:`${e.getMonth()+1}/${e.getDate()} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`},x=[],I=[],j=[],R=[],w={q:"",repo:"",priority:"",status:"",label:""},S="overview",N={};async function u(t,e={}){let a=await fetch(tt+t,{headers:{"content-type":"application/json"},...e}),o=await a.json().catch(()=>({}));if(!a.ok)throw new Error(o.error||`HTTP ${a.status}`);return o}let at=`
<style>
[data-pane='conversation'],
[class*='centerCol'] { position: relative; }
[${L}] {
  position: absolute; inset: 0; display: none; z-index: 60;
  background: var(--dsw-alias-bg-base, #0d1117); overflow: hidden;
}
html[${E}]:not([${z}]) [data-pane='conversation'] > div[${L}],
html[${E}]:not([${z}]) [class*='centerCol'] > div[${L}] {
  display: flex !important; flex-direction: column;
}
html[${E}]:not([${z}]) [data-pane='conversation'] > :not([${L}]),
html[${E}]:not([${z}]) [class*='centerCol'] > :not([${L}]) {
  display: none !important;
}
[${g}] {
  display: flex; align-items: center; gap: 8px; width: 100%; height: 32px;
  padding: 0 12px; background: transparent; border: none; border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #9aa7b4); cursor: pointer;
  font-size: 13px; white-space: nowrap;
}
[${g}]:hover { background: var(--dsw-specific-sidebar-nav-item-hover, #1b2127); color: var(--dsw-alias-label-primary, #e6edf3); }
[${g}][data-active] { background: var(--dsw-specific-sidebar-nav-item-active, #232a31); color: var(--dsw-alias-label-primary, #e6edf3); font-weight: 600; }
[${g}] span { display: inline-flex; align-items: center; justify-content: center; flex: none; }
[${g}][data-icon-only] { gap: 0; justify-content: center; padding: 0; height: 36px; margin-bottom: 12px; }
[${g}][data-icon-only] > span:not(:first-child) { display: none; }

#dsh-tb-view{height:100%;display:flex;flex-direction:column;color:var(--dsw-alias-label-primary,#e6edf3);font-size:12.5px}
.dsh-tb-head{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--dsw-alias-border-l2,#2a3138);flex:none;gap:10px}
.dsh-tb-title{font-size:15px;font-weight:600;flex:none}
.dsh-tb-tabs{display:flex;gap:2px;flex:1;min-width:0}
.dsh-tb-tab{background:transparent;border:0;border-bottom:2px solid transparent;color:var(--dsw-alias-label-secondary,#9aa7b4);padding:4px 12px;font-size:13px;cursor:pointer}
.dsh-tb-tab:hover{color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-tb-tab.dsh-tb-tab-on{border-bottom-color:#3478f6;color:var(--dsw-alias-label-primary,#e6edf3);font-weight:600}
.dsh-tb-head-actions{display:flex;gap:6px;flex:none}
.dsh-tb-head-actions button,.dsh-tb-toolbar select,.dsh-tb-toolbar input{background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-primary,#e6edf3);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer}
.dsh-tb-head-actions #dsh-tb-new{background:var(--dsw-alias-button-primary-bg,#3478f6);border-color:transparent}
.dsh-tb-toolbar{display:flex;gap:8px;align-items:center;padding:8px 16px;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);flex:none;flex-wrap:wrap}
.dsh-tb-toolbar #dsh-tb-search{flex:1;min-width:140px}
.dsh-tb-count{color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:11.5px}
.dsh-tb-body{flex:1;min-height:0;overflow:auto}
.dsh-tb-columns{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:10px 14px;height:100%;box-sizing:border-box}
.dsh-tb-col{background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;display:flex;flex-direction:column;min-height:100%;min-width:150px}
.dsh-tb-col-head{padding:7px 9px;font-weight:600;font-size:12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);color:var(--dsw-alias-label-secondary,#9aa7b4)}
.dsh-tb-col-head b{color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-tb-col-body{padding:6px;display:flex;flex-direction:column;gap:6px;overflow-y:auto}
.dsh-tb-card{background:var(--dsw-alias-bg-base,#0d1117);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:7px;padding:8px 9px;cursor:pointer;transition:border-color .12s}
.dsh-tb-card:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-card-title{font-size:12.5px;font-weight:500;line-height:1.35;word-break:break-all}
.dsh-tb-card-meta{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;align-items:center}
.dsh-tb-pill{font-size:10.5px;padding:1px 6px;border-radius:9px;border:1px solid currentColor;line-height:1.5}
.dsh-tb-bar{height:3px;border-radius:2px;background:var(--dsw-alias-bg-layer-2,#1b2127);margin-top:7px;overflow:hidden}
.dsh-tb-bar>i{display:block;height:100%;background:var(--dsw-alias-button-primary-bg,#3478f6)}
.dsh-tb-card-foot{display:flex;justify-content:space-between;margin-top:6px;color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:10.5px}
.dsh-tb-empty{color:var(--dsw-alias-label-secondary,#9aa7b4);text-align:center;padding:14px 4px;font-size:11.5px}
/* list view */
.dsh-tb-table{width:100%;border-collapse:collapse;font-size:12px}
.dsh-tb-table th{position:sticky;top:0;background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-secondary,#9aa7b4);text-align:left;padding:7px 10px;border-bottom:1px solid var(--dsw-alias-border-l2,#2a3138);font-weight:600;white-space:nowrap;z-index:1}
.dsh-tb-table td{padding:6px 10px;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);vertical-align:middle}
.dsh-tb-table tr{cursor:pointer}
.dsh-tb-table tr:hover td{background:var(--dsw-alias-bg-layer-2,#1b2127)}
/* overview */
.dsh-tb-ov{padding:14px 16px;height:100%;box-sizing:border-box;overflow:auto}
.dsh-tb-ov-stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.dsh-tb-ov-stat{flex:1;min-width:110px;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;padding:10px 12px}
.dsh-tb-ov-stat .n{font-size:22px;font-weight:700;line-height:1.1}
.dsh-tb-ov-stat .l{font-size:11px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-top:2px}
.dsh-tb-ov-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px;margin-bottom:16px}
.dsh-tb-ov-ws{background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;padding:10px 12px;cursor:pointer;transition:border-color .12s}
.dsh-tb-ov-ws:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-ov-ws h4{margin:0 0 2px;font-size:13.5px}
.dsh-tb-ov-ws .path{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);word-break:break-all;margin-bottom:7px}
.dsh-tb-ov-ws .meta{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.dsh-tb-ov-ws .branch{font-size:10.5px;color:#79c0ff;border:1px solid #79c0ff66;border-radius:8px;padding:1px 6px}
.dsh-tb-ov-ws .dirty{color:#f85149}
.dsh-tb-ov-ws .sess{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-left:auto}
.dsh-tb-ov-ws .sesslist{margin-top:7px;border-top:1px dashed var(--dsw-alias-border-l3,#232a31);padding-top:5px;display:flex;flex-direction:column;gap:2px}
.dsh-tb-ov-ws .sesslist .s{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;color:#79c0ff}
.dsh-tb-ov-ws .sesslist .s:hover{text-decoration:underline}
.dsh-tb-ov-sec{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#9aa7b4);margin:14px 0 8px}
.dsh-tb-ov-recent{display:flex;flex-direction:column;gap:5px}
.dsh-tb-ov-item{display:flex;align-items:center;gap:8px;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:6px;padding:6px 10px;cursor:pointer}
.dsh-tb-ov-item:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-ov-item .dot{width:8px;height:8px;border-radius:50%;flex:none}
.dsh-tb-ov-item .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-tb-ov-item .r{font-size:10.5px;color:#79c0ff;flex:none}
.dsh-tb-ov-item .tm{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);flex:none}
.dsh-tb-modal-mask{position:fixed;inset:0;z-index:9995;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}
.dsh-tb-modal{width:min(640px,92vw);max-height:88vh;overflow:auto;background:var(--dsw-alias-bg-layer-1,#14181d);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:10px;padding:16px 18px;color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-tb-modal h3{margin:0 0 12px;font-size:15px}
.dsh-tb-field{margin-bottom:10px}
.dsh-tb-field label{display:block;font-size:11.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-bottom:4px}
.dsh-tb-field input,.dsh-tb-field select,.dsh-tb-field textarea{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-base,#0d1117);color:var(--dsw-alias-label-primary,#e6edf3);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:6px;padding:6px 9px;font-size:12.5px;font-family:inherit}
.dsh-tb-field textarea{min-height:70px;resize:vertical}
.dsh-tb-row{display:flex;gap:10px}
.dsh-tb-row .dsh-tb-field{flex:1}
.dsh-tb-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
.dsh-tb-actions button{padding:6px 14px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2,#2a3138);background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-primary,#e6edf3);cursor:pointer;font-size:12.5px}
.dsh-tb-actions button.dsh-tb-primary{background:var(--dsw-alias-button-primary-bg,#3478f6);border-color:transparent;color:#fff}
.dsh-tb-actions button.dsh-tb-danger{color:#f85149}
.dsh-tb-actions button.dsh-tb-grow{flex:1}
.dsh-tb-note{border-left:2px solid var(--dsw-alias-border-l2,#2a3138);padding:2px 0 2px 10px;margin:8px 0;color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:12px;white-space:pre-wrap;word-break:break-all}
.dsh-tb-note .dsh-tb-note-time{font-size:10.5px}
.dsh-tb-sess{display:flex;justify-content:space-between;align-items:center;background:var(--dsw-alias-bg-base,#0d1117);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:6px;padding:5px 8px;margin-bottom:5px;gap:8px}
.dsh-tb-sess .dsh-tb-sess-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px}
.dsh-tb-sess button{flex:none;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);color:var(--dsw-alias-label-primary,#e6edf3);border-radius:5px;padding:2px 8px;font-size:11px;cursor:pointer}
.dsh-tb-sess button.dsh-tb-open{background:var(--dsw-alias-button-primary-bg,#3478f6);border-color:transparent}
</style>`;document.documentElement.insertAdjacentHTML("beforeend",at);let ot=`
<div id="dsh-tb-view" ${L}="">
  <div class="dsh-tb-head">
    <div class="dsh-tb-title">\u4EFB\u52A1\u9762\u677F</div>
    <div class="dsh-tb-tabs">
      <button class="dsh-tb-tab" data-tb-view="overview">\u6982\u89C8</button>
      <button class="dsh-tb-tab" data-tb-view="kanban">\u770B\u677F</button>
      <button class="dsh-tb-tab" data-tb-view="list">\u5217\u8868</button>
    </div>
    <div class="dsh-tb-head-actions">
      <button id="dsh-tb-refresh" title="\u5237\u65B0">\u27F3</button>
      <button id="dsh-tb-new" title="\u65B0\u5EFA\u4EFB\u52A1">\uFF0B \u65B0\u5EFA</button>
    </div>
  </div>
  <div class="dsh-tb-toolbar" id="dsh-tb-toolbar">
    <input id="dsh-tb-search" placeholder="\u641C\u7D22\u6807\u9898/\u4ED3\u5E93/feature/\u6807\u7B7E\u2026" />
    <select id="dsh-tb-repo-filter"><option value="">\u5168\u90E8\u4ED3\u5E93</option></select>
    <select id="dsh-tb-priority-filter"><option value="">\u5168\u90E8\u4F18\u5148\u7EA7</option></select>
    <select id="dsh-tb-status-filter"><option value="">\u5168\u90E8\u72B6\u6001</option></select>
    <select id="dsh-tb-label-filter"><option value="">\u5168\u90E8\u6807\u7B7E</option></select>
    <span id="dsh-tb-count" class="dsh-tb-count"></span>
  </div>
  <div class="dsh-tb-body" id="dsh-tb-body"></div>
</div>`;function it(){let t=document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');return t===null?void 0:t.querySelector('[class*="logoRow"]')?.parentElement??t.firstElementChild}function dt(t){let e=t.querySelector('button[class*="newSession"]');if(e!==null)return e;for(let a of t.children)if(a.tagName==="BUTTON")return a}function lt(){return document.querySelector('[data-pane="conversation"]')??document.querySelector('[class*="centerCol"]')??void 0}function nt(t){return[...t.classList].some(e=>/collapsed/i.test(e))}let h=null,A=null;function D(){return document.documentElement.hasAttribute(E)}function W(){h!==null&&(D()?h.setAttribute("data-active",""):h.removeAttribute("data-active"))}function J(t){let e=t!==void 0?t:!D();e&&document.documentElement.removeAttribute(z),e?document.documentElement.setAttribute(E,""):document.documentElement.removeAttribute(E),W(),e&&M()}function Y(){if(A!==null)return;let t=lt();t!==void 0&&(A=document.createElement("div"),A.setAttribute(L,""),A.innerHTML=ot,t.appendChild(A),rt())}function G(){let t=it();if(t===void 0||(h===null&&(h=document.createElement("button"),h.type="button",h.setAttribute(g,""),h.innerHTML=`<span>${et}</span><span>\u4EFB\u52A1\u770B\u677F</span>`,h.title="\u4EFB\u52A1\u770B\u677F",h.addEventListener("click",()=>J()),W()),h.parentElement===t))return;let e=dt(t),a=e?.closest('[class*="logoRow"]'),o=a!=null&&a.parentElement===t?a:e;t.insertBefore(h,o?.nextElementSibling??null),(()=>{h!==null&&(nt(t)?h.setAttribute("data-icon-only",""):h.removeAttribute("data-icon-only"))})()}function rt(){i("#dsh-tb-new")?.addEventListener("click",mt),i("#dsh-tb-refresh")?.addEventListener("click",()=>M()),i("#dsh-tb-search")?.addEventListener("input",()=>{w.q=i("#dsh-tb-search").value.trim(),v()}),i("#dsh-tb-repo-filter")?.addEventListener("change",()=>{w.repo=i("#dsh-tb-repo-filter").value,v()}),i("#dsh-tb-priority-filter")?.addEventListener("change",()=>{w.priority=i("#dsh-tb-priority-filter").value,v()}),i("#dsh-tb-status-filter")?.addEventListener("change",()=>{w.status=i("#dsh-tb-status-filter").value,v()}),i("#dsh-tb-label-filter")?.addEventListener("change",()=>{w.label=i("#dsh-tb-label-filter").value,v()}),y(".dsh-tb-tab").forEach(t=>t.addEventListener("click",()=>{S=t.dataset.tbView,K()}))}async function v(){let t=new URLSearchParams;for(let a of["q","repo","priority","status","label"])w[a]&&t.set(a,w[a]);x=(await u(`/tasks?${t}`)).tasks||[],K()}async function ct(){try{let[t,e]=await Promise.all([u("/sessions"),u("/workspaces")]);I=t.sessions||[],j=e.workspaces||[];let a=i("#dsh-tb-repo-filter");if(a){let s=a.value;a.innerHTML='<option value="">\u5168\u90E8\u4ED3\u5E93</option>'+j.map(n=>`<option value="${l(n.title)}">${l(n.title)}</option>`).join(""),s&&[...a.options].some(n=>n.value===s)&&(a.value=s)}let o=await u("/tasks").catch(()=>({tasks:[]})),r=new Set;for(let s of o.tasks||[])for(let n of s.labels||[])r.add(n);R=[...r].sort();let c=i("#dsh-tb-label-filter");if(c){let s=c.value;c.innerHTML='<option value="">\u5168\u90E8\u6807\u7B7E</option>'+R.map(n=>`<option value="${l(n)}">${l(n)}</option>`).join(""),s&&[...c.options].some(n=>n.value===s)&&(c.value=s)}let b=i("#dsh-tb-priority-filter");b&&!b.options.length&&(b.innerHTML='<option value="">\u5168\u90E8\u4F18\u5148\u7EA7</option>'+Object.entries(k).map(([s,n])=>`<option value="${s}">${n.label}</option>`).join(""));let m=i("#dsh-tb-status-filter");m&&!m.options.length&&(m.innerHTML='<option value="">\u5168\u90E8\u72B6\u6001</option>'+Object.entries(f).map(([s,n])=>`<option value="${s}">${n.label}</option>`).join(""))}catch{}}async function bt(){for(let t of j)if(!(!t.path||N[t.path]!==void 0))try{let e=await fetch(`/ide/api/git?op=status&path=${encodeURIComponent(t.path)}`).then(a=>a.json());N[t.path]=e.git?{branch:e.branch?.name||"(detached)",dirty:(e.files||[]).length}:null}catch{N[t.path]=null}}function M(){return ct().then(()=>bt()).then(v).catch(v)}function F(t){return(t.labels||[]).map(e=>`<span class="dsh-tb-pill" style="color:${st(e)}">${l(e)}</span>`).join("")}function pt(t){let e=f[t.status]||f.todo;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function Q(t){let e=k[t.priority]||k.medium;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function X(t){try{localStorage.setItem("dsh.sessions.current",JSON.stringify({sessionId:t}))}catch{}location.reload()}function ht(){var n;let t={};for(let d of _)t[d]=0;let e={};for(let d of x){t[d.status]!==void 0&&t[d.status]++;let p=d.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(e[p]||(e[p]=[])).push(d)}let a=x.length,o={};for(let d of I)d.repo&&(o[n=d.repo]||(o[n]=[])).push(d);let r=[...x].sort((d,p)=>p.updatedAt-d.updatedAt).slice(0,10),c=[["\u5168\u90E8",a,"#e6edf3"],..._.map(d=>[f[d].label,t[d]||0,f[d].color])].map(([d,p,P])=>`<div class="dsh-tb-ov-stat"><div class="n" style="color:${P}">${p}</div><div class="l">${d}</div></div>`).join(""),b;j.length?b=j.map(d=>{let p=e[d.title]||[],P=_.map($=>p.filter(q=>q.status===$).length),xt=_.map(($,q)=>P[q]?`<span class="dsh-tb-pill" style="color:${f[$].color}">${f[$].label} ${P[q]}</span>`:"").join(""),wt=(o[d.title]||[]).length,C=N[d.path],gt=C?`<span class="branch">\u2387 ${l(C.branch)}</span>${C.dirty?`<span class="branch dirty" title="${C.dirty} \u4E2A\u672A\u63D0\u4EA4\u6587\u4EF6">\u25CF${C.dirty}</span>`:""}`:"",Z=(o[d.title]||[]).slice(0,3).map($=>`<div class="s" data-sid="${l($.id)}" title="\u6253\u5F00\u4F1A\u8BDD ${l($.id)}">\u25B8 ${l($.title)}</div>`).join("");return`<div class="dsh-tb-ov-ws" data-repo="${l(d.title)}">
					<h4>${l(d.title)}</h4>
					<div class="path">${l(d.path||"")}</div>
					<div class="meta">${xt||'<span class="dsh-tb-empty" style="padding:0">\u65E0\u4EFB\u52A1</span>'}${gt}<span class="sess">\u4F1A\u8BDD ${wt}</span></div>
					${Z?`<div class="sesslist">${Z}</div>`:""}
				</div>`}).join(""):b='<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u5DE5\u4F5C\u533A\uFF09</div>';let m=r.length?r.map(d=>{let p=f[d.status]||f.todo;return`<div class="dsh-tb-ov-item" data-id="${l(d.id)}">
				<span class="dot" style="background:${p.color}"></span>
				<span class="t">${l(d.title)}</span>
				${d.repo?`<span class="r">${l(d.repo)}</span>`:""}
				<span class="tm">${H(d.updatedAt)}</span>
			</div>`}).join(""):'<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF09</div>',s=i("#dsh-tb-body");s&&(s.innerHTML=`<div class="dsh-tb-ov">
			<div class="dsh-tb-ov-stats">${c}</div>
			<div class="dsh-tb-ov-sec">\u5DE5\u4F5C\u533A\u5185\u5BB9</div>
			<div class="dsh-tb-ov-grid">${b}</div>
			<div class="dsh-tb-ov-sec">\u6700\u8FD1\u66F4\u65B0</div>
			<div class="dsh-tb-ov-recent">${m}</div>
		</div>`,y(".dsh-tb-ov-ws").forEach(d=>d.addEventListener("click",()=>{w.repo=d.dataset.repo;let p=i("#dsh-tb-repo-filter");p&&(p.value=w.repo),S="kanban",K(),v()})),y(".dsh-tb-ov-ws .s").forEach(d=>d.addEventListener("click",p=>{p.stopPropagation(),X(d.dataset.sid)})),y(".dsh-tb-ov-item").forEach(d=>d.addEventListener("click",()=>O(d.dataset.id))))}function ft(t){let e=f[t.status]||f.todo,a=k[t.priority]||k.medium,o=[];o.push(Q(t)),t.repo&&o.push(`<span class="dsh-tb-pill" style="color:#79c0ff">${l(t.repo)}</span>`),t.feature&&o.push(`<span class="dsh-tb-pill" style="color:#d2a8ff">${l(t.feature)}</span>`),o.push(F(t)),t.review&&t.review!=="none"&&o.push(`<span class="dsh-tb-pill" style="color:${t.review==="approved"?"#3fb950":t.review==="rejected"?"#f85149":"#d29922"}">${V[t.review]}</span>`),t.test&&t.test!=="none"&&o.push(`<span class="dsh-tb-pill" style="color:${t.test==="passed"?"#3fb950":t.test==="failed"?"#f85149":"#d29922"}">${B[t.test]}</span>`);let r=[];return t.sessionIds?.length&&r.push(`<span>\u4F1A\u8BDD ${t.sessionIds.length}</span>`),t.notes?.length&&r.push(`<span>\u8BC4\u8BBA ${t.notes.length}</span>`),r.push(`<span>${H(t.updatedAt)}</span>`),`<div class="dsh-tb-card" data-id="${l(t.id)}" style="border-left:3px solid ${e.color}">
			<div class="dsh-tb-card-title">${l(t.title)}</div>
			<div class="dsh-tb-card-meta">${o.join("")}</div>
			${t.progress>0?`<div class="dsh-tb-bar"><i style="width:${Math.min(100,t.progress)}%"></i></div>`:""}
			<div class="dsh-tb-card-foot">${r.join(" \xB7 ")}</div>
		</div>`}function vt(){let t=i("#dsh-tb-body"),e=i("#dsh-tb-count");if(!t)return;t.innerHTML='<div class="dsh-tb-columns"></div>';let a=i(".dsh-tb-columns",t);e&&(e.textContent=`${x.length} \u4E2A\u4EFB\u52A1`);for(let[o,r]of Object.entries(f)){let c=document.createElement("div");c.className="dsh-tb-col";let b=x.filter(s=>s.status===o);c.innerHTML=`<div class="dsh-tb-col-head">${r.label} <b>${b.length}</b></div><div class="dsh-tb-col-body"></div>`;let m=i(".dsh-tb-col-body",c);b.length?b.forEach(s=>m.insertAdjacentHTML("beforeend",ft(s))):m.innerHTML='<div class="dsh-tb-empty">\u2014</div>',a.appendChild(c)}y(".dsh-tb-card",a).forEach(o=>o.addEventListener("click",()=>O(o.dataset.id)))}function ut(){let t=i("#dsh-tb-body"),e=i("#dsh-tb-count");if(!t)return;if(e&&(e.textContent=`${x.length} \u4E2A\u4EFB\u52A1`),!x.length){t.innerHTML='<div class="dsh-tb-ov"><div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u53F3\u4E0A\u89D2\u300C\uFF0B \u65B0\u5EFA\u300D\uFF09</div></div>';return}let a=x.map(o=>`<tr data-id="${l(o.id)}">
			<td>${pt(o)}</td>
			<td>${Q(o)}</td>
			<td style="max-width:340px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l(o.title)}</div></td>
			<td>${o.repo?`<span class="dsh-tb-pill" style="color:#79c0ff">${l(o.repo)}</span>`:""}</td>
			<td style="max-width:140px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l(o.feature||"")}</div></td>
			<td>${F(o)}</td>
			<td style="min-width:90px">${o.progress>0?`<div class="dsh-tb-bar" style="margin:0"><i style="width:${Math.min(100,o.progress)}%"></i></div>`:""}</td>
			<td>${o.review!=="none"?`<span class="dsh-tb-pill" style="color:${o.review==="approved"?"#3fb950":o.review==="rejected"?"#f85149":"#d29922"}">${V[o.review]}</span>`:""}</td>
			<td>${o.test!=="none"?`<span class="dsh-tb-pill" style="color:${o.test==="passed"?"#3fb950":o.test==="failed"?"#f85149":"#d29922"}">${B[o.test]}</span>`:""}</td>
			<td style="white-space:nowrap">${H(o.updatedAt)}</td>
		</tr>`).join("");t.innerHTML=`<div class="dsh-tb-ov" style="padding:0">
			<table class="dsh-tb-table">
				<thead><tr><th>\u72B6\u6001</th><th>\u4F18\u5148\u7EA7</th><th>\u4EFB\u52A1</th><th>\u4ED3\u5E93</th><th>\u5206\u652F/feature</th><th>\u6807\u7B7E</th><th>\u8FDB\u5EA6</th><th>Review</th><th>\u6D4B\u8BD5</th><th>\u66F4\u65B0</th></tr></thead>
				<tbody>${a}</tbody>
			</table>
		</div>`,y("tr[data-id]",t).forEach(o=>o.addEventListener("click",()=>O(o.dataset.id)))}function K(){y(".dsh-tb-tab").forEach(e=>{e.dataset.tbView===S?e.classList.add("dsh-tb-tab-on"):e.classList.remove("dsh-tb-tab-on")});let t=i("#dsh-tb-toolbar");t&&(t.style.display=S==="overview"?"none":"flex"),S==="kanban"?vt():S==="list"?ut():ht()}function T(t,e,a){return`<div class="dsh-tb-field"><label for="${t}">${e}</label>${a}</div>`}function mt(){let t=document.createElement("div");t.className="dsh-tb-modal-mask";let e=j.map(o=>`<option value="${l(o.title)}">${l(o.title)}</option>`).join("");t.innerHTML=`<div class="dsh-tb-modal">
			<h3>\u65B0\u5EFA\u4EFB\u52A1</h3>
			${T("tb-f-title","\u6807\u9898 *",'<input id="tb-f-title" placeholder="\u4EFB\u52A1\u6807\u9898" />')}
			<div class="dsh-tb-row">
				${T("tb-f-repo","\u4ED3\u5E93",`<select id="tb-f-repo"><option value="">\uFF08\u65E0\uFF09</option>${e}</select>`)}
				${T("tb-f-feature","\u5206\u652F/feature",'<input id="tb-f-feature" placeholder="\u5982 feat-xxx" />')}
			</div>
			<div class="dsh-tb-row">
				${T("tb-f-priority","\u4F18\u5148\u7EA7",`<select id="tb-f-priority">${Object.entries(k).map(([o,r])=>`<option value="${o}" ${o==="medium"?"selected":""}>${r.label}</option>`).join("")}</select>`)}
				${T("tb-f-status","\u72B6\u6001",`<select id="tb-f-status">${Object.entries(f).map(([o,r])=>`<option value="${o}">${r.label}</option>`).join("")}</select>`)}
			</div>
			${T("tb-f-labels","\u6807\u7B7E\uFF08\u9017\u53F7\u5206\u9694\uFF09",`<input id="tb-f-labels" placeholder="\u5982 bug, \u540E\u7AEF, P1" list="tb-labels-datalist" /><datalist id="tb-labels-datalist">${R.map(o=>`<option value="${l(o)}"></option>`).join("")}</datalist>`)}
			${T("tb-f-desc","\u63CF\u8FF0",'<textarea id="tb-f-desc" placeholder="\u9700\u6C42/\u5B9E\u73B0\u65B9\u5F0F/\u9A8C\u6536\u6807\u51C6\u2026"></textarea>')}
			<div class="dsh-tb-actions">
				<button data-act="cancel">\u53D6\u6D88</button>
				<button data-act="save" class="dsh-tb-primary">\u521B\u5EFA</button>
			</div>
		</div>`,document.body.appendChild(t);let a=()=>t.remove();i('[data-act="cancel"]',t).addEventListener("click",a),t.addEventListener("click",o=>{o.target===t&&a()}),i('[data-act="save"]',t).addEventListener("click",async()=>{let o={title:i("#tb-f-title",t).value,repo:i("#tb-f-repo",t).value,feature:i("#tb-f-feature",t).value.trim(),priority:i("#tb-f-priority",t).value,status:i("#tb-f-status",t).value,labels:i("#tb-f-labels",t).value.split(",").map(r=>r.trim()).filter(Boolean),description:i("#tb-f-desc",t).value};if(!o.title.trim()){i("#tb-f-title",t).focus();return}try{let{task:r}=await u("/tasks",{method:"POST",body:JSON.stringify(o)});a(),M(),O(r.id)}catch(r){alert(`\u521B\u5EFA\u5931\u8D25\uFF1A${r.message}`)}}),i("#tb-f-title",t).focus()}async function O(t){let{task:e}=await u(`/tasks/${t}`),a=document.createElement("div");a.className="dsh-tb-modal-mask";let o=I.map(s=>`<option value="${l(s.id)}">${l(s.title||s.id)}${s.repo?` \xB7 ${l(s.repo)}`:""}</option>`).join("");a.innerHTML=`<div class="dsh-tb-modal" style="width:min(700px,92vw)">
			<h3>${l(e.title)}</h3>
			<div class="dsh-tb-field"><label>\u4ED3\u5E93 / \u5206\u652F</label><input id="tb-d-repo" value="${l(e.repo)}" /><input id="tb-d-feature" value="${l(e.feature)}" placeholder="feature/\u5206\u652F" style="margin-top:6px" /></div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>\u72B6\u6001</label><select id="tb-d-status">${Object.entries(f).map(([s,n])=>`<option value="${s}" ${s===e.status?"selected":""}>${n.label}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u4F18\u5148\u7EA7</label><select id="tb-d-priority">${Object.entries(k).map(([s,n])=>`<option value="${s}" ${s===e.priority?"selected":""}>${n.label}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u8FDB\u5EA6 ${e.progress}%</label><input id="tb-d-progress" type="range" min="0" max="100" value="${e.progress}" /></div>
			</div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>Review</label><select id="tb-d-review">${Object.entries(V).map(([s,n])=>`<option value="${s}" ${s===e.review?"selected":""}>${n}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6D4B\u8BD5</label><select id="tb-d-test">${Object.entries(B).map(([s,n])=>`<option value="${s}" ${s===e.test?"selected":""}>${n}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6807\u7B7E</label><input id="tb-d-labels" value="${l((e.labels||[]).join(", "))}" placeholder="\u9017\u53F7\u5206\u9694" list="tb-labels-datalist2" /><datalist id="tb-labels-datalist2">${R.map(s=>`<option value="${l(s)}"></option>`).join("")}</datalist></div>
			</div>
			<div class="dsh-tb-field"><label>\u63CF\u8FF0</label><textarea id="tb-d-desc">${l(e.description||"")}</textarea></div>
			<div class="dsh-tb-field"><label>\u8FDB\u5C55\u8BB0\u5F55\uFF08${(e.notes||[]).length}\uFF09</label>
				<div id="tb-d-notes">${(e.notes||[]).map(s=>`<div class="dsh-tb-note"><span class="dsh-tb-note-time">${H(s.at)}</span><br/>${l(s.text)}</div>`).join("")||'<div class="dsh-tb-note">\uFF08\u6682\u65E0\u8BB0\u5F55\uFF09</div>'}</div>
				<textarea id="tb-d-note" placeholder="\u6DFB\u52A0\u8FDB\u5C55/\u5B8C\u6210\u60C5\u51B5\u2026\uFF08Ctrl+Enter \u63D0\u4EA4\uFF09" style="margin-top:6px"></textarea>
			</div>
			<div class="dsh-tb-field"><label>\u5173\u8054\u4F1A\u8BDD\uFF08\u70B9\u51FB\u6253\u5F00\u53EF\u7EE7\u7EED\uFF09</label>
				<div id="tb-d-sessions">${(e.sessionIds||[]).map(s=>{let n=I.find(d=>d.id===s);return`<div class="dsh-tb-sess"><span class="dsh-tb-sess-title" title="${l(s)}">${l(n?n.title:s)}</span><button data-sid="${l(s)}" data-act="open" class="dsh-tb-open">\u6253\u5F00</button><button data-sid="${l(s)}" data-act="unlink">\u89E3\u9664</button></div>`}).join("")||'<div class="dsh-tb-note">\uFF08\u672A\u5173\u8054\u4F1A\u8BDD\uFF09</div>'}</div>
				<div class="dsh-tb-row" style="margin-top:6px">
					<select id="tb-d-sess-pick" style="flex:1">${o||'<option value="">\uFF08\u6682\u65E0\u4F1A\u8BDD\uFF09</option>'}</select>
					<button id="tb-d-sess-link">\u5173\u8054</button>
				</div>
			</div>
			<div class="dsh-tb-actions">
				<button data-act="del" class="dsh-tb-danger">\u5220\u9664</button>
				<button data-act="cancel">\u5173\u95ED</button>
				<button data-act="save" class="dsh-tb-primary dsh-tb-grow">\u4FDD\u5B58</button>
			</div>
		</div>`,document.body.appendChild(a);let r=()=>({repo:i("#tb-d-repo",a).value.trim(),feature:i("#tb-d-feature",a).value.trim(),status:i("#tb-d-status",a).value,priority:i("#tb-d-priority",a).value,progress:Number(i("#tb-d-progress",a).value),review:i("#tb-d-review",a).value,test:i("#tb-d-test",a).value,labels:i("#tb-d-labels",a).value.split(",").map(s=>s.trim()).filter(Boolean),description:i("#tb-d-desc",a).value}),c=()=>a.remove(),b=async()=>{c(),await O(t)},m=async s=>{let{task:n}=await u(`/tasks/${t}`,{method:"PATCH",body:JSON.stringify(s)});return await v(),n};a.addEventListener("click",s=>{s.target===a&&c()}),i('[data-act="cancel"]',a).addEventListener("click",c),i('[data-act="save"]',a).addEventListener("click",async()=>{try{await m(r()),M(),b()}catch(s){alert(`\u4FDD\u5B58\u5931\u8D25\uFF1A${s.message}`)}}),i('[data-act="del"]',a).addEventListener("click",async()=>{if(confirm(`\u5220\u9664\u4EFB\u52A1\u300C${e.title}\u300D\uFF1F`))try{await u(`/tasks/${t}`,{method:"DELETE"}),c(),await M()}catch(s){alert(`\u5220\u9664\u5931\u8D25\uFF1A${s.message}`)}}),i("#tb-d-note",a).addEventListener("keydown",async s=>{if(s.key==="Enter"&&(s.ctrlKey||s.metaKey)){let n=i("#tb-d-note",a).value.trim();if(!n)return;await u(`/tasks/${t}/notes`,{method:"POST",body:JSON.stringify({text:n})}),await v(),b()}}),i("#tb-d-sess-link",a).addEventListener("click",async()=>{let s=i("#tb-d-sess-pick",a).value;s&&(await u(`/tasks/${t}/sessions`,{method:"POST",body:JSON.stringify({sessionId:s,action:"link"})}),await v(),b())}),y("#tb-d-sessions [data-act]",a).forEach(s=>s.addEventListener("click",async()=>{let n=s.dataset.sid;s.dataset.act==="open"?X(n):(await u(`/tasks/${t}/sessions`,{method:"POST",body:JSON.stringify({sessionId:n,action:"unlink"})}),await v(),b())}))}Y(),G(),new MutationObserver(()=>{Y(),G()}).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("keydown",t=>{t.ctrlKey&&t.shiftKey&&(t.key==="B"||t.key==="b")&&(t.preventDefault(),J())}),document.addEventListener("click",t=>{if(!D())return;let e=t.target;e instanceof Element&&(e.closest(`[${g}]`)||e.closest('[data-pane="sidebar"], [class*="sidebarCol"]')&&J(!1))})})();})();
