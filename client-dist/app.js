(()=>{(()=>{if(window.__dshTaskboardLoaded)return;window.__dshTaskboardLoaded=!0;let ft="/taskboard/api",m={todo:{label:"\u5F85\u529E",color:"#8b949e"},in_progress:{label:"\u8FDB\u884C\u4E2D",color:"#3478f6"},in_review:{label:"\u8BC4\u5BA1\u4E2D",color:"#bc8cff"},blocked:{label:"\u5DF2\u963B\u585E",color:"#f85149"},done:{label:"\u5DF2\u5B8C\u6210",color:"#3fb950"}},P=["todo","in_progress","in_review","blocked","done"],R={low:{label:"\u4F4E",color:"#8b949e"},medium:{label:"\u4E2D",color:"#d29922"},high:{label:"\u9AD8",color:"#e3862e"},urgent:{label:"\u7D27\u6025",color:"#f85149"}},G={none:"\u2014",pending:"\u8BC4\u5BA1\u5F85\u5904\u7406",approved:"\u8BC4\u5BA1\u901A\u8FC7",rejected:"\u8BC4\u5BA1\u9A73\u56DE"},Q={none:"\u2014",pending:"\u6D4B\u8BD5\u5F85\u5904\u7406",passed:"\u6D4B\u8BD5\u901A\u8FC7",failed:"\u6D4B\u8BD5\u5931\u8D25"},ot=["#79c0ff","#d2a8ff","#7ee787","#ffa657","#ff7b72","#f2cc60","#a5d6ff","#ffd7a8"],S="data-dsh-taskboard-active",C="data-dsh-taskboard-entry",H="data-dsh-taskboard-view",D="data-dsh-ssh-active",ut='<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2.5" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M6.5 6.5v7"/></svg>',a=(t,e=document)=>e.querySelector(t),$=(t,e=document)=>[...e.querySelectorAll(t)],r=t=>String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),A=t=>{let e=String(t||"").split("/").filter(Boolean);return e.length?e[e.length-1]:String(t||"")},xt=t=>{let e=0;for(let d of String(t))e=e*31+d.charCodeAt(0)>>>0;return ot[e%ot.length]},I=t=>{if(!t)return"";let e=new Date(t),d=Date.now()-t;return d<6e4?"\u521A\u521A":d<36e5?`${Math.floor(d/6e4)} \u5206\u949F\u524D`:d<864e5?`${Math.floor(d/36e5)} \u5C0F\u65F6\u524D`:`${e.getMonth()+1}/${e.getDate()} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`},j=[],M=[],q=[],Z=[],T={q:"",repo:"",priority:"",status:"",label:""},N="overview",U={};async function g(t,e={}){let d=await fetch(ft+t,{headers:{"content-type":"application/json"},...e}),i=await d.json().catch(()=>({}));if(!d.ok)throw new Error(i.error||`HTTP ${d.status}`);return i}let gt=`
<style>
/* \u53EA\u5728\u4EFB\u52A1\u770B\u677F\u6253\u5F00\u65F6\u624D\u628A\u5BF9\u8BDD\u5217\u8BBE\u4E3A\u5B9A\u4F4D\u951A\u70B9\uFF1B\u6B63\u5E38\u5BF9\u8BDD\u65F6\u4E0D\u5E72\u9884\u65B0\u7248\u5E03\u5C40\uFF0C
   \u907F\u514D\u7EDD\u5BF9\u5B9A\u4F4D\u6D6E\u5C42\uFF08\u542B\u8F93\u5165\u533A\u76F8\u5173\uFF09\u7684\u5305\u542B\u5757\u88AB\u6539\u53D8\u5BFC\u81F4\u8F93\u5165\u88AB\u906E\u6321 */
html[${S}] [data-pane='conversation'],
html[${S}] [class*='centerCol'] { position: relative; }
[${H}] {
  position: absolute; inset: 0; display: none; z-index: 60;
  background: var(--dsw-alias-bg-base, #0d1117); overflow: hidden;
}
html[${S}]:not([${D}]) [data-pane='conversation'] > div[${H}],
html[${S}]:not([${D}]) [class*='centerCol'] > div[${H}] {
  display: flex !important; flex-direction: column;
}
html[${S}]:not([${D}]) [data-pane='conversation'] > :not([${H}]),
html[${S}]:not([${D}]) [class*='centerCol'] > :not([${H}]) {
  display: none !important;
}
[${C}] {
  display: flex; align-items: center; gap: 8px; width: 100%; height: 32px;
  padding: 0 12px; background: transparent; border: none; border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #9aa7b4); cursor: pointer;
  font-size: 13px; white-space: nowrap; transition: background .15s, color .15s;
}
[${C}]:hover { background: var(--dsw-specific-sidebar-nav-item-hover, #1b2127); color: var(--dsw-alias-label-primary, #e6edf3); }
[${C}][data-active] { background: var(--dsw-specific-sidebar-nav-item-active, #232a31); color: var(--dsw-alias-label-primary, #e6edf3); font-weight: 600; }
[${C}] span { display: inline-flex; align-items: center; justify-content: center; flex: none; }
[${C}][data-icon-only] { gap: 0; justify-content: center; padding: 0; height: 36px; margin-bottom: 12px; }
[${C}][data-icon-only] > span:not(:first-child) { display: none; }

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
.dsh-tb-ov-sec .dsh-tb-ov-more{float:right;background:transparent;border:1px solid var(--dsw-alias-border-l2,#2a3138);color:var(--dsw-alias-label-secondary,#9aa7b4);border-radius:7px;padding:1px 9px;font-size:10.5px;font-weight:500;cursor:pointer;transition:all .15s}
.dsh-tb-ov-sec .dsh-tb-ov-more:hover{border-color:var(--dsw-alias-border-accent,#bc8cff);color:var(--dsw-alias-label-primary,#e6edf3)}
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
.dsh-tb-picklist{display:flex;flex-direction:column;gap:10px;max-height:48vh;overflow-y:auto;margin-top:10px}
.dsh-tb-pick-group{border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:9px;overflow:hidden}
.dsh-tb-pick-grouphead{display:flex;justify-content:space-between;align-items:center;background:var(--dsw-alias-bg-layer-2,#1b2127);padding:6px 11px;font-size:11.5px;font-weight:700;color:var(--dsw-alias-label-secondary,#9aa7b4);letter-spacing:.3px}
.dsh-tb-pick-grouphead b{color:#bc8cff}
.dsh-tb-pick-item{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 11px;border-top:1px solid var(--dsw-alias-border-l2,#2a3138);cursor:pointer;transition:background .12s}
.dsh-tb-pick-item:hover{background:var(--dsw-alias-bg-layer-2,#1b2127)}
.dsh-tb-pick-item .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.dsh-tb-pick-item .m{flex:none;font-size:10.5px;color:var(--dsw-alias-label-tertiary,#768390)}
.dsh-tb-empty{padding:14px;text-align:center;color:var(--dsw-alias-label-tertiary,#768390);font-size:12px}
</style>`;document.documentElement.insertAdjacentHTML("beforeend",gt);let mt=`
<div id="dsh-tb-view" ${H}="">
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
</div>`;function wt(){let t=document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');return t===null?void 0:t.querySelector('[class*="logoRow"]')?.parentElement??t.firstElementChild}function yt(t){let e=t.querySelector('button[class*="newSession"]');if(e!==null)return e;for(let d of t.children)if(d.tagName==="BUTTON")return d}function it(){return document.querySelector('[data-pane="conversation"]')??document.querySelector('[class*="centerCol"]')??void 0}function $t(t){return[...t.classList].some(e=>/collapsed/i.test(e))}let w=null,J=null;function tt(){return document.documentElement.hasAttribute(S)}function rt(){w!==null&&(tt()?w.setAttribute("data-active",""):w.removeAttribute("data-active"))}function et(t){let e=t!==void 0?t:!tt();e&&document.documentElement.removeAttribute(D),e?document.documentElement.setAttribute(S,""):document.documentElement.removeAttribute(S),rt(),e&&W()}function nt(){if(J!==null)return;let t=it();t!==void 0&&(J=document.createElement("div"),J.setAttribute(H,""),J.innerHTML=mt,t.appendChild(J),kt())}function lt(){let t=wt();if(t===void 0||(w===null&&(w=document.createElement("button"),w.type="button",w.setAttribute(C,""),w.innerHTML=`<span>${ut}</span><span>\u4EFB\u52A1\u770B\u677F</span>`,w.title="\u4EFB\u52A1\u770B\u677F",w.addEventListener("click",()=>et()),rt()),w.parentElement===t))return;let e=yt(t),d=e?.closest('[class*="logoRow"]'),i=d!=null&&d.parentElement===t?d:e;t.insertBefore(w,i?.nextElementSibling??null),(()=>{w!==null&&($t(t)?w.setAttribute("data-icon-only",""):w.removeAttribute("data-icon-only"))})()}function kt(){a("#dsh-tb-new")?.addEventListener("click",pt),a("#dsh-tb-refresh")?.addEventListener("click",()=>W()),a("#dsh-tb-search")?.addEventListener("input",()=>{T.q=a("#dsh-tb-search").value.trim(),k()}),a("#dsh-tb-repo-filter")?.addEventListener("change",()=>{T.repo=a("#dsh-tb-repo-filter").value,k()}),a("#dsh-tb-priority-filter")?.addEventListener("change",()=>{T.priority=a("#dsh-tb-priority-filter").value,k()}),a("#dsh-tb-status-filter")?.addEventListener("change",()=>{T.status=a("#dsh-tb-status-filter").value,k()}),a("#dsh-tb-label-filter")?.addEventListener("change",()=>{T.label=a("#dsh-tb-label-filter").value,k()}),$(".dsh-tb-tab").forEach(t=>t.addEventListener("click",()=>{N=t.dataset.tbView,X()}))}async function k(){let t=new URLSearchParams;for(let d of["q","repo","priority","status","label"])T[d]&&t.set(d,T[d]);j=(await g(`/tasks?${t}`)).tasks||[],X()}async function Et(){try{let[t,e]=await Promise.all([g("/sessions"),g("/workspaces")]);M=t.sessions||[],q=e.workspaces||[];let d=a("#dsh-tb-repo-filter");if(d){let c=d.value;d.innerHTML='<option value="">\u5168\u90E8\u4ED3\u5E93</option>'+q.map(h=>`<option value="${r(h.path)}" title="${r(h.path)}">${r(A(h.path))}</option>`).join(""),c&&[...d.options].some(h=>h.value===c)&&(d.value=c)}let i=await g("/tasks").catch(()=>({tasks:[]})),f=new Set;for(let c of i.tasks||[])for(let h of c.labels||[])f.add(h);Z=[...f].sort();let p=a("#dsh-tb-label-filter");if(p){let c=p.value;p.innerHTML='<option value="">\u5168\u90E8\u6807\u7B7E</option>'+Z.map(h=>`<option value="${r(h)}">${r(h)}</option>`).join(""),c&&[...p.options].some(h=>h.value===c)&&(p.value=c)}let l=a("#dsh-tb-priority-filter");l&&!l.options.length&&(l.innerHTML='<option value="">\u5168\u90E8\u4F18\u5148\u7EA7</option>'+Object.entries(R).map(([c,h])=>`<option value="${c}">${h.label}</option>`).join(""));let v=a("#dsh-tb-status-filter");v&&!v.options.length&&(v.innerHTML='<option value="">\u5168\u90E8\u72B6\u6001</option>'+Object.entries(m).map(([c,h])=>`<option value="${c}">${h.label}</option>`).join(""))}catch{}}async function Lt(){for(let t of q)if(!(!t.path||U[t.path]!==void 0))try{let e=await fetch(`/ide/api/git?op=status&path=${encodeURIComponent(t.path)}`).then(d=>d.json());U[t.path]=e.git?{branch:e.branch?.name||"(detached)",dirty:(e.files||[]).length}:null}catch{U[t.path]=null}}function W(){return Et().then(()=>Lt()).then(k).catch(k)}function ct(t){return(t.labels||[]).map(e=>`<span class="dsh-tb-pill" style="color:${xt(e)}">${r(e)}</span>`).join("")}function Tt(t){let e=m[t.status]||m.todo;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function bt(t){let e=R[t.priority]||R.medium;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function St(t){let e=(d,i,f)=>`<button type="button" class="dsh-tb-statusbtn ${f||""}" data-status="${d}">${i}</button>`;switch(t.status){case"todo":return`${e("in_progress","\u25B6 \u5F00\u59CB\u6267\u884C")} ${e("blocked","\u26D4 \u963B\u585E","ghost")}`;case"in_progress":return`${e("in_review","\u63D0\u4EA4\u8BC4\u5BA1")} ${e("blocked","\u26D4 \u963B\u585E","ghost")}`;case"in_review":return`${e("done","\u2705 \u786E\u8BA4\u5B8C\u6210","primary")} ${e("in_progress","\u21A9 \u9000\u56DE\u4FEE\u6539")}`;case"done":return`${e("in_progress","\u21A9 \u91CD\u65B0\u6253\u5F00","ghost")}`;case"blocked":return`${e("in_progress","\u25B6 \u6062\u590D\u8FDB\u884C")}`;default:return""}}function B(t){try{localStorage.setItem("dsh.sessions.current",JSON.stringify({sessionId:t}))}catch{}location.reload()}function _(t){let e=document.createElement("div");e.className="dsh-tb-toast",e.textContent=t,document.body.appendChild(e),setTimeout(()=>e.remove(),1600)}function jt(){var Y;let t={};for(let o of P)t[o]=0;let e={};for(let o of j){t[o.status]!==void 0&&t[o.status]++;let u=o.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(e[u]||(e[u]=[])).push(o)}let d=j.length,i=t.done||0,f=d?Math.round(i/d*100):0,p={};for(let o of M)o.repo&&(p[Y=o.repo]||(p[Y]=[])).push(o);let l=[...j].sort((o,u)=>u.updatedAt-o.updatedAt).slice(0,10),c=[...M].filter(o=>o&&o.updatedAt).sort((o,u)=>(u.updatedAt||0)-(o.updatedAt||0)).slice(0,15),s='<div class="dsh-tb-ov-stat dsh-tb-ov-add" id="dsh-tb-ov-new" title="\u65B0\u5EFA\u4EFB\u52A1"><div class="dsh-tb-ov-addbtn">\uFF0B \u65B0\u5EFA\u4EFB\u52A1</div></div>'+[["\u5168\u90E8\u4EFB\u52A1",d,"#e6edf3",""],...P.map(o=>[m[o].label,t[o]||0,m[o].color,o]),["\u5B8C\u6210\u7387",`${f}%`,"#3fb950",null]].map(([o,u,z,E])=>{let at=o==="\u5B8C\u6210\u7387"?f:d?Math.round(u/d*100):0,F=E!==null?" dsh-tb-ov-stat-click":"",dt=E===""?"\u67E5\u770B\u5168\u90E8\u4EFB\u52A1":E?`\u67E5\u770B\u300C${o}\u300D\u7684\u4EFB\u52A1`:"";return`<div class="dsh-tb-ov-stat${F}" ${E!==null?`data-status="${E}"`:""} title="${dt}"><div class="n" style="color:${z}">${u}</div><div class="l">${o}</div><div class="mini"><i style="width:${at}%;background:${z}"></i></div></div>`}).join(""),n;q.length?n=q.map(o=>{let u=e[o.path]||e[o.title]||[],z=P.map(L=>u.filter(O=>O.status===L).length),E=u.length,at=z[P.indexOf("done")]||0,F=E?Math.round(at/E*100):0,dt=E?P.map((L,O)=>z[O]?`<i style="width:${Math.round(z[O]/E*100)}%;background:${m[L].color}" title="${m[L].label} ${z[O]}"></i>`:"").join(""):"",It=P.map((L,O)=>z[O]?`<span class="st"><i class="dot" style="background:${m[L].color}"></i>${m[L].label} <b>${z[O]}</b></span>`:"").join(""),Nt=(p[o.path]||p[o.title]||[]).length,K=U[o.path],Pt=K?`<span class="branch">\u2387 ${r(K.branch)}</span>${K.dirty?`<span class="branch dirty" title="${K.dirty} \u4E2A\u672A\u63D0\u4EA4\u6587\u4EF6">\u25CF${K.dirty}</span>`:""}`:"",vt=(p[o.path]||p[o.title]||[]).slice(0,3).map(L=>`<div class="s" data-sid="${r(L.id)}" title="\u6253\u5F00\u4F1A\u8BDD ${r(L.id)}">\u25B8 ${r(L.title)}</div>`).join("");return`<div class="dsh-tb-ov-ws" data-repo="${r(o.path)}">
					<div class="ws-head"><h4>${r(o.title)}</h4><span class="ws-total">${E} \u4E2A\u4EFB\u52A1</span></div>
					<div class="path">${r(o.path||"")}</div>
					${E?`<div class="stack">${dt}</div><div class="ws-stats">${It}</div>`:'<div class="ws-stats" style="color:var(--dsw-alias-label-secondary,#9aa7b4)">\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u300D\u521B\u5EFA</div>'}
					<div class="comp"><span class="pct">\u5B8C\u6210\u7387 ${F}%</span><div class="track"><i style="width:${F}%"></i></div></div>
					<div class="meta">${Pt}<span class="sess">\u4F1A\u8BDD ${Nt}</span></div>
					${vt?`<div class="sesslist">${vt}</div>`:""}
				</div>`}).join(""):n='<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u5DE5\u4F5C\u533A\uFF09</div>';let b=l.length?l.map(o=>{let u=m[o.status]||m.todo;return`<div class="dsh-tb-ov-item" data-id="${r(o.id)}">
				<span class="dot" style="background:${u.color}"></span>
				<span class="t">${r(o.title)}</span>
				${o.repo?`<span class="r">${r(A(o.repo))}</span>`:""}
				<span class="tm">${I(o.updatedAt)}</span>
			</div>`}).join(""):'<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF09</div>',x=c.length?c.map(o=>`<div class="dsh-tb-ov-item" data-sid="${r(o.id)}">
				<span class="dot" style="background:${o.running?"#f2cc60":"#3478f6"};box-shadow:0 0 5px ${o.running?"#f2cc60":"#3478f6"}99"></span>
				<span class="t">${r(o.title||o.id)}${o.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</span>
				${o.repo?`<span class="r">${r(A(o.repo))}</span>`:""}
				${o.turns?`<span class="r" style="color:var(--dsw-alias-label-tertiary,#768390)">${o.turns} \u8F6E</span>`:""}
				<span class="tm">${I(o.updatedAt)}</span>
			</div>`).join(""):'<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u5BF9\u8BDD\uFF09</div>',y=a("#dsh-tb-body");y&&(y.innerHTML=`<div class="dsh-tb-ov">
			<div class="dsh-tb-ov-stats">${s}</div>
			<div class="dsh-tb-ov-sec">\u6700\u65B0\u5BF9\u8BDD<button class="dsh-tb-ov-more" id="dsh-tb-ov-sess-all" title="\u67E5\u770B\u5168\u90E8\u4F1A\u8BDD">\u67E5\u770B\u5168\u90E8 ${M.length} \u203A</button></div>
			<div class="dsh-tb-ov-recent" id="dsh-tb-ov-sessions">${x}</div>
			<div class="dsh-tb-ov-sec">\u5DE5\u4F5C\u533A\u5185\u5BB9</div>
			<div class="dsh-tb-ov-grid">${n}</div>
			<div class="dsh-tb-ov-sec">\u6700\u8FD1\u66F4\u65B0\u4EFB\u52A1</div>
			<div class="dsh-tb-ov-recent">${b}</div>
		</div>`,a("#dsh-tb-ov-new")?.addEventListener("click",pt),$(".dsh-tb-ov-stat[data-status]").forEach(o=>o.addEventListener("click",()=>{T.status=o.dataset.status,N="list",X(),k()})),$(".dsh-tb-ov-ws").forEach(o=>o.addEventListener("click",()=>{T.repo=o.dataset.repo;let u=a("#dsh-tb-repo-filter");u&&(u.value=T.repo),N="kanban",X(),k()})),$(".dsh-tb-ov-ws .s").forEach(o=>o.addEventListener("click",u=>{u.stopPropagation(),B(o.dataset.sid)})),$(".dsh-tb-ov-item").forEach(o=>o.addEventListener("click",()=>{o.dataset.id&&V(o.dataset.id)})),$("#dsh-tb-ov-sessions .dsh-tb-ov-item").forEach(o=>o.addEventListener("click",u=>{u.stopPropagation(),B(o.dataset.sid)})),a("#dsh-tb-ov-sess-all")?.addEventListener("click",o=>{o.stopPropagation(),_t()}))}function zt(t){let e=m[t.status]||m.todo,d=R[t.priority]||R.medium,i=[];i.push(bt(t)),t.status==="in_review"&&i.push('<span class="dsh-tb-pill" style="color:#bc8cff;font-weight:600">\u25C9 \u5F85 review</span>'),t.repo&&i.push(`<span class="dsh-tb-pill" style="color:#79c0ff">${r(A(t.repo))}</span>`),t.feature&&i.push(`<span class="dsh-tb-pill" style="color:#d2a8ff">${r(t.feature)}</span>`),i.push(ct(t)),t.review&&t.review!=="none"&&i.push(`<span class="dsh-tb-pill" style="color:${t.review==="approved"?"#3fb950":t.review==="rejected"?"#f85149":"#d29922"}">${G[t.review]}</span>`),t.test&&t.test!=="none"&&i.push(`<span class="dsh-tb-pill" style="color:${t.test==="passed"?"#3fb950":t.test==="failed"?"#f85149":"#d29922"}">${Q[t.test]}</span>`);let f=[];return t.sessionIds?.length&&f.push(`<span>\u4F1A\u8BDD ${t.sessionIds.length}</span>`),t.notes?.length&&f.push(`<span>\u8BC4\u8BBA ${t.notes.length}</span>`),f.push(`<span>${I(t.updatedAt)}</span>`),`<div class="dsh-tb-card" data-id="${r(t.id)}" style="border-left:3px solid ${e.color}">
			<div class="dsh-tb-card-title">${r(t.title)}</div>
			<div class="dsh-tb-card-meta">${i.join("")}</div>
			${t.displayProgress>0?`<div class="dsh-tb-bar"><i style="width:${Math.min(100,t.displayProgress)}%"></i></div>`:""}
			<div class="dsh-tb-card-foot">${f.join(" \xB7 ")}</div>
		</div>`}function Ct(){let t=a("#dsh-tb-body"),e=a("#dsh-tb-count");if(!t)return;t.innerHTML='<div class="dsh-tb-columns"></div>';let d=a(".dsh-tb-columns",t);e&&(e.textContent=`${j.length} \u4E2A\u4EFB\u52A1`);for(let[i,f]of Object.entries(m)){let p=document.createElement("div");p.className="dsh-tb-col";let l=j.filter(c=>c.status===i);p.innerHTML=`<div class="dsh-tb-col-head">${f.label} <b>${l.length}</b></div><div class="dsh-tb-col-body"></div>`;let v=a(".dsh-tb-col-body",p);l.length?l.forEach(c=>v.insertAdjacentHTML("beforeend",zt(c))):v.innerHTML='<div class="dsh-tb-empty">\u2014</div>',d.appendChild(p)}$(".dsh-tb-card",d).forEach(i=>i.addEventListener("click",()=>V(i.dataset.id)))}function At(){let t=a("#dsh-tb-body"),e=a("#dsh-tb-count");if(!t)return;if(e&&(e.textContent=`${j.length} \u4E2A\u4EFB\u52A1`),!j.length){t.innerHTML='<div class="dsh-tb-ov"><div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u300D\u521B\u5EFA\uFF09</div></div>';return}let d=j.map(i=>`<tr data-id="${r(i.id)}">
			<td>${Tt(i)}</td>
			<td>${bt(i)}</td>
			<td style="max-width:340px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r(i.title)}</div></td>
			<td>${i.repo?`<span class="dsh-tb-pill" style="color:#79c0ff">${r(A(i.repo))}</span>`:""}</td>
			<td style="max-width:140px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r(i.feature||"")}</div></td>
			<td>${ct(i)}</td>
			<td style="min-width:90px">${i.displayProgress>0?`<div class="dsh-tb-bar" style="margin:0"><i style="width:${Math.min(100,i.displayProgress)}%"></i></div>`:""}</td>
			<td>${i.review!=="none"?`<span class="dsh-tb-pill" style="color:${i.review==="approved"?"#3fb950":i.review==="rejected"?"#f85149":"#d29922"}">${G[i.review]}</span>`:""}</td>
			<td>${i.test!=="none"?`<span class="dsh-tb-pill" style="color:${i.test==="passed"?"#3fb950":i.test==="failed"?"#f85149":"#d29922"}">${Q[i.test]}</span>`:""}</td>
			<td style="white-space:nowrap">${I(i.updatedAt)}</td>
		</tr>`).join("");t.innerHTML=`<div class="dsh-tb-ov" style="padding:0">
			<table class="dsh-tb-table">
				<thead><tr><th>\u72B6\u6001</th><th>\u4F18\u5148\u7EA7</th><th>\u4EFB\u52A1</th><th>\u4ED3\u5E93</th><th>\u5206\u652F/feature</th><th>\u6807\u7B7E</th><th>\u8FDB\u5EA6</th><th>Review</th><th>\u6D4B\u8BD5</th><th>\u66F4\u65B0</th></tr></thead>
				<tbody>${d}</tbody>
			</table>
		</div>`,$("tr[data-id]",t).forEach(i=>i.addEventListener("click",()=>V(i.dataset.id)))}function X(){$(".dsh-tb-tab").forEach(e=>{e.dataset.tbView===N?e.classList.add("dsh-tb-tab-on"):e.classList.remove("dsh-tb-tab-on")});let t=a("#dsh-tb-toolbar");t&&(t.style.display=N==="overview"?"none":"flex"),N==="kanban"?Ct():N==="list"?At():jt()}function pt(){let t=document.createElement("div");t.className="dsh-tb-modal-mask";let e=q.map(l=>`<option value="${r(l.path)}" title="${r(l.path)}">${r(l.path)}</option>`).join(""),d=(l,v)=>{a(l,t)?.classList.add("err"),v&&(a(v,t).hidden=!1)},i=()=>{t.innerHTML=`<div class="dsh-tb-modal" style="width:min(560px,92vw)">
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
			</div>`,a("#tb-f-title",t).addEventListener("input",()=>{a("#tb-f-title",t).classList.remove("err"),a("#tb-hint-title",t).hidden=!0}),a("#tb-f-repo",t).addEventListener("change",()=>{a("#tb-f-repo",t).classList.remove("err"),a("#tb-hint-repo",t).hidden=!0}),a('[data-act="cancel"]',t).addEventListener("click",p),a('[data-act="save"]',t).addEventListener("click",async()=>{let l=a("#tb-f-title",t).value.trim(),v=a("#tb-f-repo",t).value;a("#tb-hint-title",t).hidden=!0,a("#tb-hint-repo",t).hidden=!0,$(".err",t).forEach(h=>h.classList.remove("err"));let c=!0;if(l||(d("#tb-f-title","#tb-hint-title"),c=!1),v||(d("#tb-f-repo","#tb-hint-repo"),c=!1),!!c)try{let{task:h}=await g("/tasks",{method:"POST",body:JSON.stringify({title:l,repo:v,feature:a("#tb-f-feature",t).value.trim(),description:a("#tb-f-desc",t).value})});W(),f(h)}catch(h){alert(`\u521B\u5EFA\u5931\u8D25\uFF1A${h.message}`)}}),a("#tb-f-title",t).focus()},f=l=>{t.innerHTML=`<div class="dsh-tb-modal" style="width:min(560px,92vw)">
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
			</div>`,a('[data-act="newsess"]',t).addEventListener("click",async()=>{try{let{sessionId:v}=await g(`/tasks/${l.id}/session`,{method:"POST",body:"{}"});B(v)}catch(v){alert(`\u65B0\u5EFA\u4F1A\u8BDD\u5931\u8D25\uFF1A${v.message}`)}}),a('[data-act="bind"]',t).addEventListener("click",()=>{t.remove(),V(l.id)}),a('[data-act="detail"]',t).addEventListener("click",()=>{t.remove(),V(l.id)}),a('[data-act="close"]',t).addEventListener("click",()=>t.remove())},p=()=>t.remove();t.addEventListener("click",l=>{l.target===t&&p()}),document.body.appendChild(t),i()}function Mt(t,e){g("/sessions").then(d=>{let i=document.createElement("div");i.className="dsh-tb-modal-mask",i.innerHTML=`<div class="dsh-tb-modal" style="width:min(600px,92vw)">
				<h3>\u9009\u62E9\u4F1A\u8BDD\u5173\u8054</h3>
				<div class="dsh-tb-field"><input id="tb-pick-search" placeholder="\u641C\u7D22\u4F1A\u8BDD\u6807\u9898\u2026" /></div>
				<div class="dsh-tb-picklist" id="tb-pick-list">\u52A0\u8F7D\u4E2D\u2026</div>
				<div class="dsh-tb-actions"><button data-act="cancel">\u53D6\u6D88</button></div>
			</div>`,document.body.appendChild(i);let f=d.sessions||M,p=a("#tb-pick-list",i),l=v=>{let c=String(v||"").trim().toLowerCase(),h=f.filter(b=>!c||String(b.title||"").toLowerCase().includes(c)),s={};for(let b of h){let x=b.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(s[x]||(s[x]=[])).push(b)}let n=Object.entries(s).sort((b,x)=>x[1].length-b[1].length).map(([b,x])=>(x.sort((y,Y)=>(Y.updatedAt||0)-(y.updatedAt||0)),`<div class="dsh-tb-pick-group">
							<div class="dsh-tb-pick-grouphead">${r(A(b))} <b>${x.length}</b></div>
							${x.map(y=>`<div class="dsh-tb-pick-item" data-sid="${r(y.id)}">
								<div class="t">${r(y.title||y.id)}${y.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</div>
								<div class="m">${y.updatedAt?I(y.updatedAt):""}</div>
							</div>`).join("")}
						</div>`)).join("");p.innerHTML=n||'<div class="dsh-tb-empty">\uFF08\u65E0\u5339\u914D\u4F1A\u8BDD\uFF09</div>',$(".dsh-tb-pick-item",i).forEach(b=>b.addEventListener("click",async()=>{let x=b.dataset.sid;try{let{task:y,injected:Y,injectionNote:o}=await g(`/tasks/${t}/sessions`,{method:"POST",body:JSON.stringify({sessionId:x,action:"link"})});i.remove(),await k(),e(y),_(Y?"\u2713 \u5DF2\u5173\u8054\u4F1A\u8BDD\uFF08\u5DF2\u6CE8\u5165\u4EFB\u52A1\u4E0A\u4E0B\u6587\uFF09":o||"\u5DF2\u5173\u8054\u4F1A\u8BDD")}catch(y){alert(`\u5173\u8054\u5931\u8D25\uFF1A${y.message}`)}}))};l(""),a("#tb-pick-search",i).addEventListener("input",()=>l(a("#tb-pick-search",i).value)),a('[data-act="cancel"]',i).addEventListener("click",()=>i.remove()),i.addEventListener("click",v=>{v.target===i&&i.remove()}),a("#tb-pick-search",i).focus()}).catch(()=>alert("\u83B7\u53D6\u4F1A\u8BDD\u5217\u8868\u5931\u8D25"))}function _t(){g("/sessions").then(t=>{let e=document.createElement("div");e.className="dsh-tb-modal-mask",e.innerHTML=`<div class="dsh-tb-modal" style="width:min(620px,92vw)">
				<h3>\u5168\u90E8\u5BF9\u8BDD\uFF08${(t.sessions||[]).length}\uFF09</h3>
				<div class="dsh-tb-field"><input id="tb-sessall-search" placeholder="\u641C\u7D22\u6807\u9898 / \u4ED3\u5E93\u2026" /></div>
				<div class="dsh-tb-picklist" id="tb-sessall-list">\u52A0\u8F7D\u4E2D\u2026</div>
				<div class="dsh-tb-actions"><button data-act="cancel">\u5173\u95ED</button></div>
			</div>`,document.body.appendChild(e);let d=(t.sessions||M).slice().sort((p,l)=>(l.updatedAt||0)-(p.updatedAt||0)),i=a("#tb-sessall-list",e),f=p=>{let l=String(p||"").trim().toLowerCase(),v=d.filter(s=>!l||String(s.title||"").toLowerCase().includes(l)||String(s.repo||"").toLowerCase().includes(l));if(!v.length){i.innerHTML='<div class="dsh-tb-empty">\uFF08\u65E0\u5339\u914D\u4F1A\u8BDD\uFF09</div>';return}let c={};for(let s of v){let n=s.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(c[n]||(c[n]=[])).push(s)}let h=Object.entries(c).map(([s,n])=>`<div class="dsh-tb-pick-group">
						<div class="dsh-tb-pick-grouphead">${r(A(s))} <b>${n.length}</b></div>
						${n.map(b=>`<div class="dsh-tb-pick-item" data-sid="${r(b.id)}">
							<div class="t">${r(b.title||b.id)}${b.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</div>
							<div class="m">${b.updatedAt?I(b.updatedAt):""}</div>
						</div>`).join("")}
					</div>`).join("");i.innerHTML=h,$(".dsh-tb-pick-item",e).forEach(s=>s.addEventListener("click",()=>B(s.dataset.sid)))};f(""),a("#tb-sessall-search",e).addEventListener("input",()=>f(a("#tb-sessall-search",e).value)),a('[data-act="cancel"]',e).addEventListener("click",()=>e.remove()),e.addEventListener("click",p=>{p.target===e&&e.remove()}),a("#tb-sessall-search",e).focus()}).catch(()=>alert("\u83B7\u53D6\u4F1A\u8BDD\u5217\u8868\u5931\u8D25"))}async function V(t){let{task:e}=await g(`/tasks/${t}`);st(e)}function st(t){let e=t.id,d=document.createElement("div");d.className="dsh-tb-modal-mask";let i=M.map(s=>`<option value="${r(s.id)}">${r(s.title||s.id)}${s.repo?` \xB7 ${r(A(s.repo))}`:""}</option>`).join("");d.innerHTML=`<div class="dsh-tb-modal" style="width:min(700px,92vw)">
			<h3>${r(t.title)}</h3>
			<div class="dsh-tb-field"><label>\u4ED3\u5E93\u76EE\u5F55\uFF08\u5DE5\u4F5C\u533A\u8DEF\u5F84\uFF09</label><input id="tb-d-repo" placeholder="/root/projects/\u2026" value="${r(t.repo)}" /><input id="tb-d-feature" value="${r(t.feature)}" placeholder="feature/\u5206\u652F" style="margin-top:6px" /></div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>\u72B6\u6001\uFF08AI \u81EA\u52A8\u6D41\u8F6C\uFF0C\u4F60\u53EA\u9700\u5728"\u8BC4\u5BA1\u4E2D"\u65F6\u5904\u7406\uFF09</label>
					<div class="dsh-tb-statusline">
						<span class="dsh-tb-statusbadge" style="color:${m[t.status].color};border-color:${m[t.status].color}55;background:${m[t.status].color}14">${m[t.status].label}</span>
						<div class="dsh-tb-statusactions">${St(t)}</div>
					</div>
				</div>
				<div class="dsh-tb-field"><label>\u4F18\u5148\u7EA7</label><select id="tb-d-priority">${Object.entries(R).map(([s,n])=>`<option value="${s}" ${s===t.priority?"selected":""}>${n.label}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u8FDB\u5EA6 ${t.displayProgress??t.progress}%\uFF08\u81EA\u52A8\u6D3E\u751F\uFF09</label><input id="tb-d-progress" type="range" min="0" max="100" value="${t.progress}" /></div>
			</div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>Review</label><select id="tb-d-review">${Object.entries(G).map(([s,n])=>`<option value="${s}" ${s===t.review?"selected":""}>${n}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6D4B\u8BD5</label><select id="tb-d-test">${Object.entries(Q).map(([s,n])=>`<option value="${s}" ${s===t.test?"selected":""}>${n}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6807\u7B7E</label><input id="tb-d-labels" value="${r((t.labels||[]).join(", "))}" placeholder="\u9017\u53F7\u5206\u9694" list="tb-labels-datalist2" /><datalist id="tb-labels-datalist2">${Z.map(s=>`<option value="${r(s)}"></option>`).join("")}</datalist></div>
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
				<div id="tb-d-notes">${(t.notes||[]).map(s=>`<div class="dsh-tb-note"><span class="dsh-tb-note-time">${I(s.at)}</span><br/>${r(s.text)}</div>`).join("")||'<div class="dsh-tb-note">\uFF08\u6682\u65E0\u8BB0\u5F55\uFF09</div>'}</div>
				<textarea id="tb-d-note" placeholder="\u6DFB\u52A0\u8FDB\u5C55/\u5B8C\u6210\u60C5\u51B5\u2026\uFF08Ctrl+Enter \u63D0\u4EA4\uFF09" style="margin-top:6px"></textarea>
			</div>
			<div class="dsh-tb-field"><label>\u6C60\u5185\u4F1A\u8BDD\uFF08\u5171\u4EAB\u4E0A\u4E0B\u6587\u53EF\u8BBF\u95EE\u8005\uFF1B\u70B9\u51FB\u6253\u5F00\u53EF\u7EE7\u7EED\uFF09</label>
				<div id="tb-d-sessions">${(t.sessionIds||[]).map(s=>{let n=M.find(b=>b.id===s);return`<div class="dsh-tb-sess"><span class="dsh-tb-sess-title" title="${r(s)}">${r(n?n.title:s)}${n&&n.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</span><button data-sid="${r(s)}" data-act="open" class="dsh-tb-open">\u6253\u5F00</button><button data-sid="${r(s)}" data-act="unlink">\u89E3\u9664</button></div>`}).join("")||'<div class="dsh-tb-note">\uFF08\u672A\u5173\u8054\u4F1A\u8BDD\uFF09</div>'}</div>
				<div class="dsh-tb-row" style="margin-top:6px">
					<button id="tb-d-sess-open" style="flex:1" title="\u6309\u5DE5\u4F5C\u533A\u5206\u7EC4\u3001\u6309\u66F4\u65B0\u65F6\u95F4\u6392\u5E8F\u3001\u53EF\u641C\u7D22">\u{1F50D} \u9009\u62E9\u4F1A\u8BDD\u5173\u8054</button>
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
		</div>`,document.body.appendChild(d);let f=async()=>{let s=a("#tb-d-ctx-body",d);if(s)try{let{context:n}=await g(`/tasks/${e}/context`);s.textContent=n||"\uFF08\u6682\u65E0\u5171\u4EAB\u4E0A\u4E0B\u6587\uFF09"}catch{s.textContent="\uFF08\u83B7\u53D6\u5931\u8D25\uFF09"}},p=async()=>{try{let{context:s}=await g(`/tasks/${e}/context`);await navigator.clipboard.writeText(s||""),_("\u2713 \u5DF2\u590D\u5236\u6700\u65B0\u5171\u4EAB\u4E0A\u4E0B\u6587")}catch{try{let{context:s}=await g(`/tasks/${e}/context`),n=document.createElement("textarea");n.value=s||"",document.body.appendChild(n),n.select(),document.execCommand("copy"),n.remove(),_("\u2713 \u5DF2\u590D\u5236\u6700\u65B0\u5171\u4EAB\u4E0A\u4E0B\u6587")}catch(s){alert(`\u590D\u5236\u5931\u8D25\uFF1A${s.message}`)}}};f(),a("#tb-d-ctx-refresh",d)?.addEventListener("click",f),a("#tb-d-ctx-copy",d)?.addEventListener("click",p);let l=()=>({repo:a("#tb-d-repo",d).value.trim(),feature:a("#tb-d-feature",d).value.trim(),priority:a("#tb-d-priority",d).value,progress:Number(a("#tb-d-progress",d).value),review:a("#tb-d-review",d).value,test:a("#tb-d-test",d).value,labels:a("#tb-d-labels",d).value.split(",").map(s=>s.trim()).filter(Boolean),description:a("#tb-d-desc",d).value}),v=()=>d.remove(),c=s=>{d.remove(),st(s)},h=async s=>{let{task:n}=await g(`/tasks/${e}`,{method:"PATCH",body:JSON.stringify(s)});return await k(),n};d.addEventListener("click",s=>{s.target===d&&v()}),a('[data-act="cancel"]',d).addEventListener("click",v),a('[data-act="save"]',d).addEventListener("click",async()=>{try{let s=await h(l());c(s),_("\u2713 \u5DF2\u4FDD\u5B58")}catch(s){alert(`\u4FDD\u5B58\u5931\u8D25\uFF1A${s.message}`)}}),a('[data-act="del"]',d).addEventListener("click",async()=>{if(confirm(`\u5220\u9664\u4EFB\u52A1\u300C${t.title}\u300D\uFF1F`))try{await g(`/tasks/${e}`,{method:"DELETE"}),v(),await W()}catch(s){alert(`\u5220\u9664\u5931\u8D25\uFF1A${s.message}`)}}),a('[data-act="copyctx"]',d)?.addEventListener("click",p),a("#tb-d-note",d).addEventListener("keydown",async s=>{if(s.key==="Enter"&&(s.ctrlKey||s.metaKey)){let n=a("#tb-d-note",d).value.trim();if(!n)return;try{let{task:b}=await g(`/tasks/${e}/notes`,{method:"POST",body:JSON.stringify({text:n})});await k(),c(b),_("\u2713 \u8FDB\u5C55\u5DF2\u8BB0\u5F55")}catch(b){alert(`\u8BB0\u5F55\u5931\u8D25\uFF1A${b.message}`)}}}),a("#tb-d-sess-open",d)?.addEventListener("click",()=>{Mt(e,s=>{d.remove(),st(s)})}),$("#tb-d-sessions [data-act]",d).forEach(s=>s.addEventListener("click",async()=>{let n=s.dataset.sid;if(s.dataset.act==="open")B(n);else{let{task:b}=await g(`/tasks/${e}/sessions`,{method:"POST",body:JSON.stringify({sessionId:n,action:"unlink"})});await k(),c(b),_("\u5DF2\u89E3\u9664\u4F1A\u8BDD")}})),a("#tb-d-sess-new",d)?.addEventListener("click",async()=>{try{let{sessionId:s}=await g(`/tasks/${e}/session`,{method:"POST",body:"{}"});B(s)}catch(s){alert(`\u65B0\u5EFA\u4F1A\u8BDD\u5931\u8D25\uFF1A${s.message}`)}}),$(".dsh-tb-statusbtn",d).forEach(s=>s.addEventListener("click",async()=>{try{let n=await h({status:s.dataset.status});c(n),_("\u2713 \u72B6\u6001\u5DF2\u66F4\u65B0")}catch(n){alert(`\u72B6\u6001\u6D41\u8F6C\u5931\u8D25\uFF1A${n.message}`)}})),a('[data-act="split"]',d)?.addEventListener("click",()=>{let s=document.createElement("div");s.className="dsh-tb-modal-mask",s.innerHTML=`<div class="dsh-tb-modal">
				<h3>\u62C6\u5206\u4EFB\u52A1\uFF1A${r(t.title)}</h3>
				<div class="dsh-tb-field"><label>\u5B50\u4EFB\u52A1\u6807\u9898\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF0C\u62C6\u5206\u540E\u81EA\u52A8\u7EE7\u627F\u4ED3\u5E93/\u4F18\u5148\u7EA7/\u6807\u7B7E/\u5173\u8054\u4F1A\u8BDD\uFF09</label>
					<textarea id="tb-split-titles" style="min-height:120px" placeholder="\u4F8B\u5982\uFF1A&#10;\u5B9E\u73B0\u529F\u80FD A&#10;\u5B9E\u73B0\u529F\u80FD B&#10;\u8054\u8C03\u4E0E\u6D4B\u8BD5"></textarea></div>
				<div class="dsh-tb-actions">
					<button data-act="cancel">\u53D6\u6D88</button>
					<button data-act="do" class="dsh-tb-primary">\u62C6\u5206</button>
				</div>
			</div>`,document.body.appendChild(s);let n=()=>s.remove();a('[data-act="cancel"]',s).addEventListener("click",n),s.addEventListener("click",b=>{b.target===s&&n()}),a('[data-act="do"]',s).addEventListener("click",async()=>{let b=a("#tb-split-titles",s).value.split(`
`).map(x=>x.trim()).filter(Boolean);if(!b.length){a("#tb-split-titles",s).focus();return}try{let{tasks:x}=await g(`/tasks/${e}/split`,{method:"POST",body:JSON.stringify({titles:b})});n(),await W(),_(`\u2713 \u5DF2\u62C6\u5206\u4E3A ${x.length} \u4E2A\u5B50\u4EFB\u52A1`),x?.[0]&&V(x[0].id)}catch(x){alert(`\u62C6\u5206\u5931\u8D25\uFF1A${x.message}`)}}),a("#tb-split-titles",s).focus()})}nt(),lt(),new MutationObserver(()=>{nt(),lt()}).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("keydown",t=>{t.ctrlKey&&t.shiftKey&&(t.key==="B"||t.key==="b")&&(t.preventDefault(),et())}),document.addEventListener("click",t=>{if(!tt())return;let e=t.target;e instanceof Element&&(e.closest(`[${C}]`)||e.closest('[data-pane="sidebar"], [class*="sidebarCol"]')&&et(!1))});function Ot(){let t=it();if(!t||t.clientWidth===0)return;let e=t.style.width;try{t.style.width=`${t.clientWidth-1}px`,t.offsetWidth,t.style.width=e||""}catch{}}let Ht=[300,800,1600],ht=()=>{for(let t of Ht)setTimeout(Ot,t)};document.readyState==="loading"?window.addEventListener("load",ht):ht()})();})();
