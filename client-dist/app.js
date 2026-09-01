(()=>{(()=>{if(window.__dshTaskboardLoaded)return;window.__dshTaskboardLoaded=!0;let ct="/taskboard/api",u={todo:{label:"\u5F85\u529E",color:"#8b949e"},in_progress:{label:"\u8FDB\u884C\u4E2D",color:"#3478f6"},in_review:{label:"\u8BC4\u5BA1\u4E2D",color:"#bc8cff"},blocked:{label:"\u5DF2\u963B\u585E",color:"#f85149"},done:{label:"\u5DF2\u5B8C\u6210",color:"#3fb950"}},O=["todo","in_progress","in_review","blocked","done"],_={low:{label:"\u4F4E",color:"#8b949e"},medium:{label:"\u4E2D",color:"#d29922"},high:{label:"\u9AD8",color:"#e3862e"},urgent:{label:"\u7D27\u6025",color:"#f85149"}},X={none:"\u2014",pending:"\u8BC4\u5BA1\u5F85\u5904\u7406",approved:"\u8BC4\u5BA1\u901A\u8FC7",rejected:"\u8BC4\u5BA1\u9A73\u56DE"},W={none:"\u2014",pending:"\u6D4B\u8BD5\u5F85\u5904\u7406",passed:"\u6D4B\u8BD5\u901A\u8FC7",failed:"\u6D4B\u8BD5\u5931\u8D25"},et=["#79c0ff","#d2a8ff","#7ee787","#ffa657","#ff7b72","#f2cc60","#a5d6ff","#ffd7a8"],C="data-dsh-taskboard-active",j="data-dsh-taskboard-entry",M="data-dsh-taskboard-view",I="data-dsh-ssh-active",bt='<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2.5" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M6.5 6.5v7"/></svg>',o=(t,e=document)=>e.querySelector(t),$=(t,e=document)=>[...e.querySelectorAll(t)],r=t=>String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),N=t=>{let e=String(t||"").split("/").filter(Boolean);return e.length?e[e.length-1]:String(t||"")},pt=t=>{let e=0;for(let a of String(t))e=e*31+a.charCodeAt(0)>>>0;return et[e%et.length]},V=t=>{if(!t)return"";let e=new Date(t),a=Date.now()-t;return a<6e4?"\u521A\u521A":a<36e5?`${Math.floor(a/6e4)} \u5206\u949F\u524D`:a<864e5?`${Math.floor(a/36e5)} \u5C0F\u65F6\u524D`:`${e.getMonth()+1}/${e.getDate()} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`},L=[],Y=[],H=[],F=[],E={q:"",repo:"",priority:"",status:"",label:""},A="overview",D={};async function x(t,e={}){let a=await fetch(ct+t,{headers:{"content-type":"application/json"},...e}),i=await a.json().catch(()=>({}));if(!a.ok)throw new Error(i.error||`HTTP ${a.status}`);return i}let ht=`
<style>
[data-pane='conversation'],
[class*='centerCol'] { position: relative; }
[${M}] {
  position: absolute; inset: 0; display: none; z-index: 60;
  background: var(--dsw-alias-bg-base, #0d1117); overflow: hidden;
}
html[${C}]:not([${I}]) [data-pane='conversation'] > div[${M}],
html[${C}]:not([${I}]) [class*='centerCol'] > div[${M}] {
  display: flex !important; flex-direction: column;
}
html[${C}]:not([${I}]) [data-pane='conversation'] > :not([${M}]),
html[${C}]:not([${I}]) [class*='centerCol'] > :not([${M}]) {
  display: none !important;
}
[${j}] {
  display: flex; align-items: center; gap: 8px; width: 100%; height: 32px;
  padding: 0 12px; background: transparent; border: none; border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #9aa7b4); cursor: pointer;
  font-size: 13px; white-space: nowrap; transition: background .15s, color .15s;
}
[${j}]:hover { background: var(--dsw-specific-sidebar-nav-item-hover, #1b2127); color: var(--dsw-alias-label-primary, #e6edf3); }
[${j}][data-active] { background: var(--dsw-specific-sidebar-nav-item-active, #232a31); color: var(--dsw-alias-label-primary, #e6edf3); font-weight: 600; }
[${j}] span { display: inline-flex; align-items: center; justify-content: center; flex: none; }
[${j}][data-icon-only] { gap: 0; justify-content: center; padding: 0; height: 36px; margin-bottom: 12px; }
[${j}][data-icon-only] > span:not(:first-child) { display: none; }

#dsh-tb-view ::-webkit-scrollbar, .dsh-tb-modal ::-webkit-scrollbar { width: 8px; height: 8px; }
#dsh-tb-view ::-webkit-scrollbar-thumb, .dsh-tb-modal ::-webkit-scrollbar-thumb { background: #2c3440; border-radius: 4px; }
#dsh-tb-view ::-webkit-scrollbar-thumb:hover, .dsh-tb-modal ::-webkit-scrollbar-thumb:hover { background: #3d4653; }
#dsh-tb-view ::-webkit-scrollbar-track, .dsh-tb-modal ::-webkit-scrollbar-track { background: transparent; }

#dsh-tb-view{height:100%;display:flex;flex-direction:column;color:var(--dsw-alias-label-primary,#e6edf3);font-size:12.5px}
.dsh-tb-head{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--dsw-alias-border-l2,#2a3138);flex:none;gap:10px;background:linear-gradient(180deg,rgba(52,120,246,.05),transparent)}
.dsh-tb-title{font-size:15px;font-weight:700;flex:none;letter-spacing:.2px;display:flex;align-items:center;gap:8px}
.dsh-tb-title::before{content:"";width:4px;height:16px;border-radius:2px;background:linear-gradient(180deg,#3478f6,#bc8cff)}
.dsh-tb-tabs{display:flex;gap:4px;flex:1;min-width:0;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:9px;padding:2px;width:fit-content}
.dsh-tb-tab{background:transparent;border:0;color:var(--dsw-alias-label-secondary,#9aa7b4);padding:5px 14px;font-size:12.5px;cursor:pointer;border-radius:7px;transition:all .15s}
.dsh-tb-tab:hover{color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-tb-tab.dsh-tb-tab-on{background:var(--dsw-alias-button-primary-bg,#3478f6);color:#fff;font-weight:600;box-shadow:0 1px 4px rgba(52,120,246,.4)}
.dsh-tb-head-actions{display:flex;gap:6px;flex:none}
.dsh-tb-head-actions button,.dsh-tb-toolbar select,.dsh-tb-toolbar input{background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-primary,#e6edf3);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer;transition:border-color .15s,background .15s}
.dsh-tb-head-actions button:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-head-actions #dsh-tb-refresh{font-size:13px}
.dsh-tb-toolbar{display:flex;gap:8px;align-items:center;padding:9px 18px;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);flex:none;flex-wrap:wrap;background:var(--dsw-alias-bg-layer-2,#1b2127)}
.dsh-tb-toolbar #dsh-tb-search{flex:1;min-width:140px}
.dsh-tb-toolbar #dsh-tb-search:focus{outline:none;border-color:#3478f6}
.dsh-tb-newbtn{background:linear-gradient(135deg,#3478f6,#2a5fd8);border-color:transparent;font-weight:600;flex:none;margin-left:auto}
.dsh-tb-newbtn:hover{filter:brightness(1.1);border-color:transparent}
.dsh-tb-count{color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:11.5px}
.dsh-tb-body{flex:1;min-height:0;overflow:auto}
.dsh-tb-columns{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding:12px 16px;height:100%;box-sizing:border-box}
.dsh-tb-col{background:linear-gradient(180deg,var(--dsw-alias-bg-layer-2,#1b2127),var(--dsw-alias-bg-layer-1,#14181d));border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:11px;display:flex;flex-direction:column;min-height:100%;min-width:150px}
.dsh-tb-col-head{padding:9px 11px;font-weight:600;font-size:12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);color:var(--dsw-alias-label-secondary,#9aa7b4)}
.dsh-tb-col-head b{color:var(--dsw-alias-label-primary,#e6edf3);background:var(--dsw-alias-bg-base,#0d1117);border-radius:8px;padding:1px 7px;font-size:11px}
.dsh-tb-col-body{padding:7px;display:flex;flex-direction:column;gap:7px;overflow-y:auto}
.dsh-tb-card{background:var(--dsw-alias-bg-base,#0d1117);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:10px;padding:10px 11px;cursor:pointer;transition:border-color .15s,transform .15s,box-shadow .15s}
.dsh-tb-card:hover{border-color:var(--dsw-alias-border-accent,#bc8cff);transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.35)}
.dsh-tb-card-title{font-size:12.5px;font-weight:600;line-height:1.4;word-break:break-all}
.dsh-tb-card-meta{display:flex;flex-wrap:wrap;gap:4px;margin-top:7px;align-items:center}
.dsh-tb-pill{font-size:10.5px;padding:1px 7px;border-radius:9px;border:1px solid;line-height:1.6;background:color-mix(in srgb,currentColor 10%,transparent)}
.dsh-tb-bar{height:4px;border-radius:3px;background:var(--dsw-alias-bg-layer-2,#1b2127);margin-top:8px;overflow:hidden}
.dsh-tb-bar>i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#3478f6,#7c5cf0)}
.dsh-tb-card-foot{display:flex;justify-content:space-between;margin-top:7px;color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:10.5px}
.dsh-tb-empty{color:var(--dsw-alias-label-secondary,#9aa7b4);text-align:center;padding:14px 4px;font-size:11.5px}
.dsh-tb-table{width:100%;border-collapse:collapse;font-size:12px}
.dsh-tb-table th{position:sticky;top:0;background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-secondary,#9aa7b4);text-align:left;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l2,#2a3138);font-weight:600;white-space:nowrap;z-index:1}
.dsh-tb-table td{padding:7px 12px;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);vertical-align:middle}
.dsh-tb-table tr{cursor:pointer;transition:background .12s}
.dsh-tb-table tr:hover td{background:rgba(52,120,246,.07)}
.dsh-tb-ov{padding:16px 18px;height:100%;box-sizing:border-box;overflow:auto}
.dsh-tb-ov-stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
.dsh-tb-ov-stat{flex:1;min-width:100px;background:linear-gradient(180deg,var(--dsw-alias-bg-layer-2,#1b2127),var(--dsw-alias-bg-layer-1,#14181d));border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:11px;padding:11px 13px;position:relative;overflow:hidden;transition:border-color .15s}
.dsh-tb-ov-stat:hover{border-color:var(--dsw-alias-border-l2,#3a434d)}
.dsh-tb-ov-stat::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,currentColor,transparent);opacity:.35}
.dsh-tb-ov-stat .n{font-size:25px;font-weight:700;line-height:1.1}
.dsh-tb-ov-stat .l{font-size:11px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-top:3px}
.dsh-tb-ov-stat .mini{height:5px;border-radius:3px;background:var(--dsw-alias-bg-base,#0d1117);margin-top:9px;overflow:hidden}
.dsh-tb-ov-stat .mini i{display:block;height:100%;border-radius:3px}
.dsh-tb-ov-add{border:1.5px dashed #3d4653;display:flex;align-items:center;justify-content:center;cursor:pointer;min-width:118px;transition:border-color .15s,background .15s}
.dsh-tb-ov-add:hover{border-color:#3478f6;background:rgba(52,120,246,.06)}
.dsh-tb-ov-add::before{display:none}
.dsh-tb-ov-addbtn{font-size:13px;font-weight:600;color:#9aa7b4;display:flex;align-items:center;gap:6px;transition:color .15s;white-space:nowrap}
.dsh-tb-ov-add:hover .dsh-tb-ov-addbtn{color:#e6edf3}
.dsh-tb-ov-stat-click{cursor:pointer}
.dsh-tb-ov-stat-click:hover{border-color:var(--dsw-alias-border-accent,#bc8cff);transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.3)}
.dsh-tb-ov-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:11px;margin-bottom:16px}
.dsh-tb-ov-ws{background:linear-gradient(180deg,var(--dsw-alias-bg-layer-2,#1b2127),var(--dsw-alias-bg-layer-1,#14181d));border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:12px;padding:12px 14px;cursor:pointer;transition:border-color .15s,transform .15s,box-shadow .15s}
.dsh-tb-ov-ws:hover{border-color:var(--dsw-alias-border-accent,#bc8cff);transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.35)}
.dsh-tb-ov-ws .ws-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsh-tb-ov-ws h4{margin:0;font-size:13.5px;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-tb-ov-ws .ws-total{flex:none;font-size:11px;color:var(--dsw-alias-label-secondary,#9aa7b4);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:9px;padding:1px 8px;background:var(--dsw-alias-bg-base,#0d1117)}
.dsh-tb-ov-ws .path{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);word-break:break-all;margin:4px 0 9px}
.dsh-tb-ov-ws .stack{display:flex;height:8px;border-radius:5px;overflow:hidden;background:var(--dsw-alias-bg-base,#0d1117);margin-bottom:8px;gap:1px}
.dsh-tb-ov-ws .stack i{display:block;height:100%}
.dsh-tb-ov-ws .ws-stats{display:flex;flex-wrap:wrap;gap:9px;font-size:11px;margin-bottom:9px}
.dsh-tb-ov-ws .ws-stats .st{display:inline-flex;align-items:center;gap:5px;color:var(--dsw-alias-label-secondary,#9aa7b4)}
.dsh-tb-ov-ws .ws-stats .st b{color:var(--dsw-alias-label-primary,#e6edf3);font-weight:700}
.dsh-tb-ov-ws .ws-stats .dot{width:8px;height:8px;border-radius:50%;display:inline-block;box-shadow:0 0 4px currentColor}
.dsh-tb-ov-ws .comp{display:flex;align-items:center;gap:8px;margin-bottom:2px}
.dsh-tb-ov-ws .comp .track{flex:1;height:6px;border-radius:3px;background:var(--dsw-alias-bg-base,#0d1117);overflow:hidden}
.dsh-tb-ov-ws .comp .track i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#2ea043,#56d364)}
.dsh-tb-ov-ws .comp .pct{font-size:11px;color:var(--dsw-alias-label-secondary,#9aa7b4);flex:none;font-weight:600}
.dsh-tb-ov-ws .meta{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-top:6px}
.dsh-tb-ov-ws .branch{font-size:10.5px;color:#79c0ff;border:1px solid #79c0ff4d;border-radius:8px;padding:1px 7px;background:#79c0ff12}
.dsh-tb-ov-ws .dirty{color:#f85149}
.dsh-tb-ov-ws .sess{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-left:auto}
.dsh-tb-ov-ws .sesslist{margin-top:8px;border-top:1px dashed var(--dsw-alias-border-l3,#232a31);padding-top:6px;display:flex;flex-direction:column;gap:3px}
.dsh-tb-ov-ws .sesslist .s{font-size:10.5px;color:#79c0ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;padding:1px 4px;border-radius:5px;transition:background .12s}
.dsh-tb-ov-ws .sesslist .s:hover{background:#79c0ff12;text-decoration:underline}
.dsh-tb-ov-sec{font-size:12px;font-weight:700;color:var(--dsw-alias-label-secondary,#9aa7b4);margin:16px 0 9px;letter-spacing:.3px}
.dsh-tb-ov-recent{display:flex;flex-direction:column;gap:6px}
.dsh-tb-ov-item{display:flex;align-items:center;gap:9px;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:9px;padding:7px 11px;cursor:pointer;transition:border-color .15s,transform .12s}
.dsh-tb-ov-item:hover{border-color:var(--dsw-alias-border-accent,#bc8cff);transform:translateX(2px)}
.dsh-tb-ov-item .dot{width:8px;height:8px;border-radius:50%;flex:none}
.dsh-tb-ov-item .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
.dsh-tb-ov-item .r{font-size:10.5px;color:#79c0ff;flex:none}
.dsh-tb-ov-item .tm{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);flex:none}
.dsh-tb-modal-mask{position:fixed;inset:0;z-index:9995;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
.dsh-tb-modal{width:min(640px,92vw);max-height:88vh;overflow:auto;background:var(--dsw-alias-bg-layer-1,#14181d);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:14px;padding:18px 20px;color:var(--dsw-alias-label-primary,#e6edf3);box-shadow:0 16px 50px rgba(0,0,0,.55);animation:dsh-tb-pop .18s ease}
@keyframes dsh-tb-pop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
.dsh-tb-modal h3{margin:0 0 14px;font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:8px}
.dsh-tb-modal h3::before{content:"";width:4px;height:17px;border-radius:2px;background:linear-gradient(180deg,#3478f6,#bc8cff)}
.dsh-tb-field{margin-bottom:11px}
.dsh-tb-field label{display:block;font-size:11.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-bottom:5px;font-weight:600}
.dsh-tb-field input,.dsh-tb-field select,.dsh-tb-field textarea{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-base,#0d1117);color:var(--dsw-alias-label-primary,#e6edf3);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;padding:7px 10px;font-size:12.5px;font-family:inherit;transition:border-color .15s}
.dsh-tb-field input:focus,.dsh-tb-field select:focus,.dsh-tb-field textarea:focus{outline:none;border-color:#3478f6}
.dsh-tb-field textarea{min-height:70px;resize:vertical}
.dsh-tb-field input.err,.dsh-tb-field select.err,.dsh-tb-field textarea.err{border-color:#f85149}
.dsh-tb-hint{color:#f85149;font-size:11px;margin-top:4px}
.dsh-tb-created-title{font-size:14.5px;font-weight:700;margin:2px 0}
.dsh-tb-created-meta{font-size:11.5px;color:#79c0ff;margin-bottom:14px;word-break:break-all}
.dsh-tb-created-next{font-size:12px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-bottom:9px;font-weight:600}
.dsh-tb-created-actions{display:flex;flex-direction:column;gap:8px}
.dsh-tb-big{padding:11px 16px !important;font-size:13.5px !important;text-align:center}
.dsh-tb-created-actions .dsh-tb-big{width:100%}
.dsh-tb-ctx{border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;background:var(--dsw-alias-bg-base,#0d1117);overflow:hidden}
.dsh-tb-ctx-body{max-height:180px;overflow:auto;padding:8px 10px;font-size:11.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);white-space:pre-wrap;word-break:break-all}
.dsh-tb-ctx-actions{display:flex;gap:6px;padding:5px 8px;border-top:1px solid var(--dsw-alias-border-l3,#232a31)}
.dsh-tb-ctx-actions button{background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);color:var(--dsw-alias-label-primary,#e6edf3);border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer}
.dsh-tb-ctx-actions button:hover{border-color:#3478f6}
.dsh-tb-row{display:flex;gap:10px}
.dsh-tb-row .dsh-tb-field{flex:1}
.dsh-tb-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.dsh-tb-actions button{padding:7px 16px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2,#2a3138);background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-primary,#e6edf3);cursor:pointer;font-size:12.5px;transition:all .15s}
.dsh-tb-actions button:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-actions button.dsh-tb-primary{background:linear-gradient(135deg,#3478f6,#2a5fd8);border-color:transparent;color:#fff;font-weight:600}
.dsh-tb-actions button.dsh-tb-primary:hover{filter:brightness(1.1)}
.dsh-tb-actions button.dsh-tb-danger{color:#f85149}
.dsh-tb-actions button.dsh-tb-danger:hover{background:#f8514914}
.dsh-tb-actions button.dsh-tb-grow{flex:1}
.dsh-tb-statusline{display:flex;flex-direction:column;gap:7px}
.dsh-tb-statusbadge{display:inline-flex;align-items:center;font-size:12px;font-weight:700;border:1px solid;border-radius:8px;padding:3px 11px;width:fit-content}
.dsh-tb-statusactions{display:flex;gap:6px;flex-wrap:wrap}
.dsh-tb-statusbtn{background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);color:var(--dsw-alias-label-primary,#e6edf3);border-radius:7px;padding:4px 11px;font-size:11.5px;cursor:pointer;transition:all .13s}
.dsh-tb-statusbtn:hover{border-color:#3478f6;color:#fff}
.dsh-tb-statusbtn.primary{background:linear-gradient(135deg,#3478f6,#2a5fd8);border-color:transparent;color:#fff;font-weight:600}
.dsh-tb-statusbtn.primary:hover{filter:brightness(1.1)}
.dsh-tb-statusbtn.ghost{opacity:.7}
.dsh-tb-note{border-left:2px solid var(--dsw-alias-border-l2,#2a3138);padding:2px 0 2px 11px;margin:9px 0;color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:12px;white-space:pre-wrap;word-break:break-all;border-image:linear-gradient(180deg,#3478f6,#bc8cff) 1}
.dsh-tb-note .dsh-tb-note-time{font-size:10.5px;font-weight:600;color:#79c0ff}
.dsh-tb-sess{display:flex;justify-content:space-between;align-items:center;background:var(--dsw-alias-bg-base,#0d1117);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;padding:6px 9px;margin-bottom:6px;gap:8px;transition:border-color .12s}
.dsh-tb-sess:hover{border-color:var(--dsw-alias-border-l2,#3a434d)}
.dsh-tb-sess .dsh-tb-sess-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px}
.dsh-tb-sess button{flex:none;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);color:var(--dsw-alias-label-primary,#e6edf3);border-radius:6px;padding:3px 9px;font-size:11px;cursor:pointer;transition:all .12s}
.dsh-tb-sess button:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-sess button.dsh-tb-open{background:linear-gradient(135deg,#3478f6,#2a5fd8);border-color:transparent;color:#fff}
.dsh-tb-sess button.dsh-tb-open:hover{filter:brightness(1.1)}
.dsh-tb-run{color:#f2cc60;font-size:10px;border:1px solid #f2cc6066;border-radius:8px;padding:0 6px;margin-left:6px;flex:none;animation:dsh-tb-blink 1.2s ease-in-out infinite}
@keyframes dsh-tb-blink{0%,100%{opacity:1}50%{opacity:.45}}
.dsh-tb-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;background:#1b2127;border:1px solid #3478f6;color:#e6edf3;border-radius:9px;padding:9px 20px;font-size:12.5px;font-weight:600;box-shadow:0 6px 24px rgba(0,0,0,.5);animation:dsh-tb-toast .18s ease;pointer-events:none}
@keyframes dsh-tb-toast{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
</style>`;document.documentElement.insertAdjacentHTML("beforeend",ht);let ft=`
<div id="dsh-tb-view" ${M}="">
  <div class="dsh-tb-head">
    <div class="dsh-tb-title">\u4EFB\u52A1\u9762\u677F</div>
    <div class="dsh-tb-tabs">
      <button class="dsh-tb-tab" data-tb-view="overview">\u6982\u89C8</button>
      <button class="dsh-tb-tab" data-tb-view="kanban">\u770B\u677F</button>
      <button class="dsh-tb-tab" data-tb-view="list">\u5217\u8868</button>
    </div>
    <div class="dsh-tb-head-actions">
      <button id="dsh-tb-refresh" title="\u5237\u65B0">\u27F3</button>
    </div>
  </div>
  <div class="dsh-tb-toolbar" id="dsh-tb-toolbar">
    <input id="dsh-tb-search" placeholder="\u641C\u7D22\u6807\u9898/\u4ED3\u5E93/feature/\u6807\u7B7E\u2026" />
    <select id="dsh-tb-repo-filter"><option value="">\u5168\u90E8\u4ED3\u5E93</option></select>
    <select id="dsh-tb-priority-filter"><option value="">\u5168\u90E8\u4F18\u5148\u7EA7</option></select>
    <select id="dsh-tb-status-filter"><option value="">\u5168\u90E8\u72B6\u6001</option></select>
    <select id="dsh-tb-label-filter"><option value="">\u5168\u90E8\u6807\u7B7E</option></select>
    <span id="dsh-tb-count" class="dsh-tb-count"></span>
    <button id="dsh-tb-new" title="\u65B0\u5EFA\u4EFB\u52A1" class="dsh-tb-newbtn">\uFF0B \u65B0\u5EFA\u4EFB\u52A1</button>
  </div>
  <div class="dsh-tb-body" id="dsh-tb-body"></div>
</div>`;function vt(){let t=document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');return t===null?void 0:t.querySelector('[class*="logoRow"]')?.parentElement??t.firstElementChild}function ut(t){let e=t.querySelector('button[class*="newSession"]');if(e!==null)return e;for(let a of t.children)if(a.tagName==="BUTTON")return a}function xt(){return document.querySelector('[data-pane="conversation"]')??document.querySelector('[class*="centerCol"]')??void 0}function gt(t){return[...t.classList].some(e=>/collapsed/i.test(e))}let w=null,R=null;function G(){return document.documentElement.hasAttribute(C)}function st(){w!==null&&(G()?w.setAttribute("data-active",""):w.removeAttribute("data-active"))}function Q(t){let e=t!==void 0?t:!G();e&&document.documentElement.removeAttribute(I),e?document.documentElement.setAttribute(C,""):document.documentElement.removeAttribute(C),st(),e&&q()}function at(){if(R!==null)return;let t=xt();t!==void 0&&(R=document.createElement("div"),R.setAttribute(M,""),R.innerHTML=ft,t.appendChild(R),wt())}function ot(){let t=vt();if(t===void 0||(w===null&&(w=document.createElement("button"),w.type="button",w.setAttribute(j,""),w.innerHTML=`<span>${bt}</span><span>\u4EFB\u52A1\u770B\u677F</span>`,w.title="\u4EFB\u52A1\u770B\u677F",w.addEventListener("click",()=>Q()),st()),w.parentElement===t))return;let e=ut(t),a=e?.closest('[class*="logoRow"]'),i=a!=null&&a.parentElement===t?a:e;t.insertBefore(w,i?.nextElementSibling??null),(()=>{w!==null&&(gt(t)?w.setAttribute("data-icon-only",""):w.removeAttribute("data-icon-only"))})()}function wt(){o("#dsh-tb-new")?.addEventListener("click",rt),o("#dsh-tb-refresh")?.addEventListener("click",()=>q()),o("#dsh-tb-search")?.addEventListener("input",()=>{E.q=o("#dsh-tb-search").value.trim(),m()}),o("#dsh-tb-repo-filter")?.addEventListener("change",()=>{E.repo=o("#dsh-tb-repo-filter").value,m()}),o("#dsh-tb-priority-filter")?.addEventListener("change",()=>{E.priority=o("#dsh-tb-priority-filter").value,m()}),o("#dsh-tb-status-filter")?.addEventListener("change",()=>{E.status=o("#dsh-tb-status-filter").value,m()}),o("#dsh-tb-label-filter")?.addEventListener("change",()=>{E.label=o("#dsh-tb-label-filter").value,m()}),$(".dsh-tb-tab").forEach(t=>t.addEventListener("click",()=>{A=t.dataset.tbView,K()}))}async function m(){let t=new URLSearchParams;for(let a of["q","repo","priority","status","label"])E[a]&&t.set(a,E[a]);L=(await x(`/tasks?${t}`)).tasks||[],K()}async function mt(){try{let[t,e]=await Promise.all([x("/sessions"),x("/workspaces")]);Y=t.sessions||[],H=e.workspaces||[];let a=o("#dsh-tb-repo-filter");if(a){let c=a.value;a.innerHTML='<option value="">\u5168\u90E8\u4ED3\u5E93</option>'+H.map(b=>`<option value="${r(b.path)}" title="${r(b.path)}">${r(N(b.path))}</option>`).join(""),c&&[...a.options].some(b=>b.value===c)&&(a.value=c)}let i=await x("/tasks").catch(()=>({tasks:[]})),v=new Set;for(let c of i.tasks||[])for(let b of c.labels||[])v.add(b);F=[...v].sort();let p=o("#dsh-tb-label-filter");if(p){let c=p.value;p.innerHTML='<option value="">\u5168\u90E8\u6807\u7B7E</option>'+F.map(b=>`<option value="${r(b)}">${r(b)}</option>`).join(""),c&&[...p.options].some(b=>b.value===c)&&(p.value=c)}let l=o("#dsh-tb-priority-filter");l&&!l.options.length&&(l.innerHTML='<option value="">\u5168\u90E8\u4F18\u5148\u7EA7</option>'+Object.entries(_).map(([c,b])=>`<option value="${c}">${b.label}</option>`).join(""));let f=o("#dsh-tb-status-filter");f&&!f.options.length&&(f.innerHTML='<option value="">\u5168\u90E8\u72B6\u6001</option>'+Object.entries(u).map(([c,b])=>`<option value="${c}">${b.label}</option>`).join(""))}catch{}}async function yt(){for(let t of H)if(!(!t.path||D[t.path]!==void 0))try{let e=await fetch(`/ide/api/git?op=status&path=${encodeURIComponent(t.path)}`).then(a=>a.json());D[t.path]=e.git?{branch:e.branch?.name||"(detached)",dirty:(e.files||[]).length}:null}catch{D[t.path]=null}}function q(){return mt().then(()=>yt()).then(m).catch(m)}function dt(t){return(t.labels||[]).map(e=>`<span class="dsh-tb-pill" style="color:${pt(e)}">${r(e)}</span>`).join("")}function $t(t){let e=u[t.status]||u.todo;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function it(t){let e=_[t.priority]||_.medium;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function kt(t){let e=(a,i,v)=>`<button type="button" class="dsh-tb-statusbtn ${v||""}" data-status="${a}">${i}</button>`;switch(t.status){case"todo":return`${e("in_progress","\u25B6 \u5F00\u59CB\u6267\u884C")} ${e("blocked","\u26D4 \u963B\u585E","ghost")}`;case"in_progress":return`${e("in_review","\u63D0\u4EA4\u8BC4\u5BA1")} ${e("blocked","\u26D4 \u963B\u585E","ghost")}`;case"in_review":return`${e("done","\u2705 \u786E\u8BA4\u5B8C\u6210","primary")} ${e("in_progress","\u21A9 \u9000\u56DE\u4FEE\u6539")}`;case"done":return`${e("in_progress","\u21A9 \u91CD\u65B0\u6253\u5F00","ghost")}`;case"blocked":return`${e("in_progress","\u25B6 \u6062\u590D\u8FDB\u884C")}`;default:return""}}function J(t){try{localStorage.setItem("dsh.sessions.current",JSON.stringify({sessionId:t}))}catch{}location.reload()}function T(t){let e=document.createElement("div");e.className="dsh-tb-toast",e.textContent=t,document.body.appendChild(e),setTimeout(()=>e.remove(),1600)}function Et(){var h;let t={};for(let d of O)t[d]=0;let e={};for(let d of L){t[d.status]!==void 0&&t[d.status]++;let g=d.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(e[g]||(e[g]=[])).push(d)}let a=L.length,i=t.done||0,v=a?Math.round(i/a*100):0,p={};for(let d of Y)d.repo&&(p[h=d.repo]||(p[h]=[])).push(d);let l=[...L].sort((d,g)=>g.updatedAt-d.updatedAt).slice(0,10),c='<div class="dsh-tb-ov-stat dsh-tb-ov-add" id="dsh-tb-ov-new" title="\u65B0\u5EFA\u4EFB\u52A1"><div class="dsh-tb-ov-addbtn">\uFF0B \u65B0\u5EFA\u4EFB\u52A1</div></div>'+[["\u5168\u90E8\u4EFB\u52A1",a,"#e6edf3",""],...O.map(d=>[u[d].label,t[d]||0,u[d].color,d]),["\u5B8C\u6210\u7387",`${v}%`,"#3fb950",null]].map(([d,g,z,y])=>{let Z=d==="\u5B8C\u6210\u7387"?v:a?Math.round(g/a*100):0,U=y!==null?" dsh-tb-ov-stat-click":"",tt=y===""?"\u67E5\u770B\u5168\u90E8\u4EFB\u52A1":y?`\u67E5\u770B\u300C${d}\u300D\u7684\u4EFB\u52A1`:"";return`<div class="dsh-tb-ov-stat${U}" ${y!==null?`data-status="${y}"`:""} title="${tt}"><div class="n" style="color:${z}">${g}</div><div class="l">${d}</div><div class="mini"><i style="width:${Z}%;background:${z}"></i></div></div>`}).join(""),b;H.length?b=H.map(d=>{let g=e[d.path]||e[d.title]||[],z=O.map(k=>g.filter(S=>S.status===k).length),y=g.length,Z=z[O.indexOf("done")]||0,U=y?Math.round(Z/y*100):0,tt=y?O.map((k,S)=>z[S]?`<i style="width:${Math.round(z[S]/y*100)}%;background:${u[k].color}" title="${u[k].label} ${z[S]}"></i>`:"").join(""):"",jt=O.map((k,S)=>z[S]?`<span class="st"><i class="dot" style="background:${u[k].color}"></i>${u[k].label} <b>${z[S]}</b></span>`:"").join(""),St=(p[d.path]||p[d.title]||[]).length,B=D[d.path],Ct=B?`<span class="branch">\u2387 ${r(B.branch)}</span>${B.dirty?`<span class="branch dirty" title="${B.dirty} \u4E2A\u672A\u63D0\u4EA4\u6587\u4EF6">\u25CF${B.dirty}</span>`:""}`:"",lt=(p[d.path]||p[d.title]||[]).slice(0,3).map(k=>`<div class="s" data-sid="${r(k.id)}" title="\u6253\u5F00\u4F1A\u8BDD ${r(k.id)}">\u25B8 ${r(k.title)}</div>`).join("");return`<div class="dsh-tb-ov-ws" data-repo="${r(d.path)}">
					<div class="ws-head"><h4>${r(d.title)}</h4><span class="ws-total">${y} \u4E2A\u4EFB\u52A1</span></div>
					<div class="path">${r(d.path||"")}</div>
					${y?`<div class="stack">${tt}</div><div class="ws-stats">${jt}</div>`:'<div class="ws-stats" style="color:var(--dsw-alias-label-secondary,#9aa7b4)">\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u300D\u521B\u5EFA</div>'}
					<div class="comp"><span class="pct">\u5B8C\u6210\u7387 ${U}%</span><div class="track"><i style="width:${U}%"></i></div></div>
					<div class="meta">${Ct}<span class="sess">\u4F1A\u8BDD ${St}</span></div>
					${lt?`<div class="sesslist">${lt}</div>`:""}
				</div>`}).join(""):b='<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u5DE5\u4F5C\u533A\uFF09</div>';let s=l.length?l.map(d=>{let g=u[d.status]||u.todo;return`<div class="dsh-tb-ov-item" data-id="${r(d.id)}">
				<span class="dot" style="background:${g.color}"></span>
				<span class="t">${r(d.title)}</span>
				${d.repo?`<span class="r">${r(N(d.repo))}</span>`:""}
				<span class="tm">${V(d.updatedAt)}</span>
			</div>`}).join(""):'<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF09</div>',n=o("#dsh-tb-body");n&&(n.innerHTML=`<div class="dsh-tb-ov">
			<div class="dsh-tb-ov-stats">${c}</div>
			<div class="dsh-tb-ov-sec">\u5DE5\u4F5C\u533A\u5185\u5BB9</div>
			<div class="dsh-tb-ov-grid">${b}</div>
			<div class="dsh-tb-ov-sec">\u6700\u8FD1\u66F4\u65B0</div>
			<div class="dsh-tb-ov-recent">${s}</div>
		</div>`,o("#dsh-tb-ov-new")?.addEventListener("click",rt),$(".dsh-tb-ov-stat[data-status]").forEach(d=>d.addEventListener("click",()=>{E.status=d.dataset.status,A="list",K(),m()})),$(".dsh-tb-ov-ws").forEach(d=>d.addEventListener("click",()=>{E.repo=d.dataset.repo;let g=o("#dsh-tb-repo-filter");g&&(g.value=E.repo),A="kanban",K(),m()})),$(".dsh-tb-ov-ws .s").forEach(d=>d.addEventListener("click",g=>{g.stopPropagation(),J(d.dataset.sid)})),$(".dsh-tb-ov-item").forEach(d=>d.addEventListener("click",()=>P(d.dataset.id))))}function Lt(t){let e=u[t.status]||u.todo,a=_[t.priority]||_.medium,i=[];i.push(it(t)),t.status==="in_review"&&i.push('<span class="dsh-tb-pill" style="color:#bc8cff;font-weight:600">\u25C9 \u5F85 review</span>'),t.repo&&i.push(`<span class="dsh-tb-pill" style="color:#79c0ff">${r(N(t.repo))}</span>`),t.feature&&i.push(`<span class="dsh-tb-pill" style="color:#d2a8ff">${r(t.feature)}</span>`),i.push(dt(t)),t.review&&t.review!=="none"&&i.push(`<span class="dsh-tb-pill" style="color:${t.review==="approved"?"#3fb950":t.review==="rejected"?"#f85149":"#d29922"}">${X[t.review]}</span>`),t.test&&t.test!=="none"&&i.push(`<span class="dsh-tb-pill" style="color:${t.test==="passed"?"#3fb950":t.test==="failed"?"#f85149":"#d29922"}">${W[t.test]}</span>`);let v=[];return t.sessionIds?.length&&v.push(`<span>\u4F1A\u8BDD ${t.sessionIds.length}</span>`),t.notes?.length&&v.push(`<span>\u8BC4\u8BBA ${t.notes.length}</span>`),v.push(`<span>${V(t.updatedAt)}</span>`),`<div class="dsh-tb-card" data-id="${r(t.id)}" style="border-left:3px solid ${e.color}">
			<div class="dsh-tb-card-title">${r(t.title)}</div>
			<div class="dsh-tb-card-meta">${i.join("")}</div>
			${t.displayProgress>0?`<div class="dsh-tb-bar"><i style="width:${Math.min(100,t.displayProgress)}%"></i></div>`:""}
			<div class="dsh-tb-card-foot">${v.join(" \xB7 ")}</div>
		</div>`}function Tt(){let t=o("#dsh-tb-body"),e=o("#dsh-tb-count");if(!t)return;t.innerHTML='<div class="dsh-tb-columns"></div>';let a=o(".dsh-tb-columns",t);e&&(e.textContent=`${L.length} \u4E2A\u4EFB\u52A1`);for(let[i,v]of Object.entries(u)){let p=document.createElement("div");p.className="dsh-tb-col";let l=L.filter(c=>c.status===i);p.innerHTML=`<div class="dsh-tb-col-head">${v.label} <b>${l.length}</b></div><div class="dsh-tb-col-body"></div>`;let f=o(".dsh-tb-col-body",p);l.length?l.forEach(c=>f.insertAdjacentHTML("beforeend",Lt(c))):f.innerHTML='<div class="dsh-tb-empty">\u2014</div>',a.appendChild(p)}$(".dsh-tb-card",a).forEach(i=>i.addEventListener("click",()=>P(i.dataset.id)))}function zt(){let t=o("#dsh-tb-body"),e=o("#dsh-tb-count");if(!t)return;if(e&&(e.textContent=`${L.length} \u4E2A\u4EFB\u52A1`),!L.length){t.innerHTML='<div class="dsh-tb-ov"><div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u300D\u521B\u5EFA\uFF09</div></div>';return}let a=L.map(i=>`<tr data-id="${r(i.id)}">
			<td>${$t(i)}</td>
			<td>${it(i)}</td>
			<td style="max-width:340px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r(i.title)}</div></td>
			<td>${i.repo?`<span class="dsh-tb-pill" style="color:#79c0ff">${r(N(i.repo))}</span>`:""}</td>
			<td style="max-width:140px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r(i.feature||"")}</div></td>
			<td>${dt(i)}</td>
			<td style="min-width:90px">${i.displayProgress>0?`<div class="dsh-tb-bar" style="margin:0"><i style="width:${Math.min(100,i.displayProgress)}%"></i></div>`:""}</td>
			<td>${i.review!=="none"?`<span class="dsh-tb-pill" style="color:${i.review==="approved"?"#3fb950":i.review==="rejected"?"#f85149":"#d29922"}">${X[i.review]}</span>`:""}</td>
			<td>${i.test!=="none"?`<span class="dsh-tb-pill" style="color:${i.test==="passed"?"#3fb950":i.test==="failed"?"#f85149":"#d29922"}">${W[i.test]}</span>`:""}</td>
			<td style="white-space:nowrap">${V(i.updatedAt)}</td>
		</tr>`).join("");t.innerHTML=`<div class="dsh-tb-ov" style="padding:0">
			<table class="dsh-tb-table">
				<thead><tr><th>\u72B6\u6001</th><th>\u4F18\u5148\u7EA7</th><th>\u4EFB\u52A1</th><th>\u4ED3\u5E93</th><th>\u5206\u652F/feature</th><th>\u6807\u7B7E</th><th>\u8FDB\u5EA6</th><th>Review</th><th>\u6D4B\u8BD5</th><th>\u66F4\u65B0</th></tr></thead>
				<tbody>${a}</tbody>
			</table>
		</div>`,$("tr[data-id]",t).forEach(i=>i.addEventListener("click",()=>P(i.dataset.id)))}function K(){$(".dsh-tb-tab").forEach(e=>{e.dataset.tbView===A?e.classList.add("dsh-tb-tab-on"):e.classList.remove("dsh-tb-tab-on")});let t=o("#dsh-tb-toolbar");t&&(t.style.display=A==="overview"?"none":"flex"),A==="kanban"?Tt():A==="list"?zt():Et()}function rt(){let t=document.createElement("div");t.className="dsh-tb-modal-mask";let e=H.map(l=>`<option value="${r(l.path)}" title="${r(l.path)}">${r(l.path)}</option>`).join(""),a=(l,f)=>{o(l,t)?.classList.add("err"),f&&(o(f,t).hidden=!1)},i=()=>{t.innerHTML=`<div class="dsh-tb-modal" style="width:min(560px,92vw)">
				<h3>\u65B0\u5EFA\u4EFB\u52A1</h3>
				<div class="dsh-tb-field">
					<label for="tb-f-title">\u6807\u9898 *</label>
					<input id="tb-f-title" placeholder="\u4E00\u53E5\u8BDD\u8BF4\u660E\u8981\u505A\u4EC0\u4E48" />
					<div class="dsh-tb-hint" id="tb-hint-title" hidden>\u8BF7\u586B\u5199\u4EFB\u52A1\u6807\u9898</div>
				</div>
				<div class="dsh-tb-row">
					<div class="dsh-tb-field">
						<label for="tb-f-repo">\u4ED3\u5E93\u76EE\u5F55 *</label>
						<select id="tb-f-repo"><option value="" disabled selected>\u8BF7\u9009\u62E9\u5DE5\u4F5C\u533A\u76EE\u5F55\uFF08\u65B0\u5EFA\u7684\u5BF9\u8BDD\u4F1A\u6302\u5230\u8FD9\u4E2A\u5DE5\u4F5C\u533A\uFF09</option>${e}</select>
						<div class="dsh-tb-hint" id="tb-hint-repo" hidden>\u8BF7\u9009\u62E9\u4EFB\u52A1\u6240\u5C5E\u7684\u5DE5\u4F5C\u533A\u76EE\u5F55</div>
					</div>
					<div class="dsh-tb-field">
						<label for="tb-f-feature">\u5206\u652F / feature</label>
						<input id="tb-f-feature" placeholder="\u5982 feat-xxx" />
					</div>
				</div>
				<div class="dsh-tb-field">
					<label for="tb-f-desc">\u63CF\u8FF0</label>
					<textarea id="tb-f-desc" placeholder="\u9700\u6C42\u80CC\u666F / \u5B9E\u73B0\u65B9\u5F0F / \u9A8C\u6536\u6807\u51C6\u2026"></textarea>
				</div>
				<div class="dsh-tb-actions">
					<button data-act="cancel">\u53D6\u6D88</button>
					<button data-act="save" class="dsh-tb-primary">\u521B\u5EFA\u4EFB\u52A1</button>
				</div>
			</div>`,o("#tb-f-title",t).addEventListener("input",()=>{o("#tb-f-title",t).classList.remove("err"),o("#tb-hint-title",t).hidden=!0}),o("#tb-f-repo",t).addEventListener("change",()=>{o("#tb-f-repo",t).classList.remove("err"),o("#tb-hint-repo",t).hidden=!0}),o('[data-act="cancel"]',t).addEventListener("click",p),o('[data-act="save"]',t).addEventListener("click",async()=>{let l=o("#tb-f-title",t).value.trim(),f=o("#tb-f-repo",t).value;o("#tb-hint-title",t).hidden=!0,o("#tb-hint-repo",t).hidden=!0,$(".err",t).forEach(b=>b.classList.remove("err"));let c=!0;if(l||(a("#tb-f-title","#tb-hint-title"),c=!1),f||(a("#tb-f-repo","#tb-hint-repo"),c=!1),!!c)try{let{task:b}=await x("/tasks",{method:"POST",body:JSON.stringify({title:l,repo:f,feature:o("#tb-f-feature",t).value.trim(),description:o("#tb-f-desc",t).value})});q(),v(b)}catch(b){alert(`\u521B\u5EFA\u5931\u8D25\uFF1A${b.message}`)}}),o("#tb-f-title",t).focus()},v=l=>{t.innerHTML=`<div class="dsh-tb-modal" style="width:min(560px,92vw)">
				<h3>\u2705 \u4EFB\u52A1\u5DF2\u521B\u5EFA</h3>
				<div class="dsh-tb-created-title">${r(l.title)}</div>
				<div class="dsh-tb-created-meta">${r(l.repo)}${l.feature?` \xB7 ${r(l.feature)}`:""}</div>
				<div class="dsh-tb-created-next">\u63A5\u4E0B\u6765\u505A\u4EC0\u4E48\uFF1F</div>
				<div class="dsh-tb-created-actions">
					<button data-act="newsess" class="dsh-tb-primary dsh-tb-big">\u2795 \u65B0\u5EFA\u5BF9\u8BDD\u5F00\u59CB\u5E72\u6D3B</button>
					<button data-act="bind" class="dsh-tb-big">\u{1F517} \u7ED1\u5B9A\u5DF2\u6709\u4F1A\u8BDD</button>
					<button data-act="detail" class="dsh-tb-big">\u8FDB\u5165\u4EFB\u52A1\u8BE6\u60C5</button>
				</div>
				<div class="dsh-tb-actions" style="margin-top:12px">
					<button data-act="close">\u5173\u95ED</button>
				</div>
			</div>`,o('[data-act="newsess"]',t).addEventListener("click",async()=>{try{let{sessionId:f}=await x(`/tasks/${l.id}/session`,{method:"POST",body:"{}"});J(f)}catch(f){alert(`\u65B0\u5EFA\u4F1A\u8BDD\u5931\u8D25\uFF1A${f.message}`)}}),o('[data-act="bind"]',t).addEventListener("click",()=>{t.remove(),P(l.id)}),o('[data-act="detail"]',t).addEventListener("click",()=>{t.remove(),P(l.id)}),o('[data-act="close"]',t).addEventListener("click",()=>t.remove())},p=()=>t.remove();t.addEventListener("click",l=>{l.target===t&&p()}),document.body.appendChild(t),i()}async function P(t){let{task:e}=await x(`/tasks/${t}`);nt(e)}function nt(t){let e=t.id,a=document.createElement("div");a.className="dsh-tb-modal-mask";let i=Y.map(s=>`<option value="${r(s.id)}">${r(s.title||s.id)}${s.repo?` \xB7 ${r(N(s.repo))}`:""}</option>`).join("");a.innerHTML=`<div class="dsh-tb-modal" style="width:min(700px,92vw)">
			<h3>${r(t.title)}</h3>
			<div class="dsh-tb-field"><label>\u4ED3\u5E93\u76EE\u5F55\uFF08\u5DE5\u4F5C\u533A\u8DEF\u5F84\uFF09</label><input id="tb-d-repo" placeholder="/root/projects/\u2026" value="${r(t.repo)}" /><input id="tb-d-feature" value="${r(t.feature)}" placeholder="feature/\u5206\u652F" style="margin-top:6px" /></div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>\u72B6\u6001\uFF08AI \u81EA\u52A8\u6D41\u8F6C\uFF0C\u4F60\u53EA\u9700\u5728"\u8BC4\u5BA1\u4E2D"\u65F6\u5904\u7406\uFF09</label>
					<div class="dsh-tb-statusline">
						<span class="dsh-tb-statusbadge" style="color:${u[t.status].color};border-color:${u[t.status].color}55;background:${u[t.status].color}14">${u[t.status].label}</span>
						<div class="dsh-tb-statusactions">${kt(t)}</div>
					</div>
				</div>
				<div class="dsh-tb-field"><label>\u4F18\u5148\u7EA7</label><select id="tb-d-priority">${Object.entries(_).map(([s,n])=>`<option value="${s}" ${s===t.priority?"selected":""}>${n.label}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u8FDB\u5EA6 ${t.displayProgress??t.progress}%\uFF08\u81EA\u52A8\u6D3E\u751F\uFF09</label><input id="tb-d-progress" type="range" min="0" max="100" value="${t.progress}" /></div>
			</div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>Review</label><select id="tb-d-review">${Object.entries(X).map(([s,n])=>`<option value="${s}" ${s===t.review?"selected":""}>${n}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6D4B\u8BD5</label><select id="tb-d-test">${Object.entries(W).map(([s,n])=>`<option value="${s}" ${s===t.test?"selected":""}>${n}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6807\u7B7E</label><input id="tb-d-labels" value="${r((t.labels||[]).join(", "))}" placeholder="\u9017\u53F7\u5206\u9694" list="tb-labels-datalist2" /><datalist id="tb-labels-datalist2">${F.map(s=>`<option value="${r(s)}"></option>`).join("")}</datalist></div>
			</div>
			<div class="dsh-tb-field"><label>\u63CF\u8FF0</label><textarea id="tb-d-desc">${r(t.description||"")}</textarea></div>
			<div class="dsh-tb-field"><label>\u5171\u4EAB\u4E0A\u4E0B\u6587\uFF08\u6C60\u5185\u4F1A\u8BDD\u53EF\u8BBF\u95EE\uFF1A\u65B0\u5BF9\u8BDD\u81EA\u52A8\u5E26\u3001\u5173\u8054\u4F1A\u8BDD\u81EA\u52A8\u6CE8\u5165\u3001\u4E5F\u53EF\u590D\u5236\u968F\u65F6\u53D6\u6700\u65B0\u7248\uFF09</label>
				<div class="dsh-tb-ctx">
					<div class="dsh-tb-ctx-body" id="tb-d-ctx-body">\u52A0\u8F7D\u4E2D\u2026</div>
					<div class="dsh-tb-ctx-actions">
						<button id="tb-d-ctx-copy" title="\u590D\u5236\u6700\u65B0\u4E0A\u4E0B\u6587\u5230\u526A\u8D34\u677F">\u{1F4CB} \u590D\u5236</button>
						<button id="tb-d-ctx-refresh" title="\u91CD\u65B0\u83B7\u53D6\u6700\u65B0\u4E0A\u4E0B\u6587">\u27F3 \u5237\u65B0</button>
					</div>
				</div>
			</div>
			<div class="dsh-tb-field"><label>\u8FDB\u5C55\u8BB0\u5F55\uFF08${(t.notes||[]).length}\uFF09</label>
				<div id="tb-d-notes">${(t.notes||[]).map(s=>`<div class="dsh-tb-note"><span class="dsh-tb-note-time">${V(s.at)}</span><br/>${r(s.text)}</div>`).join("")||'<div class="dsh-tb-note">\uFF08\u6682\u65E0\u8BB0\u5F55\uFF09</div>'}</div>
				<textarea id="tb-d-note" placeholder="\u6DFB\u52A0\u8FDB\u5C55/\u5B8C\u6210\u60C5\u51B5\u2026\uFF08Ctrl+Enter \u63D0\u4EA4\uFF09" style="margin-top:6px"></textarea>
			</div>
			<div class="dsh-tb-field"><label>\u6C60\u5185\u4F1A\u8BDD\uFF08\u5171\u4EAB\u4E0A\u4E0B\u6587\u53EF\u8BBF\u95EE\u8005\uFF1B\u70B9\u51FB\u6253\u5F00\u53EF\u7EE7\u7EED\uFF09</label>
				<div id="tb-d-sessions">${(t.sessionIds||[]).map(s=>{let n=Y.find(h=>h.id===s);return`<div class="dsh-tb-sess"><span class="dsh-tb-sess-title" title="${r(s)}">${r(n?n.title:s)}${n&&n.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</span><button data-sid="${r(s)}" data-act="open" class="dsh-tb-open">\u6253\u5F00</button><button data-sid="${r(s)}" data-act="unlink">\u89E3\u9664</button></div>`}).join("")||'<div class="dsh-tb-note">\uFF08\u672A\u5173\u8054\u4F1A\u8BDD\uFF09</div>'}</div>
				<div class="dsh-tb-row" style="margin-top:6px">
					<select id="tb-d-sess-pick" style="flex:1">${i||'<option value="">\uFF08\u6682\u65E0\u4F1A\u8BDD\uFF09</option>'}</select>
					<button id="tb-d-sess-link">\u5173\u8054</button>
					<button id="tb-d-sess-new" title="\u65B0\u5EFA\u4E00\u4E2A\u7ED1\u5B9A\u5230\u6B64\u4EFB\u52A1\u7684\u5BF9\u8BDD">\uFF0B \u65B0\u5BF9\u8BDD</button>
				</div>
			</div>
			<div class="dsh-tb-actions">
				<button data-act="del" class="dsh-tb-danger">\u5220\u9664</button>
				<button data-act="copyctx" title="\u590D\u5236\u4EFB\u52A1\u4E0A\u4E0B\u6587\uFF08\u53EF\u7C98\u5230\u4EFB\u610F\u5BF9\u8BDD\u91CC\u5E26\u4E0A\u80CC\u666F\uFF09">\u{1F4CB} \u590D\u5236\u4E0A\u4E0B\u6587</button>
				<button data-act="split" title="\u5927\u4EFB\u52A1\u62C6\u6210\u591A\u4E2A\u5C0F\u4EFB\u52A1">\u2702 \u62C6\u5206</button>
				<button data-act="cancel">\u5173\u95ED</button>
				<button data-act="save" class="dsh-tb-primary dsh-tb-grow">\u4FDD\u5B58</button>
			</div>
		</div>`,document.body.appendChild(a);let v=async()=>{let s=o("#tb-d-ctx-body",a);if(s)try{let{context:n}=await x(`/tasks/${e}/context`);s.textContent=n||"\uFF08\u6682\u65E0\u5171\u4EAB\u4E0A\u4E0B\u6587\uFF09"}catch{s.textContent="\uFF08\u83B7\u53D6\u5931\u8D25\uFF09"}},p=async()=>{try{let{context:s}=await x(`/tasks/${e}/context`);await navigator.clipboard.writeText(s||""),T("\u2713 \u5DF2\u590D\u5236\u6700\u65B0\u5171\u4EAB\u4E0A\u4E0B\u6587")}catch{try{let{context:s}=await x(`/tasks/${e}/context`),n=document.createElement("textarea");n.value=s||"",document.body.appendChild(n),n.select(),document.execCommand("copy"),n.remove(),T("\u2713 \u5DF2\u590D\u5236\u6700\u65B0\u5171\u4EAB\u4E0A\u4E0B\u6587")}catch(s){alert(`\u590D\u5236\u5931\u8D25\uFF1A${s.message}`)}}};v(),o("#tb-d-ctx-refresh",a)?.addEventListener("click",v),o("#tb-d-ctx-copy",a)?.addEventListener("click",p);let l=()=>({repo:o("#tb-d-repo",a).value.trim(),feature:o("#tb-d-feature",a).value.trim(),priority:o("#tb-d-priority",a).value,progress:Number(o("#tb-d-progress",a).value),review:o("#tb-d-review",a).value,test:o("#tb-d-test",a).value,labels:o("#tb-d-labels",a).value.split(",").map(s=>s.trim()).filter(Boolean),description:o("#tb-d-desc",a).value}),f=()=>a.remove(),c=s=>{a.remove(),nt(s)},b=async s=>{let{task:n}=await x(`/tasks/${e}`,{method:"PATCH",body:JSON.stringify(s)});return await m(),n};a.addEventListener("click",s=>{s.target===a&&f()}),o('[data-act="cancel"]',a).addEventListener("click",f),o('[data-act="save"]',a).addEventListener("click",async()=>{try{let s=await b(l()),n=o("#tb-d-sess-pick",a)?.value;if(n&&!(s.sessionIds||[]).includes(n)){let h=await x(`/tasks/${e}/sessions`,{method:"POST",body:JSON.stringify({sessionId:n,action:"link"})});s=h.task,await m(),h.injectionNote&&!h.injected&&T(h.injectionNote)}c(s),T("\u2713 \u5DF2\u4FDD\u5B58")}catch(s){alert(`\u4FDD\u5B58\u5931\u8D25\uFF1A${s.message}`)}}),o('[data-act="del"]',a).addEventListener("click",async()=>{if(confirm(`\u5220\u9664\u4EFB\u52A1\u300C${t.title}\u300D\uFF1F`))try{await x(`/tasks/${e}`,{method:"DELETE"}),f(),await q()}catch(s){alert(`\u5220\u9664\u5931\u8D25\uFF1A${s.message}`)}}),o('[data-act="copyctx"]',a)?.addEventListener("click",p),o("#tb-d-note",a).addEventListener("keydown",async s=>{if(s.key==="Enter"&&(s.ctrlKey||s.metaKey)){let n=o("#tb-d-note",a).value.trim();if(!n)return;try{let{task:h}=await x(`/tasks/${e}/notes`,{method:"POST",body:JSON.stringify({text:n})});await m(),c(h),T("\u2713 \u8FDB\u5C55\u5DF2\u8BB0\u5F55")}catch(h){alert(`\u8BB0\u5F55\u5931\u8D25\uFF1A${h.message}`)}}}),o("#tb-d-sess-link",a).addEventListener("click",async()=>{let s=o("#tb-d-sess-pick",a).value;if(!s)return;let{task:n,injected:h,injectionNote:d}=await x(`/tasks/${e}/sessions`,{method:"POST",body:JSON.stringify({sessionId:s,action:"link"})});await m(),c(n),T(h?"\u2713 \u5DF2\u5173\u8054\u4F1A\u8BDD\uFF08\u5DF2\u6CE8\u5165\u4EFB\u52A1\u4E0A\u4E0B\u6587\uFF09":d||"\u5DF2\u5173\u8054\u4F1A\u8BDD")}),$("#tb-d-sessions [data-act]",a).forEach(s=>s.addEventListener("click",async()=>{let n=s.dataset.sid;if(s.dataset.act==="open")J(n);else{let{task:h}=await x(`/tasks/${e}/sessions`,{method:"POST",body:JSON.stringify({sessionId:n,action:"unlink"})});await m(),c(h),T("\u5DF2\u89E3\u9664\u4F1A\u8BDD")}})),o("#tb-d-sess-new",a)?.addEventListener("click",async()=>{try{let{sessionId:s}=await x(`/tasks/${e}/session`,{method:"POST",body:"{}"});J(s)}catch(s){alert(`\u65B0\u5EFA\u4F1A\u8BDD\u5931\u8D25\uFF1A${s.message}`)}}),$(".dsh-tb-statusbtn",a).forEach(s=>s.addEventListener("click",async()=>{try{let n=await b({status:s.dataset.status});c(n),T("\u2713 \u72B6\u6001\u5DF2\u66F4\u65B0")}catch(n){alert(`\u72B6\u6001\u6D41\u8F6C\u5931\u8D25\uFF1A${n.message}`)}})),o('[data-act="split"]',a)?.addEventListener("click",()=>{let s=document.createElement("div");s.className="dsh-tb-modal-mask",s.innerHTML=`<div class="dsh-tb-modal">
				<h3>\u62C6\u5206\u4EFB\u52A1\uFF1A${r(t.title)}</h3>
				<div class="dsh-tb-field"><label>\u5B50\u4EFB\u52A1\u6807\u9898\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF0C\u62C6\u5206\u540E\u81EA\u52A8\u7EE7\u627F\u4ED3\u5E93/\u4F18\u5148\u7EA7/\u6807\u7B7E/\u5173\u8054\u4F1A\u8BDD\uFF09</label>
					<textarea id="tb-split-titles" style="min-height:120px" placeholder="\u4F8B\u5982\uFF1A&#10;\u5B9E\u73B0\u529F\u80FD A&#10;\u5B9E\u73B0\u529F\u80FD B&#10;\u8054\u8C03\u4E0E\u6D4B\u8BD5"></textarea></div>
				<div class="dsh-tb-actions">
					<button data-act="cancel">\u53D6\u6D88</button>
					<button data-act="do" class="dsh-tb-primary">\u62C6\u5206</button>
				</div>
			</div>`,document.body.appendChild(s);let n=()=>s.remove();o('[data-act="cancel"]',s).addEventListener("click",n),s.addEventListener("click",h=>{h.target===s&&n()}),o('[data-act="do"]',s).addEventListener("click",async()=>{let h=o("#tb-split-titles",s).value.split(`
`).map(d=>d.trim()).filter(Boolean);if(!h.length){o("#tb-split-titles",s).focus();return}try{let{tasks:d}=await x(`/tasks/${e}/split`,{method:"POST",body:JSON.stringify({titles:h})});n(),await q(),T(`\u2713 \u5DF2\u62C6\u5206\u4E3A ${d.length} \u4E2A\u5B50\u4EFB\u52A1`),d?.[0]&&P(d[0].id)}catch(d){alert(`\u62C6\u5206\u5931\u8D25\uFF1A${d.message}`)}}),o("#tb-split-titles",s).focus()})}at(),ot(),new MutationObserver(()=>{at(),ot()}).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("keydown",t=>{t.ctrlKey&&t.shiftKey&&(t.key==="B"||t.key==="b")&&(t.preventDefault(),Q())}),document.addEventListener("click",t=>{if(!G())return;let e=t.target;e instanceof Element&&(e.closest(`[${j}]`)||e.closest('[data-pane="sidebar"], [class*="sidebarCol"]')&&Q(!1))})})();})();
